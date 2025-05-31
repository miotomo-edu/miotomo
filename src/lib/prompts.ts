export const bookCompanionGreetings = "Hello! I'm MioTomo! Your happy book buddy! Are you enjoying your book?";

// Dynamically import the markdown file
const markdownFiles = import.meta.glob('./book-companion-prompt.md', { query: '?raw', import: 'default' });

// Initialize the variable to hold the content of the markdown file
export let bookCompanionPrompt = '';

// Load the content of the markdown file
for (const path in markdownFiles) {
  const loadFile = markdownFiles[path]; // `loadFile` is a function that returns a Promise
  bookCompanionPrompt = await loadFile(); // Call the function to load the file content
  break; // Since we only have one file, we can stop after loading it
}
