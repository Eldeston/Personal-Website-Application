/* ---------------- VERCEL SPEED INSIGHTS ---------------- */

// Initialize Vercel Speed Insights
function initializeSpeedInsights() {
    if(typeof window !== 'undefined' && window.fetch) {
        const script = document.createElement('script');
        script.src = 'https://cdn.vercel-analytics.com/v1/script.js';
        script.async = true;

        script.onload = function() {
            if(typeof window.va !== 'undefined') {
                window.va.track = window.va.track || function() {};
            }
        };

        document.head.appendChild(script);
    }
}

// Call on page load
window.addEventListener('load', () => {
    initializeSpeedInsights();
});

/* ---------------- GITHUB API ---------------- */

function displayGithubStats(data) {
    // Get image element id
    const githubPfp = document.getElementById('githubPfp');
    // Sets current Github profile picture
    githubPfp.src = data.avatar_url;

    // Get element ids to update document with data for Github
    const userFollows = document.getElementById('userFollows');
    const userStars = document.getElementById('userStars');
    const userForks = document.getElementById('userForks');

    const userJoin = document.getElementById('userJoin');
    const userRepos = document.getElementById('userRepos');
    const userGists = document.getElementById('userGists');

    userFollows.innerHTML = `👥 Followers: ${data.followers}`;
    userStars.innerHTML = `⭐ Stars: ${data.total_stars}`;
    userForks.innerHTML = `🍴 Forks: ${data.total_forks}`;

    userJoin.innerHTML = `🗓️ Joined: ${data.created_at}`;
    userRepos.innerHTML = `📦 Repositories: ${data.public_repos}`;
    userGists.innerHTML = `📄 Gists: ${data.public_gists}`;
}

async function fetchGithubStats(username) {
    try {
        console.log('Fetching GitHub stats for:', username);
        const response = await fetch(`/github?username=${username}`);

        if(!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log('GitHub data:', data);

        // Display the data (example)
        displayGithubStats(data);
    } catch(error) {
        console.error('Error fetching GitHub stats:', error);
    }
}

/* ---------------- DISCORD API ---------------- */

function displayDiscordStats(data) {
    // Get element ids to update document with data for Discord
    const botStatus = document.getElementById('botStatus');
    const botCreation = document.getElementById('botCreation');

    const serverCount = document.getElementById('serverCount');
    const serverOnline = document.getElementById('serverOnline');

    botStatus.innerHTML = `⚙️ Status: online`;
    botCreation.innerHTML = `🗓️ Created: ${data.created_at}`;

    serverCount.innerHTML = `👥 Member Count: ${data.memberCount}`;
    serverOnline.innerHTML = `🟢 Online Count: ${data.onlineCount}`;
}

async function fetchDiscordStats(guildId) {
    try {
        console.log(`Fetching Discord stats for ${guildId}`);
        const response = await fetch(`/discord?guildId=${guildId}`);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log('Discord data:', data);

        // Display the data (example)
        displayDiscordStats(data);
    } catch(error) {
        console.error('Error fetching Discord stats:', error);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
    // Replace with dynamic username if needed
    fetchGithubStats('eldeston');
    // Replace with dynamic guild id if needed
    fetchDiscordStats('604061216779796492');
});