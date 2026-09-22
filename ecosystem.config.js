module.exports = {
  apps: [
    {
      name: 'friends-bot',
      script: 'src/index.js',
      cwd: __dirname,
      autorestart: true,
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
