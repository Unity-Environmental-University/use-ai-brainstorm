// ── PROTOCOL TEMPLATE ───────────────────────────────────────────
// Copy this file (drop the leading underscore) to add a new protocol.
// The site auto-discovers any *.js file in this folder that doesn't
// start with _ — no other code needs to change.
//
// Two flavours:
//   • single-phase  — one `phases.main` entry, `next: null`
//   • two-phase     — two phases linked by `next`; UI shows a switch button
//
// Set `status: 'live'` to show the chatbot. `status: 'soon'` hides the
// card from the picker (the paste-sheet still works internally).

const SYSTEM = `You are running the EXAMPLE protocol.

Replace this string with the actual system prompt. It becomes the
\`system\` message the chatbot sends — so write it as instructions TO
the model, in second person.

Keep the rules short and concrete. The whole protocol is the prompt.`;

const PASTE = `Paste this once at the start of your conversation:

<the human-facing instructions you'd want someone to paste into ChatGPT
or Claude. Usually a softer, second-person version of the SYSTEM above.>

Here's what I want: <describe it>`;

export default {
  slug: 'example-protocol',                    // url-safe; matches filename ideally
  name: 'Example Protocol',                    // card title
  tagline: 'One-line description for the card.',
  blurb:
    'A paragraph that runs across the top of the protocol page. Says why this protocol exists, in plain language.',
  accent: 'sky',                               // sky | green | purple | yellow | red
  status: 'soon',                              // 'live' shows the chatbot; 'soon' hides the card
  paste: PASTE,
  seed: "The chatbot's opening line to the user.",
  phases: {
    main: { label: 'Main phase', n: null, system: SYSTEM, next: null },
    // For two-phase, use:
    //   phaseA: { label: 'Phase A', n: 1, system: A_SYSTEM, next: 'phaseB' },
    //   phaseB: { label: 'Phase B', n: 2, system: B_SYSTEM, next: null },
  },
  start: 'main',
  howto: [
    'A short step shown in the How-to-use-it sidebar.',
    'One step per array entry.',
    'Three or four is plenty.',
  ],
};
