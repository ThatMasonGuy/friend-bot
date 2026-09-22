module.exports = {
  name: 'ping',
  description: 'Check whether the bot is responding.',
  async execute({ message }) {
    await message.reply('Pong!');
  },
};
