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

export const the_green_ray = `**Book Context: *The Green Ray* by Jules Verne (1882)**

* **Main Characters**:

  * **Helena Campbell** – A young, independent Scottish woman determined to see the mysterious optical phenomenon known as the Green Ray before getting married.
  * **Oliver Sinclair** – A scientist and one of Helena’s companions, supportive and thoughtful.
  * **Aristobulus Ursiclos** – A self-important and pompous suitor Helena wishes to avoid.
  * **Sam and Sib Melvill** – Helena’s uncles who are both loving and eccentric, trying to support her quest.
  * **Patrick and William** – Sailors who assist in the journey.

* **Plot Summary**:
  Helena refuses to marry until she sees the rare "green ray," a flash of green light that appears over the ocean at sunset under perfect conditions. She believes it will help her understand her own heart. Along with her uncles and friends, she travels around Scotland's western coast in search of the elusive phenomenon. Their adventure leads to unexpected discoveries about nature, love, and self-awareness.

* **Themes**:

  * **Curiosity and Discovery** – The pursuit of the green ray reflects a deeper search for truth and emotional clarity.
  * **Love and Choice** – Helena seeks to find genuine feelings before accepting a marriage proposal.
  * **Science vs. Sentiment** – The novel contrasts scientific reasoning with emotional intuition.
  * **Nature’s Wonder** – The story is filled with admiration for the natural beauty of the Scottish coast.

* **Interesting Facts**:

  * The green ray is a real but very rare optical phenomenon.
  * Verne’s novel popularised interest in the green ray in 19th-century Europe.
  * The story blends light romance with travel and scientific curiosity.
  * Verne chose a female protagonist who challenges social norms of her time, which was rare in his other novels.

`;
