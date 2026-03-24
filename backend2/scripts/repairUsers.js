const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { complianceDb, User } = require("../models");
const { waitForConnection } = require("../config/db");

function sanitizeEmail(email) {
  if (!email) return email;
  return String(email).toLowerCase().trim().replace(/[;,]+$/g, "");
}

function inferRole(email) {
  if (!email) return null;
  if (email.startsWith("admin@")) return "company_admin";
  if (email.startsWith("secretary@")) return "company_secretary";
  return null;
}

async function run() {
  try {
    await waitForConnection(complianceDb, "complianceDb");

    const users = await User.find({});
    if (!users.length) {
      console.log("No users found in database.");
      return;
    }

    for (const user of users) {
      const originalEmail = user.email;
      const cleanedEmail = sanitizeEmail(user.email);

      const validRole =
        user.role === "company_admin" || user.role === "company_secretary"
          ? user.role
          : inferRole(cleanedEmail) || "company_secretary";

      user.email = cleanedEmail;
      user.role = validRole;
      await user.save();

      console.log(`Updated user: ${originalEmail} -> ${user.email}, role=${user.role}`);
    }

    console.log("User repair completed.");
  } catch (error) {
    console.error("Repair failed:", error.message);
    process.exitCode = 1;
  } finally {
    await complianceDb.close();
  }
}

run();
