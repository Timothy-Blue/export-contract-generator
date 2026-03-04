const path = require('path');
const fs = require('fs');

const TEMPLATE_FILE_PATH = path.join(__dirname, '../assets/contract_import_template.csv');

/**
 * Resolves the absolute path to the CSV template file.
 * Throws if the file does not exist.
 * @returns {string} absolute file path
 */
function getTemplatePath() {
  if (!fs.existsSync(TEMPLATE_FILE_PATH)) {
    const err = new Error('Template file not found at ' + TEMPLATE_FILE_PATH);
    err.code = 'TEMPLATE_NOT_FOUND';
    throw err;
  }
  return TEMPLATE_FILE_PATH;
}

module.exports = { getTemplatePath };
