export const bookCompanionGreetings =
  "Hello! I'm MioTomo! Your happy book buddy! Are you enjoying your book?";

// Dynamically import the markdown file
// const markdownFiles = import.meta.glob("./spelling-prompt-2.md", {
//   query: "?raw",
//   import: "default",
// });

export function loadBookCompanionPrompt(promptName: string): Promise<string> {
  const filename = `./${promptName}-prompt.md`;
  const markdownFiles = import.meta.glob("./*-prompt.md", {
    query: "?raw",
    import: "default",
  });

  if (markdownFiles[filename]) {
    return markdownFiles[filename]();
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

export const f1_growing_wings = `The book is structured chronologically and thematically, combining:

* **Narrative storytelling** from key races and turning points
* **Character-driven insights** into leaders like Christian Horner, Adrian Newey, Sebastian Vettel, Max Verstappen, and Helmut Marko
* **Strategic breakdowns** of pivotal decisions, such as:

  * The founding of the team from Jaguar F1 in 2004
  * The design and aero innovations led by Adrian Newey
  * The four-time championship era with Vettel
  * Ricciardo vs. Verstappen tensions
  * The post-Honda engine transition and the development of Red Bull Powertrains

### Key Figures

* **Christian Horner** – Youngest F1 team principal in history; leadership, diplomacy, and controversy
* **Adrian Newey** – Technical mastermind behind car design; detail on philosophy, decisions, and conflicts
* **Sebastian Vettel** – The prodigy who led Red Bull’s first golden era (2010–2013)
* **Max Verstappen** – The modern champion; his rise, driving style, and dominance
* **Mark Webber, Daniel Ricciardo, Sergio Pérez** – Context on internal rivalries and team dynamics
* **Dietrich Mateschitz** – Red Bull co-founder; the visionary investor behind the team

* **Innovation vs. Tradition**: Red Bull’s break from traditional F1 team culture and use of aggressive branding, marketing, and engineering
* **Team Politics**: Intra-team conflicts (e.g., Vettel/Webber, Ricciardo/Verstappen), as well as political manoeuvring with the FIA and F1 leadership
* **Engineering Dominance**: Aerodynamic design, DRS innovation, development of their own engine division (Red Bull Powertrains)
* **Branding in Sport**: How Red Bull turned their team into a global youth marketing phenomenon
* **Leadership & Management**: Horner’s long-term tenure, clashes with rivals (e.g., Mercedes, Toto Wolff), and internal controversies

### 🔧 Technical Content

While readable for non-experts, the book dives into:

* F1 regulations and how Red Bull exploited or adapted to them
* Car development cycles and design decisions
* The cost cap era and how Red Bull managed operations
* Race strategies and performance analytics

The book, "Growing Wings: The Inside Story of Red Bull Racing" by Ben Hunt, tells the exciting story of the Red Bull Racing Formula 1 team. It's a non-fiction book that acts like an "inside story" of how a racing team became champions.

Here are the main points:

*   **The Main Idea: From Underdog to Champion**
    *   The book is about how **Red Bull Racing went from being a new, less serious team to one of the most successful and dominant teams in Formula 1**.
    *   When Red Bull first bought the Jaguar F1 team in 2004, other teams didn't take them seriously and thought they were just a "party team". But they proved everyone wrong.
    *   It covers **two decades of their journey**, including their very first drivers up to their incredible success with Max Verstappen.

*   **Key People and What They Did**
    *   **Dietrich Mateschitz:** He was the **founder of Red Bull** and the one who had the big idea and vision to create the racing team. His motto was **"no risk no fun,"** which was a big part of the team's spirit.
    *   **Christian Horner:** He became the **youngest ever team principal (the boss!)** of an F1 team when he joined Red Bull Racing in 2005. He played a huge role in leading the team.
    *   **Adrian Newey:** He's the **brilliant designer and technical director** who was involved from the beginning. He helped design the incredibly fast cars that won championships.
    *   **Key Drivers:**
        *   **Sebastian Vettel:** He helped Red Bull win **four championships in a row** between 2010 and 2013.
        *   **Max Verstappen:** He joined the team in 2016 and quickly became the **youngest F1 race winner**. He is now a multiple world champion for Red Bull and has broken many records.

*   **What Made Them Winners (and good lessons for kids!)**
    *   **"Winner Mentality":** Red Bull changed the team's culture to focus on winning. They believed that winners don't settle for "good enough" but always push for that extra effort. This means working hard, being committed, and never giving up.
    *   **Teamwork and Innovation:** The book shows how important it was for the team to **work together** and to always be **innovating** to make their cars faster. They weren't afraid to challenge rules or try new things.
    *   **Overcoming Challenges:** Red Bull faced many ups and downs, including changing engines and tough competition, but they always rebuilt and kept their ambition to get back on top.

*   **Exciting Parts of the Story**
    *   The book is **"packed with intrigue, high-stakes schemes, and adrenalin-fueled action on-and-off the track"**.
    *   It tells about **important races and rivalries between drivers**, where they fought hard on the track.
    *   It talks about the **amazing speed of F1 cars**, which only have 1600cc engines.

*   **Format and Style**
    *   The book is described as a "thrilling, frank, and unvarnished account" of the team.
    *   It includes striking **color photos** of important moments in Red Bull's history.
    *   It covers the team's history year-by-year from 2004 to the amazing 2023 season.

**Example of questions:**

*   What do you think it means to have a 'winner mentality' like Red Bull tried to have?
*   Imagine you're building a super-fast race car. What kind of person would you want to design it? What about the person who drives it?
*   The book says the team's motto was 'no risk no fun!' What do you think that means in racing?
*   What would be the most exciting part of being on a Formula 1 team for you?"
`;

export const f1_surving_to_drive = `Don’t assume the child knows Formula 1 — explain gently and keep it light. Always stay positive, curious, and encouraging!

**Title**: *Surviving to Drive: A Year Inside Formula 1*
**Author**: Guenther Steiner (Team Principal of the Haas F1 Team)
**What it's about**:
It’s a true story about what it’s like to run a small Formula 1 racing team. Guenther writes a diary during the 2022 racing season. He shares funny, stressful, and exciting moments, from fixing broken cars to cheering for drivers. It’s like a behind-the-scenes peek into a super fast and wild sport!

---

**Who’s who (in kid-friendly language):**

* **Guenther Steiner** – The boss of the Haas team. He’s honest, a bit grumpy sometimes, but also really funny. He tries hard to help his drivers and team do well.
* **Kevin Magnussen** – A race car driver who made a big comeback to the team in 2022. He’s fast and calm.
* **Mick Schumacher** – Another driver. He’s the son of a very famous F1 driver. He tries hard but sometimes crashes, which worries the team.
* **Gene Haas** – The team owner. He gives the money and checks how things are going.
* **Other F1 teams** – Big, powerful teams like Red Bull or Mercedes. Haas has to compete against them, even with a smaller budget.

---

**What happens in the book (in a simple way):**

* Guenther talks about every race and what went wrong or right
* He explains how hard it is to keep a team going with not much money
* He tells funny stories about drivers, car problems, and flying around the world
* Sometimes the drivers don’t listen, or they crash the car — that’s stressful!
* Guenther has to solve lots of problems and keep everyone motivated

---

**Goals:**

* Help the child understand what F1 is and how the Haas team works
* Talk about teamwork, trying your best, fixing problems, and staying calm under pressure
* Ask fun and thoughtful questions
* Be encouraging and engaging — like a racing-loving big brother or sister!

---

**Examples of questions the chatbot might ask the child:**

1. “Do you know what Formula 1 is? Want me to explain it like a race with super-fast rocket cars?”
2. “Imagine you were in charge of a racing team. What would you do if both your drivers crashed?”
3. “Guenther has to stay calm when things go wrong. Can you think of a time *you* had to stay calm under pressure?”
4. “Guenther is really funny and says silly things when he’s stressed. What do you do to feel better when you’re frustrated?”
5. “If you were a driver on the Haas team, what would your race helmet look like?”
6. “The Haas team doesn’t have much money. How do you think they can still race against bigger teams?”`;
