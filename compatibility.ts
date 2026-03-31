// utils/compatibility.ts

export interface CompatibilityIssue {
  code: string;
  message: string;
  keys: string[];
  type: "error" | "warning";
}

export interface CompatibilityResult {
  errors: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
  isCompatible: boolean;
  hasIssues: boolean;
  errorKeys: Set<string>;
  warningKeys: Set<string>;
}

// ─── Constants ─────────────────────────────────────────

const FORM_FACTOR_RANK: Record<string, number> = {
  "Mini ITX": 1,
  "Micro ATX": 2,
  "ATX": 3,
  "E-ATX": 4,
  "XL ATX": 5,
};

const CASE_MAX_FORM_FACTOR: Record<string, string> = {
  "Mini ITX Tower": "Mini ITX",
  "MicroATX Mini Tower": "Micro ATX",
  "MicroATX Mid Tower": "Micro ATX",
  "Mid Tower": "ATX",
  "Full Tower": "XL ATX",
};

const SYSTEM_OVERHEAD_WATTS = 75;
const PSU_HEADROOM_BUFFER = 100;

// ─── Helpers ───────────────────────────────────────────

function safeNumber(val: any): number | null {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }
  return null;
}

function safeString(val: any): string {
  return String(val ?? "").trim();
}

function getRamModuleCount(ram: any): number {
  if (!ram) return 1;
  if (typeof ram.size === "string") {
    const parts = ram.size.split("x");
    const count = parseInt(parts[0]);
    return isNaN(count) ? 1 : count;
  }
  return 1;
}

function getRamTotalGb(ram: any): number | null {
  if (!ram || typeof ram.size !== "string") return null;

  const parts = ram.size.split("x");
  if (parts.length === 2) {
    const count = parseInt(parts[0]);
    const gb = parseInt(parts[1]);
    if (!isNaN(count) && !isNaN(gb)) return count * gb;
  }

  return null;
}

// ─── Main Function ─────────────────────────────────────

export function checkCompatibility(selected: Record<string, any | null>): CompatibilityResult {
  const errors: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];

  const addError = (code: string, message: string, keys: string[]) =>
    errors.push({ code, message, keys, type: "error" });

  const addWarning = (code: string, message: string, keys: string[]) =>
    warnings.push({ code, message, keys, type: "warning" });

  try {
    const cpu = selected["CPU"];
    const gpu = selected["GPU"];
    const mb  = selected["MB"];
    const ram1 = selected["RAM1"];
    const ram2 = selected["RAM2"];
    const psu = selected["PSU"];
    const cas = selected["CAS"];

    // ── CPU ↔ MB ──
    if (cpu && mb) {
      const cpuSocket = safeString(cpu.socket);
      const mbSocket = safeString(mb.socket);

      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        addError(
          "CPU_SOCKET_MISMATCH",
          `Socket mismatch: ${cpu.name} (${cpuSocket}) vs ${mb.name} (${mbSocket})`,
          ["CPU", "MB"]
        );
      }
    }

    // ── CPU ↔ RAM1 ──
    if (cpu && ram1) {
      const cpuRam = safeString(cpu.ram_type);
      const ramType = safeString(ram1.type);

      if (cpuRam && ramType && cpuRam !== ramType) {
        addError(
          "RAM_TYPE_MISMATCH",
          `RAM type mismatch: ${cpuRam} vs ${ramType}`,
          ["CPU", "RAM1"]
        );
      }
    }

    // ── GPU ↔ PSU ──
    if (gpu && psu) {
      const required = safeNumber(gpu.recommended_psu);
      const watt = safeNumber(psu.wattage);

      if (required && watt && watt < required) {
        addError(
          "PSU_GPU",
          `PSU too weak (${watt}W < ${required}W)`,
          ["GPU", "PSU"]
        );
      }
    }

    // ── CPU + GPU ↔ PSU ──
    if (cpu && gpu && psu) {
      const cpuTdp = safeNumber(cpu.tdp) ?? 0;
      const gpuTdp = safeNumber(gpu.tdp_watts) ?? 0;
      const watt = safeNumber(psu.wattage);

      if (watt !== null) {
        const total = cpuTdp + gpuTdp + SYSTEM_OVERHEAD_WATTS;

        if (watt < total) {
          addError(
            "PSU_TOTAL",
            `System needs ~${total}W but PSU is ${watt}W`,
            ["CPU", "GPU", "PSU"]
          );
        } else if (watt < total + PSU_HEADROOM_BUFFER) {
          addWarning(
            "PSU_HEADROOM",
            `Low headroom (~${total}W load)`,
            ["CPU", "GPU", "PSU"]
          );
        }
      }
    }

    // ── MB ↔ Case ──
    if (mb && cas) {
      const caseMax = CASE_MAX_FORM_FACTOR[cas.type];
      const mbForm = mb.form_factor;

      if (caseMax && mbForm) {
        const caseRank = FORM_FACTOR_RANK[caseMax] ?? 0;
        const mbRank = FORM_FACTOR_RANK[mbForm] ?? 0;

        if (mbRank > caseRank) {
          addError(
            "FORM_FACTOR",
            `Motherboard too large`,
            ["MB", "CAS"]
          );
        }
      }
    }

    // ── RAM ↔ MB (for BOTH slots) ──
    if (mb) {
      const slots = safeNumber(mb.memory_slots);
      const maxMem = safeNumber(mb.max_memory);

      [ram1, ram2].forEach((ram, index) => {
        if (!ram) return;

        const key = index === 0 ? "RAM1" : "RAM2";

        const modules = getRamModuleCount(ram);
        const totalGb = getRamTotalGb(ram);

        if (slots && modules > slots) {
          addError("RAM_SLOT", `Too many RAM sticks`, [key, "MB"]);
        }

        if (maxMem && totalGb && totalGb > maxMem) {
          addError("RAM_MAX", `RAM exceeds motherboard limit`, [key, "MB"]);
        }
      });
    }

    // ── PSU ↔ Case ──
    if (psu && cas) {
      const caseType = safeString(cas.psu);
      const psuType = safeString(psu.type);

      if (caseType && psuType && caseType !== psuType) {
        addError(
          "PSU_CASE",
          `PSU type mismatch`,
          ["PSU", "CAS"]
        );
      }
    }
  } catch (err) {
    console.log("Compatibility crash:", err);
  }

  const errorKeys = new Set(errors.flatMap((e) => e.keys));
  const warningKeys = new Set(warnings.flatMap((w) => w.keys));

  return {
    errors,
    warnings,
    isCompatible: errors.length === 0,
    hasIssues: errors.length > 0 || warnings.length > 0,
    errorKeys,
    warningKeys,
  };
}