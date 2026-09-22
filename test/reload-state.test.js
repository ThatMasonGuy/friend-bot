const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { saveReloadState, takeReloadState } = require('../src/reload-state');

test('reload state survives a process boundary and is consumed once', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'friends-bot-reload-'));
  const filePath = path.join(directory, 'state.json');
  const state = { channelId: '123', requestedBy: 'Tester', createdAt: 1_000 };
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  saveReloadState(filePath, state);
  assert.deepEqual(takeReloadState(filePath, 2_000), state);
  assert.equal(takeReloadState(filePath, 2_000), null);
});

test('expired reload state is discarded', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'friends-bot-reload-'));
  const filePath = path.join(directory, 'state.json');
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  saveReloadState(filePath, { channelId: '123', requestedBy: 'Tester', createdAt: 1_000 });
  assert.equal(takeReloadState(filePath, 1_000 + 6 * 60 * 1000), null);
  assert.equal(fs.existsSync(filePath), false);
});
