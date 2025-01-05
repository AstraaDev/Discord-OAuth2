# [Discord] - OAuth2 Bot

![Node.js](https://img.shields.io/badge/Nodejs-16.15-informational.svg)
![Repo size](https://img.shields.io/github/repo-size/AstraaDev/Discord-OAuth2.svg?label=Repo%20size&style=flat-square)

## Description
This project allows you to manage user access to your Discord bot via OAuth2 authorization. Users must authorize the bot to join servers on their behalf.

## Features
- Manage user access to your server.
- View and control users in the database.
- Various commands to facilitate interaction with the bot.

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
4. Create a `.env` file and add the following variables:
   ```env
   BotToken=YOUR_DISCORD_BOT_TOKEN
   ClientID=YOUR_CLIENT_ID
   ClientSecret=YOUR_CLIENT_SECRET
   PORT=1500
   ```

### Running the Bot
Start the bot by running:
```bash
node bot.js
```

Start the Express server:
```bash
node index.js
```

## Database
SQLite is used to store user information:
- `username`: The username of the authorized user.
- `discord_id`: The Discord ID of the user.
- `access_token`: The OAuth2 access token.
- `refresh_token`: The OAuth2 refresh token.

## Additional Information
- For support, join the [Discord Server](https://discord.gg/PKR7nM9j9U).
- Contributions are welcome. Feel free to open an issue or create a pull request.
