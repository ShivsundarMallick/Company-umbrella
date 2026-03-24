const { complianceDb, Document } = require('../models');
const { waitForConnection } = require('../config/db');

(async () => {
  try {
    await waitForConnection(complianceDb, 'complianceDb');
    const before = await Document.countDocuments();
    const result = await Document.deleteMany({});
    const after = await Document.countDocuments();
    console.log(`[ClearDocuments] before=${before}, deleted=${result.deletedCount}, after=${after}`);
  } catch (error) {
    console.error('[ClearDocuments] Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await complianceDb.close();
  }
})();
