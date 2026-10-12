const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const elements = new Map();
const element = key => {
  if (!elements.has(key)) elements.set(key, { innerHTML: '', textContent: '', open: false, showModal() { this.open = true; }, close() { this.open = false; } });
  return elements.get(key);
};
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: element }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { newGame, loadGame, buyTruck, buyHub, saleQuote, saleBlockReason, openSaleDialog, confirmSale, settleTrips, settleHub, setGame: value => { game = value; }, mute: () => { render = () => {}; showToast = () => {}; replenishOrders = () => {}; } };\n})();', context);
const api = context.api;
api.mute();
const state = api.newGame('hamburg');
api.setGame(state);
const starter = state.trucks[0];
assert.equal(state.version, 42);
assert.equal(api.saleBlockReason(starter), null);
assert.equal(api.saleQuote(starter).coins, 23750, 'free starter uses the current model price');
assert.equal(api.openSaleDialog(starter.id), true);
assert.equal(api.confirmSale(), true, 'one free starter can be sold while the other remains');
assert.equal(state.trucks.length, 1);
assert.equal(api.saleBlockReason(state.trucks[0]), 'Mindestens ein regulärer Auftrags-LKW muss bleiben.');
assert.equal(api.openSaleDialog(state.trucks[0].id), false);
state.coins = 100000;
api.buyTruck(2);
const purchased = state.trucks[1];
assert.equal(purchased.id, 'LKW-03');
assert.equal(purchased.purchasePrice, 25000);
assert.equal(api.saleQuote(purchased).coins, 23750);
purchased.purchasePrice = 1000;
purchased.kmDriven = 250000;
assert.equal(api.saleQuote(purchased).coins, 550, 'historical paid price and linear rate');
purchased.kmDriven = 500000;
assert.equal(api.saleQuote(purchased).coins, 150);
purchased.kmDriven = 600000;
assert.equal(api.saleQuote(purchased).coins, 150, 'rate is clamped after 500,000 km');
purchased.kmDriven = 0;
purchased.rarityLevel = 41;
purchased.moduleCapacityLevel = 2;
purchased.moduleCapacitySpent = 2;
const quote = api.saleQuote(purchased);
assert.equal(quote.gears.common, 14500);
assert.equal(quote.gears.epic, 72, 'half of the aggregate 145, rounded down once');
assert.equal(quote.gears.legendary, 0, 'one invested gear rounds down');
assert.equal(quote.modulesLost, 2);

const busyOrder = { id: 'BUSY', status: 'active', truckId: purchased.id, distance: 10, volume: 4, delivered: 0, tripCargo: 4, tripStartAt: Date.now(), routeType: 'single', category: 'national', kind: 'normal' };
state.orders = [busyOrder];
assert.match(api.saleBlockReason(purchased), /laufender Auftrag/);
assert.equal(api.openSaleDialog(purchased.id), false);
assert.equal(api.confirmSale(), false);
busyOrder.tripStartAt = 0;
api.settleTrips(100000);
assert.equal(purchased.kmDriven, 20, 'single way includes empty return');
assert.equal(purchased.toursCompleted, 1);
assert.equal(purchased.ordersCompleted, 1);
assert.equal(busyOrder.status, 'completed');
const coinsBefore = state.coins;
const gearsBefore = state.inventory.gears.common;
assert.equal(api.openSaleDialog(purchased.id), true);
assert.match(element('#sale-dialog-content').innerHTML, /Kapazitätsmodule verloren/);
assert.equal(api.confirmSale(), true);
assert.equal(state.trucks.length, 1);
assert.equal(state.coins, Math.round((coinsBefore + api.saleQuote(purchased).coins) * 100) / 100);
assert.equal(state.inventory.gears.common, gearsBefore + 14500);
assert.equal(api.confirmSale(), false, 'cannot sell twice');

api.buyHub();
api.buyTruck(0);
const city = state.trucks.find(truck => truck.tier === 0);
assert.equal(api.saleBlockReason(city), null, 'hub assigned city truck has no active order');
state.hubs[0].nextCycleAt = Date.now() + 15 * 60 * 1000;
api.settleHub(Date.now());
assert.ok(city.toursCompleted > 0, 'completed hub runs count for the vehicle');
assert.equal(city.kmDriven, city.toursCompleted * 24, 'hub tours include return journey');
assert.equal(api.openSaleDialog(city.id), true);
assert.equal(api.confirmSale(), true);
assert.equal(state.trucks.filter(truck => truck.tier <= 1).length, 0);
const soldKm = city.kmDriven;
api.settleHub(Date.now() + 2 * 60 * 60 * 1000);
assert.equal(city.kmDriven, soldKm, 'sold hub vehicle stops accumulating mileage');
api.buyTruck(0);
const replacement = state.trucks.find(truck => truck.tier === 0);
assert.equal(replacement.rarityLevel, 0);
assert.equal(replacement.kmDriven, 0);

const old = api.newGame('hamburg');
old.trucks.pop(); // Existing saves contain only the original free starter.
old.version = 36;
old.trucks.push({ id: 'LKW-02', tier: 3, capacity: 8.5, rarityLevel: 0 });
old.orders = [
  { id: 'DONE', status: 'completed', truckId: 'LKW-01', distance: 100, routeType: 'single', delivered: 8, volume: 8 },
  { id: 'ACTIVE', status: 'active', truckId: 'LKW-02', distance: 50, routeType: 'dual', delivered: 8.5, volume: 17, tripStartAt: 100, tripCargo: 8.5 },
  { id: 'UNRELATED', status: 'completed', truckId: 'REMOVED', distance: 500, routeType: 'single', delivered: 4, volume: 4 }
];
storage.set('frachtwerk-save-v2', JSON.stringify(old));
const migrated = api.loadGame();
assert.equal(migrated.version, 42);
assert.equal(migrated.orders.length, 3, 'active and completed orders are retained');
assert.equal(migrated.trucks[0].purchasePrice, null);
assert.equal(migrated.trucks[0].kmDriven, 400);
assert.equal(migrated.trucks[0].toursCompleted, 2);
assert.equal(migrated.trucks[0].ordersCompleted, 1);
assert.equal(migrated.trucks[1].purchasePrice, 2600);
assert.equal(migrated.trucks[1].kmDriven, 100);
assert.equal(migrated.trucks[1].toursCompleted, 1);
assert.equal(migrated.trucks[1].ordersCompleted, 0);
assert.equal(api.loadGame().trucks[0].kmDriven, 400, 'migration runs only once');
const previous = api.newGame('hamburg');
previous.version = 35;
const previousIds = Array.from(previous.orders, order => order.id);
storage.set('frachtwerk-save-v2', JSON.stringify(previous));
assert.deepEqual(Array.from(api.loadGame().orders, order => order.id), previousIds, 'older offers survive the full migration');
console.log('vehicle sale eligibility, rates, refunds, counters and migration: OK');
