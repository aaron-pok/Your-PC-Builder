const mongoose = require("mongoose");

// A flexible schema that allows ANY fields from your collection documents
const schema = new mongoose.Schema({}, { strict: false });

module.exports = function getCollectionModel(collectionName) {
  // 3rd argument forces exact collection name (no pluralization)
  return mongoose.models[collectionName] ||
    mongoose.model(collectionName, schema, collectionName);
};
