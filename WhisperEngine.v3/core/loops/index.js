const invocation = require('./invocation.js');
const absence = require('./absence.js');
const naming = require('./naming.js');
const threshold = require('./threshold.js');
const quiet = require('./quiet.js');
const recursive = require('./recursive.js');
const nullLoop = require('./null.js');

module.exports = {
  invocation,
  absence,
  naming,
  threshold,
  quiet,
  recursive,
  null: nullLoop
};
