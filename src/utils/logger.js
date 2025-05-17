const fs = require('fs');

function logInfo(message) {
  const logMessage = `[INFO] ${new Date().toISOString()}: ${message}`;
  console.log(logMessage);
  fs.appendFileSync('application.log', logMessage + '\n');
}

function logError(message) {
  const logMessage = `[ERROR] ${new Date().toISOString()}: ${message}`;
  console.error(logMessage);
  fs.appendFileSync('application.log', logMessage + '\n');
}

function logWarning(message) {
  const logMessage = `[WARNING] ${new Date().toISOString()}: ${message}`;
  console.warn(logMessage);
  fs.appendFileSync('application.log', logMessage + '\n');
}

module.exports = {
  logInfo,
  logError,
  logWarning
};