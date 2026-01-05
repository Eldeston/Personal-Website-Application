/* Dynamic typewriter animation, better than using the CSS method and works for all elements */

// Function for typing effect
function startTyping(element) {
    // Store text before clearing
    const currText = element.textContent;
    // Empty string
    element.textContent = "";
    // Record current iteration
    let iterations = 0;

    // Declare a recursive function
    function typing() {
        // If conditions are met, exit function
        if(iterations >= currText.length) return;
        // Add the next character
        element.textContent += currText[iterations];
        // Iterate for the next character
        iterations++;
        // Call the function again after 62.5ms
        setTimeout(typing, 62.5);
    }

    // Call function after 500ms
    setTimeout(typing, 500);
}

// Create intersection observer
// This is also faster than using onScroll
// The onScroll fires the script multiple times while the observer can be fired once
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        // Simply return when intersection has not been made
        if(!entry.isIntersecting) return;
        // Call on function
        startTyping(entry.target);
        // Stop observing once started
        observer.unobserve(entry.target);
    });
// This sets theshold to execute the function when 50% of the element is in view
}, { threshold: 0.5 });

// Observe all elements with the 'typing' class
document.querySelectorAll('.typing').forEach(element => {
    observer.observe(element);
});