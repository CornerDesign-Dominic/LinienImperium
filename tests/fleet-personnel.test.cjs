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
vm.runInContext(beforeEvents + '\n globalThis.api = { newGame, levelForXp, dispatchCapacity, hubCapacity, operatingCostPerKm, buyTruck, unlockDepartment, setGame: value => { game = value; }, disableRendering: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
const api = context.api;
api.disableRendering();

const state = api.newGame('hamburg');
api.setGame(state);
assert.equal(api.dispatchCapacity(), 10);
assert.equal(api.hubCapacity(), 1);
assert.equal(state.trucks.length, 1);
assert.equal(state.trucks[0].cardId, 'navigator');
assert.equal(api.operatingCostPerKm(state.trucks[0]), .65);
state.coins = 10000;
api.unlockDepartment('hr');
assert.equal(state.company.departments.hr, undefined, 'new HR unlocks are paused');
state.xp = 1000;
assert.equal(api.levelForXp(state.xp).level, 5);
assert.equal(api.dispatchCapacity(), 10, 'card garage capacity does not depend on player level');
assert.equal(api.hubCapacity(), 3);
state.xp = 30000;
assert.equal(api.levelForXp(state.xp).level, 25);
assert.equal(api.dispatchCapacity(), 10);
assert.equal(api.hubCapacity(), 18);
assert.equal(api.buyTruck(2), false, 'regular trucks are no longer sold');
assert.equal(state.trucks.length, 1);
console.log('fixed card garage capacity, hub slots and paused HR: OK');
