![Project Banner](./public/banner.png)

# Miotomo- Hackathon 🚀📚

### Project 100xEngineers Gen AI Buildathon 2.0

## **What is Miotomo?** 🤖✨

**Miotomo** is a voice-first reading companion app for children aged 6–12.

Built with the power of LLMs:

- It helps kids reflect deeply on stories through short, thoughtful conversations with a magical AI friend named Tomo, improving **analytical thinking**, **spelling**, **debating**, and **vocabulary**.
- Tomo asks questions, shares quotes, and sparks creativity — without ever reading the whole book.

---

### 👦👧 Who are the users?

- **Children (Ages 6–12)**
  Chatting with Tomo helps kids build **analytical thinking**, **spelling**, **debating**, and **vocabulary** through fun, reflective story conversations.
  Tomo uses quotes and questions to spark imagination — never reading the full book.

- **Parents**
  Get insights into your child's learning progress and support their growth with daily reflections.

- **Schools**
  Support curriculum goals by developing key skills like **critical thinking**, **storytelling**, **vocabulary**, and **pronunciation** in an engaging format.

- **Publishers**
  Give books new life with interactive story-based experiences that make reading more exciting and immersive.

---

### ❓ Why do we need Miotomo?

- **Miotomo makes reading a conversation**, helping children become thinkers, storytellers, and empathetic humans.
- **Not just another edtech app** — Miotomo doesn’t read the book for them or promote rote learning.
- **Builds their voice** in a noisy digital world by fostering imagination and emotional insight.
- As AI grows, **understanding and interpretation matter more than memory** — Miotomo nurtures these essential skills early on.

---

### 📚 Research papers

1. Science outside — [Pushing your teaching down the learning pyramid](https://www.scienceoutside.org/post/pushing-your-teaching-down-the-learning-pyramid)
2. The LEGO Foundation's report, _5 Ways Books Can Empower Play_ — [How reading can be more playful](https://learningthroughplay.com/explore-the-research/how-reading-can-be-more-playful)

---

### 💡 How does Miotomo help children?

#### 🧠 Vocabulary

**How the app helps:**
**Contextual Word Learning**
When a child reads or chats with the AI, unfamiliar words can be highlighted. The AI can:

- Define the word in kid-friendly language.
- Use it in a new sentence.
- Offer synonyms or opposites.
- Let the child try to use it in their own sentence.

---

#### 🔤 Spelling

**How the app helps:**
**Interactive Spelling Practice**

- The AI can dictate a word from the story and ask the child to spell it out.
- Voice-to-text tools can correct pronunciation and offer hints for tricky spellings.

---

#### 🗣️ Debating

**How the app helps:**

1. **Guided Debates**

   - AI can present a simple question like:
     _“Should Mowgli have stayed in the jungle or gone to the village?”_
     Then guide the child through making arguments for and against.

2. **Roleplay Arguments**
   - The AI can pretend to be a character and challenge the child’s opinion:
     _“I think Shere Khan was misunderstood. What do you think?”_
     This teaches kids to defend their point of view with reasoning.

---

#### 🧠 Cognitive & Critical Thinking Skills

- **Inference and Prediction:** Kids can guess what might happen next in the story and discuss why.
- **Comparative Thinking:** Let them compare characters, themes, or different books.
- **Cause and Effect:** Explore why certain things happen in the story and what might have changed the outcome.

---

#### 🎨 Creativity & Imagination

- **Story Creation:** Kids can rewrite chapters or endings, or create spin-off stories with guidance from AI.
- **Roleplay with Characters:** Let them have conversations as if they’re a character in the book.
- **World-building Games:** Ask them to invent new places or creatures based on the story's world.

---

#### 💬 Language & Communication

- **Reading Comprehension Checks:** Ask the AI questions about what they read to ensure understanding.
- **Speech-to-Text Practice:** Using voice, children can improve pronunciation and fluency.
- **Writing Prompts:** AI can suggest journal prompts or creative writing exercises related to the book.

---

#### 🧩 Interactive Learning

- **Mini-Quizzes & Puzzles:** AI can quiz kids on the story or vocabulary in a fun way.
- **Theme Exploration:** Dive into ideas like bravery, friendship, or fairness through guided discussion.
- **Interactive Fact-Finding:** AI can bring in real-world context (e.g. “Was the jungle in _The Jungle Book_ real?”).

---

#### 🧘‍♀️ Personal Growth & Empathy

- **Emotional Intelligence:** AI can ask how characters might have felt, helping kids explore emotions.
- **Moral Dilemmas:** Introduce ethical questions based on the plot to spark discussion.
- **Growth Tracking:** Let kids see how their skills (spelling, vocabulary, etc.) improve over time.

---

## 🛠️ Technical Details

This project leverages Deepgram Voice Agent API to enable voice interactions within the application. The user interface is built utilizing modern AI-assisted tools.

### 🧰 Tools Used

- Deepgram Voice Agent API
- gpt-4o-mini as LLM (via Deepgram)
- React for frontend coding
- Figma and Motiff for UI design

---

### 🗣️ Deepgram

The Voice Agent code is based on the example by Deepgram: [Voice agent medical assistant demo](https://github.com/deepgram-devs/voice-agent-medical-assistant-demo), stripped down to the bare minimum, and put together with the help of AI.

---

### 📝 Prompt engineering

The prototype for the buildathon doesn't have a backend and the prompts are hardcoded in the frontend with minimal modifications based on the selected book.
The prompt is loaded from a markdown file `src/lib/book-companion-prompt.md`.

Based on the selected book, the prompt is modified to include the following:

- The book title
- The author name
- (to be done) The book themes
- (to be done) The list of characters with their traits
- (to be done) Dialogues examples based on themes and characters

---

### 🗂️ Structure of the project

```
├── public
└── src
├── assets
│   └── img
├── components
│   ├── common
│   │   └── icons
│   ├── features
│   │   └── voice
│   ├── layout
│   └── sections
├── context
├── hooks
├── lib
├── styles
└── utils
```
