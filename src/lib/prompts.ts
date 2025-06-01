export const bookCompanionGreetings =
  "Hello! I'm MioTomo! Your happy book buddy! Are you enjoying your book?";

// Dynamically import the markdown file
const markdownFiles = import.meta.glob("./book-companion-prompt.md", {
  query: "?raw",
  import: "default",
});

export function loadBookCompanionPrompt(): Promise<string> {
  for (const path in markdownFiles) {
    const loadFile = markdownFiles[path];
    return loadFile();
  }
  return Promise.resolve(""); // fallback if not found
}
