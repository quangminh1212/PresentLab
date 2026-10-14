# SAU 10 — Sài Gòn sau giờ

An animated, 10-slide HTML concept deck for a fictional city-discovery experience: choose the mood of the evening, then follow a loose route through food, music, and the streets between them.

## Open the deck

Open [`sau-10.html`](../../../examples/sau-10.html) in a browser. Scroll, swipe, or use the arrow keys, Page Up/Down, Home, and End. The floating controls appear on hover or keyboard focus.

## Project notes

- This is a concept project, not a description of a real product. Stops and times on slide 7 are illustrative.
- The ten images embedded in `sau-10.html` are generated concept artwork. They do not document real venues or events.
- CSS motion runs in the browser version. PresentLab's deterministic PNG, PDF, and PPTX renderer disables animation, so those exports are static.

## Visual prompt set

Generated with the built-in ImageGen tool. These prompts are kept with the project so the visuals can be regenerated or adapted.

### `embedded image: saigon-night-concept.png`

```text
Use case: photorealistic-natural
Asset type: opening-slide hero photograph for a 16:9 HTML pitch deck
Primary request: Create an atmospheric concept image for an imagined after-dark experience in Ho Chi Minh City. Show a lively but graceful Saigon street at night with wet pavement reflecting warm amber shop lights, subtle turquoise accents, a few blurred scooters in motion, and distant urban lights. The scene should feel human and inviting rather than crowded or chaotic.
Style/medium: premium editorial travel photography, natural street texture, realistic light and haze
Composition/framing: wide landscape, 16:9; keep the left third deep, uncluttered, and dark enough for large white presentation text; concentrate the vivid street glow and motion in the right half; no visible legible signage
Lighting/mood: late-night amber pools of light against deep midnight blue; cinematic, refined, quietly energetic
Constraints: purely conceptual artwork, not a documentary photograph or record of a real event; no text, logos, watermark, poster design, borders, or collage
Avoid: recognizable real people, distorted vehicles, oversaturated cyberpunk neon, fake interface elements, sharp readable signs
```

### `embedded image: night-food-concept.png`

```text
Use case: photorealistic-natural
Asset type: editorial inset image for a 16:9 slide deck about a fictional Saigon night-walk concept
Primary request: A close, atmospheric view of a small late-night street food counter in Ho Chi Minh City, with a steaming bowl being served and warm practical lights. Suggest the texture and welcome of a night stop without making the location identifiable.
Style/medium: premium documentary-style food and travel photography, realistic materials and candid atmosphere
Composition/framing: vertical 4:5 crop; bowl and hands in the lower center, softly glowing stall behind; no legible signage
Lighting/mood: amber tungsten light, deep navy shadows, a trace of teal reflected in wet pavement
Constraints: conceptual generated scene only, no visible faces, no logos, no text, no watermark, no collage or graphic overlay
```

### `embedded image: night-music-concept.png`

```text
Use case: photorealistic-natural
Asset type: vertical editorial image for a 16:9 slide deck about a fictional after-dark city guide
Primary request: An intimate outdoor live-music moment on a Ho Chi Minh City side street at night: a small performer seen only as a soft silhouette, a few listeners from behind, practical amber bulbs and a hint of blue light, with the everyday street still visible.
Style/medium: refined independent travel-magazine photography, natural grain and candid realism
Composition/framing: vertical 4:5 crop; the performer sits in the upper third and a small group forms a soft foreground; leave quiet dark space around the edges
Lighting/mood: warm amber bulbs against deep ink-blue night, intimate and unforced
Constraints: conceptual generated image, not a record of a real venue or event; no recognizable faces, no readable text, no logos, no watermark, no poster styling or collage
Avoid: concert stadium scale, exaggerated lasers, cyberpunk neon, perfectly staged crowd
```

## Render a static review copy

From the repository root, run `npm run build`, then:

```powershell
node dist/cli.js validate --input examples/sau-10.html
node dist/cli.js render --input examples/sau-10.html --output .artifacts/sau-10 --format png,pdf,pptx
```
