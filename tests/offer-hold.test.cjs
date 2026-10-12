const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const beforeEvents = source.slice(0, source.indexOf("  document.addEventListener('click'"));
const storage = new Map();
const elements = new Map();
const element = key => {
  if (!elements.has(key)) elements.set(key, { innerHTML: '', textContent: '', open: false, disabled: false, close() { this.open = false; } });
  return elements.get(key);
};
const math = Object.create(Math);
math.random = () => .9;
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  Date, Math: math, Intl, Number, JSON, setTimeout, clearTimeout,
  document: { querySelector: element }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { newGame, loadGame, createOrder, pinLimit, pinnedOrders, toggleOrderPin, renderOrders, manualRefreshCost, manualRefreshOrders, autoRefreshOrders, assignOrder, setGame: value => { game = value; }, mute: messages => { render = () => {}; showToast = message => messages.push(message); } };\n})();', context);
const api = context.api;
const messages = [];
api.mute(messages);
const state = api.newGame('hamburg');
api.setGame(state);
state.coins = 100000;
const regional = state.orders.find(order => order.category === 'national');
const distant = api.createOrder(999, { category: 'international', customer: null });
state.orders.splice(1, 1, distant);
assert.equal(api.pinLimit(), 1);
assert.equal(api.toggleOrderPin(regional.id), true);
assert.equal(regional.pinned, true);
api.renderOrders();
const html = element('#orders-list').innerHTML;
assert.match(html, new RegExp(`data-pin="${regional.id}"[^>]*aria-pressed="true"[^>]*aria-label="Auftrag freigeben"`));
assert.match(html, new RegExp(`data-pin="${distant.id}"[^>]*aria-pressed="false"[^>]*aria-label="Auftrag halten"`));
assert.match(html, /class="order-lock-toggle locked"/);
assert.doesNotMatch(html, new RegExp(`data-pin="${distant.id}"[^>]*disabled`), 'other locks remain clickable');
assert.equal(element('#held-offers-count').textContent, '1 / 1 Aufträge gehalten');
assert.equal(api.toggleOrderPin(distant.id), false, 'one slot is shared across segments');
assert.equal(messages.at(-1), 'Du kannst nur 1 Auftrag halten.');
assert.equal(distant.pinned, undefined);
assert.equal(api.toggleOrderPin(regional.id), true);
assert.equal(api.toggleOrderPin(distant.id), true);
assert.equal(api.toggleOrderPin(distant.id), true);
assert.equal(api.toggleOrderPin(regional.id), true);

const heldSnapshot = JSON.stringify(regional);
const oldOtherIds = state.orders.filter(order => order.status === 'available' && !order.pinned).map(order => order.id);
const timer = state.nextAutoRefreshAt;
const manualCost = api.manualRefreshCost();
assert.equal(api.manualRefreshOrders(), true);
assert.equal(state.nextAutoRefreshAt, timer, 'manual refresh does not shift timer');
assert.equal(state.coins, 100000 - manualCost);
assert.equal(JSON.stringify(regional), heldSnapshot, 'manual refresh preserves the whole offer');
assert.ok(oldOtherIds.every(id => !state.orders.some(order => order.id === id && order.status === 'available')));
const nextOtherIds = state.orders.filter(order => order.status === 'available' && !order.pinned).map(order => order.id);
assert.equal(api.autoRefreshOrders(timer), true);
assert.equal(JSON.stringify(regional), heldSnapshot, 'automatic refresh preserves the whole offer');
assert.ok(nextOtherIds.every(id => !state.orders.some(order => order.id === id && order.status === 'available')));
assert.equal(state.manualRefreshCount, 0);
const restored = api.loadGame();
api.setGame(restored);
const heldAfterReload = restored.orders.find(order => order.id === regional.id);
assert.equal(JSON.stringify(heldAfterReload), heldSnapshot, 'held offer survives reload');
assert.equal(api.pinnedOrders().length, 1);
api.assignOrder(heldAfterReload.id, restored.trucks[0].id);
assert.equal(heldAfterReload.status, 'active');
assert.equal(heldAfterReload.pinned, false);
assert.equal(api.pinnedOrders().length, 0, 'assignment frees the hold slot');
assert.equal(restored.orders.filter(order => order.status === 'available').length, 5);
const newRegional = restored.orders.find(order => order.status === 'available' && order.category === 'national');
assert.equal(api.toggleOrderPin(newRegional.id), true, 'slot can be reused');

restored.company.departments.sales = true;
restored.company.salesLevel = 1;
assert.equal(api.pinLimit(), 2, 'a purchased sales level adds to the free slot');
const second = restored.orders.find(order => order.status === 'available' && order.id !== newRegional.id);
assert.equal(api.toggleOrderPin(second.id), true);
const third = restored.orders.find(order => order.status === 'available' && !order.pinned);
assert.equal(api.toggleOrderPin(third.id), false);
assert.equal(messages.at(-1), 'Du kannst nur 2 Aufträge halten.');

console.log('shared offer hold, both refreshes, assignment and reload: OK');
