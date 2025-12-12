import dotenv from "dotenv";
import express from "express";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Imports routes
import github from "./routes/github.js";
import discord from "./routes/discord.js";

const port = 3000;
const app = express();

// Homepage route (still does not work)
// app.get("/", (request, result) => {
//     result.sendFile("index.html", { root: "./public" });
// });

// Serves the files for frontend (DOES NOT FLIPPIN WORK)
app.use(path.join(__dirname, 'public'));

app.use((result, request) => {
    request.status(404);
    request.send("<h1>Page not found. Error 404.</h1>")
});

/* ---------------- GITHUB API ---------------- */

// Mount routes for Github
app.use("/github", github);

/* ---------------- DISCORD API ---------------- */

// Mount routes for Discord
app.use("/discord", discord);

/* ---------------- STARTS SERVER ---------------- */

// Listen on specified port
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

export default app;