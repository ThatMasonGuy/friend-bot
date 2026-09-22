const fs = require('node:fs');
const path = require('node:path');

function loadCommands(commandsDirectory) {
  const commands = new Map();
  const files = fs
    .readdirSync(commandsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => entry.name)
    .sort();

  for (const file of files) {
    const filePath = path.join(commandsDirectory, file);
    delete require.cache[require.resolve(filePath)];
    const command = require(filePath);
    validateCommand(command, file);

    const names = [command.name, ...(command.aliases ?? [])];
    for (const rawName of names) {
      const name = rawName.toLowerCase();
      if (commands.has(name)) {
        throw new Error(`Duplicate command or alias "${name}" in ${file}`);
      }
      commands.set(name, command);
    }
  }

  return commands;
}

function validateCommand(command, file) {
  if (!command || typeof command !== 'object') {
    throw new TypeError(`${file} must export a command object`);
  }
  if (typeof command.name !== 'string' || !/^[a-z0-9_-]+$/i.test(command.name)) {
    throw new TypeError(`${file} must have an alphanumeric name`);
  }
  if (typeof command.execute !== 'function') {
    throw new TypeError(`${file} must export an execute function`);
  }
  if (command.aliases !== undefined) {
    if (!Array.isArray(command.aliases) || command.aliases.some((alias) => typeof alias !== 'string')) {
      throw new TypeError(`${file} aliases must be an array of strings`);
    }
  }
}

module.exports = { loadCommands };
