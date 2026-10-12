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
vm.runInContext(beforeEvents + '\n globalThis.api = { TRUCKS, newGame, freightRevenue, orderEconomics, tourEconomics, operatingCostPerKm, estimatedProfit, settleTrips, applyOrderReward, setGame: value => { game = value; }, disableRendering: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
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
assert.equal(cityResult.bonus, 100);
assert.equal(api.estimatedProfit(order, cityTruck), 1158);
assert.equal(api.orderEconomics(order, allrounder).revenue, 4600, 'freight payout does not depend on the truck');
assert.equal(api.orderEconomics(order, allrounder).trips, 25);
assert.equal(api.orderEconomics(order, allrounder).totalProfit, 2745, 'legacy 100-t contract calculation');
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
assert.equal(api.orderEconomics(dual, cityTruck).bonus, 200);
assert.equal(api.orderEconomics(dual, cityTruck).totalProfit, 5398);
const city = { ...order, category: 'city', routeType: null, distance: 8, volume: 20 };
assert.equal(api.freightRevenue(city), 160);
assert.equal(api.orderEconomics(city, { tier: 0, capacity: 1 }).totalProfit, 132);

state.company.transportUpgrades.national.premiumLevel = 25;
assert.equal(api.orderEconomics(order, allrounder).bonus, 125);
assert.equal(api.orderEconomics(dual, allrounder).bonus, 250);
assert.equal(api.orderEconomics(order, allrounder).revenue, 4600, 'company premium does not change freight');
assert.equal(api.orderEconomics(order, allrounder).cost, 1955, 'company premium does not change costs');
assert.equal(api.orderEconomics({ ...order, category: 'international' }, allrounder).bonus, 100, 'national premium does not affect international contracts');
state.company.transportUpgrades.national.premiumLevel = 0;

state.customerSkills.nordbau = { pay: 2, special: 0, referral: 0 };
const customerOrder = { ...order, customer: 'nordbau' };
assert.equal(api.freightRevenue(customerOrder), 4609.2, 'customer bonus applies to ton-kilometers');
assert.equal(api.orderEconomics(customerOrder, cityTruck).revenue, 4609.2);

state.orders = [{ ...order, status: 'active', truckId: cityTruck.id, tripCargo: cityTruck.capacity, tripStartAt: 0 }];
state.company.transportUpgrades.national.premiumLevel = 25;
const startCoins = state.coins;
api.settleTrips(Date.now());
assert.equal(state.orders[0].status, 'completed');
assert.equal(state.stats.trips, 67);
assert.equal(state.stats.grossRevenue, cityResult.revenue);
assert.equal(state.stats.operatingCosts, cityResult.cost);
assert.equal(state.coins - startCoins, cityResult.transportProfit, 'booked transport profit matches the modal');
assert.equal(state.orders[0].completionReward.coins, 125, 'company bonus is stored on completion');
assert.equal(api.applyOrderReward(state.orders[0]), true);
assert.equal(state.coins - startCoins, cityResult.transportProfit + 125, 'premium is credited only when claimed');
assert.equal(api.applyOrderReward(state.orders[0]), false, 'premium cannot be claimed twice');
const legacy = api.newGame('hamburg');
api.setGame(legacy);
legacy.trucks.push({ id: 'LEGACY-SATTEL', tier: 4, capacity: 18, rarityLevel: 0 });
legacy.orders = [{ ...order, id: 'A-LEGACY', volume: 10, distance: 40, status: 'active', truckId: 'LEGACY-SATTEL', tripCargo: 10, tripStartAt: 0 }];
api.settleTrips(Date.now());
assert.equal(legacy.orders[0].status, 'completed', 'running old national trip keeps its assigned Sattelzug');
console.log('freight payout, vehicle cost, customer bonus and booking: OK');
