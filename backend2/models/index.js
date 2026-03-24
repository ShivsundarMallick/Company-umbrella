const { complianceDb } = require("../config/db");
const CompanySchema = require("./Company");
const DocumentSchema = require("./Document");
const UserSchema = require("./User");

const Company = complianceDb.models.Company || complianceDb.model("Company", CompanySchema);
const Document = complianceDb.models.Document || complianceDb.model("Document", DocumentSchema);
const User = complianceDb.models.User || complianceDb.model("User", UserSchema);

module.exports = {
  complianceDb,
  Company,
  Document,
  User
};
