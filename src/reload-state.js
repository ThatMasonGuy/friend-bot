const fs = require('node:fs');

const MAX_STATE_AGE_MS = 5 * 60 * 1000;

function saveReloadState(filePath, state) {
  fs.writeFileSync(filePath, `${JSON.stringify(state)}\n`, { mode: 0o600 });
}

function takeReloadState(filePath, now = Date.now()) {
  let state;
  try {
    state = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    removeState(filePath);
    throw error;
  }

  removeState(filePath);
  if (
    !state ||
    typeof state.channelId !== 'string' ||
    typeof state.requestedBy !== 'string' ||
    !Number.isFinite(state.createdAt) ||
    now - state.createdAt > MAX_STATE_AGE_MS ||
    state.createdAt > now + 10_000
  ) {
    return null;
  }

  return state;
}

function removeState(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

module.exports = { saveReloadState, takeReloadState };
