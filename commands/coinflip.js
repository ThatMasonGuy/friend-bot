const { randomInt } = require('node:crypto');
const { EmbedBuilder } = require('discord.js');

const MAX_COINS = 100;

module.exports = {
  name: 'coinflip',
  description: 'Flip one or more coins.',
  aliases: ['coin', 'flip'],
  usage: '[number of coins]',
  examples: ['coinflip', 'coinflip 10'],
  async execute({ args, message }) {
    const count = parseCount(args);
    const flips = Array.from({ length: count }, () => (randomInt(2) === 0 ? 'Heads' : 'Tails'));
    const heads = flips.filter((result) => result === 'Heads').length;
    const tails = count - heads;

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(count === 1 ? '🪙 Coin Flip' : `🪙 ${count} Coin Flips`)
      .setDescription(flips.map((result) => (result === 'Heads' ? '🟡 H' : '⚪ T')).join('  '))
      .addFields(
        { name: 'Heads', value: `**${heads}**`, inline: true },
        { name: 'Tails', value: `**${tails}**`, inline: true },
      )
      .setFooter({ text: `Requested by ${message.author.username}` });

    await message.reply({ embeds: [embed] });
  },
};

function parseCount(args) {
  if (args.length === 0) return 1;
  if (args.length !== 1 || !/^\d+$/.test(args[0])) {
    throw new Error('Use `!coinflip [number of coins]`, for example `!coinflip 10`.');
  }

  const count = Number(args[0]);
  if (count < 1 || count > MAX_COINS) {
    throw new Error(`Choose between 1 and ${MAX_COINS} coins.`);
  }
  return count;
}

module.exports.parseCount = parseCount;
