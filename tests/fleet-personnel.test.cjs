const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: () => null }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { newGame, loadGame, levelForXp, dispatchCapacity, hubCapacity, operatingCostPerKm, buyTruck, unlockDepartment, setGame: value => { game = value; }, disableRendering: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
const api = context.api;
api.disableRendering();

const state = api.newGame('hamburg');
api.setGame(state);
assert.equal(api.dispatchCapacity(), 5);
assert.equal(api.hubCapacity(), 1);
state.coins = 10000;
api.unlockDepartment('hr');
assert.equal(state.company.departments.hr, undefined, 'new HR unlocks are paused');
state.xp = 999;
assert.equal(api.dispatchCapacity(), 5);
state.xp = 1000;
assert.equal(api.levelForXp(state.xp).level, 5);
assert.equal(api.dispatchCapacity(), 6);
assert.equal(api.hubCapacity(), 3);
state.xp = 30000;
assert.equal(api.levelForXp(state.xp).level, 25);
assert.equal(api.dispatchCapacity(), 10);
assert.equal(api.levelForXp(32499).level, 25);
assert.equal(api.levelForXp(32500).level, 26, 'level 25 to 26 costs 4 × 25² XP');
state.xp = Array.from({ length: 99 }, (_, index) => index + 1).reduce((sum, level) => sum + (level < 25 ? 100 * level : 4 * level * level), 0);
assert.equal(api.levelForXp(state.xp).level, 100);
assert.equal(api.dispatchCapacity(), 25);
assert.equal(api.hubCapacity(), 75);

const legacy = api.newGame('hamburg');
legacy.trucks.pop(); // A save made before the second starter existed.
legacy.version = 33;
legacy.coins = 10000;
legacy.company.departments.hr = true;
legacy.company.employees = 2;
legacy.stats.employeeSpent = 1000;
for (let i = 0; i < 6; i++) legacy.trucks.push({ ...legacy.trucks[0], id: `ALT-${i}` });
storage.set('frachtwerk-save-v2', JSON.stringify(legacy));
const migrated = api.loadGame();
assert.equal(migrated.version, 43);
assert.equal(migrated.trucks.length, 7, 'existing trucks remain');
assert.equal(migrated.coins, 11000, 'hire cost refunded once');
assert.equal(migrated.company.employees, 0);
assert.equal(migrated.stats.employeeRefund, 1000);
assert.equal(api.loadGame().coins, 11000, 'reload does not refund again');
api.setGame(migrated);
assert.equal(api.dispatchCapacity(), 5);
assert.equal(api.operatingCostPerKm(migrated.trucks[0]), .65);
api.buyTruck(2);
assert.equal(migrated.trucks.length, 7, 'over-limit save cannot buy');
migrated.xp = 10000; // Level 14: seven regular slots, still below current fleet.
api.buyTruck(2);
assert.equal(migrated.trucks.length, 7);
migrated.xp = 36000; // Level 27: ten regular slots.
migrated.coins = 25000;
api.buyTruck(2);
assert.equal(migrated.trucks.length, 8, 'buying resumes once level provides room');
console.log('fleet limits, hub slots, legacy refund and over-limit saves: OK');
