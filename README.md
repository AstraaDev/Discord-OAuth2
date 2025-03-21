# [Discord] - OAuth2 Bot

![Node.js](https://img.shields.io/badge/Nodejs-16.15-informational.svg)
![Repo size](https://img.shields.io/github/repo-size/AstraaDev/Discord-OAuth2.svg?label=Repo%20size&style=flat-square)

## Description
This project allows you to manage user access to your Discord bot via OAuth2 authorization. Users must authorize the bot to join servers on their behalf. It provides useful commands for server management, a simple setup process, and a robust database to handle user information.

## Features
- Manage user access to your server via OAuth2.
- View and control users in the database.
- Refresh and manage bot commands dynamically.

## Commands

### Bot Commands
- **`/ping`**: Displays the bot's current ping.
- **`/refresh`**: Refreshes the bot's slash commands.
- **`/links`**: Sends useful links such as OAuth2 and bot invitation links.
- **`/joinall`**: Adds all users from the database to the server.
- **`/join`**: Adds a specified number of users to the server.
- **`/users`**: Displays the total number of users in the database.
- **`/clear`**: Deletes a specified number of messages in a channel.

## Setup Instructions

### Prerequisites
- Node.js v16.15 or later
- Discord bot token
- SQLite database

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/AstraaDev/Discord-OAuth2.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Discord-OAuth2
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Edit the `.env` file provided in the repository:
   ```env
   ClientID=YOUR_CLIENT_ID_HERE
   ClientSecret=YOUR_CLIENT_SECRET_HERE
   PORT=1500
   BotToken=YOUR_BOT_TOKEN_HERE
   ```
5. Modify `YOUR_USER_ID_HERE` in `src/bot.js` with your Discord account ID. Only these IDs will have access to the bot commands.
6. Replace `YOUR_CLIENT_ID_HERE` and `YOUR_REDIRECT_URI_HERE` in `src/bot.js` to match your application's OAuth2 settings.

### Running the Bot
Start the bot by running:
```bash
node bot.js
```

Start the Express server:
```bash
node index.js
```

## Creating a Discord Bot

To create your Discord bot and retrieve the necessary credentials:

1. **Go to the Discord Developer Portal**:
   Visit the [Discord Developer Portal](https://discord.com/developers/applications) and log in with your Discord account.

2. **Create a New Application**:
   - Click on "New Application."
   - Provide a name for your bot and click "Create."

3. **Generate the Client ID and Client Secret**:
   - Go to the "OAuth2" tab.
   - Under "General Information," copy your **Client ID** and **Client Secret**. These will be used in your `.env` file.

4. **Add a Bot User**:
   - Navigate to the "Bot" tab.
   - Click on "Add Bot" and confirm.
   - Copy the **Bot Token** by clicking on "Reset Token." Add this token to your `.env` file as `BotToken`.

5. **Set Up OAuth2 Redirects**:
   - In the "OAuth2" tab, under "Redirects," add your redirect URI (e.g., `http://localhost:1500/api/auth/discord/redirect`).

6. **Configure Permissions**:
   - In the "OAuth2" tab, use the URL Generator to set the bot's permissions and scopes (e.g., `bot`, `applications.commands`).
   - Generate the invitation link and use it to invite your bot to a server.

## Example OAuth2 Authorization Link Content
<img src="https://cdn.discordapp.com/attachments/1079127307656122501/1325528616729051229/image_1.png?ex=677c1e39&is=677accb9&hm=5e556d1d6d4df4a54e9bcd9d06a45df145254a7bbfdbab7796d5677aba24effe&" alt="OAuth2 Example" width="400">

## Database
SQLite is used to store user information:
- `username`: The username of the authorized user.
- `discord_id`: The Discord ID of the user.
- `access_token`: The OAuth2 access token.
- `refresh_token`: The OAuth2 refresh token.

## Additional Information
- Need help? Join the [Discord Server](https://astraadev.github.io/#/discord).
- Contributions are welcome! Open an issue or create a pull request.
