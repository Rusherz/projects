const Commando = require('discord.js-commando');
const client = new Commando.Client({
    owner: '123506734290436099'
});
const path = require('path');

client.registry
    // Registers your custom command groups
    .registerGroups([
        ['fun', 'Fun commands'],
        ['some', 'Some group'],
        ['other', 'Some other group']
    ])

    // Registers all built-in groups, commands, and argument types
    .registerDefaults()

    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, 'commands'));

const sqlite = require('sqlite');

client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);


client.login('MzEyMzAyMjM3NjY3ODE5NTIx.DFjkoA.d6SZLP6jQ8yTc783bcSjdXHuHyE');