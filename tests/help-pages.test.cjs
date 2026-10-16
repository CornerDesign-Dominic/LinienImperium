const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const views = [...html.matchAll(/id="view-([a-z-]+)" class="view(?: active)?"/g)].map(match => match[1]);
assert.equal(views.length, 14);
assert.match(html, /id="page-help-button"[^>]*aria-haspopup="dialog"/);
assert.match(html, /<dialog id="page-help-dialog"[^>]*aria-labelledby="page-help-title"/);

const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector, { textContent: '', innerHTML: '', open: false, showModal() { this.open = true; }, close() { this.open = false; } });
  return elements.get(selector);
}
const storage = new Map();
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  document: { querySelector: element },
  Date, Math, Intl, Number, JSON, setTimeout, clearTimeout
});
vm.runInContext(source.slice(0, source.indexOf("  document.addEventListener('click'")) + '\n globalThis.api = { pageHelp, openPageHelp, setView: view => { currentView = view; } };\n})();', context);
for (const view of views) {
  const [title, sections] = context.api.pageHelp(view);
  assert.ok(title && !title.includes('Spielregeln'), `${view}: page-specific title`);
  assert.ok(sections.length >= 2, `${view}: rules and calculations`);
  assert.ok(sections.every(([heading, body]) => heading && body.includes('<p>')), `${view}: readable sections`);
  assert.match(sections.at(-1)[1], /app\.js/, `${view}: where to adjust values`);
  context.api.setView(view);
  context.api.openPageHelp();
  assert.match(element('#page-help-title').textContent, new RegExp(title));
  assert.equal((element('#page-help-content').innerHTML.match(/class="page-help-section"/g) || []).length, sections.length);
}
assert.match(context.api.pageHelp('expeditions')[1][1][1], /6,00 %|6 %/);
assert.match(context.api.pageHelp('special')[1][2][1], /1\.000 tkm/);
assert.match(context.api.pageHelp('special')[1][1][1], /beim Start gespeichert/);
assert.match(context.api.pageHelp('statistics')[1][0][1], /52,75 g\/tkm/);
assert.equal(element('#page-help-dialog').open, true);
console.log('all 14 views have contextual calculations in the shared help dialog: OK');
