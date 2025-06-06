let lastActivity = Date.now();

function recordActivity() {
  lastActivity = Date.now();
}

function getIdleTime() {
  return Date.now() - lastActivity;
}

function isIdle(limit) {
  return getIdleTime() > limit;
}

// for testing
function setLastActivity(time) {
  lastActivity = time;
}

module.exports = { recordActivity, getIdleTime, isIdle, setLastActivity };
