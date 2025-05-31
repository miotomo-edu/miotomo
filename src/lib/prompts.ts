export const bookCompanionGreetings =
  "Hello! I'm MioTomo! Your happy book buddy! Are you enjoying your book?";

// Dynamically import the markdown file
const markdownFiles = import.meta.glob("./book-companion-prompt.md", {
  query: "?raw",
  import: "default",
});

// Initialize the variable to hold the content of the markdown file
export let bookCompanionPrompt = "";

// Load the content of the markdown file
async function loadPrompt() {
  for (const path in markdownFiles) {
    const loadFile = markdownFiles[path];
    bookCompanionPrompt = await loadFile();
    break;
  }
}
loadPrompt();
