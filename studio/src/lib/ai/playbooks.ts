/**
 * Craft playbooks given to Claude. These encode professional editing and motion
 * design practice so results feel like a human editor's, not a generic AI cut.
 * Edit these to change how the AI edits everywhere in the product.
 */

export const EDITING_PLAYBOOK = `EDITING PLAYBOOK (follow like a senior editor):
1. Hook in the first 1.5s: open on the most visually striking or emotionally charged moment, not the start of the file.
2. Cut on action or on the beat. Never cut mid-word or mid-gesture; leave ~0.1-0.2s of breathing room around speech.
3. Remove dead air: silences, false starts, "um"s, repeated takes, out-of-focus or shaky frames, camera setup moments.
4. Vary shot length with intent: fast (0.5-1.2s) for energy, medium (1.5-3s) for information, long (3-6s) for emotion or beauty shots.
5. Story arc: hook → context → build/benefit → payoff → call to action or emotional close. Order clips for the story, not file order, unless continuity (speech) requires order.
6. Keep speech segments intact and in order when the video is a talking head, podcast, interview or tutorial.
7. Transitions are punctuation: mostly hard cuts; use 1 type of transition consistently; reserve flashy transitions (glitch, zoom, whip) for energetic styles and section changes.
8. Punch-in zooms (1.1-1.25x) on emphasis moments in talking-head content; slow pushes (1.0→1.08) on beauty/product shots.
9. Text on screen: max ~6 words per card, never cover faces/products, keep inside the safe area, consistent font pair.
10. Color: one coherent grade across all clips; warm for lifestyle/emotional, teal-orange or contrasty for cinematic, clean/neutral for corporate.
11. Respect the target duration and aspect ratio exactly; a 15s reel must feel complete, not truncated.
12. End deliberately: a hero shot, the best line, or a CTA card — never an awkward fade on a random frame.`;

export const MOTION_PLAYBOOK = `MOTION DESIGN PLAYBOOK (follow like a senior motion designer):
1. Composition: one focal point per moment; use thirds or strong centre symmetry; generous negative space; nothing important within 5% of the edges.
2. Hierarchy: headline > supporting text > decorative elements. Headline 8-14% of the short side, supporting 3.5-5%.
3. Timing: stagger entrances 3-6 frames apart; ease-out (easeOutCubic/easeOutBack/spring) on entrances, ease-in on exits; hold hero moments ≥1s; total motion should "settle" before each change.
4. Anticipation & overshoot: use easeOutBack or spring for pops, 5-15% overshoot max. Avoid linear easing except for continuous drifts.
5. Depth: layer backgrounds (gradient/orbs/grid) + mid (shapes, particles at low opacity) + foreground (type). Parallax: background moves slower than foreground.
6. Light: light-sweep across metallic/glossy type at the hero moment; light-streaks/particles in screen blend for premium energy; subtle film grain for texture.
7. Typography: max two families; tighten letter-spacing on big display type (-0.02em), open it on small caps labels (0.2-0.3em). Use gradient/extrude only for hero words.
8. Colour: 1 dominant, 1 accent, neutrals. Accent only on what matters. Dark backgrounds: avoid pure black, use deep charcoal/blue.
9. Continuity: elements should transform into the next beat (scale/position keyframes) instead of every element fading out and new ones fading in.
10. Loops: subtle (pulse 3-5%, float 8-12px) and only on 1-2 elements at a time.
11. End frame: clean lockup (logo/title + tagline) held for at least 1s, nothing moving except a slow drift.`;

export const STYLE_PROFILE_GUIDE = `When given a REFERENCE video, extract a reusable style profile: pacing (average/min/max shot length, cuts per 10s), cut rhythm (on beat or free), transitions used, zoom/camera moves, colour grade (warm/cool, contrast, saturation, black levels), text style (font feel, size, position, animation, caption style), overlays (grain, light leaks, letterbox), music feel (BPM, energy), and structure (hook, sections, ending). Apply the same *style* to the user's own footage — never copy the reference's content, logos or text.`;
