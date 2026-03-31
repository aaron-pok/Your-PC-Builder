const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ─── OpenAI client ────────────────────────────────────────────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a helpful PC building assistant for YourPCBuilder, a PC component store based in Nepal.

You ONLY answer questions related to:
- PC components (CPU, GPU, RAM, motherboard, PSU, storage, cases, coolers)
- PC builds and compatibility checks
- Prebuilt PCs and laptops
- Brand comparisons (AMD vs Intel, Nvidia vs AMD, etc.)
- PC/laptop performance, benchmarks, and technical comparisons
- Budget recommendations for PC or laptop purchases (prices are in Nepali Rupees NRs)
- Technical advice about PC hardware, generations, and technologies
- Gaming PCs, workstation builds, office builds, study laptops

If the user asks about ANYTHING outside of these topics (e.g. cooking, sports, politics, general knowledge, coding help, weather, movies, etc.), respond with exactly:
"I'm only able to help with PC building, components, and laptops. Feel free to ask me anything related to that!"

Guidelines:
- Be concise and friendly
- All prices are in Nepali Rupees (NRs)
- When inventory data is provided, use it to give real product recommendations with actual prices
- Always consider compatibility when recommending builds (socket match, RAM type, PSU wattage, form factor)
- For brand comparisons like AMD vs Intel, give a balanced and informative answer based on use case
- If a part is not in the inventory data provided, mention it may not be in stock
- Format lists cleanly when showing multiple options`;

// ─── Detect which categories the user is asking about ────────────────────────
function detectCategories(message) {
  const lower = message.toLowerCase();
  const map = [
    {
      keywords: [
        "cpu", "processor", "ryzen", "intel", "core i", "amd cpu",
        "amd vs", "vs intel", "vs amd", "amd or intel", "intel or amd",
        "which processor", "which cpu", "better cpu", "amd better", "intel better",
        "i5", "i7", "i9", "r5", "r7", "r9", "core ultra",
      ],
      category: "cpu",
    },
    {
      keywords: [
        "gpu", "graphics card", "graphics", "rtx", "radeon", "nvidia", "gtx",
        "rx ", "geforce", "video card", "vram", "nvidia vs amd", "amd vs nvidia",
        "which gpu", "better gpu", "4060", "4070", "4080", "3060", "6600", "6700",
      ],
      category: "gpu",
    },
    {
      keywords: ["ram", "memory", "ddr4", "ddr5", "dimm"],
      category: "ram",
    },
    {
      keywords: [
        "motherboard", "mobo", "mainboard", "socket", "lga", "am5", "am4",
        "lga1700", "lga1200",
      ],
      category: "motherboard",
    },
    {
      keywords: ["psu", "power supply", "watt", "power unit", "watts", "sufficient power"],
      category: "psu",
    },
    {
      keywords: ["storage", "ssd", "hdd", "nvme", "m.2", "hard drive", "hard disk"],
      category: "storage",
    },
    {
      keywords: ["case", "chassis", "tower", "cabinet", "casing"],
      category: "case",
    },
    {
      keywords: ["cooler", "cooling", "fan", "aio", "liquid cool", "heatsink"],
      category: "cooler",
    },
    {
      keywords: [
        "prebuilt", "pre-built", "pre built", "ready made", "desktop pc",
        "gaming pc", "office pc", "workstation", "build under", "pc under",
        "budget pc", "cheap pc",
      ],
      category: "prebuilt",
    },
    {
      keywords: [
        "laptop", "notebook", "laptop under", "budget laptop",
        "gaming laptop", "study laptop", "office laptop",
      ],
      category: "laptop",
    },
  ];

  const found = [];
  for (const entry of map) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      found.push(entry.category);
    }
  }
  return [...new Set(found)];
}

// ─── Fetch inventory from the correct DB + collection ─────────────────────────
async function getInventoryData(category) {
  try {
    // Maps each category to its exact database and collection name in MongoDB
    const collectionMap = {
      cpu:         { db: "pcpart",     collection: "cpu" },
      gpu:         { db: "pcpart",     collection: "gpu" },
      ram:         { db: "pcpart",     collection: "ram" },
      motherboard: { db: "pcpart",     collection: "motherboard" },
      psu:         { db: "pcpart",     collection: "psu" },
      storage:     { db: "pcpart",     collection: "storage" },
      case:        { db: "pcpart",     collection: "case" },
      cooler:      { db: "pcpart",     collection: "cooler" },
      prebuilt:    { db: "prebuilt",   collection: "prebuilt_db" },
      laptop:      { db: "laptops_db", collection: "laptops" },
    };

    const entry = collectionMap[category];
    if (!entry) return null;

    // Always use useDb to target the correct database
    const dbConn = mongoose.connection.useDb(entry.db);
    const model =
      dbConn.models[entry.collection] ||
      dbConn.model(
        entry.collection,
        new mongoose.Schema({}, { strict: false }),
        entry.collection
      );

    const items = await model
      .find({})
      .select({
        name: 1, price: 1,
        // CPU
        socket: 1, tdp: 1, ram_type: 1, core_count: 1, boost_clock: 1,
        // GPU
        recommended_psu: 1, tdp_watts: 1, chipset: 1, memory: 1,
        // RAM
        type: 1, size: 1, modules: 1, speed: 1,
        // Motherboard
        form_factor: 1, max_memory: 1, memory_slots: 1,
        // PSU
        wattage: 1, modular: 1,
        // Storage
        capacity: 1, interface: 1, interface_type: 1,
        // Laptop & Prebuilt
        processor: 1, gpu_model: 1, ram_size: 1, storage_size: 1,
        category: 1, brand_name: 1,
        _id: 0,
      })
      .sort({ price: 1 })
      .limit(15)
      .lean();

    if (!items.length) return null;

    const lines = items.map((item) => {
      const specs = Object.entries(item)
        .filter(([k, v]) => k !== "name" && k !== "price" && v != null && v !== "")
        .map(([k, v]) => `${k}:${Array.isArray(v) ? v.join("/") : v}`)
        .join(", ");
      return `- ${item.name}: NRs ${item.price?.toLocaleString() ?? "N/A"}${
        specs ? ` (${specs})` : ""
      }`;
    });

    return `${category.toUpperCase()} inventory:\n${lines.join("\n")}`;
  } catch (err) {
    console.error(`[inventory:${category}]`, err.message);
    return null;
  }
}

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    // ===== PC PARTS DB (pcpart) =====
    const pcpartDb = mongoose.connection.useDb("pcpart");

    const Case = pcpartDb.models.case ||
      pcpartDb.model("case", new mongoose.Schema({}, { strict: false }), "case");
    const Cooler = pcpartDb.models.cooler ||
      pcpartDb.model("cooler", new mongoose.Schema({}, { strict: false }), "cooler");
    const Cpu = pcpartDb.models.cpu ||
      pcpartDb.model("cpu", new mongoose.Schema({}, { strict: false }), "cpu");
    const Gpu = pcpartDb.models.gpu ||
      pcpartDb.model("gpu", new mongoose.Schema({}, { strict: false }), "gpu");
    const Motherboard = pcpartDb.models.motherboard ||
      pcpartDb.model("motherboard", new mongoose.Schema({}, { strict: false }), "motherboard");
    const Psu = pcpartDb.models.psu ||
      pcpartDb.model("psu", new mongoose.Schema({}, { strict: false }), "psu");
    const Ram = pcpartDb.models.ram ||
      pcpartDb.model("ram", new mongoose.Schema({}, { strict: false }), "ram");
    const Storage = pcpartDb.models.storage ||
      pcpartDb.model("storage", new mongoose.Schema({}, { strict: false }), "storage");

    // ===== LAPTOPS DB (laptops_db) =====
    const laptopsDb = mongoose.connection.useDb("laptops_db");
    const Laptop =
      laptopsDb.models.laptops ||
      laptopsDb.model(
        "laptops",
        new mongoose.Schema({}, { strict: false }),
        "laptops"
      );

    // ===== PREBUILT DB (prebuilt) =====
    const prebuiltDb = mongoose.connection.useDb("prebuilt");
    const Prebuilt =
      prebuiltDb.models.prebuilt_db ||
      prebuiltDb.model(
        "prebuilt_db",
        new mongoose.Schema({}, { strict: false }),
        "prebuilt_db"
      );

    // ===== ROOT =====
    app.get("/", (req, res) => res.send("PC Builder backend running"));

    // ===== PC PART ROUTES =====
    app.get("/api/cases", async (req, res) => {
      try { res.json(await Case.find()); }
      catch (err) { res.status(500).json({ error: "Failed to fetch cases" }); }
    });
    app.get("/api/coolers", async (req, res) => {
      try { res.json(await Cooler.find()); }
      catch (err) { res.status(500).json({ error: "Failed to fetch coolers" }); }
    });
    app.get("/api/cpus", async (req, res) => {
      try { res.json(await Cpu.find()); }
      catch (err) { res.status(500).json({ error: "Failed to fetch cpus" }); }
    });
    app.get("/api/gpus", async (req, res) => {
      try { res.json(await Gpu.find()); }
      catch (err) { res.status(500).json({ error: "Failed to fetch gpus" }); }
    });
    app.get("/api/motherboards", async (req, res) => {
      try { res.json(await Motherboard.find()); }
      catch (err) { res.status(500).json({ error: "Failed to fetch motherboards" }); }
    });
    app.get("/api/psus", async (req, res) => {
      try { res.json(await Psu.find()); }
      catch (err) { res.status(500).json({ error: "Failed to fetch psus" }); }
    });
    app.get("/api/rams", async (req, res) => {
      try { res.json(await Ram.find()); }
      catch (err) { res.status(500).json({ error: "Failed to fetch rams" }); }
    });
    app.get("/api/storages", async (req, res) => {
      try { res.json(await Storage.find()); }
      catch (err) { res.status(500).json({ error: "Failed to fetch storages" }); }
    });

    // ===== LAPTOP ROUTES =====
    app.get("/api/laptops", async (req, res) => {
      try {
        const laptops = await Laptop.find();
        res.json(laptops);
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch laptops" });
      }
    });

    app.get("/api/laptops/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid laptop ID" });
        }
        const laptop = await Laptop.findById(id);
        if (!laptop) return res.status(404).json({ error: "Laptop not found" });
        res.json(laptop);
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch laptop details" });
      }
    });

    // ===== PREBUILT ROUTES =====
    app.get("/api/prebuilts", async (req, res) => {
      try {
        const data = await Prebuilt.find();
        res.json(data);
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch prebuilts" });
      }
    });

    app.get("/api/prebuilts/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid prebuilt ID" });
        }
        const prebuilt = await Prebuilt.findById(id);
        if (!prebuilt)
          return res.status(404).json({ error: "Prebuilt not found" });
        res.json(prebuilt);
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch prebuilt details" });
      }
    });

    // ===== CHAT ROUTE =====
    app.post("/api/chat", async (req, res) => {
      try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
          return res.status(400).json({ error: "messages array is required" });
        }

        // Get latest user message to detect what inventory to fetch
        const latestUser = [...messages]
          .reverse()
          .find((m) => m.role === "user");

        // Fetch relevant inventory based on keywords in the message
        let inventoryContext = "";
        if (latestUser) {
          const categories = detectCategories(latestUser.content);
          if (categories.length > 0) {
            const results = await Promise.all(
              categories.map((cat) => getInventoryData(cat))
            );
            const valid = results.filter(Boolean);
            if (valid.length > 0) {
              inventoryContext =
                "\n\nCurrent store inventory:\n" + valid.join("\n\n");
            }
          }
        }

        const systemMessage = {
          role: "system",
          content: SYSTEM_PROMPT + inventoryContext,
        };

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [systemMessage, ...messages],
          max_tokens: 600,
          temperature: 0.7,
        });

        res.json({ reply: completion.choices[0].message.content });
      } catch (err) {
        console.error("[/api/chat]", err.message);
        res.status(500).json({ error: "Failed to get AI response" });
      }
    });

    // ===== START SERVER =====
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
}

start();
