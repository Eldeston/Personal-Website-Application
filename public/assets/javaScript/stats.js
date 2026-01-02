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

    // Update each element's inner HTML
    userFollows.innerHTML = `👥 Followers: ${data.followers}`;
    userStars.innerHTML = `⭐ Stars: ${data.total_stars}`;
    userForks.innerHTML = `🍴 Forks: ${data.total_forks}`;

    userJoin.innerHTML = `🗓️ Joined: ${data.created_at}`;
    userRepos.innerHTML = `📦 Repositories: ${data.public_repos}`;
    userGists.innerHTML = `📄 Gists: ${data.public_gists}`;

    // Update top languages display (fallback to 'Other' when none available)
    displayTopLanguages(data.languages || []);
}

function displayTopLanguages(languages = []) {
    const textIds = ['language1', 'language2', 'language3', 'language4', 'language5'];
    const barIds = ['languageBar1', 'languageBar2', 'languageBar3', 'languageBar4', 'languageBar5'];

    const colorMap = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'CSS': '#563d7c',
        'HTML': '#e34c26',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'C#': '#178600',
        'Shell': '#89e051',
        'PHP': '#4F5D95',
        'Go': '#00ADD8'
    };
    
    const textOthers = document.getElementById('others');

    const languagePercentTotal = languages.reduce((sum, lang) => sum + lang.percentage, 0);
    const otherLangPercentage = Math.round(100 - languagePercentTotal);

    textOthers.textContent = `Other — ${otherLangPercentage === 0 ? '<1' : otherLangPercentage}%`;
    textOthers.style.borderLeft = `8px solid gray`;
    textOthers.style.paddingLeft = '16px';

    // Populate with available languages
    languages.slice(0, 5).forEach((lang, i) => {
        const textEl = document.getElementById(textIds[i]);
        const barEl = document.getElementById(barIds[i]);

        // When bytes exist but rounding produced 0%, show '<1%' and a small visible bar
        const hasBytes = typeof lang.bytes === 'number' && lang.bytes > 0;
        const barWidth = (lang.percentage === 0 && hasBytes) ? '1' : `${lang.percentage}`;
        const displayPct = barWidth === '1' ? '<1' : lang.percentage;

        if (textEl){
            textEl.textContent = `${lang.name} — ${displayPct}%`;
            textEl.style.borderLeft = `8px solid ${colorMap[lang.name] || 'gray'}`;
            textEl.style.paddingLeft = '16px';
        }
        if (barEl) {
            barEl.style.width = barWidth + '%';
            barEl.style.height = '100%';
            barEl.style.backgroundColor = colorMap[lang.name] || 'gray';
            barEl.style.transition = 'width 600ms ease';

            // Tooltip hover text
            barEl.setAttribute('title', `${lang.name}: ${displayPct}`);
        }
    });
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
        return data;
    } catch(error) {
        console.error('Error fetching GitHub stats:', error);
        throw error;
    }
}

/* ---------------- DISCORD API ---------------- */

function displayDiscordStats(data) {
    // Get element ids to update document with data for Discord
    const botCreation = document.getElementById('botCreation');
    const botStatus = document.getElementById('botStatus');

    const serverCount = document.getElementById('serverCount');
    const serverOnline = document.getElementById('serverOnline');

    // Update each element's inner HTML
    botCreation.innerHTML = `🗓️ Created: ${data.created_at}`;
    botStatus.innerHTML = `⚙️ Status: online`;

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