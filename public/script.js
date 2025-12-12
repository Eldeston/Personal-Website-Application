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
    const githubPfp = document.getElementById('githubPfp');
    // Example: update DOM with the data
    const container = document.getElementById('github-stats');

    // Warn and exit when no element is found
    if(!container) {
        console.warn('No #github-stats element found');
        return;
    }

    // Sets current Github profile picture
    githubPfp.src = data.avatar_url;

    container.innerHTML = `
        <div>
            <h3>👤 Username: ${data.name || data.login}</h3>
            <p>⭐ Stars: ${data.total_stars}</p>
            <p>🍴 Forks: ${data.total_forks}</p>
        </div>

        <div>
            <p>👥 Followers: ${data.followers}</p>
            <p>📦 Public Repos: ${data.public_repos}</p>
            <p><a href="${data.html_url}" target="_blank">View Profile</a><p>
        </div>
    `;
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
    // Example: update DOM with the data
    const container = document.getElementById('discord-stats');

    if(!container) {
        console.warn('No #discord-stats element found');
        return;
    }

    container.innerHTML = `
        <div>
            <h3>🤖 Bot Name: ${data.username}</h3>
            <p>🏛️ Guild Name: ${data.guildname}</p>
        </div>

        <div>
            <p>👥 Member Count: ${data.memberCount}</p>
            <p>🟢 Online Count: ${data.onlineCount}</p>
        </div>
    `;
}

// ...existing code...

async function fetchDiscordStats(guildId) {
    try {
        console.log(`Fetching Discrod stats for ${guildId}`);
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