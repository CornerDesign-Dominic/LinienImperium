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
vm.runInContext(beforeEvents + '\n globalThis.api = { newGame, buyTruck, buyHub, saleQuote, saleBlockReason, openSaleDialog, confirmSale, setGame: value => { game = value; }, mute: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
const api = context.api;
api.mute();
const state = api.newGame('hamburg');
api.setGame(state);
const cardTruck = state.trucks[0];
assert.equal(state.version, 43);
assert.match(api.saleBlockReason(cardTruck), /Fahrzeugkarten können nicht verkauft/);
assert.equal(api.openSaleDialog(cardTruck.id), false);
assert.equal(api.buyTruck(2), false);
api.buyHub();
state.coins = 10000;
api.buyTruck(0);
const city = state.trucks.find(truck => truck.tier === 0);
assert.equal(api.saleBlockReason(city), null);
assert.equal(api.saleQuote(city).coins, 3800);
city.purchasePrice = 1000;
city.kmDriven = 250000;
assert.equal(api.saleQuote(city).coins, 550, 'used city trucks lose value with mileage');
city.kmDriven = 500000;
assert.equal(api.saleQuote(city).coins, 150);
city.kmDriven = 600000;
assert.equal(api.saleQuote(city).coins, 150, 'rate is clamped after 500,000 km');
city.kmDriven = 0;
city.rarityLevel = 41;
city.moduleCapacityLevel = 2;
city.moduleCapacitySpent = 2;
const quote = api.saleQuote(city);
assert.equal(quote.gears.common, 14500);
assert.equal(quote.gears.epic, 72);
assert.equal(quote.modulesLost, 2);
const coinsBefore = state.coins;
assert.equal(api.openSaleDialog(city.id), true);
assert.match(element('#sale-dialog-content').innerHTML, /Kapazitätsmodule verloren/);
assert.equal(api.confirmSale(), true);
assert.equal(state.trucks.length, 1);
assert.equal(state.trucks[0].cardId, 'navigator');
assert.equal(state.coins, Math.round((coinsBefore + quote.coins) * 100) / 100);
assert.equal(state.inventory.gears.common, 14500);
assert.equal(api.confirmSale(), false, 'cannot sell twice');
console.log('card vehicles cannot be sold; city-vehicle sale and refunds remain: OK');
