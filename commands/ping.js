const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Check whether the bot is responding.',
  usage: '',
  examples: ['ping'],
  async execute({ message }) {
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('🏓 Pong!')
      .setDescription(`WebSocket latency: **${message.client.ws.ping} ms**`);
    await message.reply({ embeds: [embed] });
  },
};
