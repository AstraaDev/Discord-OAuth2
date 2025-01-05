require('dotenv').config();
const express = require('express');
const axios = require('axios');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();

const port = process.env.PORT || 1500;
const app = express();

const db = new sqlite3.Database('db.sqlite');

console.log('ClientID:', process.env.ClientID);
console.log('ClientSecret:', process.env.ClientSecret);

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, discord_id TEXT, access_token TEXT, refresh_token TEXT)");
});

app.get('/api/auth/discord/redirect', async (req, res) => {
    const { code } = req.query;

    if (code) {
        const formData = new url.URLSearchParams({
            client_id: process.env.ClientID,
            client_secret: process.env.ClientSecret,
            grant_type: 'authorization_code',
            code: code.toString(),
            redirect_uri: 'http://localhost:1500/api/auth/discord/redirect',
        });

        const output = await axios.post('https://discord.com/api/v10/oauth2/token',
            formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
        });

        if (output.data) {
            const access = output.data.access_token;

            const userinfo = await axios.get('https://discord.com/api/v10/users/@me', {
                headers: {
                    'Authorization': `Bearer ${access}`,
                },
            });

            const existingUser = await getUserByDiscordId(userinfo.data.id);

            if (existingUser) {
                db.run("UPDATE users SET username = ?, access_token = ?, refresh_token = ? WHERE discord_id = ?",
                    [userinfo.data.username, output.data.access_token, output.data.refresh_token, userinfo.data.id], (err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log("User data updated in database");
                        }
                    });
            } else {
                db.run("INSERT INTO users (username, discord_id, access_token, refresh_token) VALUES (?, ?, ?, ?)",
                    [userinfo.data.username, userinfo.data.id, output.data.access_token, output.data.refresh_token], (err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log("User registered in the database");
                        }
                    });
            }

            console.log(output.data, userinfo.data);
            
        } 
    }
});

function getUserByDiscordId(discordId) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE discord_id = ?", [discordId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

app.listen(port, () => {console.log(`Running on ${port}`)});