const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'reload',
  description: 'Pull the latest code and restart the bot.',
  usage: '',
  examples: ['reload'],
  async execute({ message, reloadFromGit }) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🔄 Checking for Updates')
      .setDescription('Pulling the latest commands from GitHub…');
    await message.reply({ embeds: [embed] });
    await reloadFromGit(message);
  },
};
