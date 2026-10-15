const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const elements = new Map();
const element = selector => {
  if (!elements.has(selector)) elements.set(selector, { innerHTML: '', textContent: '', open: false, close() { this.open = false; } });
  return elements.get(selector);
};
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: element }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { EXPEDITION_CHARACTERS, TRUCKS, newGame, loadGame, buyTruck, addCardToGarage, removeCardFromGarage, assignCharacterSeat, assignOrder, eligibleFreeTrucks, startExpeditionMission, upgradeTruckCapacity, upgradeTruckRarity, truckSpeed, renderDealer, renderPersonnel, setGame: value => { game = value; }, mute: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
const api = context.api;
api.mute();

const state = api.newGame('hamburg');
api.setGame(state);
assert.equal(api.EXPEDITION_CHARACTERS.length, 15);
assert.equal(state.trucks.length, 1);
assert.equal(state.trucks[0].cardId, 'navigator');
assert.equal(state.trucks[0].capacity, 4);
assert.equal(api.truckSpeed(state.trucks[0]), 1);
assert.equal(state.expedition.characters.navigator.level, 1);
assert.equal(api.addCardToGarage('navigator'), false, 'one card cannot occupy two garage slots');
assert.equal(api.addCardToGarage('unknown'), false);
assert.equal(api.assignCharacterSeat('navigator', 0), true);
assert.equal(state.expedition.seats[0], 'navigator', 'the same card may also serve in the fleet');
assert.equal(api.buyTruck(2), false, 'regional trucks are no longer purchasable');
assert.equal(state.trucks.length, 1);
api.renderDealer();
assert.doesNotMatch(element('#shop-list').innerHTML, /Langstreckentransporter/);
api.renderPersonnel();
assert.match(element('#personnel-cards').innerHTML, /4 t Nutzgewicht/);
assert.match(element('#personnel-cards').innerHTML, /24 t Nutzgewicht/);

const cardIds = new Set();
for (const card of api.EXPEDITION_CHARACTERS) {
  const model = api.TRUCKS[card.vehicleTier];
  assert.ok(card.vehicleTier >= 2 && card.vehicleTier <= 6);
  assert.ok([4, 8.5, 13, 18, 24].includes(model.capacity));
  assert.equal(cardIds.has(card.id), false);
  cardIds.add(card.id);
  state.expedition.characters[card.id] ||= { level: 1, progress: 0 };
}
for (const id of [...cardIds].slice(1, 10)) assert.equal(api.addCardToGarage(id), true);
assert.equal(state.trucks.filter(truck => truck.cardId).length, 10);
assert.equal(api.addCardToGarage([...cardIds][10]), false, 'garage has exactly ten slots');

const truck = state.trucks[0];
state.inventory.capacityModules = 1;
state.inventory.gears.common = 1000;
assert.equal(api.upgradeTruckCapacity(truck.id), true);
api.upgradeTruckRarity(truck.id);
assert.equal(truck.capacity, 4.5);
assert.equal(truck.rarityLevel, 1);
assert.equal(api.removeCardFromGarage('navigator'), true);
assert.equal(state.expedition.seats[0], 'navigator', 'removing from garage does not remove the fleet bonus');
assert.equal(api.addCardToGarage('navigator'), true);
assert.equal(state.trucks.find(item => item.cardId === 'navigator').capacity, 4.5);
assert.equal(state.trucks.find(item => item.cardId === 'navigator').rarityLevel, 1);
assert.equal(api.loadGame().trucks.find(item => item.cardId === 'navigator').capacity, 4.5);

const normalState = api.newGame('hamburg');
api.setGame(normalState);
const normalOrder = normalState.orders[0];
normalOrder.category = 'national';
api.assignOrder(normalOrder.id, normalState.trucks[0].id);
assert.equal(normalOrder.status, 'active', 'starter card takes a normal regional order');
assert.equal(normalOrder.truckId, 'KARTE-navigator');
assert.equal(api.removeCardFromGarage('navigator'), false, 'active normal order blocks card removal');

const customerState = api.newGame('hamburg');
api.setGame(customerState);
customerState.expedition.regions[0].customerUnlocked = true;
const customerOrder = customerState.orders[0];
Object.assign(customerOrder, { category: 'national', customer: 'nordbau', cargo: 'Baustoffe' });
api.assignOrder(customerOrder.id, customerState.trucks[0].id);
assert.equal(customerOrder.status, 'active', 'starter card takes an unlocked customer order');
assert.equal(customerOrder.truckId, 'KARTE-navigator');

api.setGame(state);

const national = { category: 'national' };
const international = { category: 'international' };
assert.ok(api.eligibleFreeTrucks(national).some(item => item.cardId === 'navigator'));
assert.ok(api.eligibleFreeTrucks(international).some(item => item.cardId === 'r1_rare'));
state.expedition.regions[0].endlessUnlocked = true;
state.expedition.jobs.push({ id: 500, region: 0, kind: 'material', tier: 1 });
assert.equal(api.startExpeditionMission(0, 'endless', truck.id, 500), true);
assert.equal(api.removeCardFromGarage('navigator'), false, 'busy cards cannot be removed');

console.log('card garage capacity, transport eligibility, upgrades and fleet independence: OK');
