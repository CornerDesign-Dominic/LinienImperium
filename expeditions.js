/* Theme-neutral pilot rules. Unsettled balance values are deliberately centralized here. */
(function (root) {
  'use strict';
  const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const RULES = { startCapacity: 50, cost: 5, regenMs: 600000, refill: 50, convert: 10, maxLevel: 10 };
  const CHARACTERS = [
    { id: 'navigator', name: 'Navigator', rarity: 'common', bonus: 'speed', base: .01, step: .005 },
    { id: 'scout', name: 'Späher', rarity: 'uncommon', bonus: 'regen', base: .03, step: .008 },
    { id: 'broker', name: 'Vermittler', rarity: 'rare', bonus: 'customer', base: .01, step: .002 },
    { id: 'envoy', name: 'Gesandter', rarity: 'epic', bonus: 'referral', base: .015, step: .003 },
    { id: 'quartermaster', name: 'Quartiermeister', rarity: 'legendary', bonus: 'capacity', base: 20, step: 5 }
  ];
  const REGIONS = [
    { id: 'r1', name: 'Küstenregion', customer: 'nordbau', research: [5,5,5,10,10,10,15], hours: [2,3,4,6,8,12,18], types: [.20,.75,.045,.005], stages: [1,0,0], characters: [.8,.2,0,0,0] },
    { id: 'r2', name: 'Handelsregion', customer: 'frischgut', research: [10,10,15,15,20,20,30], hours: [4,6,8,12,18,24,36], types: [.40,.55,.045,.005], stages: [.7,.3,0], characters: [.6,.3,.1,0,0] },
    { id: 'r3', name: 'Gebirgsregion', customer: 'stahlwerk', research: [15,20,20,25,30,30,40], hours: [6,8,12,18,24,36,48], types: [.15,.80,.04,.01], stages: [.3,.6,.1], characters: [.4,.35,.2,.05,0] },
    { id: 'r4', name: 'Fernhandelsregion', customer: 'alpenhandel', research: [20,25,30,35,40,45,45], hours: [8,12,18,24,36,48,60], types: [.35,.58,.06,.01], stages: [.1,.65,.25], characters: [.3,.3,.25,.14,.01] },
    { id: 'r5', name: 'Grenzregion', customer: 'eurolog', research: [30,35,40,50,60,70,75], hours: [12,18,24,36,48,60,72], types: [.25,.68,.055,.015], stages: [0,.4,.6], characters: [.2,.3,.3,.17,.03] }
  ];
  // Exactly one rarity per package; Epic only at stage 2+, Legendary only at stage 3.
  const MATERIAL = [
    [[.65,100,200],[.25,10,20],[.10,2,5]],
    [[.60,150,300],[.25,15,30],[.132,3,7],[.018,1,2]],
    [[.55,200,400],[.28,20,40],[.15,4,10],[.018,1,3],[.002,1,1]]
  ];
  const SHARDS = [
    [[.75,2,4],[.20,1,2],[.05,1,1]],
    [[.70,3,6],[.24,2,3],[.058,1,2],[.002,1,1]],
    [[.65,4,8],[.28,2,4],[.066,1,3],[.0038,1,2],[.0002,1,1]]
  ];
  const TYPES = ['shard', 'material', 'special', 'referral'];
  function weighted(weights, rng = Math.random) {
    let roll = rng() * weights.reduce((a,b) => a+b, 0);
    for (let i = 0; i < weights.length; i++) { roll -= weights[i]; if (roll < 0) return i; }
    return weights.length - 1;
  }
  function quantity(min, max, rng) { return min + Math.floor(rng() * (max - min + 1)); }
  function ensure(game, now = Date.now(), level = 1, legacy = false) {
    if (!game.expeditions) {
      const unlocked = legacy ? [...new Set(game.orders.filter(o => o.customer).map(o => o.customer).concat(Object.keys(game.customerTrust).filter(id => game.customerTrust[id] > 0)))] : [];
      game.expeditions = { version: 1, points: 50, regenAt: now, lastLevel: level, regions: REGIONS.map(r => ({ id: r.id, discovered: 0, endless: false, missions: [] })), jobs: [], nextJob: 1, shards: Object.fromEntries(RARITIES.map(r => [r,0])), characters: {}, seats: [null,null,null,null,null], unlockedCustomers: unlocked, log: [], stats: { finds: 0, completed: 0, spent: 0, refills: 0 } };
    }
    return game.expeditions;
  }
  function bonus(e, kind) {
    return e.seats.reduce((sum, id) => { const def = CHARACTERS.find(c => c.id === id), c = e.characters[id]; return sum + (def && c && def.bonus === kind ? def.base + (c.level - 1) * def.step : 0); },0);
  }
  function capacity(e) { return RULES.startCapacity + e.regions.reduce((s,r) => s+r.missions.filter(m => m.claimed).length,0) + bonus(e,'capacity'); }
  function interval(e) { return RULES.regenMs / (1 + Math.min(.2,bonus(e,'regen'))); }
  function log(e, message) { e.log.unshift(message); e.log = e.log.slice(0,12); }
  function sync(game, now, level) {
    const e = ensure(game,now,level); let changed = false;
    const cap = capacity(e), ms = interval(e);
    if (e.points >= cap) { e.regenAt = now; }
    else {
      const count = Math.floor(Math.max(0,now-e.regenAt)/ms);
      if (count) { e.points = Math.min(cap,e.points+count); e.regenAt = e.points === cap ? now : e.regenAt+count*ms; changed = true; }
    }
    if (level > e.lastLevel) { const amount = (level-e.lastLevel)*RULES.refill; e.points += amount; e.stats.refills += amount; e.lastLevel = level; e.regenAt = now; log(e,`Levelaufstieg: +${amount} Expeditionspunkte.`); changed = true; }
    for (const r of e.regions) for (const m of r.missions) if (m.status === 'active' && now >= m.finishAt) { m.status = 'completed'; changed = true; }
    for (const j of e.jobs) if (j.status === 'active' && now >= j.finishAt) { j.status = 'completed'; changed = true; }
    return changed;
  }
  function spend(e, cost, now) {
    if (e.points < cost) return false;
    if (e.points >= capacity(e)) e.regenAt = now;
    e.points -= cost; e.stats.spent += cost; return true;
  }
  function available(e,index) { return index === 0 || e.regions[index-1].endless; }
  function discover(game,index,now=Date.now()) {
    const e=ensure(game), r=e.regions[index], def=REGIONS[index];
    if (!def || !available(e,index) || r.endless) return false;
    const final = r.discovered === 7, cost=final ? 20 : def.research[r.discovered];
    if (!spend(e,cost,now)) return false;
    if (final) {
      r.endless=true; game.inventory.capacityModules++;
      if (!e.unlockedCustomers.includes(def.customer)) e.unlockedCustomers.push(def.customer);
      log(e,`${def.name}: Endlosort, Kunde und 1 Kapazitätsmodul freigeschaltet.`);
    } else {
      r.missions.push({ id:`${r.id}-place-${r.discovered+1}`, place:r.discovered+1, durationMs:def.hours[r.discovered]*3600000, status:'queued', claimed:false }); r.discovered++;
      log(e,`${def.name}: Ort ${r.discovered} entdeckt. Transportmission bleibt optional.`);
    }
    return true;
  }
  function busy(e,id) { return e.jobs.some(j=>j.status==='active' && j.truckId===id) || e.regions.some(r=>r.missions.some(m=>m.status==='active' && m.truckId===id)); }
  function eligible(game,truckId) { const t=game.trucks.find(t=>t.id===truckId); return t && t.tier>=2 && !t.hubAssigned && !busy(ensure(game),truckId) && !game.orders.some(o=>o.status==='active' && o.truckId===truckId); }
  function findTask(e,id) { return e.jobs.find(j=>j.id===id) || e.regions.flatMap(r=>r.missions).find(m=>m.id===id); }
  function assign(game,id,truckId,now=Date.now()) {
    const e=ensure(game), task=findTask(e,id); if (!task || task.status!=='queued' || !eligible(game,truckId)) return false;
    task.status='active'; task.truckId=truckId; task.startAt=now; task.finishAt=now+task.durationMs; return true;
  }
  function packageLoot(table, rng) { const index=weighted(table.map(r=>r[0]),rng), row=table[index]; return {rarity:RARITIES[index], count:quantity(row[1],row[2],rng)}; }
  function grantCharacter(e,index,rng) {
    const rarity = RARITIES[weighted(REGIONS[index].characters,rng)];
    const def=CHARACTERS.find(c=>c.rarity===rarity);
    if (e.characters[def.id]) { const shard=rarity==='legendary'?'epic':rarity, count=rarity==='legendary'?25:10; e.shards[shard]+=count; log(e,`${def.name} doppelt: +${count} ${shard}-Shards.`); return {character:def.id, duplicate:true, rarity:shard,count}; }
    e.characters[def.id]={level:1,progress:0}; log(e,`${def.name} (${rarity}) auf Level 1 gefunden.`); return {character:def.id,duplicate:false};
  }
  function explore(game,index,now=Date.now(),rng=Math.random) {
    const e=ensure(game),r=e.regions[index],def=REGIONS[index]; if (!def || !r.endless || !spend(e,RULES.cost,now)) return false;
    e.stats.finds++;
    if (rng()<.02) return grantCharacter(e,index,rng);
    const type=TYPES[weighted(def.types,rng)],stage=weighted(def.stages,rng)+1;
    const reward = type==='material' ? {gears:packageLoot(MATERIAL[stage-1],rng)} : type==='shard' ? {shards:packageLoot(SHARDS[stage-1],rng)} : {customer:def.customer,kind:type};
    const job={id:`E-${e.nextJob++}`,region:index,type,stage,status:'queued',durationMs:(60+quantity(0,120,rng))*1000,reward,claimed:false};
    e.jobs.push(job); log(e,`${type} Stufe ${stage}: ${job.id} gefunden.`); return job;
  }
  function claim(game,id,queueCustomer) {
    const e=ensure(game),task=findTask(e,id); if (!task || task.status!=='completed' || task.claimed) return false;
    // Validate the adapter before any mutation, then create the customer order exactly once.
    if (task.reward?.customer) { if (typeof queueCustomer!=='function') return false; queueCustomer(task.reward.customer,task.reward.kind,task.stage); }
    task.claimed=true;
    if (task.place) log(e,`Ort ${task.place}: +1 maximale Expeditionskapazität.`);
    else {
      if (task.reward.gears) game.inventory.gears[task.reward.gears.rarity]+=task.reward.gears.count;
      if (task.reward.shards) e.shards[task.reward.shards.rarity]+=task.reward.shards.count;
      e.stats.completed++; const item=task.reward.gears || task.reward.shards; log(e,item ? `${task.id}: +${item.count} ${item.rarity}-${task.reward.gears?'Zahnräder':'Shards'}.` : `${task.id}: Kundenauftrag erhalten.`);
      const claimed=e.jobs.filter(j=>j.claimed);
      if(claimed.length>100) { const remove=new Set(claimed.slice(0,claimed.length-100).map(j=>j.id)); e.jobs=e.jobs.filter(j=>!remove.has(j.id)); }
    }
    // Completed expedition tasks are retained for audit; the truck was already released at completion.
    return true;
  }
  function upgradeCost(def,level) {
    const rarity=level<=3?'common':level<=6?'uncommon':level<=9?'rare':'epic';
    const multiplier=[1,1.5,3,6,12][RARITIES.indexOf(def.rarity)] / (def.rarity === 'legendary' && level <= 4 ? 3 : 1);
    const costs=[0,0,10,20,10,15,25,3,5,8,2];
    return {rarity,count:Math.ceil(costs[level]*multiplier)};
  }
  function feed(e,id,amount) {
    const c=e.characters[id],def=CHARACTERS.find(c=>c.id===id); if (!c||!def||c.level>=10||!Number.isSafeInteger(amount)||amount<=0) return false;
    const cost=upgradeCost(def,c.level+1), used=Math.min(amount,e.shards[cost.rarity],cost.count-c.progress); if (!used) return false;
    e.shards[cost.rarity]-=used; c.progress+=used;
    if (c.progress===cost.count) { c.level++; c.progress=0; } return true;
  }
  function seat(e,id,slot,now=Date.now()) {
    if (!Number.isInteger(slot)||slot<0||slot>=5||(id && !e.characters[id])) return false;
    if (id) e.seats=e.seats.map(s=>s===id?null:s);
    e.seats[slot]=id||null; e.regenAt=now; return true;
  }
  function convert(e,rarity) { const i=RARITIES.indexOf(rarity); if(i<0||i>=4||e.shards[rarity]<RULES.convert) return false; e.shards[rarity]-=RULES.convert; e.shards[RARITIES[i+1]]++; return true; }
  function convertLegendary(e) { if(e.shards.legendary < 1) return false; e.shards.legendary--; e.shards.epic += 10; return true; }
  const api={RULES,REGIONS,CHARACTERS,RARITIES,MATERIAL,SHARDS,TYPES,weighted,available,ensure,bonus,capacity,interval,sync,discover,busy,eligible,assign,explore,claim,upgradeCost,feed,seat,convert,convertLegendary};
  if(typeof module==='object' && module.exports) module.exports=api;
  root.Expeditions=api;
})(typeof globalThis==='object'?globalThis:this);
