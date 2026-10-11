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
vm.runInContext(beforeEvents + '\n globalThis.api = { TRUCKS, newGame, freightRevenue, orderEconomics, tourEconomics, operatingCostPerKm, estimatedProfit, settleTrips, setGame: value => { game = value; }, disableRendering: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
const api = context.api;
api.disableRendering();

const state = api.newGame('antwerp');
api.setGame(state);
const order = {
  id: 'A-TEST', category: 'national', routeType: 'single', distance: 46, volume: 100,
  delivered: 0, customer: null, status: 'available', homeCity: 'antwerp'
};
const cityTruck = { id: 'CITY-TEST', tier: 1, capacity: 1.5, rarityLevel: 0 };
state.trucks.push(cityTruck);
const allrounder = { tier: 2, capacity: 4 };
assert.equal(api.freightRevenue(order), 4600);
const cityResult = api.orderEconomics(order, cityTruck);
assert.equal(cityResult.trips, 67);
assert.equal(cityResult.revenue, 4600);
assert.equal(cityResult.distanceCost, 3082);
assert.equal(cityResult.loadedCost, 460);
assert.equal(cityResult.transportProfit, 1058);
assert.equal(cityResult.bonus, 10);
assert.equal(api.estimatedProfit(order, cityTruck), 1068);
assert.equal(api.orderEconomics(order, allrounder).revenue, 4600, 'freight payout does not depend on the truck');
assert.equal(api.orderEconomics(order, allrounder).trips, 25);
assert.equal(api.orderEconomics(order, allrounder).totalProfit, 2655, 'documented national Allrounder example');
assert.notEqual(api.orderEconomics(order, allrounder).totalProfit, cityResult.totalProfit);

state.company.departments.hr = true;
state.company.departments.workshop = true;
state.company.employees = 1;
state.company.workshopLevel = 10;
assert.equal(api.operatingCostPerKm(cityTruck), .49, 'former employees no longer add to vehicle costs');
state.company.employees = 0;
state.company.workshopLevel = 0;

const dual = { ...order, routeType: 'dual' };
assert.equal(api.freightRevenue(dual), 9200);
assert.equal(api.orderEconomics(dual, cityTruck).totalProfit, 5218);
const city = { ...order, category: 'city', routeType: null, distance: 8, volume: 20 };
assert.equal(api.freightRevenue(city), 160);
assert.equal(api.orderEconomics(city, { tier: 0, capacity: 1 }).totalProfit, 114);

state.customerSkills.nordbau = { pay: 2, special: 0, referral: 0 };
const customerOrder = { ...order, customer: 'nordbau' };
assert.equal(api.freightRevenue(customerOrder), 4609.2, 'customer bonus applies to ton-kilometers');
assert.equal(api.orderEconomics(customerOrder, cityTruck).revenue, 4609.2);

state.orders = [{ ...order, status: 'active', truckId: cityTruck.id, tripCargo: cityTruck.capacity, tripStartAt: 0 }];
const startCoins = state.coins;
api.settleTrips(Date.now());
assert.equal(state.orders[0].status, 'completed');
assert.equal(state.stats.trips, 67);
assert.equal(state.stats.grossRevenue, cityResult.revenue);
assert.equal(state.stats.operatingCosts, cityResult.cost);
assert.equal(state.coins - startCoins, cityResult.transportProfit, 'booked transport profit matches the modal');
assert.equal(state.orders[0].completionReward.coins, cityResult.bonus, 'completion bonus remains separate');
console.log('freight payout, vehicle cost, customer bonus and booking: OK');
