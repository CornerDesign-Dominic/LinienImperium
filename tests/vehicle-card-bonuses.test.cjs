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
vm.runInContext(beforeEvents + '\n globalThis.api = { newGame, createCardTruck, cardBonusValue, cardBonusStats, truckSpeed, operatingCostPerKm, tourEconomics, projectFleetVehicles, assignCharacterSeat, giveCharacterShard, addCardToGarage, removeCardFromGarage, cards: EXPEDITION_CHARACTERS, setGame: value => { game = value; }, mute: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
const api = context.api;
api.mute();
const state = api.newGame('hamburg');
api.setGame(state);
const card = id => api.cards.find(item => item.id === id);
const own = id => { state.expedition.characters[id] = { level: 1, progress: 0 }; return card(id); };
assert.equal(api.cards.length, 15);
assert.equal(new Set(api.cards.map(item => item.id)).size, 15);
assert.deepEqual([...new Set(api.cards.map(item => item.scope))].sort(), ['fleet', 'garage', 'self', 'single']);
for (const level of [1, 5, 10]) {
  assert.ok(api.cardBonusValue(card('navigator'), level) < api.cardBonusValue(card('r1_uncommon'), level));
  assert.ok(api.cardBonusValue(card('r1_uncommon'), level) < api.cardBonusValue(card('r1_rare'), level));
}
assert.equal(api.cardBonusValue(card('navigator'), 10), 5.5);
assert.equal(api.cardBonusValue(card('r1_uncommon'), 10), 12);
assert.equal(api.cardBonusValue(card('r1_rare'), 10), 18.5);
const starter = state.trucks[0];
assert.equal(api.operatingCostPerKm(starter), .6435);
state.expedition.shards.common = 1;
api.giveCharacterShard('navigator');
assert.equal(api.operatingCostPerKm(starter), .64025, 'a shard upgrade strengthens only the assigned card');
const garageSpeed = own('r1_uncommon');
const booster = api.createCardTruck(garageSpeed);
assert.equal(api.truckSpeed(starter), 1);
assert.equal(api.addCardToGarage(garageSpeed.id), true);
assert.equal(api.truckSpeed(starter), 1.03, 'parked garage card speeds up other parked cards');
assert.equal(api.truckSpeed(booster), 1.03);
assert.equal(api.removeCardFromGarage(garageSpeed.id), true);
assert.equal(api.truckSpeed(starter), 1, 'removing source removes the aura');
const single = own('r3_common');
const singleTruck = api.createCardTruck(single);
state.trucks.push(singleTruck);
const order = { distance: 100, routeType: 'single', volume: 10, category: 'national', kind: 'normal' };
assert.equal(api.tourEconomics(order, singleTruck, 10, 0).revenue, 1010, 'single-order pay bonus applies to direct trips');
const fleet = own('r1_rare');
api.assignCharacterSeat('navigator', 0, 0);
api.assignCharacterSeat(fleet.id, 1, 0);
api.assignCharacterSeat('navigator', 0, 1);
api.assignCharacterSeat(fleet.id, 1, 1);
const first = api.projectFleetVehicles(0);
const second = api.projectFleetVehicles(1);
assert.equal(first[0].bonusStats.speed, 5);
assert.equal(second[0].bonusStats.speed, 5, 'same card buffs both fleets');
assert.equal(api.truckSpeed(first[0]), 1.05);
assert.equal(api.truckSpeed(starter), 1, 'fleet bonus does not change ordinary garage trips');
state.expedition.characters[fleet.id].level = 10;
assert.equal(api.truckSpeed(first[0]), 1.05, 'running project snapshots retain their bonus');
assert.equal(api.projectFleetVehicles(0)[0].bonusStats.speed, 18.5);
console.log('15 vehicle-card bonuses, scaling, shard upgrade, garage aura, single trips and project snapshots: OK');
