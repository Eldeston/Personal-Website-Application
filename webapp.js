import dotenv from "dotenv";
import express from "express";
import { Octokit } from "@octokit/rest";
import { Client, GatewayIntentBits } from "discord.js";

// For storing tokens
dotenv.config();

const port = 3000;
const app = express();

// Login through provided tokens
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

// Create Discord clients and specify intents
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// Login with token
if(process.env.DISCORD_TOKEN) {
    discordClient.login(process.env.DISCORD_TOKEN)
        .then(() => console.log('Discord bot logged in'))
        .catch(error => console.error('Discord login error:', error.message));
} else {
    console.warn('DISCORD_TOKEN not set — Discord endpoints will be unavailable');
}

// Homepage...?
app.get("/");

/* ---------------- GITHUB API ---------------- */

app.get("/api/github", async (request, result) => {
    console.log('Connected to "/webapp/github"');

    const username = request.query.username;

    if(!username) return result.status(400).json({ error: "username query param required" });

    try {
        const userData = await octokit.users.getByUsername({ username });
        const repositoryData = await octokit.paginate(octokit.repos.listForUser, { username, per_page: 100 });

        const totalStars = repositoryData.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
        const totalForks = repositoryData.reduce((sum, r) => sum + (r.forks_count || 0), 0);

        result.json({
            login: userData.data.login,
            name: userData.data.name,
            avatar_url: userData.data.avatar_url,
            html_url: userData.data.html_url,
            followers: userData.data.followers,
            following: userData.data.following,
            public_repos: userData.data.public_repos,
            public_gists: userData.data.public_gists,
            created_at: userData.data.created_at,
            total_stars: totalStars,
            total_forks: totalForks
        });
    } catch(error) {
        result.status(500).json({ error: error.message });
    }
});

/* ---------------- DISCORD API ---------------- */

app.get("/api/discord", async (request, result) => {
    console.log('Connected to "/webapp/discord"');

    if (!discordClient.isReady()) return result.status(503).json({ error: 'Discord client not ready' });

    try {
        const botUser = discordClient.user;
        const guild = discordClient.guilds.cache.get(request.query.guildId);

        // Make sure members are cached
        await guild.members.fetch();

        // Check for online members and find the size
        const onlineCount = guild.members.cache.filter(
            member => member.presence && member.presence.status === "online"
        ).size;

        result.json({
            // id: botUser.id,
            username: botUser.username,
            // discriminator: botUser.discriminator,
            // avatar: botUser.avatar,
            guildname: guild.name,
            memberCount: guild.memberCount,
            onlineCount: onlineCount
        });
    } catch(err) {
        console.error('Discord bot-stats error:', err);
        result.status(500).json({ error: err.message });
    }
});

// Does not work on Vercel
// app.use(express.static("public"));

// Starts server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})

if(process.env.NODE_ENV !== "production") {
  app.listen(3000, () => console.log("Local server running"));
}

export default app;