const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Show every command and how to use it.',
  aliases: ['commands'],
  usage: '',
  examples: ['help'],
  async execute({ commands, message, prefix }) {
    const uniqueCommands = [...new Set(commands.values())].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('📖 Friends Bot Commands')
      .setDescription(`Commands begin with \`${prefix}\`. Dice notation uses **count d sides**, so \`4d6\` means four six-sided dice.`)
      .addFields(
        uniqueCommands.map((command) => {
          const usage = command.usage ? ` ${command.usage}` : '';
          const examples = command.examples?.length
            ? `\nExamples: ${command.examples.map((example) => `\`${prefix}${example}\``).join(', ')}`
            : '';
          return {
            name: `${prefix}${command.name}${usage}`,
            value: `${command.description || 'No description'}${examples}`,
          };
        }),
      )
      .setFooter({ text: `${uniqueCommands.length} commands available • Requested by ${message.author.username}` });

    await message.reply({ embeds: [embed] });
  },
};
