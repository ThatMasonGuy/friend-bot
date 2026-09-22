const { randomInt } = require('node:crypto');
const { EmbedBuilder } = require('discord.js');

const MAX_DICE = 100;
const MAX_SIDES = 1_000_000;

module.exports = {
  name: 'dice',
  description: 'Roll any number and type of dice.',
  aliases: ['roll'],
  usage: '[count]d<sides> or [count] [sides]',
  examples: ['dice', 'dice d20', 'dice 4d6', 'dice 3 8'],
  async execute({ args, message }) {
    const { count, sides } = parseDice(args);
    const rolls = Array.from({ length: count }, () => randomInt(1, sides + 1));
    const total = rolls.reduce((sum, roll) => sum + roll, 0);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🎲 Rolling ${count}d${sides}`)
      .setDescription(rolls.map((roll) => `\`${roll}\``).join('  '))
      .addFields({ name: 'Total', value: `**${total.toLocaleString()}**`, inline: true })
      .setFooter({ text: `Requested by ${message.author.username}` });

    if (count > 1) {
      embed.addFields({
        name: 'Average',
        value: `**${(total / count).toFixed(2)}**`,
        inline: true,
      });
    }

    await message.reply({ embeds: [embed] });
  },
};

function parseDice(args) {
  let count = 1;
  let sides = 6;

  if (args.length === 1) {
    const notation = args[0].match(/^(\d*)d(\d+)$/i);
    if (notation) {
      count = notation[1] ? Number(notation[1]) : 1;
      sides = Number(notation[2]);
    } else if (/^\d+$/.test(args[0])) {
      sides = Number(args[0]);
    } else {
      throw usageError();
    }
  } else if (args.length === 2 && args.every((arg) => /^\d+$/.test(arg))) {
    count = Number(args[0]);
    sides = Number(args[1]);
  } else if (args.length !== 0) {
    throw usageError();
  }

  if (count < 1 || count > MAX_DICE) {
    throw new Error(`Choose between 1 and ${MAX_DICE} dice.`);
  }
  if (sides < 2 || sides > MAX_SIDES) {
    throw new Error(`Dice must have between 2 and ${MAX_SIDES.toLocaleString()} sides.`);
  }

  return { count, sides };
}

function usageError() {
  return new Error('Use dice notation like `!dice 4d6`, or use `!dice 4 6`.');
}

module.exports.parseDice = parseDice;
