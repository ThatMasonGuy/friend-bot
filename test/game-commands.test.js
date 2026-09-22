const assert = require('node:assert/strict');
const test = require('node:test');
const coinflip = require('../commands/coinflip');
const dice = require('../commands/dice');
const help = require('../commands/help');
const randchar = require('../commands/randchar');
const { loadCommands } = require('../src/command-loader');
const path = require('node:path');

test('coinflip accepts a bounded count', () => {
  assert.equal(coinflip.parseCount([]), 1);
  assert.equal(coinflip.parseCount(['10']), 10);
  assert.throws(() => coinflip.parseCount(['0']), /between 1 and 100/);
  assert.throws(() => coinflip.parseCount(['lots']), /Use/);
});

test('dice accepts notation, a side count, and separate values', () => {
  assert.deepEqual(dice.parseDice([]), { count: 1, sides: 6 });
  assert.deepEqual(dice.parseDice(['d20']), { count: 1, sides: 20 });
  assert.deepEqual(dice.parseDice(['4d6']), { count: 4, sides: 6 });
  assert.deepEqual(dice.parseDice(['3', '8']), { count: 3, sides: 8 });
  assert.throws(() => dice.parseDice(['101d6']), /between 1 and 100/);
  assert.throws(() => dice.parseDice(['2d1']), /between 2 and/);
});

test('game commands respond with valid embeds', async () => {
  const replies = [];
  const message = {
    author: { username: 'Tester' },
    reply: async (reply) => replies.push(reply),
  };

  await coinflip.execute({ args: ['5'], message });
  await dice.execute({ args: ['4d6'], message });
  await randchar.execute({ args: [], message });

  assert.equal(replies.length, 3);
  for (const reply of replies) {
    const data = reply.embeds[0].toJSON();
    assert.ok(data.title);
    assert.ok(data.color);
  }
  const statFields = replies[2].embeds[0].toJSON().fields;
  assert.equal(statFields.length, 7);
  const scoreSum = statFields
    .slice(0, 6)
    .reduce((sum, field) => sum + Number(field.name.match(/: (\d+)$/)[1]), 0);
  assert.deepEqual(
    statFields.slice(0, 6).map((field) => field.name.replace(/: \d+$/, '')),
    ['🎲 Roll 1', '🎲 Roll 2', '🎲 Roll 3', '🎲 Roll 4', '🎲 Roll 5', '🎲 Roll 6'],
  );
  assert.ok(statFields.slice(0, 6).every((field) => field.inline === false));
  assert.equal(statFields[6].name, '📊 Total');
  assert.equal(statFields[6].value, `**${scoreSum}**`);
});

test('help explains every command with examples in an embed', async () => {
  let reply;
  const commands = loadCommands(path.resolve(__dirname, '../commands'));
  const message = {
    author: { username: 'Tester' },
    reply: async (value) => { reply = value; },
  };

  await help.execute({ commands, message, prefix: '!' });
  const data = reply.embeds[0].toJSON();
  const commandNames = [...new Set(commands.values())].map((command) => command.name);
  assert.equal(data.fields.length, commandNames.length);
  assert.match(data.fields.find((field) => field.name.startsWith('!dice')).value, /!dice 4d6/);
  assert.match(data.fields.find((field) => field.name.startsWith('!randchar')).value, /4d6/);
});
