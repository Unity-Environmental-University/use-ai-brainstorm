// ── Protocol registry ───────────────────────────────────────────
// Auto-collects every sibling *.js file in this folder (except files
// starting with _ or this index). Adding a protocol = dropping a file
// in this directory. No other code needs to change.
//
// Each protocol file `export default`s its definition. The shape is
// documented in `_template.js`.

const modules = import.meta.glob('./*.js', { eager: true });

const list = [];
for (const path in modules) {
  if (path === './index.js') continue;
  // skip files prefixed with _ (templates, scratch files, etc.)
  if (path.startsWith('./_')) continue;
  const def = modules[path].default;
  if (!def) {
    // Helpful early warning for someone adding a new protocol who
    // forgets the default export.
    console.warn(`[protocols] ${path} has no default export — skipped`);
    continue;
  }
  list.push(def);
}

// Stable order: live ones first (in their declared order), then soon.
list.sort((a, b) => {
  const liveA = a.status === 'live' ? 0 : 1;
  const liveB = b.status === 'live' ? 0 : 1;
  return liveA - liveB;
});

export const PROTOCOL_LIST = list;

export const PROTOCOLS = Object.fromEntries(list.map((p) => [p.slug, p]));
