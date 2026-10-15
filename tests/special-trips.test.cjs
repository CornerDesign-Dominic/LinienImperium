const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const elements = new Map();
const element = key => {
  if (!elements.has(key)) elements.set(key, { innerHTML: '', textContent: '', open: false, close() { this.open = false; }, showModal() { this.open = true; }, setAttribute() {} });
  return elements.get(key);
};
const math = Object.create(Math);
math.random = () => .5;
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math: math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: element }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { newGame, loadGame, save, createOrder, queueCustomerTrip, assignCharacterSeat, assignOrder, projectFleetVehicles, projectEstimatedEnd, startFleetProject, settleFleetProjects, spendOvertime, regenerateOvertime, renderSpecialTrips, renderInventory, applyOrderReward, settleTrips, setProject: id => { selectedProjectId = id; }, setGame: value => { game = value; }, mute: () => { render = () => {}; showToast = () => {}; replenishOrders = () => {}; } };\n})();', context);
const api = context.api;
api.mute();
const state = api.newGame('hamburg');
api.setGame(state);
state.expedition.regions[0].customerUnlocked = true;
assert.equal(api.assignCharacterSeat('navigator', 0), true);
assert.equal(api.assignCharacterSeat('navigator', 0, 1), true, 'same card may appear in multiple templates');
const sourceOrder = api.createOrder(999, { category: 'national', customer: null });
sourceOrder.customer = 'nordbau';
const special = api.queueCustomerTrip(sourceOrder, 'special');
const referral = api.queueCustomerTrip(sourceOrder, 'referral');
assert.equal(special.volume, 400);
assert.equal(special.distance, 120);
assert.equal(special.deadlineMs, 3600000);
assert.equal(referral.volume, 1100);
assert.equal(referral.distance, 240);
assert.equal(referral.deadlineMs, 3 * 3600000);
assert.match(referral.projectName, /Großprojekt/);
assert.equal(api.projectFleetVehicles(2), null, 'an empty template cannot start');
assert.equal(api.projectFleetVehicles(0).length, 1, 'one card is enough');
api.renderInventory();
assert.match(element('#inventory-content').innerHTML, /Großauftrag Stadtversorgung/);
api.renderSpecialTrips();
assert.match(element('#special-content').innerHTML, /Großprojekt Hafenverbund/);

const now = Date.now();
assert.equal(api.startFleetProject(special.id, 0, now), true);
assert.equal(api.startFleetProject(special.id, 0, now), false, 'cannot start twice');
assert.equal(api.startFleetProject(referral.id, 1, now), true, 'same card may work on two projects at once');
assert.equal(special.project.vehicles.length, 1);
assert.ok(api.projectEstimatedEnd(special, now) > special.project.deadlineAt, 'slow fleet misses deadline without overtime');
api.setProject(special.id);
api.renderSpecialTrips();
assert.match(element('#special-content').innerHTML, /assets\/project-special.svg/);
assert.match(element('#special-content').innerHTML, /data-project-overtime="[^\"]+:10"/);
const normal = state.orders.find(order => order.status === 'available');
normal.category = 'national';
api.assignOrder(normal.id, 'KARTE-navigator');
assert.equal(normal.status, 'active', 'the same card may also carry a normal garage order');
api.settleTrips(now + 1000);
assert.equal(special.status, 'active', 'normal trip settlement does not consume a project');

state.overtimePoints = 10;
math.random = () => 0;
assert.equal(api.spendOvertime(special.id, 10, now + 1000), true);
assert.equal(special.delivered, 110, 'one-percent bonus rolls per point in a batch');
assert.equal(state.overtimePoints, 0);
assert.equal(api.spendOvertime(special.id, 1, now + 1000), false, 'cannot spend without points');
state.overtimeLastRegenAt = now;
assert.equal(api.regenerateOvertime(now + 21 * 60000), true);
assert.equal(state.overtimePoints, 2, 'one point regenerates every ten minutes');
assert.equal(api.regenerateOvertime(now + 21 * 60000), false, 'regeneration is idempotent');

assert.equal(api.settleFleetProjects(now + 4 * 3600000), true);
assert.equal(special.status, 'failed', 'incomplete project fails at deadline');
assert.equal(referral.status, 'failed', 'the parallel project also has a deadline');
assert.equal(special.completionReward, null, 'failed projects award nothing');

const quick = api.queueCustomerTrip(sourceOrder, 'special');
quick.volume = 12;
assert.equal(api.startFleetProject(quick.id, 0, now + 5 * 3600000), true);
math.random = () => .5;
assert.equal(api.settleFleetProjects(now + 5 * 3600000 + 20 * 60000), true);
assert.equal(quick.status, 'completed');
assert.equal(quick.delivered, 12);
assert.ok(quick.completionReward);
assert.equal(api.applyOrderReward(quick), true);
assert.equal(api.applyOrderReward(quick), false, 'reward can only be claimed once');
api.save();
assert.equal(api.loadGame().orders.find(order => order.id === quick.id).completionReward.claimedAt > 0, true);

const regionFive = api.queueCustomerTrip({ ...sourceOrder, region: 4 }, 'referral');
assert.ok(regionFive.volume > referral.volume);
assert.ok(regionFive.distance > referral.distance);

const combined = api.newGame('hamburg');
api.setGame(combined);
combined.expedition.characters.r1_rare = { level: 1, progress: 0 };
api.assignCharacterSeat('navigator', 0);
api.assignCharacterSeat('r1_rare', 1);
const shared = api.queueCustomerTrip(sourceOrder, 'special');
shared.volume = 30;
const multiStart = now + 10 * 3600000;
assert.equal(api.startFleetProject(shared.id, 0, multiStart), true);
assert.equal(shared.project.vehicles.length, 2);
assert.equal(shared.project.vehicles[0].cargo, 4);
assert.equal(shared.project.vehicles[1].cargo, 13);
assert.ok(api.projectEstimatedEnd(shared, multiStart) < multiStart + 15 * 60000);
api.settleFleetProjects(multiStart + 5 * 60000);
assert.ok(shared.delivered >= 4 && shared.delivered < 30, 'individual vehicles complete independent tours');
api.settleFleetProjects(multiStart + 20 * 60000);
assert.equal(shared.status, 'completed');
assert.equal(shared.delivered, 30);
console.log('fleet projects, concurrent templates, deadlines, overtime and rewards: OK');
