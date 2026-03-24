const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI_COMPLIANCE = process.env.MONGO_URI_COMPLIANCE;

if (!MONGO_URI_COMPLIANCE) {
  throw new Error("MONGO_URI_COMPLIANCE is missing in environment variables");
}

const commonOptions = {
  maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 30),
  minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 2),
  serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 15000)
};

const complianceDb = mongoose.createConnection(MONGO_URI_COMPLIANCE, commonOptions);

complianceDb.on("connected", () => {
  console.log("[DB] complianceDb connected");
});

complianceDb.on("error", (error) => {
  console.error("[DB] complianceDb error:", error.message);
});

complianceDb.on("disconnected", () => {
  console.warn("[DB] complianceDb disconnected");
});

function waitForConnection(connection, name = "database") {
  if (connection.readyState === 1) return Promise.resolve(connection);

  return new Promise((resolve, reject) => {
    connection.once("connected", () => resolve(connection));
    connection.once("error", (error) => {
      reject(new Error(`[DB] ${name} connection failed: ${error.message}`));
    });
  });
}

async function connectDatabases() {
  await waitForConnection(complianceDb, "complianceDb");
  return { complianceDb };
}

module.exports = {
  complianceDb,
  connectDatabases,
  waitForConnection
};
