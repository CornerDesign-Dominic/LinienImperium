const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const elements = new Map();
const element = key => {
  if (!elements.has(key)) elements.set(key, { innerHTML: '', textContent: '', open: false, showModal() { this.open = true; }, close() { this.open = false; }, insertAdjacentHTML(_where, html) { this.innerHTML += html; } });
  return elements.get(key);
};
const math = Object.create(Math);
math.random = Math.random;
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math: math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: element }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { RANK_GEAR_COSTS, GEAR_LOOT, newGame, loadGame, save, rankGearCost, truckRarity, upgradeTruckRarity, makeCompletionReward, applyOrderReward, settleTrips, renderSpecialTrips, setGame: value => { game = value; }, setCustomer: value => { selectedSpecialCustomer = value; }, mute: () => { render = () => {}; showToast = () => {}; replenishOrders = () => {}; } };\n})();', context);
const api = context.api;
api.mute();
const state = api.newGame('hamburg');
api.setGame(state);
const truck = state.trucks[0];
const other = { id: 'LKW-03', tier: 0, capacity: 1, rarityLevel: 0 };
state.trucks.push(other);
const expected = [29000, 2900, 725, 145, 29];
assert.deepEqual(Array.from(Object.values(api.RANK_GEAR_COSTS), costs => costs.reduce((a, b) => a + b, 0)), expected);
assert.equal(Object.values(api.RANK_GEAR_COSTS).flat().length, 50);
for (const rarity of Object.keys(api.RANK_GEAR_COSTS)) state.inventory.gears[rarity] = 100000;
const initialCoins = state.coins;
for (let level = 0; level < 50; level++) {
  const rarity = api.truckRarity(truck).id;
  const cost = api.rankGearCost(truck);
  const before = state.inventory.gears[rarity];
  api.upgradeTruckRarity(truck.id);
  assert.equal(truck.rarityLevel, level + 1);
  assert.equal(state.inventory.gears[rarity], before - cost);
}
assert.equal(api.rankGearCost(truck), Infinity);
api.upgradeTruckRarity(truck.id);
assert.equal(truck.rarityLevel, 50);
assert.equal(state.coins, initialCoins);
assert.equal(api.rankGearCost(other), 1000, 'second LKW uses same stock');
state.inventory.gears.common = 999;
api.upgradeTruckRarity(other.id);
assert.equal(other.rarityLevel, 0, 'insufficient gears');
state.inventory.gears.common = 1000;
api.upgradeTruckRarity(other.id);
assert.equal(other.rarityLevel, 1);
assert.equal(state.inventory.gears.common, 0);

const order = (category, kind = 'normal', customer = null, distance = 100, volume = 20) => ({ category, kind, customer, distance, volume, routeType: 'single', status: 'completed' });
math.random = () => 0;
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('national')).gears)), { common: 20, uncommon: 2 });
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('national', 'normal', 'frischgut')).gears)), { common: 20, uncommon: 2, rare: 2 });
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('national', 'special', 'frischgut')).gears)), { common: 20, uncommon: 2, rare: 2, epic: 5 });
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('international', 'referral', 'eurolog')).gears)), { common: 20, uncommon: 2, rare: 2, epic: 5, legendary: 2 });
const dual = { ...order('national', 'normal', null), routeType: 'dual' };
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(dual).gears)), { common: 20, uncommon: 2 }, 'dual way does not double the gear basis');
math.random = () => .999999;
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('national')).gears)), {}, 'zero drops are possible');
math.random = () => .5;
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('national', 'normal', null, 10, 10)).gears)), { common: 2 }, 'common two-drop branch');
math.random = () => .1;
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('national', 'normal', null, 105, 10)).gears)), { common: 11, uncommon: 1 }, 'partial blocks are rolled proportionally');
math.random = () => .9;
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('national', 'normal', null, 105, 10)).gears)), {}, 'partial blocks can miss');
math.random = () => 0;
const completed = { id: 'A-9000', ...order('national'), completionReward: api.makeCompletionReward(order('national')) };
state.orders = [completed];
assert.equal(api.applyOrderReward(completed), true);
assert.equal(state.inventory.gears.common, 20);
api.save();
const reloaded = api.loadGame();
api.setGame(reloaded);
assert.equal(api.applyOrderReward(reloaded.orders[0]), false, 'claim only once after reload');
assert.equal(reloaded.inventory.gears.common, 20);
const touring = api.newGame('hamburg');
api.setGame(touring);
touring.trucks[0].capacity = 4;
const active = { ...order('national', 'normal', null, 8, 2), id: 'A-tour', delivered: 0, status: 'active', truckId: touring.trucks[0].id, tripCargo: 2, tripStartAt: 0 };
touring.orders = [active];
api.settleTrips(20_000);
assert.equal(active.status, 'completed');
assert.deepEqual(JSON.parse(JSON.stringify(active.completionReward.gears)), { common: 1, uncommon: 1 });
assert.equal(touring.inventory.gears.common, 0, 'loot waits for claim');
api.applyOrderReward(active);
assert.equal(touring.inventory.gears.common, 1);

const old = api.newGame('hamburg');
old.version = 31;
old.trucks[0].rarityLevel = 23;
old.inventory.gears.rare = 17;
old.orders = [{ id: 'A-old', ...order('national'), completionReward: { coins: 2, gear: 'rare', capacityModule: false, claimedAt: null } }];
storage.set('frachtwerk-save-v2', JSON.stringify(old));
const migrated = api.loadGame();
assert.equal(migrated.version, 37);
assert.equal(migrated.trucks[0].rarityLevel, 23);
assert.equal(migrated.inventory.gears.rare, 17);
assert.deepEqual(JSON.parse(JSON.stringify(migrated.orders[0].completionReward.gears)), { rare: 1 });
api.setGame(migrated);
assert.equal(api.applyOrderReward(migrated.orders[0]), true);
assert.equal(migrated.inventory.gears.rare, 18);

migrated.orders.push({ id: 'A-ref', ...order('national', 'referral', 'frischgut'), status: 'queued', completionReward: null });
migrated.expedition.regions[0].endlessUnlocked = true;
api.setCustomer(null);
api.renderSpecialTrips();
const overview = element('#special-content').innerHTML;
assert.ok(overview.indexOf('Empfehlungsaufträge') < overview.indexOf('Nordbau GmbH'));
assert.match(overview, /1 Empfehlungsfahrten offen/);
api.setCustomer('referrals');
api.renderSpecialTrips();
assert.match(element('#special-content').innerHTML, /Empfehlungsfahrt durchführen · 1 offen/);
console.log('gear costs, loot, claims, migration and referral list: OK');
