let simulatedTimeOffset = 0;
let timeScale = 60;

function getCurrentSimulationTime() {
  return new Date(Date.now() + simulatedTimeOffset);
}

function advanceTime() {
  simulatedTimeOffset += 5 * 60 * 1000 * (timeScale / 60);
}

function setTimeScale(scale) {
  timeScale = scale;
}

function getTimeScale() {
  return timeScale;
}

function resetTime() {
  simulatedTimeOffset = 0;
}

module.exports = {
  getCurrentSimulationTime,
  advanceTime,
  setTimeScale,
  getTimeScale,
  resetTime
};
