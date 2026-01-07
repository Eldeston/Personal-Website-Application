// Nothing yet RAAAAAHHH

/*

TODO:

- Impement security for the routes
- Forum posts
- Forum panel

*/

// GET highlighted posts
async function fetchHighlightedPosts() {
    try {
        const response = await fetch('/forum');

        if (!response.ok) {
            throw new Error('Failed to load highlighted posts.');
        }

        const posts = await response.json();
        return posts; // array of { _id, name, message, date }
    } catch (error) {
        console.error(error);
        return [];
    }
}

// POST a new forum message
async function submitPost(name, email, message) {
    try {
        const response = await fetch('/forum', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to submit post.');
        }

        return result.insertedId;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Example: Render highlighted posts
async function renderHighlightedPosts() {
    const container = document.getElementById('highlighted-posts');
    container.innerHTML = '<p>Loading...</p>';

    const posts = await fetchHighlightedPosts();

    if (posts.length === 0) {
        container.innerHTML = '<p>No highlighted posts yet.</p>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="consoleWindow">
            <h3>${post.name}</h3>
            <p>${post.message}</p>
            <p>${new Date(post.date).toLocaleString()}</p>
        </div>
    `).join('<br>');
}

// Example: Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    const insertedId = await submitPost(name, email, message);

    if (insertedId) {
        alert('Message submitted!');
        event.target.reset();
    } else {
        alert('Failed to submit message.');
    }
}

renderHighlightedPosts();