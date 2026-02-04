const fs = require('fs');
const path = require('path');
const sequelize = require('@config/config');
require('module-alias/register');
const User = require('@models/User');
const { addToken } = require('@middleware/tokenBlacklist');
const dbSync = {};
// Load all models
fs.readdirSync(path.join(__dirname))
  .filter(file => file !== 'index.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    dbSync[model.name] = model;
  });
// Call associate to set up relations
Object.keys(dbSync).forEach(modelName => {
  if (dbSync[modelName].associate) {
    dbSync[modelName].associate(dbSync);
  }
});
async function syncModelsInOrder() {
  try {
    await dbSync.User.sync({ force: false });
    await dbSync.Inspection.sync({ force: false });
    await dbSync.InspectionStatus.sync({ force: false });
    await dbSync.Department.sync({ force: false });
    await dbSync.Role.sync({ force: false });
    await dbSync.Topic.sync({ force: false });
    await dbSync.Inspectionfollow.sync({ force: false });


  } catch (error) {
    console.error('Error syncing models:', error);
  }
}
syncModelsInOrder();


dbSync.sequelize = sequelize;
dbSync.Sequelize = require('sequelize');
module.exports = dbSync;