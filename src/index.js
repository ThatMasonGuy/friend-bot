require('dotenv').config({ quiet: true });

const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  PermissionFlagsBits,
} = require('discord.js');
const { loadCommands } = require('./command-loader');
const { saveReloadState, takeReloadState } = require('./reload-state');

const execFileAsync = promisify(execFile);
const projectDirectory = path.resolve(__dirname, '..');
const commandsDirectory = path.join(projectDirectory, 'commands');
const reloadStatePath = path.join(projectDirectory, '.reload-state.json');
const prefix = process.env.COMMAND_PREFIX || '!';

if (!process.env.DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN is missing. Copy .env.example to .env and add the token.');
  process.exit(1);
}

let commands;
try {
  commands = loadCommands(commandsDirectory);
} catch (error) {
  console.error('Could not load commands:', error);
  process.exit(1);
}

const client = new Client({
  allowedMentions: { parse: [], repliedUser: false },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let reloadInProgress = false;

client.once(Events.ClientReady, (readyClient) => {
  const commandNames = [...new Set([...commands.values()].map((command) => command.name))];
  console.log(`Ready as ${readyClient.user.tag}; loaded: ${commandNames.join(', ')}`);
  announceRestartComplete(readyClient).catch((error) => {
    console.error('Could not announce completed restart:', error);
  });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const input = message.content.slice(prefix.length).trim();
  if (!input) return;

  const separator = input.search(/\s/);
  const commandName = (separator === -1 ? input : input.slice(0, separator)).toLowerCase();
  const rawArgs = separator === -1 ? '' : input.slice(separator).trim();
  const command = commands.get(commandName);
  if (!command) return;

  const context = {
    args: rawArgs ? rawArgs.split(/\s+/) : [],
    client,
    commandName,
    commands,
    message,
    prefix,
    rawArgs,
    reloadFromGit,
  };

  try {
    await command.execute(context);
  } catch (error) {
    console.error(`Command ${commandName} failed:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle('❌ Command Failed')
      .setDescription(errorMessage.slice(0, 4_000));
    await message.reply({ embeds: [embed] }).catch(() => {});
  }
});

async function reloadFromGit(message) {
  if (!canReload(message)) {
    throw new Error('You do not have permission to reload the bot.');
  }
  if (reloadInProgress) {
    throw new Error('A reload is already in progress.');
  }

  reloadInProgress = true;
  let result;
  try {
    const { stdout, stderr } = await execFileAsync('git', ['pull', '--ff-only'], {
      cwd: projectDirectory,
      timeout: 60_000,
      maxBuffer: 1024 * 1024,
    });
    result = [stdout, stderr].join('\n').trim() || 'Git pull completed.';
    saveReloadState(reloadStatePath, {
      channelId: message.channelId,
      requestedBy: message.author.username,
      createdAt: Date.now(),
    });
  } catch (error) {
    reloadInProgress = false;
    const details = [error.stdout, error.stderr, error.message].filter(Boolean).join('\n').trim();
    throw new Error(`Update failed; the bot is still running.\n${details.slice(0, 1_300)}`);
  }

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle('✅ Update Complete')
    .setDescription(`\`\`\`\n${result.slice(0, 3_500)}\n\`\`\``)
    .setFooter({ text: 'Restarting now…' });
  await message
    .reply({ embeds: [embed] })
    .catch((error) => console.error('Could not send reload confirmation:', error));
  setTimeout(() => process.exit(0), 750).unref();
}

async function announceRestartComplete(readyClient) {
  const state = takeReloadState(reloadStatePath);
  if (!state) return;

  const channel = await readyClient.channels.fetch(state.channelId);
  if (!channel?.isTextBased() || typeof channel.send !== 'function') {
    throw new Error(`Reload channel ${state.channelId} is not a text channel.`);
  }

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle('✅ Restart Complete')
    .setDescription('The bot is back online and the latest commands are ready to use.')
    .setFooter({ text: `Reload requested by ${state.requestedBy}` })
    .setTimestamp();
  await channel.send({ embeds: [embed] });
}

function canReload(message) {
  const configuredUsers = new Set(
    (process.env.RELOAD_USER_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  );

  return (
    configuredUsers.has('*') ||
    configuredUsers.has(message.author.id) ||
    Boolean(message.member?.permissions.has(PermissionFlagsBits.Administrator))
  );
}

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error('Discord login failed:', error);
  process.exit(1);
});
