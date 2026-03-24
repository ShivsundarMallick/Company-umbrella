const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { complianceDb } = require("../models");
const { waitForConnection } = require("../config/db");
const { runReminderCycle } = require("../services/reminderService");

async function run() {
  try {
    await waitForConnection(complianceDb, "complianceDb");

    const days = Number(process.argv[2]) || undefined;
    const summary = await runReminderCycle({
      source: "manual-script",
      days,
      force: true
    });

    console.log("[checkExpiry] Completed:");
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error("[checkExpiry] Failed:", error.message);
    process.exitCode = 1;
  } finally {
    await complianceDb.close();
  }
}

run();
