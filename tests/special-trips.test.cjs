const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const elements = new Map();
const element = key => {
  if (!elements.has(key)) elements.set(key, { open: false, innerHTML: '', textContent: '', close() { this.open = false; }, showModal() { this.open = true; } });
  return elements.get(key);
};
const math = Object.create(Math);
math.random = (() => { let i = 0; return () => [.99, .2, .7][i++ % 3]; })();
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math: math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: element }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { CUSTOMERS, SPECIAL_CHANCES, newGame, createOrder, loadGame, save, makeCompletionReward, queueCustomerTrip, assignCustomerTrip, settleTrips, applyOrderReward, upgradeTruckCapacity, renderSpecialTrips, setCustomer: value => { selectedSpecialCustomer = value; }, setGame: value => { game = value; }, mute: () => { render = () => {}; showToast = () => {}; replenishOrders = () => {}; } };\n})();', context);
const api = context.api;
api.mute();

const state = api.newGame('hamburg');
api.setGame(state);
assert.equal(state.orders.filter(o => o.status === 'available' && o.category === 'city').length, 0);
math.random = () => .049;
assert.equal(api.createOrder(99, { category: 'national', level: 1 }).customer, null, 'locked customers do not appear');
state.expedition.regions[0].endlessUnlocked = true;
state.expedition.regions[4].endlessUnlocked = true;
state.expedition.regions[0].customerUnlocked = true;
state.expedition.regions[4].customerUnlocked = true;
for (const kind of ['normal', 'special', 'referral']) {
  const national = api.createOrder(500, { category: 'national', customer: 'nordbau', kind });
  const international = api.createOrder(501, { category: 'international', customer: 'eurolog', kind });
  assert.ok(national.volume >= 10 && national.volume <= 40 && Number.isInteger(national.volume));
  assert.ok(international.volume >= 10 && international.volume <= 50 && Number.isInteger(international.volume));
}
assert.equal(api.createOrder(100, { category: 'national', level: 1 }).customer !== null, true, '5% at level 1');
assert.equal(api.createOrder(101, { category: 'international', level: 1 }).customer !== null, true);
math.random = (() => { let i = 0; return () => [.1, .3, .7][i++ % 3]; })();
assert.equal(api.createOrder(102, { category: 'city', level: 99 }).customer, null, 'never in city');
math.random = () => .05;
assert.equal(api.createOrder(103, { category: 'national', level: 1 }).customer, null, '5% boundary');

state.trucks.push({ id: 'LKW-03', tier: 2, capacity: 4, rarityLevel: 0 });
state.trucks.push({ id: 'LKW-04', tier: 4, capacity: 18, rarityLevel: 0 });
state.trucks.push({ id: 'CITY-01', tier: 0, capacity: 1, rarityLevel: 0 });
for (const [category, award] of [['national', .20], ['international', .40]]) {
  const order = { ...api.createOrder(200, { category, customer: category === 'national' ? 'frischgut' : 'eurolog' }), kind: 'normal', volume: 1, delivered: 0, status: 'active', truckId: 'LKW-03', tripCargo: 1, tripStartAt: 0 };
  if (category === 'international') order.truckId = 'LKW-04';
  state.orders = [order];
  math.random = () => award - .001;
  api.settleTrips(1e9);
  const queued = state.orders.filter(o => o.status === 'queued');
  assert.equal(queued.length, 1, `${category} award`);
  assert.equal(queued[0].kind, 'special');
  assert.equal(queued[0].customer, order.customer);
  assert.equal(queued[0].category, category);
  assert.equal(order.completionReward.capacityModule, false, 'normal customer job cannot yield module');
  assert.equal(api.assignCustomerTrip(queued[0].id, 'CITY-01'), false, 'wrong truck cannot consume trip');
  const truckId = category === 'national' ? 'LKW-03' : 'LKW-04';
  assert.equal(api.assignCustomerTrip(queued[0].id, truckId), true);
  assert.equal(api.assignCustomerTrip(queued[0].id, truckId), false, 'cannot start twice');
  assert.equal(queued[0].status, 'active');
  const fixed = JSON.stringify(queued[0]);
  assert.equal(JSON.stringify(api.loadGame().orders.find(o => o.id === queued[0].id)), fixed, 'trip data persists');
  const noAward = { ...api.createOrder(201, { category, customer: order.customer }), kind: 'normal', volume: 1, delivered: 0, status: 'active', truckId, tripCargo: 1, tripStartAt: 0 };
  state.orders = [noAward];
  math.random = () => award;
  api.settleTrips(1e9);
  assert.equal(state.orders.filter(o => o.status === 'queued').length, 0, `${category} award boundary`);
}

for (const [category, rules] of Object.entries(api.SPECIAL_CHANCES)) {
  for (const [kind, chance] of [['special', rules.module], ['referral', rules.referralModule]]) {
    const order = { category, kind, volume: 1, routeType: 'single' };
    math.random = () => chance - .001;
    assert.equal(api.makeCompletionReward(order).capacityModule, true, `${category} ${kind} module hit`);
    math.random = () => chance;
    assert.equal(api.makeCompletionReward(order).capacityModule, false, `${category} ${kind} module boundary`);
  }
  const customer = category === 'national' ? 'frischgut' : 'eurolog';
  const order = { ...api.createOrder(300, { category, customer, kind: 'special' }), status: 'active', volume: 1, delivered: 0, truckId: category === 'national' ? 'LKW-03' : 'LKW-04', tripCargo: 1, tripStartAt: 0 };
  state.orders = [order];
  math.random = () => rules.referral - .001;
  api.settleTrips(1e9);
  assert.equal(state.orders.filter(o => o.kind === 'referral' && o.status === 'queued').length, 1, `${category} referral hit`);
  const reward = order.completionReward;
  assert.equal(reward.capacityModule, true);
  assert.equal(api.applyOrderReward(order), true);
  assert.equal(api.applyOrderReward(order), false, 'claim once');
  api.save();
  const reloaded = api.loadGame();
  api.setGame(reloaded);
  const saved = reloaded.orders.find(o => o.id === order.id);
  assert.equal(api.applyOrderReward(saved), false, 'claim once after reload');
  assert.equal(saved.completionReward.capacityModule, true, 'loot saved');
  api.setGame(state);
  const referral = state.orders.find(o => o.kind === 'referral');
  referral.status = 'active'; referral.truckId = order.truckId; referral.volume = 1; referral.tripCargo = 1; referral.tripStartAt = 0;
  state.orders = [referral];
  api.settleTrips(1e9);
  assert.equal(state.orders.filter(o => o.kind === 'referral').length, 1, 'no referral chain');
  const noReferral = { ...api.createOrder(301, { category, customer, kind: 'special' }), status: 'active', volume: 1, delivered: 0, truckId: order.truckId, tripCargo: 1, tripStartAt: 0 };
  state.orders = [noReferral];
  math.random = () => rules.referral;
  api.settleTrips(1e9);
  assert.equal(state.orders.filter(o => o.kind === 'referral').length, 0, `${category} referral boundary`);
}

state.orders = [];
state.inventory.capacityModules = 4;
api.setGame(state);
const truck = state.trucks[0];
assert.equal(api.upgradeTruckCapacity(truck.id), true);
assert.equal(truck.capacity, 4.5);
assert.equal(state.inventory.capacityModules, 3);
assert.equal(api.upgradeTruckCapacity(truck.id), true);
assert.equal(truck.capacity, 5);
assert.equal(state.inventory.capacityModules, 2);
assert.equal(api.upgradeTruckCapacity(truck.id), true);
assert.equal(truck.capacity, 5.5);
assert.equal(state.inventory.capacityModules, 1);
assert.equal(api.upgradeTruckCapacity(truck.id), false);
const loaded = api.loadGame();
assert.equal(loaded.trucks[0].capacity, 5.5);
assert.equal(loaded.trucks[0].moduleCapacityLevel, 3);

api.setGame(state);
api.setCustomer('frischgut');
api.renderSpecialTrips();
assert.match(element('#special-content').innerHTML, /Sonderfahrt durchführen/);
api.setCustomer(null);
api.renderSpecialTrips();
assert.doesNotMatch(element('#special-content').innerHTML, /Frischgut AG/, 'locked customers without special trips stay hidden');

math.random = (() => { let i = 0; return () => [.99, .2, .7][i++ % 3]; })();
const old = api.newGame('hamburg');
old.version = 30;
delete old.inventory.capacityModules;
old.trucks[0].capacity = 8;
storage.set('frachtwerk-save-v2', JSON.stringify(old));
const migrated = api.loadGame();
assert.equal(migrated.version, 43);
assert.equal(migrated.trucks[0].capacity, 4);
assert.equal(migrated.inventory.capacityModules, 0);
assert.equal(api.loadGame().trucks[0].capacity, 4);
console.log('special trips, loot, assignment, module upgrades and migration: OK');
