const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const elements = new Map();
const element = key => {
  if (!elements.has(key)) elements.set(key, { innerHTML: '', textContent: '' });
  return elements.get(key);
};
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: element }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { TRUCKS, CATEGORIES, newGame, buyHub, buyTruck, canTruckTakeOrder, operatingCostPerKm, renderDealer, setGame: value => { game = value; }, mute: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
const api = context.api;
api.mute();
assert.equal(api.CATEGORIES.find(category => category.id === 'national').label, 'Regionalverkehr');
assert.equal(api.CATEGORIES.find(category => category.id === 'international').label, 'Fernverkehr');

const state = api.newGame('hamburg');
api.setGame(state);
assert.equal(state.coins, 1000);
assert.equal(state.startingCoins, 1000);
assert.deepEqual(Array.from(state.trucks, truck => truck.id), ['KARTE-navigator']);
assert.equal(state.nextTruck, 1);
assert.equal(state.trucks[0].capacity, 4);
assert.equal(state.trucks[0].rarityLevel, 0);
assert.equal(state.stats.truckSpent, 0);
assert.equal(api.canTruckTakeOrder(state.trucks[0], { category: 'national' }), true);
assert.equal(api.canTruckTakeOrder(state.trucks[0], { category: 'international' }), false);
for (let tier = 2; tier < api.TRUCKS.length; tier++) assert.equal(api.buyTruck(tier), false);
assert.equal(state.trucks.length, 1);
api.renderDealer();
const dealer = element('#shop-list').innerHTML;
assert.match(dealer, /data-buy="0"/);
assert.match(dealer, /data-buy="1"/);
assert.doesNotMatch(dealer, /data-buy="[2-6]"|Langstreckentransporter/);

api.buyHub();
state.coins = 4000;
api.buyTruck(0);
const city = state.trucks[1];
assert.equal(city.id, 'LKW-01');
assert.equal(city.tier, 0);
assert.equal(city.capacity, 1);
assert.equal(city.purchasePrice, 4000);
assert.equal(state.coins, 0);
assert.equal(state.stats.truckSpent, 4000);
assert.equal(api.operatingCostPerKm(city), .2);
assert.equal(api.canTruckTakeOrder(city, { category: 'city' }), false, 'assigned hub trucks do not take city orders');
console.log('starter card, city dealer and blocked regular-truck purchases: OK');
