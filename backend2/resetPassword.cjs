const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const { complianceDb, User } = require("./models");
const { waitForConnection } = require("./config/db");

async function resetAdminPassword() {
  try {
    await waitForConnection(complianceDb, "complianceDb");

    console.log("Resetting password...");
    const user = await User.findOne({ email: "admin@company.com" });

    if (!user) {
      console.log("Admin user not found.");
      process.exitCode = 1;
      return;
    }

    user.password = "password123";
    await user.save();

    console.log("Password for admin@company.com reset to password123");
  } catch (error) {
    console.error("Error resetting password:", error.message);
    process.exitCode = 1;
  } finally {
    await complianceDb.close();
  }
}

resetAdminPassword();
