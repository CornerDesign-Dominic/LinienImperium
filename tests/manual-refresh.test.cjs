const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const assignDialog = { open: false };
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: selector => selector === '#assign-dialog' ? assignDialog : null }
});
vm.runInContext(beforeEvents + '\n globalThis.testApi = { newGame, loadGame, manualRefreshCost, manualRefreshOrders, autoRefreshOrders, setGame: value => { game = value; } };\n})();', context);
const api = context.testApi;
const state = api.newGame('hamburg');
state.xp = 14000;
state.coins = 10000;
state.trucks = Array.from({ length: 5 }, (_, i) => ({ id: `LKW-${i + 1}`, tier: 0 }));
api.setGame(state);
const timerBeforeManualRefresh = state.nextAutoRefreshAt;

assert.equal(api.manualRefreshCost(), 250);
assert.equal(api.manualRefreshOrders('national'), true);
assert.equal(api.manualRefreshCost(), 500);
assert.equal(api.manualRefreshOrders('national'), true);
assert.equal(api.manualRefreshCost(), 750);
assert.equal(api.manualRefreshOrders('international'), true);
assert.equal(state.coins, 8500);
assert.equal(state.stats.manualRefreshSpent, 1500);
assert.equal(state.manualRefreshCount, 3);
assert.equal(api.manualRefreshCost(), 1000);
assert.equal(state.nextAutoRefreshAt, timerBeforeManualRefresh);

const reloaded = api.loadGame();
assert.equal(reloaded.version, 37);
assert.equal(reloaded.manualRefreshCount, 3);
api.setGame(reloaded);
assert.equal(api.manualRefreshCost(), 1000);
reloaded.coins = 999;
const ordersBeforeFailure = JSON.stringify(reloaded.orders);
const timerBeforeFailure = reloaded.nextAutoRefreshAt;
assert.equal(api.manualRefreshOrders('national'), false);
assert.equal(reloaded.coins, 999);
assert.equal(reloaded.manualRefreshCount, 3);
assert.equal(reloaded.stats.manualRefreshSpent, 1500);
assert.equal(JSON.stringify(reloaded.orders), ordersBeforeFailure);
assert.equal(reloaded.nextAutoRefreshAt, timerBeforeFailure);

assert.equal(api.autoRefreshOrders(timerBeforeFailure - 1), false);
assert.equal(reloaded.manualRefreshCount, 3);
assert.equal(api.autoRefreshOrders(timerBeforeFailure), true);
assert.equal(reloaded.manualRefreshCount, 0);
assert.equal(reloaded.coins, 999);
assert.equal(api.manualRefreshCost(), 250);
assert.equal(api.loadGame().manualRefreshCount, 0);

const oldSave = api.newGame('hamburg');
oldSave.trucks.pop(); // Historical saves had one starter.
oldSave.version = 28;
delete oldSave.manualRefreshCount;
oldSave.nextAutoRefreshAt = Date.now() + 123456;
storage.set('frachtwerk-save-v2', JSON.stringify(oldSave));
const upgraded = api.loadGame();
assert.equal(upgraded.version, 37);
assert.equal(upgraded.manualRefreshCount, 0);
assert.equal(upgraded.nextAutoRefreshAt, oldSave.nextAutoRefreshAt);
api.setGame(upgraded);
assert.equal(api.manualRefreshCost(), 50, 'the one starter truck counts toward refresh pricing');

console.log('manual refresh pricing, shared counter, insufficient coins, auto reset and reload: OK');
