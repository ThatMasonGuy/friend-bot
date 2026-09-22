module.exports = {
  name: 'help',
  description: 'List the available commands.',
  aliases: ['commands'],
  async execute({ commands, message, prefix }) {
    const uniqueCommands = [...new Set(commands.values())].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    const lines = uniqueCommands.map(
      (command) => `\`${prefix}${command.name}\` — ${command.description || 'No description'}`,
    );
    await message.reply(lines.join('\n'));
  },
};
