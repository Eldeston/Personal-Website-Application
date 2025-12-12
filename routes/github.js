import express from "express";
import { Octokit } from "@octokit/rest";

const router = express.Router();

// Login through provided tokens
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

/* ---------------- GITHUB API ---------------- */

router.get("/", async (request, result) => {
    console.log('Connected to "/github"');

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

export default router;