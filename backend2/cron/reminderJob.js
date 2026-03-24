const cron = require("node-cron");
const { runReminderCycle } = require("../services/reminderService");

const REMINDER_CRON = process.env.REMINDER_CRON || "0 9 * * *";
const REMINDER_ENABLED = String(process.env.REMINDER_ENABLED || "true").toLowerCase() === "true";
const REMINDER_RUN_ON_STARTUP =
  String(process.env.REMINDER_RUN_ON_STARTUP || "true").toLowerCase() === "true";

if (REMINDER_ENABLED) {
  if (REMINDER_RUN_ON_STARTUP) {
    setImmediate(async () => {
      console.log("[ReminderJob] Triggered on server startup");

      try {
        const summary = await runReminderCycle({ source: "startup" });
        console.log("[ReminderJob] Startup summary:", JSON.stringify(summary));
      } catch (error) {
        console.error("[ReminderJob] STARTUP ERROR:", error.message);
      }
    });
  }

  cron.schedule(REMINDER_CRON, async () => {
    console.log("[ReminderJob] Triggered by cron");

    try {
      const summary = await runReminderCycle({ source: "cron" });
      console.log("[ReminderJob] Summary:", JSON.stringify(summary));
    } catch (error) {
      console.error("[ReminderJob] CRON ERROR:", error.message);
    }
  });
} else {
  console.log("[ReminderJob] Disabled via REMINDER_ENABLED=false");
}
