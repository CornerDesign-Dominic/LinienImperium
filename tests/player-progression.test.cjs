const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const elements = new Map();
const element = selector => {
  if (selector === 'dialog[open]') return [...elements.values()].find(item => item.open) || null;
  if (!elements.has(selector)) elements.set(selector, { innerHTML: '', textContent: '', disabled: false, open: false, showModal() { this.open = true; }, close() { this.open = false; }, setAttribute() {} });
  return elements.get(selector);
};
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: element }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { newGame, loadGame, levelForXp, dispatchCapacity, expeditionCapacity, settleTrips, tourSeconds, renderStats, maybeShowLevelUpDialog, adjustLevelAllocation, confirmLevelUpAllocation, setGame: value => { game = value; }, mute: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
const api = context.api;
api.mute();

function activeOrder(state, id, routeType, volume) {
  const truck = state.trucks[0];
  const order = { id, category: 'national', kind: 'normal', routeType, distance: 30, volume,
    delivered: 0, customer: null, status: 'active', homeCity: 'hamburg', truckId: truck.id,
    tripCargo: Math.min(truck.capacity, volume), tripStartAt: 0 };
  state.orders = [order];
  return { order, truck };
}

for (const [routeType, firstXp, totalXp] of [['single', 4, 5.5], ['dual', 8, 11]]) {
  const state = api.newGame('hamburg');
  api.setGame(state);
  const { order, truck } = activeOrder(state, `XP-${routeType}`, routeType, 5.5);
  const firstEnd = api.tourSeconds(order, truck, 4) * 1000;
  assert.equal(api.settleTrips(firstEnd), true);
  assert.equal(order.delivered, 4);
  assert.equal(state.xp, firstXp, `${routeType}: first loaded trip awards tonnage only`);
  assert.equal(api.settleTrips(firstEnd + api.tourSeconds(order, truck, 1.5) * 1000 + 1), true);
  assert.equal(order.status, 'completed');
  assert.equal(state.xp, totalXp, `${routeType}: partial final trip and completion add no flat XP`);
  assert.equal(state.stats.tons, totalXp);
  assert.equal(api.settleTrips(Date.now()), false, 'completed order cannot award XP twice');
}

assert.equal(api.levelForXp(29999).level, 24);
assert.equal(api.levelForXp(30000).level, 25);
assert.equal(api.levelForXp(32499).level, 25);
assert.equal(api.levelForXp(32500).level, 26);
assert.equal(api.levelForXp(32500).need, 4 * 26 * 26);

const old = api.newGame('hamburg');
old.version = 37;
old.xp = 122500; // Level 50 under the former 100 × L curve.
old.expedition.points = 17;
old.manualRefreshCount = 2;
old.nextAutoRefreshAt = Date.now() + 15 * 60 * 1000;
storage.set('frachtwerk-save-v2', JSON.stringify(old));
const migrated = api.loadGame();
api.setGame(migrated);
assert.equal(migrated.version, 43);
assert.equal(migrated.levelFloor, 50);
assert.equal(api.levelForXp(migrated.xp, migrated).level, 50);
assert.equal(api.dispatchCapacity(), 10);
assert.equal(migrated.expedition.points, 17);
assert.equal(migrated.manualRefreshCount, 2);
assert.equal(migrated.nextAutoRefreshAt, old.nextAutoRefreshAt);
assert.equal(api.loadGame().nextAutoRefreshAt, migrated.nextAutoRefreshAt, 'timer migration runs once');
assert.equal(api.loadGame().levelFloor, 50, 'reached level remains stored after reload');

activeOrder(migrated, 'XP-OLD', 'single', 1);
assert.equal(api.settleTrips(Date.now()), true);
assert.equal(migrated.xp, 122501);
assert.equal(migrated.expedition.points, 17, 'old level does not award a refill again');
assert.equal(api.levelForXp(migrated.xp, migrated).level, 50);

const nextThreshold = Array.from({ length: 50 }, (_, index) => index + 1)
  .reduce((sum, level) => sum + (level < 25 ? 100 * level : 4 * level * level), 0);
migrated.xp = nextThreshold - 1;
activeOrder(migrated, 'XP-NEW', 'single', 1);
api.settleTrips(Date.now());
assert.equal(api.levelForXp(migrated.xp, migrated).level, 51);
assert.equal(migrated.expedition.points, 67, 'only the newly earned level grants a refill');
assert.equal(migrated.inventory.overtimeRefills, 1, 'normal transport level-up grants one stored overtime refill');
assert.equal(api.loadGame().expedition.points, 67, 'refill stays claimed after reload');
assert.deepEqual([...migrated.pendingLevelUps], [51]);
assert.equal(migrated.overtimePoints, 100);
assert.equal(migrated.overtimeCapacity, 100);
api.renderStats();
assert.equal(element('#topbar-overtime-points').textContent, '100 / 100');
api.maybeShowLevelUpDialog();
assert.equal(element('#level-up-dialog').open, true);
assert.match(element('#level-up-title').textContent, /Herzlichen Glückwunsch zu Level 51/);
assert.equal(api.confirmLevelUpAllocation(), false, 'an incomplete allocation cannot be committed');
for (let i = 0; i < 3; i++) assert.equal(api.adjustLevelAllocation('expedition', 1), true);
for (let i = 0; i < 2; i++) assert.equal(api.adjustLevelAllocation('overtime', 1), true);
assert.equal(api.adjustLevelAllocation('overtime', 1), false, 'no sixth point can be assigned');
assert.equal(element('#confirm-level-up').disabled, false);
assert.equal(api.confirmLevelUpAllocation(), true);
assert.equal(element('#level-up-dialog').open, false);
assert.equal(api.expeditionCapacity(), 53);
assert.equal(migrated.expedition.points, 70);
assert.equal(migrated.overtimeCapacity, 102);
assert.equal(migrated.overtimePoints, 102);
assert.equal(migrated.pendingLevelUps.length, 0);
assert.equal(api.confirmLevelUpAllocation(), false, 'claimed points cannot be assigned twice');
assert.equal(api.loadGame().overtimePoints, 102);

migrated.pendingLevelUps.push(52, 53);
api.maybeShowLevelUpDialog();
for (let i = 0; i < 5; i++) api.adjustLevelAllocation('overtime', 1);
assert.equal(api.confirmLevelUpAllocation(), true);
assert.equal(element('#level-up-dialog').open, true, 'next offline level-up opens after the first allocation');
assert.match(element('#level-up-title').textContent, /Level 53/);
for (let i = 0; i < 5; i++) api.adjustLevelAllocation('expedition', 1);
assert.equal(api.confirmLevelUpAllocation(), true);
assert.equal(migrated.pendingLevelUps.length, 0);
assert.equal(migrated.overtimeCapacity, 107);
assert.equal(api.expeditionCapacity(), 58);

console.log('tonnage XP, level-up allocation, and existing-save progression: OK');
