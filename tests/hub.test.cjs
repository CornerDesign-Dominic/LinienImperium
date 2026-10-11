const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const elements = new Map();
const element = key => {
  if (!elements.has(key)) elements.set(key, { innerHTML: '', textContent: '', close() {} });
  return elements.get(key);
};
const randomMath = Object.create(Math);
randomMath.random = () => .5;
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math: randomMath, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: element }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { newGame, loadGame, buyHub, buyTruck, hub, hubTrucks, hubCapacity, hubHourlyCapacity, settleHub, collectHub, combinePickupHints, assignPrivatePickup, settleTrips, applyOrderReward, startHubUpgrade, setGame: value => { game = value; }, mute: () => { render = () => {}; showToast = () => {}; replenishOrders = () => {}; } };\n})();', context);
const api = context.api;
api.mute();

const state = api.newGame('hamburg');
api.setGame(state);
assert.equal(state.version, 35);
assert.equal(state.orders.filter(order => order.category === 'city').length, 0);
assert.equal(state.trucks.length, 1);
assert.equal(state.trucks[0].tier, 2);
assert.equal(api.hubCapacity(), 1);
api.buyHub();
assert.equal(state.coins, 1000, 'hub is free');
api.buyTruck(0);
assert.equal(api.hubTrucks().length, 1);
assert.equal(state.coins, 550);
assert.ok(api.hubHourlyCapacity() > 0);

const h = api.hub();
h.nextCycleAt = Date.now() - 9 * 60 * 60 * 1000;
api.settleHub(Date.now());
assert.equal(h.cashboxCycles, 10);
assert.equal(h.cashboxHints, 100);
assert.ok(h.cashboxCoins > 0);
assert.equal(state.xp, 0, 'hub generates no XP');
const earned = h.cashboxCoins;
api.collectHub();
assert.equal(state.coins, 550 + earned);
assert.equal(state.inventory.pickupHints, 100);
assert.equal(h.cashboxCycles, 0);

api.combinePickupHints();
assert.equal(state.inventory.pickupHints, 0);
const privateOrder = state.orders.find(order => order.kind === 'private');
assert.equal(privateOrder.status, 'queued');
api.assignPrivatePickup(privateOrder.id, state.trucks[0].id);
assert.equal(privateOrder.status, 'active');
api.settleTrips(Date.now() + 1e9);
assert.equal(privateOrder.status, 'completed');
assert.deepEqual(Object.keys(privateOrder.completionReward.gears), []);
assert.equal(privateOrder.completionReward.supplierContacts, 1);
api.applyOrderReward(privateOrder);
assert.equal(state.inventory.supplierContacts, 1);

state.inventory.supplierContacts = 5;
api.startHubUpgrade();
assert.equal(state.inventory.supplierContacts, 0);
assert.equal(h.salesLevel, 0);
assert.equal(h.construction.level, 1);
assert.equal(h.construction.finishAt - h.construction.startedAt, 12 * 60 * 60 * 1000);
api.settleHub(h.construction.finishAt - 1);
assert.equal(h.salesLevel, 0);
api.settleHub(h.construction.finishAt);
assert.equal(h.salesLevel, 1);

const legacy = api.newGame('hamburg');
legacy.version = 34;
legacy.trucks = [{ id: 'ALT-01', tier: 0, model: 'Kleintransporter', capacity: 1, symbol: '🚚', rarityLevel: 0 }];
legacy.orders.push({ id: 'ALT-A', category: 'city', status: 'available' });
legacy.orders.push({ id: 'ALT-B', category: 'city', status: 'active', truckId: 'ALT-01', volume: 10, delivered: 0, distance: 8, tripCargo: 1, tripStartAt: Date.now() });
storage.set('frachtwerk-save-v2', JSON.stringify(legacy));
const migrated = api.loadGame();
assert.equal(migrated.version, 35);
assert.equal(migrated.orders.some(order => order.id === 'ALT-A'), false);
assert.equal(migrated.orders.some(order => order.id === 'ALT-B'), true);
assert.equal(migrated.trucks.some(truck => truck.id === 'ALT-01'), true);
assert.equal(migrated.trucks.some(truck => truck.tier === 2), true, 'legacy city-only game gets a regular starter LKW');
console.log('hub, collection, private pickup and timed upgrade: OK');
