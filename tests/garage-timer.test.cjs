const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const elements = new Map();
const element = selector => {
  if (!elements.has(selector)) elements.set(selector, { innerHTML: '', textContent: '', open: false });
  return elements.get(selector);
};
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: element }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { remainingOrderSeconds, countdown, tourSeconds, newGame, renderFleet, setGame: value => { game = value; } };\n})();', context);
const api = context.api;
const state = api.newGame('hamburg');
api.setGame(state);
const truck = { id: 'CITY-01', tier: 1, model: 'Stadtlaster', symbol: '🚚', capacity: 1.5, rarityLevel: 0 };
state.trucks.push(truck);
const start = 1_000_000;
const order = { status: 'active', category: 'national', routeType: 'single', distance: 90, volume: 4, delivered: 1.5, tripCargo: 1.5, tripStartAt: start };
const currentTour = api.tourSeconds(order, truck, 1.5);
const finalTour = api.tourSeconds(order, truck, 1);
const expected = currentTour + finalTour;
assert.ok(Math.abs(api.remainingOrderSeconds(order, truck, start) - expected) < 1e-9, 'includes current and final partial tour');
assert.ok(Math.abs(api.remainingOrderSeconds(order, truck, start + 30_000) - (expected - 30)) < 1e-9, 'counts down during current tour');
assert.equal(api.remainingOrderSeconds({ ...order, status: 'completed' }, truck, start), 0, 'finished order has no timer');
assert.equal(api.countdown(3661), '01:01:01');
assert.equal(api.countdown(0), '00:00:00');
state.trucks.push({ id: 'KARTE-r1_uncommon', cardId: 'r1_uncommon', tier: 3, model: 'Rallye-Transporter', symbol: '🚛', capacity: 8.5, rarityLevel: 0 });
api.renderFleet();
const sections = element('#fleet-list').innerHTML.split('<section class="fleet-section">').slice(1);
assert.equal(sections.length, 2, 'Garage has two tables');
assert.match(sections[0], /Kartenfahrzeuge/);
assert.match(sections[0], /KARTE-r1_uncommon/);
assert.match(sections[0], /KARTE-navigator/);
assert.match(sections[1], /Stadthub/);
assert.match(sections[1], /CITY-01/);
assert.doesNotMatch(sections[1], /KARTE-r1_uncommon/);
console.log('card garage grouping and order countdown: OK');
