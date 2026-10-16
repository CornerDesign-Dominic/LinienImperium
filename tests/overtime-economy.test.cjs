const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8').split("  document.addEventListener('click'")[0];
const storage = new Map(), elements = new Map();
const math = Object.create(Math);
math.random = () => .5;
const element = selector => {
  if (!elements.has(selector)) elements.set(selector, { innerHTML: '', textContent: '', setAttribute() {} });
  return elements.get(selector);
};
const context = vm.createContext({ Date, Math: math, Intl, Number, JSON, setTimeout, clearTimeout,
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  document: { querySelector: element }
});
vm.runInContext(source + '\nglobalThis.api = { newGame, save, loadGame, queueCustomerTrip, assignCharacterSeat, startFleetProject, spendOvertime, settleFleetProjects, useOvertimeRefill, regenerateOvertime, renderInventory, awardTransportXp, setGame: v => game = v, mute: () => {render=()=>{};showToast=()=>{};} };})();', context);
const api = context.api;
api.mute();
const now = Date.now();
function fixture(volume = 40, distance = 100) {
  const state = api.newGame('hamburg');
  api.setGame(state);
  state.overtimePoints = 1000;
  api.assignCharacterSeat('navigator', 0);
  const order = api.queueCustomerTrip({ category: 'national', customer: 'nordbau', homeCity: 'hamburg', region: 0 }, 'special');
  Object.assign(order, { volume, distance });
  api.startFleetProject(order.id, 0, now);
  return { state, order };
}
function result(state, order) {
  return {
    coins: state.coins, xp: state.xp, delivered: order.delivered,
    revenue: state.stats.grossRevenue, costs: state.stats.operatingCosts,
    tons: state.stats.tons, km: state.stats.km, tkm: state.stats.tonKm, trips: state.stats.trips,
    truckKm: state.trucks[0].kmDriven, truckTrips: state.trucks[0].toursCompleted,
    reward: JSON.stringify(order.completionReward), trust: state.customerTrust.nordbau,
    refills: state.inventory.overtimeRefills
  };
}
function equalResults(actual, expected) {
  for (const key of Object.keys(expected)) {
    if (typeof expected[key] === 'number') assert.ok(Math.abs(actual[key] - expected[key]) < 1e-7, `${key}: ${actual[key]} vs ${expected[key]}`);
    else assert.equal(actual[key], expected[key], key);
  }
}
const passive = fixture();
api.settleFleetProjects(now + 59 * 60000);
assert.equal(passive.order.status, 'completed');
const expected = result(passive.state, passive.order);
const instant = fixture();
assert.equal(api.spendOvertime(instant.order.id, 10, now), true);
assert.equal(instant.order.status, 'completed');
equalResults(result(instant.state, instant.order), expected);
const afterInstant = result(instant.state, instant.order);
api.settleFleetProjects(now + 2 * 3600000);
assert.equal(api.spendOvertime(instant.order.id, 1, now), false);
equalResults(result(instant.state, instant.order), afterInstant);

// A token can split a physical tour. Reloading and its later arrival must not pay twice.
const mixed = fixture();
api.spendOvertime(mixed.order.id, 1, now);
assert.equal(mixed.order.delivered, 10);
assert.equal(mixed.state.stats.trips, 2, 'two complete tours, one partial tour');
api.save();
const reloaded = api.loadGame();
api.setGame(reloaded);
api.settleFleetProjects(now + 59 * 60000);
const restoredOrder = reloaded.orders.find(order => order.id === mixed.order.id);
equalResults(result(reloaded, restoredOrder), expected);

// Card pay, cost and XP bonuses count on the token path as on passive deliveries.
function bonusFixture() {
  const f = fixture(52, 333);
  f.state.expedition.characters.navigator.level = 10;
  f.state.expedition.characters.forscherin = { level: 10, progress: 0 };
  f.state.expedition.characters.pionierin = { level: 10, progress: 0 };
  api.assignCharacterSeat('forscherin', 1);
  api.assignCharacterSeat('pionierin', 2);
  const order = api.queueCustomerTrip({ category: 'national', customer: 'nordbau', region: 0 }, 'referral');
  Object.assign(order, { volume: 52, distance: 333 });
  api.startFleetProject(order.id, 0, now);
  f.state.orders = [order];
  return { state: f.state, order };
}
const bonusPassive = bonusFixture();
api.settleFleetProjects(now + 179 * 60000);
const expectedBonus = result(bonusPassive.state, bonusPassive.order);
const bonusInstant = bonusFixture();
for (let i = 0; i < 20 && bonusInstant.order.status === 'active'; i++) api.spendOvertime(bonusInstant.order.id, 1, now);
assert.equal(bonusInstant.order.status, 'completed');
// With multiple vehicles, faster completion can change which vehicle carries later loads.
// All loads still receive the identical shared fleet pay/XP bonuses.
assert.ok(Math.abs(bonusInstant.state.stats.grossRevenue - expectedBonus.revenue) <= .03);
assert.ok(Math.abs(bonusInstant.state.xp - expectedBonus.xp) <= .03);
assert.ok(bonusInstant.state.stats.operatingCosts > 0);
assert.ok(bonusInstant.state.stats.tonKm > 0);

// Every crossed level grants one package immediately, including offline/multi-level gains.
const levelState = api.newGame('hamburg');
api.setGame(levelState);
api.awardTransportXp(600); // Levels 2, 3 and 4.
assert.equal(levelState.inventory.overtimeRefills, 3);
assert.deepEqual([...levelState.pendingLevelUps], [2, 3, 4]);
api.awardTransportXp(0);
assert.equal(levelState.inventory.overtimeRefills, 3);
api.save();
api.setGame(api.loadGame());
api.renderInventory();
assert.match(element('#inventory-content').innerHTML, /Überstunden-Refill/);
assert.match(element('#inventory-content').innerHTML, /data-use-overtime-refill/);
assert.equal(api.useOvertimeRefill(now), true);
api.save();
const used = api.loadGame();
assert.equal(used.inventory.overtimeRefills, 2);
assert.equal(used.overtimePoints, 200, 'a full stock does not waste a package');
api.setGame(used);
assert.equal(api.regenerateOvertime(now + 60 * 60000), false, 'no regeneration above maximum');
assert.equal(used.overtimePoints, 200);
used.inventory.overtimeRefills = 0;
assert.equal(api.useOvertimeRefill(now), false);
assert.equal(used.overtimePoints, 200);

// XP earned by tokens also grants refills and records each new level only once.
const levelling = fixture(120, 100);
api.spendOvertime(levelling.order.id, 10, now);
assert.equal(levelling.state.inventory.overtimeRefills, 1);
api.spendOvertime(levelling.order.id, 10, now);
assert.equal(levelling.state.inventory.overtimeRefills, 1);
console.log('overtime/passive economy parity, partial trips, bonus accounting, refill awards and inventory use: OK');
