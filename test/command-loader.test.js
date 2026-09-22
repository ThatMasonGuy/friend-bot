const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { loadCommands } = require('../src/command-loader');

test('loads command names and aliases', () => {
  const commands = loadCommands(path.resolve(__dirname, '../commands'));
  assert.equal(commands.get('ping').name, 'ping');
  assert.equal(commands.get('commands').name, 'help');
  assert.equal(commands.get('coin').name, 'coinflip');
  assert.equal(commands.get('roll').name, 'dice');
  assert.equal(commands.get('stats').name, 'randchar');
  assert.equal(commands.get('reload').name, 'reload');
});

test('rejects duplicate names', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'friends-bot-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.writeFileSync(path.join(directory, 'one.js'), "module.exports={name:'same',execute(){}};");
  fs.writeFileSync(path.join(directory, 'two.js'), "module.exports={name:'same',execute(){}};");
  assert.throws(() => loadCommands(directory), /Duplicate command/);
});
