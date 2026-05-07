# 🧬 MIOTOMO PROMPT LIBRARY

*(Consistent Character Generation System)*

---

## 🧠 1. MASTER STYLE PROMPT (BASE)

Use this in **every prompt**.

```
Minimalist 3D character, soft rounded shapes, matte clay material, pastel color palette, floating structure, no arms, no legs, small floating pink hands (solid color), spherical body, oversized glossy eyes, eyelids same color as head, front-mounted mouth block on lower head, head wider at bottom, smooth soft lighting, clean studio render, subtle shadow, high quality, no texture noise, toy-like but premium
```

---

## ❌ NEGATIVE PROMPT (ALWAYS USE)

```
arms, legs, fingers, realistic anatomy, joints, sharp edges, detailed textures, photorealism, wrinkles, skin pores, clothing, accessories, eyebrows, nose, ears, cluttered background, high contrast lighting, hard shadows, multiple characters, distorted proportions, extra limbs, missing limbs
```

---

## 🎨 2. COLOR LOCK PROMPT

Append this to enforce consistency:

```
warm peach head, slightly darker peach mouth, muted teal spherical body, solid pink hands (no gradient), yellow spiral tail, white eyes with black pupils
```

---

## 🧬 3. CHARACTER STRUCTURE PROMPT

Use when models drift:

```
floating character made of separate volumes: large capsule head, small mouth block attached to front of head, detached spherical body below with visible gap, small floating hands on sides, single spiral whip tail attached to body, no connections between parts except tail to body
```

---

# 🎯 4. CORE PROMPT TEMPLATES

---

## 🟢 A. DEFAULT CHARACTER (NEUTRAL)

```
[MASTER STYLE PROMPT]

a friendly floating alien character, centered, neutral expression, eyes looking forward, relaxed mouth, balanced posture, tail gently curved, clean white background

[COLOR LOCK PROMPT]

[NEGATIVE PROMPT]
```

---

## 👆 B. POINTING UP (SIDE POSE)

```
[MASTER STYLE PROMPT]

floating alien character, 3/4 side view, one pink hand pointing upward, other hand visible and relaxed, eyes looking up, slight curious expression, tail gently curved, clean transparent background

[COLOR LOCK PROMPT]

[NEGATIVE PROMPT]
```

---

## ➡️ C. POINTING MIDDLE (STRAIGHT)

```
[MASTER STYLE PROMPT]

floating alien character, front view, one pink hand pointing straight forward, other hand visible and balanced, eyes focused forward, neutral confident expression, tail slightly curved, transparent background

[COLOR LOCK PROMPT]

[NEGATIVE PROMPT]
```

---

## 👇 D. POINTING DOWN

```
[MASTER STYLE PROMPT]

floating alien character, 3/4 side view, one pink hand pointing downward, other hand visible, eyes looking down, slightly thoughtful expression, tail softly drooping, transparent background

[COLOR LOCK PROMPT]

[NEGATIVE PROMPT]
```

---

# 🎭 5. EXPRESSION PROMPTS

---

## 😄 HAPPY

```
eyes wide and bright, mouth curved upward, playful energy, slight upward tilt, tail softly bouncing
```

---

## 🤔 THINKING

```
eyes looking up and slightly inward, mouth flat, subtle tilt of head, tail tightly coiled
```

---

## 😮 SURPRISED

```
eyes very wide, mouth open oval shape, slight backward lean, tail slightly extended
```

---

## 😕 CONFUSED

```
eyes slightly misaligned direction, uneven gaze, mouth slightly twisted, subtle wobble feeling, tail loose and uneven
```

---

## 😢 SAD

```
eyes slightly drooping, mouth curved downward, lower energy posture, tail hanging softly
```

---

## 😏 PLAYFUL

```
one eye slightly squinted, subtle smirk, relaxed body, tail flicking lightly
```

---

# 🌀 6. TAIL CONTROL PROMPTS

Use to force correct tail behavior:

---

## Default Tail

```
single spiral whip tail, smooth rounded shape, yellow color, thick at top and tapering to thin tip
```

---

## Animated Feel

```
tail with soft motion blur feel, slight curvature, dynamic but controlled, elastic movement
```

---

## Tight Coil (thinking)

```
tail tightly coiled under body, compact spiral, minimal movement
```

---

## Whip Motion (excited)

```
tail extended and slightly whipping, dynamic curve, expressive motion
```

---

# 📐 7. CAMERA / COMPOSITION PROMPTS

---

## Transparent Asset (IMPORTANT)

```
transparent background, no shadow plane, centered character, full body visible, no cropping, clean edges
```

---

## UI Icon Version

```
centered composition, slightly zoomed in, minimal empty space, clean silhouette readability
```

---

## Turnaround

```
front view, side view, 3/4 view, back view, consistent proportions, aligned layout
```

---

# 🧪 8. FIX PROMPTS (VERY IMPORTANT)

Use these when generation breaks.

---

## Missing Hand Fix

```
ensure both hands are visible, two pink hands present, symmetrical placement
```

---

## Wrong Eyelid Color Fix

```
eyelids must match head color exactly, not black or blue
```

---

## Tail Missing / Wrong

```
must include single yellow spiral tail attached to body, no legs or feet
```

---

## Anatomy Drift Fix

```
no arms, no legs, no joints, simplified floating structure only
```

---

## Mouth Placement Fix

```
mouth block attached to front of head, not floating separately, not between head and body
```

---

# 🔥 9. GOLD STANDARD PROMPT (COPY-PASTE)

Use this when you want maximum consistency:

```
Minimalist 3D floating alien character, soft rounded shapes, matte clay material, warm peach capsule head wider at bottom, oversized glossy eyes with eyelids same color as head, small front-mounted mouth block on lower head, detached muted teal spherical body with visible gap below head, two small floating pink hands (solid color, no gradient), single yellow spiral whip tail attached to body, smooth soft studio lighting, clean high-quality render, centered composition, transparent background

no arms, no legs, no fingers, no realistic anatomy, no eyebrows, no accessories, no extra limbs, no distortion
```

---