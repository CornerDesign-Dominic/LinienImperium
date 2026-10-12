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
vm.runInContext(beforeEvents + '\n globalThis.api = { TRUCKS, CATEGORIES, newGame, loadGame, buyTruck, saleQuote, canTruckTakeOrder, operatingCostPerKm, renderDealer, setGame: value => { game = value; }, mute: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
const api = context.api;
api.mute();
assert.equal(api.CATEGORIES.find(category => category.id === 'national').label, 'Regionalverkehr');
assert.equal(api.CATEGORIES.find(category => category.id === 'international').label, 'Fernverkehr');

const fresh = api.newGame('hamburg');
assert.equal(fresh.coins, 1000);
assert.equal(fresh.startingCoins, 1000);
assert.deepEqual(Array.from(fresh.trucks, truck => truck.id), ['LKW-01', 'LKW-02']);
assert.equal(fresh.nextTruck, 3);
for (const truck of fresh.trucks) {
  assert.equal(truck.tier, 2);
  assert.equal(truck.capacity, 4);
  assert.equal(truck.rarityLevel, 0);
  assert.equal(truck.kmDriven, 0);
  assert.equal(truck.purchasePrice, null);
  assert.equal(api.saleQuote(truck).coins, 23750);
}
assert.notEqual(fresh.trucks[0], fresh.trucks[1]);

const cases = [
  [2, 4, 25000, .65], [3, 8.5, 100000, .7], [5, 13, 250000, 1.05],
  [4, 18, 500000, 1.6], [6, 24, 1000000, 2.10]
];
for (const [tier, capacity, price, kmCost] of cases) {
  const state = api.newGame('hamburg');
  state.coins = 1000000;
  api.setGame(state);
  api.buyTruck(tier);
  const bought = state.trucks[2];
  assert.equal(bought.id, 'LKW-03');
  assert.equal(bought.tier, tier);
  assert.equal(bought.capacity, capacity);
  assert.equal(bought.purchasePrice, price);
  assert.equal(state.coins, 1000000 - price);
  assert.equal(state.stats.truckSpent, price);
  assert.equal(api.operatingCostPerKm(bought), kmCost);
  assert.equal(api.saleQuote(bought).coins, price * .95);
  assert.equal(api.canTruckTakeOrder(bought, { category: 'national' }), tier !== 4 && tier !== 6);
  assert.equal(api.canTruckTakeOrder(bought, { category: 'international' }), tier !== 2 && tier !== 3);
  assert.equal(api.canTruckTakeOrder(bought, { category: 'national', kind: 'special' }), tier !== 4 && tier !== 6);
  assert.equal(api.canTruckTakeOrder(bought, { category: 'international', kind: 'referral' }), tier !== 2 && tier !== 3);
}
api.setGame(fresh);
api.renderDealer();
const dealer = element('#shop-list').innerHTML;
const orderedNames = ['7,5-Tonner', '18-Tonner', '26-Tonner', 'Sattelzug', '40-t-Tautliner'];
assert.deepEqual(orderedNames.map(name => dealer.indexOf(`<h3>${name}</h3>`)).every((offset, i, offsets) => offset > 0 && (i === 0 || offset > offsets[i - 1])), true);
assert.match(dealer, /data-buy="5"/);
assert.match(dealer, /data-buy="4"/);

const existing = api.newGame('hamburg');
existing.trucks.pop(); // Historical save: one starter and a purchased 18-t truck.
existing.nextTruck = 3;
existing.trucks.push({ id: 'LKW-02', tier: 4, model: 'Schwerlaster', capacity: 18, symbol: '🚛', rarityLevel: 0, purchasePrice: 4000, kmDriven: 100, toursCompleted: 1, ordersCompleted: 0 });
existing.orders[0].status = 'active';
existing.orders[0].truckId = 'LKW-02';
existing.orders[0].tripCargo = 18;
storage.set('frachtwerk-save-v2', JSON.stringify(existing));
const loaded = api.loadGame();
assert.equal(loaded.trucks.length, 2, 'existing saves receive no extra starter');
assert.equal(loaded.trucks[1].tier, 4);
assert.equal(loaded.trucks[1].model, 'Sattelzug', 'existing save uses the new display name');
assert.equal(loaded.trucks[1].capacity, 18);
assert.equal(loaded.trucks[1].purchasePrice, 4000);
assert.equal(api.saleQuote(loaded.trucks[1]).coins, 3799.36);
assert.equal(loaded.orders[0].truckId, 'LKW-02');
assert.equal(loaded.orders[0].tripCargo, 18);

existing.version = 36;
delete existing.trucks[1].purchasePrice;
storage.set('frachtwerk-save-v2', JSON.stringify(existing));
const migrated = api.loadGame();
assert.equal(migrated.trucks.length, 2);
assert.equal(migrated.trucks[1].tier, 4);
assert.equal(migrated.trucks[1].capacity, 18);
assert.equal(migrated.trucks[1].purchasePrice, 4000, 'legacy paid price is fixed before the price increase');
assert.equal(migrated.orders[0].truckId, 'LKW-02');
assert.equal(migrated.orders[0].tripCargo, 18);
assert.equal(api.loadGame().trucks[1].purchasePrice, 4000);

console.log('new starters, purchases, dealer order, eligibility and historical prices: OK');
