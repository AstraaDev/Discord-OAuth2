const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, REST, Routes} = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const url = require('url');
require('../dotenv').config();

const TOKEN = process.env.BotToken;
const authorizedUserIds = ['YOUR_USER_ID_HERE'];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
});

const db = new sqlite3.Database('../db.sqlite');

const commands = [
    {
        name: 'help',
        description: 'Get help on a specific command.',
    },
    {
        name: 'ping',
        description: 'Return the bot\'s current ping.',
    },
    {
        name: 'refresh',
        description: 'Refresh bot commands.',
    },
    {
        name: 'links',
        description: 'Sends a list of useful links (oauth2 link, bot invitation link, ...).',
    },
    {
        name: 'joinall',
        description: 'Makes all users join the server.',
    },
    {
        name: 'join',
        description: 'Add a specified number of users to the server.',
        options: [
            {
                name: 'count',
                description: 'Number of users to add',
                type: 4,
                required: true,
            },
        ],
    },
    {
        name: 'users',
        description: 'Get the number of users in the database.',
    },
    {
        name: 'clear',
        description: 'Deletes a specified number of messages.',
        options: [
            {
                name: 'amount',
                description: 'Number of messages to delete',
                type: 4,
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function refreshApplicationCommands() {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.ClientID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, guildId } = interaction;
    
    if (commandName === 'help') {
        const help_embed = createEmbed('🏠 Help command', 5003474, 'Use `/help <command>` to see the details of a command.\nUse `/command None` to disable the command.\n\n**Some useful links:**\n> [Support Discord](https://discord.gg/)\n\n**All commands:**\n> `/ping` - return the bot\'s current ping\n> `/refresh` - refresh bot commands\n> `/links` - sends a list of useful links (oauth2 link, bot invitation link, ...)\n> `/joinall` - makes all users join the server\n> `/join` - make a specific number of users join the server\n> `/users` - get the number of users in the database\n> `/clear` - deletes a specified number of messages');
        interaction.reply({ embeds: [help_embed] });
    } else if (commandName === 'ping') {
        const ping = Math.abs(Date.now() - interaction.createdTimestamp);

        const ping_embed = createEmbed('⚡ Ping command', 5003474, `Bot's ping to Discord API: **${ping}** ms`);
        interaction.reply({ embeds: [ping_embed] });
    } else if (commandName === 'refresh') {
        refreshApplicationCommands();
        const refresh_Embed = createEmbed('⏰ Refresh command', 2935808, `Commands successfully refreshed`);
        interaction.reply({ embeds: [refresh_Embed] });
    } else if (commandName === 'links') {
        if (!authorizedUserIds.includes(interaction.user.id)) {
            const unauthorized_embed = createEmbed('🚫 Unauthorized', 13500416, 'You are not authorized to use this command.');
            interaction.reply({ embeds: [unauthorized_embed], ephemeral: true });
            return;
        }

        const links_actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(5)
                    .setLabel('OAuth2 Authorization link')
                    .setURL('https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID_HERE&redirect_uri=YOUR_REDIRECT_URI_HERE&response_type=code&scope=gdm.join%20identify'),
                new ButtonBuilder()
                    .setStyle(5)
                    .setLabel('Bot Invitation link')
                    .setURL('https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID_HERE&permissions=8&scope=bot%20applications.commands')
            );
        const lists_embed = createEmbed('📃 Links command', 5003474, '**Utilities of links:**\n> `OAuth2 Authorization link` - authorize the bot to join a server for you.\n> `Bot Invitation link` - invite the bot to a server.\n\n**🔗 Links:**\n> __OAuth2 Authorization link__\n```https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID_HERE&redirect_uri=YOUR_REDIRECT_URI_HERE&response_type=code&scope=gdm.join%20identify```\n> __Bot invitation link__\n```https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID_HERE&permissions=8&scope=bot%20applications.commands```');
        interaction.reply({ embeds: [lists_embed] , components: [links_actionRow] });
    } else if (commandName === 'joinall') {
        if (!authorizedUserIds.includes(interaction.user.id)) {
            const unauthorized_embed = createEmbed('🚫 Unauthorized', 13500416, 'You are not authorized to use this command.');
            interaction.reply({ embeds: [unauthorized_embed], ephemeral: true });
            return;
        }

        db.all('SELECT * FROM users', async (err, rows) => {
            if (err) {
                console.error(err.message);
                return;
            }
            
            let usersAdded = 0;
            let usersFailed = 0;
            let usersAlreadyAdded = 0;
            const guild = client.guilds.cache.get(guildId);

            let final_embed = createEmbed('🚪 JoinAll command', 5003474, `✅ ${usersAdded} users successfully added\n⚠ ${usersAlreadyAdded} users already on the server\n❌ ${usersFailed} users could not be added\n\n💠 Total users: ${usersAdded+usersFailed+usersAlreadyAdded}`);
            const reply = await interaction.reply({ embeds: [final_embed] });

            for (const row of rows) {
                const { discord_id, refresh_token } = row;

                try {
                    const isMember = await guild.members.fetch(discord_id).then(() => true).catch(() => false);

                    if (isMember) {
                        usersAlreadyAdded++;
                        final_embed = createEmbed('🚪 JoinAll command', 5003474, `✅ ${usersAdded} users successfully added\n⚠ ${usersAlreadyAdded} users already on the server\n❌ ${usersFailed} users could not be added\n\n💠 Total users: ${usersAdded+usersFailed+usersAlreadyAdded}`);
                        await reply.edit({ embeds: [final_embed] });
                    } else {
                        const formData1 = new url.URLSearchParams({
                            client_id: process.env.ClientID,
                            client_secret: process.env.ClientSecret,
                            grant_type: 'refresh_token',
                            refresh_token: refresh_token,
                        });
                    
                        const response = await axios.post('https://discord.com/api/v10/oauth2/token', formData1, {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        });
                    
                        if (response.data && response.data.access_token) {
                            const newAccessToken = response.data.access_token;
                    
                            db.run('UPDATE users SET access_token = ?, refresh_token = ? WHERE discord_id = ?', [newAccessToken, response.data.refresh_token, discord_id], (updateErr) => {
                                if (updateErr) {
                                    console.error(`Error updating database for ${discord_id}. Error message: `, updateErr.message);
                                }
                            });
                    
                            try {
                                const user = await client.users.fetch(discord_id);
                                await guild.members.add(user, { accessToken: newAccessToken });
                                usersAdded++;
                            } catch (error) {
                                console.error(`Error adding ${discord_id} to the server`);
                                usersFailed++;
                            }
                        } else {
                            console.error(`Error getting ${discord_id}'s access token`);
                            usersFailed++;
                        }
                    }

                } catch (error) {
                    console.error(`Error generating ${discord_id} access token. Error message: `, error.message);
                }
                
                final_embed = createEmbed('🚪 JoinAll command', 5003474, `✅ ${usersAdded} users successfully added\n⚠ ${usersAlreadyAdded} users already on the server\n❌ ${usersFailed} users could not be added\n\n💠 Total users: ${usersAdded+usersFailed+usersAlreadyAdded}`);
                await reply.edit({ embeds: [final_embed] });
            }
            const end_joinall = createEmbed('All users added successfully', 2935808, null);
            await reply.edit({ embeds: [final_embed, end_joinall] });
        });
    } else if (commandName === 'join') {
        if (!authorizedUserIds.includes(interaction.user.id)) {
            const unauthorized_embed = createEmbed('🚫 Unauthorized', 13500416, 'You are not authorized to use this command.');
            interaction.reply({ embeds: [unauthorized_embed], ephemeral: true });
            return;
        }

        db.all('SELECT * FROM users', async (err, rows) => {
            if (err) {
                console.error(err.message);
                return;
            }
            
            let usersAdded = 0;
            let usersFailed = 0;
            let usersAlreadyAdded = 0;
            const guild = client.guilds.cache.get(guildId);
            const count = interaction.options.getInteger('count');

            if (count <= 0 || count > rows.count) {
                const join_Embed = createEmbed('🚪 Join command', 13500416, 'Please enter a valid number of users to be added.');
                interaction.reply({ embeds: [join_Embed], ephemeral: true });
                return;
            }

            let final_embed = createEmbed('🚪 Join command', 5003474, `✅ ${usersAdded} users successfully added\n⚠ ${usersAlreadyAdded} users already on the server\n❌ ${usersFailed} users could not be added\n\n💠 Total users: ${usersAdded+usersFailed+usersAlreadyAdded}`);
            const reply = await interaction.reply({ embeds: [final_embed] });

            for (const row of rows) {
                const { discord_id, refresh_token } = row;

                if (usersAdded >= count) {
                    return;
                }

                try {
                    const isMember = await guild.members.fetch(discord_id).then(() => true).catch(() => false);

                    if (isMember) {
                        usersAlreadyAdded++;
                        final_embed = createEmbed('🚪 Join command', 5003474, `✅ ${usersAdded} users successfully added\n⚠ ${usersAlreadyAdded} users already on the server\n❌ ${usersFailed} users could not be added\n\n💠 Total users: ${usersAdded+usersFailed+usersAlreadyAdded}`);
                        await reply.edit({ embeds: [final_embed] });
                    } else {
                        const formData1 = new url.URLSearchParams({
                            client_id: process.env.ClientID,
                            client_secret: process.env.ClientSecret,
                            grant_type: 'refresh_token',
                            refresh_token: refresh_token,
                        });
                    
                        const response = await axios.post('https://discord.com/api/v10/oauth2/token', formData1, {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        });
                    
                        if (response.data && response.data.access_token) {
                            const newAccessToken = response.data.access_token;
                    
                            db.run('UPDATE users SET access_token = ?, refresh_token = ? WHERE discord_id = ?', [newAccessToken, response.data.refresh_token, discord_id], (updateErr) => {
                                if (updateErr) {
                                    console.error(`Error updating database for ${discord_id}. Error message: `, updateErr.message);
                                }
                            });
                    
                            try {
                                const user = await client.users.fetch(discord_id);
                                await guild.members.add(user, { accessToken: newAccessToken });
                                usersAdded++;
                            } catch (error) {
                                console.error(`Error adding ${discord_id} to the server`);
                                usersFailed++;
                            }
                        } else {
                            console.error(`Error getting ${discord_id}'s access token`);
                            usersFailed++;
                        }
                    }

                } catch (error) {
                    console.error(`Error generating ${discord_id} access token. Error message: `, error.message);
                }
                
                final_embed = createEmbed('🚪 Join command', 5003474, `✅ ${usersAdded} users successfully added\n⚠ ${usersAlreadyAdded} users already on the server\n❌ ${usersFailed} users could not be added\n\n💠 Total users: ${usersAdded+usersFailed+usersAlreadyAdded}`);
                await reply.edit({ embeds: [final_embed] });
            }
            const end_joinall = createEmbed(`${usersAdded} users added successfully`, 2935808, null);
            await reply.edit({ embeds: [final_embed, end_joinall] });
        });
    } else if (commandName === 'users') {
        if (!authorizedUserIds.includes(interaction.user.id)) {
            const unauthorized_embed = createEmbed('🚫 Unauthorized', 13500416, 'You are not authorized to use this command.');
            interaction.reply({ embeds: [unauthorized_embed], ephemeral: true });
            return;
        }

        db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
            if (err) {
                console.error(err.message);
                return;
            }

            const users_Embed = createEmbed('👥 Users command', 5003474, `Database contains **${row.count}** users.`);
            interaction.reply({ embeds: [users_Embed]});
        });
    } else if (commandName === 'clear') {
        const amount = interaction.options.getInteger('amount');
    
        if (amount < 1 || amount > 50) {
            const clear_Embed = createEmbed('🧹 Clear command', 13500416, `Please enter a valid number of messages to be deleted.\nThis must be between **1** and **50**.`);
            interaction.reply({ embeds: [clear_Embed], ephemeral: true });
            return;
        }
    
        interaction.channel.messages.fetch({ limit: amount })
            .then(messages => {
                interaction.channel.bulkDelete(messages)
                    .then(deletedMessages => {
                        const clear_Embed = createEmbed('🧹 Clear command', 2935808, `**${deletedMessages.size}** messages successfully deleted`);
                        interaction.reply({ embeds: [clear_Embed] });
                    })
                    .catch(error => {
                        const clear_Embed = createEmbed('🧹 Clear command', 13500416, `An error has occurred while deleting messages: ${error}`);
                        interaction.reply({ embeds: [clear_Embed], ephemeral: true });
                    });
            })
            .catch(error => {
                const clear_Embed = createEmbed('🧹 Clear command', 13500416, `An error has occurred while retrieving messages: ${error}`);
                interaction.reply({ embeds: [clear_Embed], ephemeral: true });
            });
    }
});

function createEmbed(title, color, description, thumbnail) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setDescription(description)
        .setFooter({ text: 'Made by Astraa ・ https://github.com/astraadev', iconURL: 'https://cdn.discordapp.com/attachments/1033450243481677874/1040933725531275304/astraa.gif' });

    if (thumbnail) {
        embed.setThumbnail(thumbnail);
    }

    return embed;
}

refreshApplicationCommands();
client.login(TOKEN);