const { randomInt } = require('node:crypto');
const { EmbedBuilder } = require('discord.js');

const ABILITY_NAMES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];

module.exports = {
  name: 'randchar',
  description: 'Roll six character stats using 4d6, dropping the lowest die.',
  aliases: ['stats'],
  usage: '',
  examples: ['randchar'],
  async execute({ args, message }) {
    if (args.length > 0) {
      throw new Error('`!randchar` does not take any arguments.');
    }

    const stats = ABILITY_NAMES.map((name) => {
      const rolls = Array.from({ length: 4 }, () => randomInt(1, 7)).sort((a, b) => a - b);
      return { name, rolls, total: rolls.slice(1).reduce((sum, roll) => sum + roll, 0) };
    });
    const abilityTotal = stats.reduce((sum, stat) => sum + stat.total, 0);

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🧙 Random Character Stats')
      .setDescription('Six sets of **4d6**, with the lowest die in each set discarded.')
      .addFields(
        stats.map(({ name, rolls, total }) => ({
          name: `${statEmoji(name)} ${name}: ${total}`,
          value: `~~${rolls[0]}~~ + ${rolls.slice(1).join(' + ')} = **${total}**`,
          inline: true,
        })),
      )
      .addFields({
        name: '📊 Total',
        value: `**${abilityTotal}**`,
        inline: false,
      })
      .setFooter({ text: `Requested by ${message.author.username}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};

function statEmoji(name) {
  return {
    Strength: '💪',
    Dexterity: '🏹',
    Constitution: '❤️',
    Intelligence: '🧠',
    Wisdom: '🦉',
    Charisma: '✨',
  }[name];
}
