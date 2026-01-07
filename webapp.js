import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { Octokit } from '@octokit/rest';
import { Client, GatewayIntentBits } from 'discord.js';

const port = 3000;
const app = express();

import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serves the files for frontend and enables json
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ---------------- GITHUB API ---------------- */

// Login through provided tokens
// Otherwise, unauthenticated requests have a very low rate limit
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

async function getTopLanguages(repositoryData, limit = 5) {
    // Fetch languages for all repositories when promise is settled
    const languageResponses = await Promise.allSettled(
        repositoryData.map(r => octokit.repos.listLanguages({ owner: r.owner.login, repo: r.name }))
    );

    // Create object to total up language bytes
    const languageTotals = {};
    // Loops through all responses
    for (const res of languageResponses) {
        // Only process fulfilled promises with data
        if (res.status === 'fulfilled' && res.value && res.value.data) {
            // Loops through each language in the response
            for (const [lang, bytes] of Object.entries(res.value.data)) {
                languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
            }
        }
    }

    // Finds total bytes
    const totalBytes = Object.values(languageTotals).reduce((s, v) => s + v, 0);
    // Convert to array and sort by bytes
    // Javascript can't sort objects directly
    const languagesArray = Object.entries(languageTotals)
        .map(([name, bytes]) => ({ name, bytes }))
        .sort((a, b) => b.bytes - a.bytes);

    // Return top languages with percentage
    return languagesArray.slice(0, limit).map(({ name, bytes }) => ({
        name,
        bytes,
        percentage: totalBytes ? Math.round((bytes / totalBytes) * 100) : 0
    }));
}

app.get('/github', async (request, result) => {
    // Announce connection
    console.log('Connected to "/github"');

    // Get username from query params
    const username = request.query.username;

    // Validate username
    if (!username) return result.status(400).json({ error: 'username query param required' });

    try {
        // Fetch user data from GitHub API
        const userData = await octokit.users.getByUsername({ username });
        const repositoryData = await octokit.paginate(octokit.repos.listForUser, { username, per_page: 100 });

        // Calculate total stars and forks
        const totalForks = repositoryData.reduce((sum, r) => sum + (r.forks_count || 0), 0);
        const totalStars = repositoryData.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

        // Get top languages
        const topLanguages = await getTopLanguages(repositoryData, 5);

        result.json({
            avatar_url: userData.data.avatar_url,
            followers: userData.data.followers,
            public_repos: userData.data.public_repos,
            public_gists: userData.data.public_gists,
            created_at: userData.data.created_at,
            total_stars: totalStars,
            total_forks: totalForks,
            languages: topLanguages
        });
    } catch (error) {
        result.status(500).json({ error: error.message });
    }
});

/* ---------------- DISCORD API ---------------- */

// Create Discord clients and specify intents
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// Login with token
if (process.env.DISCORD_TOKEN) {
    discordClient.login(process.env.DISCORD_TOKEN)
        .then(() => console.log('Discord bot logged in'))
        .catch(error => console.error('Discord login error:', error.message));
} else {
    console.warn('DISCORD_TOKEN not set — Discord endpoints will be unavailable');
}

app.get('/discord', async (request, result) => {
    // Announce connection
    console.log('Connected to "/discord"');

    // Check if client is ready
    if (!discordClient.isReady()) return result.status(503).json({ error: 'Discord client not ready' });

    try {
        const botUser = discordClient.user;
        const guild = discordClient.guilds.cache.get(request.query.guildId);
        if (!guild) return result.status(400).json({ error: 'Invalid or missing guildId' });

        // Make sure members are cached
        await guild.members.fetch();

        // Check for online members and find the size
        const onlineCount = guild.members.cache.filter(
            member => member.presence && member.presence.status === 'online'
        ).size;

        result.json({
            // id: botUser.id,
            username: botUser.username,
            created_at: botUser.createdAt,
            // discriminator: botUser.discriminator,
            // avatar: botUser.avatar,
            guildname: guild.name,
            memberCount: guild.memberCount,
            onlineCount
        });
    } catch(error) {
        console.error('Discord bot-stats error:', error);
        result.status(500).json({ error: error.message });
    }
});

/* ---------------- MONGO DB ---------------- */

// Connect to MongoDB (for some reason this is crashing Vercel)
const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function initMongo() {
    try {
        // Connect to MongoDB
        console.log("Connecting to MongoDB...");
        await client.connect();

        // Find/create database
        const db = client.db('forumDatabase');
        console.log("MongoDB connected successfully");

        // Return database
        return db.collection('forumPosts');
    } catch (error) {
        // Null means MongoDB is unavailable
        console.warn("MongoDB unavailable — running without database");
        return null;
    }
}

// Initialize MongoDB
const forumPosts = await initMongo();

// Sends higlighted forum posts
app.get('/forum', async (request, result) => {
    console.log('GET /forum');

    try {
        // Sends only highlighted posts
        const posts = await forumPosts
            .find({ isHighlighted: true }, {
                // Send only this data
                projection: {
                    _id: 1,
                    name: 1,
                    message: 1,
                    date: 1
                }
            })
            .sort({ date: -1 })
            .toArray();

        // Send results
        result.json(posts);
    } catch (error) {
        console.error(error);
        result.status(503).json({ error: 'Forum service unavailable.' });
    }
});

// Receives forum posts
app.post('/forum', async (request, result) => {
    console.log('POST /forum');

    try {
        const { name, email, message } = request.body;

        if(!name || !message) return result.status(400).json({ error: 'Missing name or message.' });

        const newPost = {
            name,
            email: email || null,
            message,
            date: new Date(),
            isHighlighted: false
        };

        const insertResult = await forumPosts.insertOne(newPost);

        result.json({ insertedId: insertResult.insertedId });
    } catch (error) {
        console.error(error);
        result.status(503).json({ error: 'Forum service unavailable.' });
    }
});

/* ---------------- START SERVER ---------------- */

// Listen on specified port and announce url
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

// Needed for Vercel to work (this is insanity)
export default app;