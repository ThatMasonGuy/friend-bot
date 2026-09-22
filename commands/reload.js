module.exports = {
  name: 'reload',
  description: 'Pull the latest code and restart the bot.',
  async execute({ message, reloadFromGit }) {
    await message.reply('Checking GitHub for updates…');
    await reloadFromGit(message);
  },
};
