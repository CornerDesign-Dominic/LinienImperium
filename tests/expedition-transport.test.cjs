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
  document: { querySelector: () => ({ innerHTML: '' }) }
});
vm.runInContext(beforeEvents + '\n globalThis.api = { newGame, loadGame, startExpeditionMission, settleExpeditions, expeditionTransportPlan, expeditionTransportProgress, renderExpeditionJobs, openExpeditionJobDialog, setGame: value => { game = value; }, setJobGroup: value => { selectedExpeditionJobGroup = value; }, mute: () => { render = () => {}; showToast = () => {}; } };\n})();', context);
const api = context.api;
api.mute();

const expectedTourSeconds = 30 / .96 + 30;
for (const [tier, volume, tours] of [[1, 20, 5], [2, 40, 10], [3, 60, 15]]) {
  const state = api.newGame('hamburg');
  api.setGame(state);
  state.expedition.regions[0].endlessUnlocked = true;
  const job = { id: 500 + tier, region: 0, kind: 'material', tier, createdAt: Date.now() };
  state.expedition.jobs.push(job);
  const coinsBefore = state.coins;
  const xpBefore = state.xp;
  const tripsBefore = state.stats.trips;
  assert.equal(api.startExpeditionMission(0, 'endless', state.trucks[0].id, job.id), true);
  const mission = state.expedition.missions.at(-1);
  assert.equal(mission.transport.volume, volume);
  assert.equal(mission.transport.tours.length, tours);
  assert.equal(mission.transport.tours[0].cargo, 4);
  assert.ok(Math.abs((mission.endsAt - mission.startedAt) / 1000 - expectedTourSeconds * tours) < .01);
  assert.equal(state.expedition.jobs.some(item => item.id === job.id), false);
  assert.equal(api.expeditionTransportProgress(mission, mission.startedAt), 0);
  assert.ok(api.expeditionTransportProgress(mission, mission.startedAt + expectedTourSeconds * 500) > 0);
  assert.equal(api.settleExpeditions(mission.transport.tours[0].endsAt - 1), false);
  assert.equal(mission.transport.delivered, 0, 'cargo is counted after the empty return');
  assert.equal(api.settleExpeditions(mission.transport.tours[0].endsAt), true);
  assert.equal(mission.transport.delivered, 4);
  assert.equal(mission.status, 'active');
  assert.equal(state.coins, coinsBefore);
  assert.equal(state.xp, xpBefore);
  assert.equal(state.stats.trips, tripsBefore);
  const restored = api.loadGame();
  api.setGame(restored);
  const offlineMission = restored.expedition.missions.at(-1);
  api.settleExpeditions(offlineMission.endsAt - 1);
  assert.equal(offlineMission.status, 'active', 'the last return trip must finish');
  assert.equal(offlineMission.transport.delivered, volume - 4);
  api.settleExpeditions(offlineMission.endsAt);
  assert.equal(offlineMission.status, 'completed');
  assert.equal(offlineMission.transport.delivered, volume);
  assert.equal(restored.xp, xpBefore, 'expedition tours grant no regular transport XP');
  assert.equal(restored.stats.trips, tripsBefore, 'expedition tours do not become regular trips');
  assert.equal(restored.coins, coinsBefore + 15, 'existing material loot is paid once');
  api.settleExpeditions(offlineMission.endsAt + 1000);
  assert.equal(restored.coins, coinsBefore + 15, 'offline completion cannot pay twice');
}

const state = api.newGame('hamburg');
api.setGame(state);
const job = { region: 0, kind: 'character', tier: 3 };
const small = state.trucks[0];
const base = api.expeditionTransportPlan(job, small, 0).tours.at(-1).endsAt;
assert.ok(base > 15 * 60 * 1000 && base < 16 * 60 * 1000);
const larger = { ...small, capacity: 18 };
const largePlan = api.expeditionTransportPlan(job, larger, 0);
assert.ok(largePlan.tours.at(-1).endsAt < base);
assert.equal(largePlan.tours.length, 4);
assert.equal(largePlan.tours.at(-1).cargo, 6, 'the last tour uses the remaining cargo and its lower load penalty');
const ranked = { ...small, rarityLevel: 10 };
const rankedDuration = api.expeditionTransportPlan(job, ranked, 0).tours.at(-1).endsAt;
assert.ok(Math.abs(rankedDuration / base - 1 / 1.05) < 1e-9);
state.expedition.characters.logistiker = { level: 1, progress: 0 };
state.expedition.seats[0] = 'logistiker';
const bonused = api.expeditionTransportPlan(job, small, 0).tours.at(-1).endsAt;
assert.ok(Math.abs(bonused / base - .9) < 1e-9);
console.log('expedition transport volume, loaded and empty legs, speed, bonus, progress and offline settlement: OK');
