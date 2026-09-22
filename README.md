# Friends Bot

A small Discord bot where each `!command` lives in its own file under `commands/`. Trusted contributors can push a new command to GitHub, then an authorized member can run `!reload` to pull the update and restart the bot.

## Initial setup

Requirements: Node.js 20+, Git, and PM2. This directory must be a Git clone with a configured remote for `!reload` to work.

1. Create an application and bot in the [Discord Developer Portal](https://discord.com/developers/applications).
2. On the bot page, enable the **Message Content Intent**.
3. Invite it to the server with the **View Channels**, **Send Messages**, and **Read Message History** permissions.
4. Install and configure the bot:

   ```sh
   npm install
   cp .env.example .env
   # Edit .env and add the bot token and any users allowed to reload.
   npm test
   pm2 start ecosystem.config.js
   pm2 save
   ```

5. Run `!ping` or `!help` in Discord.

Useful operations:

```sh
pm2 logs friends-bot
pm2 restart friends-bot
pm2 status
```

To start PM2 automatically after a machine reboot, run `pm2 startup` and follow the command it prints, then run `pm2 save` again.

## Adding a command

Create a file such as `commands/hello.js`:

```js
module.exports = {
  name: 'hello',
  description: 'Say hello to someone.',
  aliases: ['hi'], // Optional
  async execute({ message, args }) {
    const person = args.join(' ') || message.author.username;
    await message.reply(`Hello, ${person}!`);
  },
};
```

Every command must export a unique `name` and an async-compatible `execute` function. The context passed to it contains:

- `message` and `client` from discord.js
- `args`, split on whitespace, and the unmodified `rawArgs`
- `prefix`, `commandName`, and the loaded `commands` map

Commit and push the file. An authorized user can then run `!reload` in Discord.

## Reload behavior and security

`!reload` uses `git pull --ff-only`. It only exits after a successful pull, and PM2 restarts it. If Git fails (for example, because of a merge conflict, missing remote, or credentials), the current bot stays online and reports the failure.

Server administrators may reload by default. Add comma-separated Discord user IDs to `RELOAD_USER_IDS` to authorize non-admins. Setting it to `*` allows everyone and is only appropriate for a completely trusted server.

Command files are executable server code. Only grant repository write access to people you trust with the machine and bot token. Keep `.env` out of Git, and use an SSH deploy key or another non-interactive Git credential for private repositories.
