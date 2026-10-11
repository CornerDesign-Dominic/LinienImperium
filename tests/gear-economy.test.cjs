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
const other = { id: 'LKW-02', tier: 0, capacity: 1, rarityLevel: 0 };
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

const order = (category, kind = 'normal', customer = null) => ({ category, kind, customer, volume: 20, routeType: 'single', status: 'completed' });
const lootCases = [
  [order('city'), { common: 90 }],
  [order('national'), { common: 90, uncommon: 100 }],
  [order('international'), { common: 108, uncommon: 100 }],
  [order('national', 'normal', 'frischgut'), { common: 110, uncommon: 100, rare: 25 }],
  [order('national', 'special', 'frischgut'), { common: 130, uncommon: 100, rare: 25, epic: 5 }],
  [order('international', 'referral', 'eurolog'), { common: 180, uncommon: 100, rare: 25, epic: 5, legendary: 2 }]
];
for (const [item, expectedLoot] of lootCases) {
  math.random = () => 0;
  const reward = api.makeCompletionReward(item);
  assert.deepEqual(JSON.parse(JSON.stringify(reward.gears)), expectedLoot);
  assert.equal(reward.capacityModule, item.kind === 'special' || item.kind === 'referral');
}
math.random = () => .999999;
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('city')).gears)), { common: 110 });
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('national')).gears)), { common: 110 });
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('national', 'referral', 'frischgut')).gears)), { common: 170, legendary: 1 });
assert.deepEqual(JSON.parse(JSON.stringify(api.makeCompletionReward(order('international', 'normal', 'eurolog')).gears)), { common: 156 }, 'customer common international bonus');

const tenStarts = Array.from({ length: 10 }, () => api.makeCompletionReward(order('city')));
assert.equal(tenStarts.reduce((sum, reward) => sum + reward.gears.common, 0), 1100);
state.orders = [{ id: 'A-9000', ...order('city'), completionReward: tenStarts[0] }];
const reward = state.orders[0].completionReward;
const beforeCommon = state.inventory.gears.common;
assert.equal(api.applyOrderReward(state.orders[0]), true);
assert.equal(state.inventory.gears.common, beforeCommon + 110);
api.save();
const reloaded = api.loadGame();
api.setGame(reloaded);
assert.equal(api.applyOrderReward(reloaded.orders[0]), false, 'claim only once after reload');
assert.equal(reloaded.inventory.gears.common, beforeCommon + 110);
assert.deepEqual(JSON.parse(JSON.stringify(reloaded.orders[0].completionReward.gears)), { common: 110 }, 'loot unchanged after reload');

math.random = () => .5;
reloaded.inventory.gears.common = 0;
reloaded.trucks[1].rarityLevel = 0;
reloaded.orders = Array.from({ length: 10 }, (_, i) => ({ id: `A-start-${i}`, ...order('city'), completionReward: api.makeCompletionReward(order('city')) }));
for (const starter of reloaded.orders) assert.equal(api.applyOrderReward(starter), true);
assert.equal(reloaded.inventory.gears.common, 1000, 'ten starter jobs without bonuses fund Common 1 at midpoint');
api.upgradeTruckRarity(reloaded.trucks[1].id);
assert.equal(reloaded.trucks[1].rarityLevel, 1);
assert.equal(reloaded.inventory.gears.common, 0);

math.random = Math.random;
const touring = api.newGame('hamburg');
api.setGame(touring);
touring.trucks[0].capacity = 1;
const active = { ...touring.orders[0], category: 'city', customer: null, routeType: null, distance: 8, volume: 2, delivered: 0, status: 'active', truckId: touring.trucks[0].id, tripCargo: 1, tripStartAt: 0 };
touring.orders = [active];
math.random = () => .999999;
assert.equal(api.settleTrips(9_000), true);
assert.equal(active.delivered, 1);
assert.equal(active.completionReward, null, 'no gear per tour');
assert.equal(touring.inventory.gears.common, 0);
assert.equal(api.settleTrips(18_000), true);
assert.equal(active.status, 'completed');
assert.equal(active.completionReward.gears.common, 110);
assert.equal(touring.inventory.gears.common, 0, 'loot waits for claim');
const fixedReward = JSON.stringify(active.completionReward);
math.random = () => 0;
const touringReloaded = api.loadGame();
assert.equal(JSON.stringify(touringReloaded.orders[0].completionReward), fixedReward, 'completed loot not rerolled after reload');
api.setGame(touringReloaded);
assert.equal(api.applyOrderReward(touringReloaded.orders[0]), true);
assert.equal(touringReloaded.inventory.gears.common, 110);

math.random = Math.random;
const old = api.newGame('hamburg');
old.version = 31;
old.trucks[0].rarityLevel = 23;
old.inventory.gears.rare = 17;
old.orders = [{ id: 'A-old', ...order('national'), completionReward: { coins: 2, gear: 'rare', capacityModule: false, claimedAt: null } }];
storage.set('frachtwerk-save-v2', JSON.stringify(old));
const migrated = api.loadGame();
assert.equal(migrated.version, 35);
assert.equal(migrated.trucks[0].rarityLevel, 23);
assert.equal(migrated.inventory.gears.rare, 17);
assert.deepEqual(JSON.parse(JSON.stringify(migrated.orders[0].completionReward.gears)), { rare: 1 });
api.setGame(migrated);
assert.equal(api.applyOrderReward(migrated.orders[0]), true);
assert.equal(migrated.inventory.gears.rare, 18);

migrated.orders.push({ id: 'A-ref', ...order('national', 'referral', 'frischgut'), status: 'queued', completionReward: null });
api.setCustomer(null);
api.renderSpecialTrips();
const overview = element('#special-content').innerHTML;
assert.ok(overview.indexOf('Empfehlungsaufträge') < overview.indexOf('Nordbau GmbH'));
assert.match(overview, /1 Empfehlungsfahrten offen/);
api.setCustomer('referrals');
api.renderSpecialTrips();
assert.match(element('#special-content').innerHTML, /Empfehlungsfahrt durchführen · 1 offen/);
console.log('gear costs, loot, claims, migration and referral list: OK');
