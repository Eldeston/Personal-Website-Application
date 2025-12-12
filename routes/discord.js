import express from "express";
import { Client, GatewayIntentBits } from "discord.js";

const router = express.Router();

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

/* ---------------- DISCORD API ---------------- */

router.get("/", async (request, result) => {
    console.log('Connected to "/discord"');

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

export default router;