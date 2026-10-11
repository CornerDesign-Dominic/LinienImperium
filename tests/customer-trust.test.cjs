const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const storage = new Map();
const math = Object.create(Math);
math.random = (() => { let i = 0; return () => [.99, .2, .7][i++ % 3]; })();
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math: math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: () => ({ innerHTML: '' }) }
});
vm.runInContext(source.slice(0, source.indexOf("  document.addEventListener('click'")) + `
  globalThis.api = { newGame, loadGame, save, trustTotalForLevel, customerLevel, customerNext,
    availableCustomerSkillPoints, allocateCustomerSkill, customerTripChance, freightRevenue,
    tourEconomics, settleTrips, applyOrderReward, renderCustomers,
    setGame: value => { game = value; },
    mute: () => { render = () => {}; showToast = () => {}; replenishOrders = () => {}; } };
})();`, context);
const api = context.api;
api.mute();
const state = api.newGame('hamburg');
math.random = () => .99;
api.setGame(state);
assert.equal(api.customerLevel(0), 0);
assert.equal(api.availableCustomerSkillPoints('frischgut'), 0);
assert.equal(api.allocateCustomerSkill('frischgut', 'pay'), false);
assert.equal(api.trustTotalForLevel(1), 110);
assert.equal(api.trustTotalForLevel(2), 230);
assert.equal(api.trustTotalForLevel(150) - api.trustTotalForLevel(149), 1600);
assert.equal(api.trustTotalForLevel(150), 128250);
assert.equal(api.customerLevel(128249), 149);
assert.equal(api.customerLevel(128250), 150);
assert.equal(api.customerLevel(999999), 150);
assert.equal(api.customerNext(128250), null);

const truck = state.trucks[0];
const complete = (id, kind, customer = 'frischgut', volume = 2) => {
  const order = { id, kind, category: 'national', customer, routeType: 'single', distance: 10,
    volume, delivered: 0, status: 'active', truckId: truck.id, tripCargo: 1,
    tripStartAt: 0, cargo: 'Test', to: 'Bremen' };
  state.orders = [order];
  api.settleTrips(1e9);
  assert.equal(order.status, 'completed');
  return order;
};
let order = complete('A-100', 'normal');
assert.equal(state.customerTrust.frischgut, 10, 'one reward for the whole order');
api.settleTrips(1e9);
assert.equal(state.customerTrust.frischgut, 10);
assert.equal(api.applyOrderReward(order), true);
assert.equal(state.customerTrust.frischgut, 10, 'claim does not grant trust');
api.save();
const loaded = api.loadGame();
assert.equal(loaded.customerTrust.frischgut, 10);
assert.equal(loaded.orders[0].trustAwarded, true);
api.setGame(loaded);
api.settleTrips(1e9);
assert.equal(loaded.customerTrust.frischgut, 10, 'reload does not grant again');
api.setGame(state);
complete('A-101', 'special');
assert.equal(state.customerTrust.frischgut, 35);
complete('A-102', 'referral');
assert.equal(state.customerTrust.frischgut, 135);
assert.equal(api.customerLevel(135), 1);
assert.equal(api.availableCustomerSkillPoints('frischgut'), 1);
complete('A-103', 'normal', null);
assert.equal(state.customerTrust.frischgut, 135, 'free freight has no trust');
assert.equal(api.allocateCustomerSkill('frischgut', 'pay'), true);
assert.equal(api.allocateCustomerSkill('frischgut', 'pay'), false, 'no second free point');

const freight = { category: 'national', routeType: 'single', distance: 100, volume: 10, customer: 'frischgut' };
assert.equal(api.freightRevenue(freight), 1001);
assert.equal(api.freightRevenue({ ...freight, customer: 'stahlwerk' }), 1000);
const withSkill = api.tourEconomics(freight, truck, 1, 0);
assert.equal(withSkill.revenue, 100.1);
assert.equal(withSkill.loadedCost, 10);
assert.equal(api.customerTripChance(freight, 'award'), .2);

state.customerTrust.frischgut = 128250;
assert.equal(api.availableCustomerSkillPoints('frischgut'), 149);
for (let i = 1; i < 100; i++) assert.equal(api.allocateCustomerSkill('frischgut', 'pay'), true);
assert.equal(api.allocateCustomerSkill('frischgut', 'pay'), false, 'pay cap');
for (let i = 0; i < 25; i++) assert.equal(api.allocateCustomerSkill('frischgut', 'special'), true);
assert.equal(api.allocateCustomerSkill('frischgut', 'special'), false, 'special cap');
for (let i = 0; i < 25; i++) assert.equal(api.allocateCustomerSkill('frischgut', 'referral'), true);
assert.equal(api.allocateCustomerSkill('frischgut', 'referral'), false, 'referral cap');
assert.equal(api.availableCustomerSkillPoints('frischgut'), 0);
assert.equal(api.freightRevenue(freight), 1100);
assert.equal(api.customerTripChance(freight, 'award'), .225);
assert.equal(api.customerTripChance(freight, 'referral'), .065);
assert.equal(api.customerTripChance({ ...freight, category: 'international' }, 'award'), .42500000000000004);
assert.equal(api.customerTripChance({ ...freight, category: 'international' }, 'referral'), .08499999999999999);
assert.equal(api.customerTripChance({ ...freight, customer: 'stahlwerk' }, 'award'), .2);

math.random = (() => { let i = 0; return () => [.99, .2, .7][i++ % 3]; })();
const legacy = api.newGame('hamburg');
legacy.version = 32;
legacy.customerXp = { frischgut: 250 };
delete legacy.customerTrust;
legacy.customerSkills = { frischgut: { pay: 2, xp: 1, volume: 1 } };
legacy.orders.push({ id: 'A-999', customer: 'frischgut', kind: 'normal', status: 'completed', volume: 25 });
legacy.orders.push({ id: 'A-998', customer: 'frischgut', kind: 'normal', status: 'available', volume: 30, baseVolume: 20 });
storage.set('frachtwerk-save-v2', JSON.stringify(legacy));
const migrated = api.loadGame();
assert.equal(migrated.version, 37);
assert.equal(migrated.customerTrust.frischgut, 250);
assert.equal(migrated.customerSkills.frischgut, undefined);
assert.equal(migrated.orders.find(o => o.id === 'A-999').trustAwarded, true);
assert.ok(migrated.orders.find(o => o.id === 'A-998'), 'existing offer survives vehicle-data migration');
api.setGame(migrated);
assert.equal(api.availableCustomerSkillPoints('frischgut'), 2);
assert.equal(api.loadGame().customerTrust.frischgut, 250, 'migration persists once');
console.log('customer trust levels, points, rewards, economics, chances and migration: OK');
