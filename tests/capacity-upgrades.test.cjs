const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const elements = new Map();
const element = key => {
  if (!elements.has(key)) elements.set(key, { innerHTML: '', textContent: '', open: false, insertAdjacentHTML(position, html) { this.innerHTML = position === 'afterbegin' ? html + this.innerHTML : this.innerHTML + html; }, close() { this.open = false; } });
  return elements.get(key);
};
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: element }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { TRUCKS, newGame, loadGame, save, upgradeTruckCapacity, renderTruckDialog, saleQuote, setTruck: value => { selectedTruckId = value; }, setGame: value => { game = value; }, mute: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
const api = context.api;
api.mute();

const expected = [
  [1, 1, 1.5], [1.5, 2, 2.5], [4, 3, 5.5], [8.5, 5, 11],
  [18, 12, 24], [13, 8, 17], [24, 0, 24]
];
const state = api.newGame('hamburg');
api.setGame(state);
state.inventory.capacityModules = 100;
state.orders = [];
state.trucks = expected.map(([base], tier) => ({ id: `TEST-${tier}`, tier, model: api.TRUCKS[tier].model, capacity: base, rarityLevel: 0, moduleCapacityLevel: 0, purchasePrice: api.TRUCKS[tier].price }));
for (const [tier, [base, limit, maximum]] of expected.entries()) {
  const truck = state.trucks[tier];
  assert.equal(api.TRUCKS[tier].capacity, base);
  assert.equal(api.TRUCKS[tier].maxCapacityLevel, limit);
  const price = api.TRUCKS[tier].emptyCostPerKm;
  for (let level = 1; level <= limit; level++) {
    const before = state.inventory.capacityModules;
    assert.equal(api.upgradeTruckCapacity(truck.id), true);
    assert.equal(truck.moduleCapacityLevel, level);
    assert.equal(truck.capacity, base + level * .5);
    assert.equal(state.inventory.capacityModules, before - 1);
  }
  assert.equal(truck.capacity, maximum);
  assert.equal(truck.moduleCapacitySpent || 0, limit);
  assert.equal(api.upgradeTruckCapacity(truck.id), false, 'model-specific maximum prevents another purchase');
  assert.equal(api.TRUCKS[tier].emptyCostPerKm, price);
  assert.equal(api.saleQuote(truck).modulesLost, limit);
}
api.setTruck('TEST-5');
api.renderTruckDialog();
assert.match(element('#truck-dialog-content').innerHTML, /Ausbaustufe 8 \/ 8 · Aktuell 17 t · Maximum 17 t/);
assert.match(element('#truck-dialog-content').innerHTML, /Maximale Kapazität erreicht/);
api.setTruck('TEST-6');
api.renderTruckDialog();
assert.match(element('#truck-dialog-content').innerHTML, /Ausbaustufe 0 \/ 0 · Aktuell 24 t · Maximum 24 t/);
state.trucks[3].moduleCapacityLevel = 4;
state.trucks[3].capacity = 10.5;
api.setTruck('TEST-3');
api.renderTruckDialog();
assert.match(element('#truck-dialog-content').innerHTML, /Ausbaustufe 4 \/ 5 · Aktuell 10,5 t · Maximum 11 t/);
assert.match(element('#truck-dialog-content').innerHTML, /\+0,5 t · 1 Kapazitätsmodul/);
const loaded = api.loadGame();
assert.equal(loaded.trucks.find(truck => truck.id === 'TEST-4').capacity, 24);
assert.equal(loaded.trucks.find(truck => truck.id === 'TEST-5').moduleCapacityLevel, 8);

const old = api.newGame('hamburg');
old.version = 41;
old.trucks = [
  { id: 'LEGACY-SPRINTER', tier: 0, model: api.TRUCKS[0].model, capacity: 2, moduleCapacityLevel: 1, rarityLevel: 0 },
  { id: 'LEGACY-REGIONAL', tier: 2, model: api.TRUCKS[2].model, capacity: 6, moduleCapacityLevel: 2, rarityLevel: 0 },
  { id: 'LEGACY-18', tier: 3, model: api.TRUCKS[3].model, capacity: 9.5, moduleCapacityLevel: 1, rarityLevel: 0 },
  { id: 'LEGACY-TAUTLINER', tier: 6, model: api.TRUCKS[6].model, capacity: 25, moduleCapacityLevel: 1, rarityLevel: 0 }
];
storage.set('frachtwerk-save-v2', JSON.stringify(old));
const migrated = api.loadGame();
assert.equal(migrated.version, 42);
assert.deepEqual(migrated.trucks.map(truck => truck.id), old.trucks.map(truck => truck.id));
assert.deepEqual(migrated.trucks.map(truck => truck.capacity), [2, 6, 9.5, 25]);
assert.deepEqual(migrated.trucks.map(truck => truck.moduleCapacityLevel), [2, 4, 2, 2]);
assert.deepEqual(migrated.trucks.map(truck => truck.moduleCapacitySpent), [1, 4, 1, 1]);
api.setGame(migrated);
assert.equal(api.upgradeTruckCapacity('LEGACY-SPRINTER'), false);
assert.equal(api.upgradeTruckCapacity('LEGACY-REGIONAL'), false);
assert.equal(api.upgradeTruckCapacity('LEGACY-TAUTLINER'), false);
migrated.inventory.capacityModules = 1;
assert.equal(api.upgradeTruckCapacity('LEGACY-18'), true);
assert.equal(migrated.trucks[2].capacity, 10);
assert.equal(migrated.trucks[2].moduleCapacitySpent, 2);
assert.equal(api.loadGame().trucks[2].capacity, 10, 'legacy upgrade survives reload');
api.setTruck('LEGACY-SPRINTER');
api.renderTruckDialog();
assert.match(element('#truck-dialog-content').innerHTML, /Älterer Spielstand: Bereits erworbene Kapazität bleibt erhalten/);

console.log('vehicle-specific capacity upgrades and legacy capacity migration: OK');
