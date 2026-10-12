/* Small pilot interface; the rules live in expeditions.js, not in these templates. */
(function(root) {
  'use strict';
  const E=root.Expeditions;
  const names={shard:'Shardauftrag',material:'Materialauftrag',special:'Sonderfahrtauftrag',referral:'Empfehlungsauftrag'};
  const rarityNames={common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legendary:'Legendär'};
  const bonusNames={speed:'Fahrtempo',regen:'Punkteregeneration',customer:'Kundenauftragschance',referral:'Empfehlungschance',capacity:'Expeditionskapazität'};
  let adapter,selected=0,lastSignature='',lastView='';
  const $=s=>document.querySelector(s);
  function button(action,label,extra='',disabled=false) {return `<button type="button" class="button button-outline" data-exp-action="${action}" ${extra} ${disabled?'disabled':''}>${label}</button>`;}
  function state(){return E.ensure(adapter.game(),Date.now(),adapter.level());}
  function persist(ok,message){if(!ok){adapter.showToast('Aktion derzeit nicht möglich. Punkte, Vorräte oder freie Fahrzeuge prüfen.');return;}adapter.save();lastSignature='';adapter.render();if(message)adapter.showToast(message);}
  function taskRow(task,game){
    const e=state();
    const label=task.place?`Ort ${task.place} · optionale Versorgung`:`${task.id} · ${names[task.type]} Stufe ${task.stage}`;
    const controls=task.claimed?'<span>Belohnung abgeholt</span>':task.status==='completed'?button('claim','Belohnung abholen',`data-task="${task.id}"`):task.status==='active'?`<span>${task.truckId} · <strong data-exp-finish="${task.finishAt}">${adapter.countdown((task.finishAt-Date.now())/1000)}</strong></span>`:`<select aria-label="Fahrzeug für ${label}" id="truck-${task.id}"><option value="">Fahrzeug auswählen</option>${game.trucks.filter(t=>E.eligible(game,t.id)).map(t=>`<option value="${t.id}">${t.id} · ${t.model}</option>`).join('')}</select>${button('assign','Starten',`data-task="${task.id}"`,!game.trucks.some(t=>E.eligible(game,t.id)))}`;
    const text=task.place?'Einmalig +1 maximale Expeditionskapazität. Kein Pflichtauftrag.':task.type==='special'||task.type==='referral'?'Belohnung: gespeicherter Kundenauftrag für die normale Sonderfahrten-Seite.':'Ein garantierter Beutefund; keine ganzen Charaktere aus diesem Auftrag.';
    const progress=task.status==='active'?Math.max(0,Math.min(100,(Date.now()-task.startAt)/task.durationMs*100)):task.status==='completed'?100:0;
    return `<article class="exp-task"><div><strong>${label}</strong><p>${text}</p><small>Dauer: ${adapter.countdown(task.durationMs/1000)}</small><div class="mini-progress"><span data-exp-progress="${task.id}" style="width:${progress}%"></span></div></div><div class="exp-controls">${controls}</div></article>`;
  }
  function regionView(game,e){
    const def=E.REGIONS[selected],r=e.regions[selected],allowed=E.available?E.available(e,selected):selected===0||e.regions[selected-1].endless;
    const cost=r.discovered===7?20:def.research[r.discovered];
    const navigation=E.REGIONS.map((d,i)=>button('region',`${i+1}. ${d.name}`,`data-region="${i}"`,i>0&&!e.regions[i-1].endless)).join('');
    const pool=def.types.map((chance,i)=>`${names[E.TYPES[i]]}: ${(chance*100).toLocaleString('de-DE')} %`).join(' · ');
    const stageText=def.stages.map((chance,i)=>chance?`Stufe ${i+1}: ${(chance*100).toLocaleString('de-DE')} %`:'').filter(Boolean).join(' · ');
    const card=`<section class="panel exp-panel"><h2>${def.name}</h2><p>${r.discovered}/7 Unterorte entdeckt · ${r.missions.filter(m=>m.claimed).length}/7 Versorgungsmissionen abgeholt · Endlosort ${r.endless?'offen':'geschlossen'}</p><p>Die Versorgung ist optional und sperrt weder den nächsten Ort noch den Endlosort.</p>${r.endless?button('explore','Expedition durchführen · 5 Punkte',`data-region="${selected}"`,e.points<5):button('discover',`${r.discovered===7?'Endlosort erschließen':'Ort '+(r.discovered+1)+' aufdecken'} · ${cost} Punkte`,`data-region="${selected}"`,!allowed||e.points<cost)}${r.endless?'<p>Kunde freigeschaltet · einmaliges Kapazitätsmodul erhalten.</p>':'<p>Am Endlosort: ein Kunde, ein Kapazitätsmodul und Zugang zur nächsten Region.</p>'}<details><summary>Fundchancen und Testwerte</summary><p>2 % direkter Charakterfund, sonst 98 % Auftrag. Innerhalb der Aufträge: ${pool}</p><p>${stageText}</p><p>Stufe 1: Common bis Rare · Stufe 2: zusätzlich Epic · Stufe 3: zusätzlich Legendary.</p><p>Direkter Charakterfund: ${def.characters.map((c,i)=>c?`${rarityNames[E.RARITIES[i]]} ${(c*100).toLocaleString('de-DE')} %`:'').filter(Boolean).join(' · ')}.</p></details></section>`;
    const jobs=e.jobs.filter(j=>j.region===selected&&!j.claimed);
    return `<div class="exp-regions">${navigation}</div>${card}<section class="panel exp-panel"><h2>Optionale Ortsmissionen</h2>${r.missions.map(m=>taskRow(m,game)).join('')||'<p>Decke den ersten Ort auf.</p>'}</section><section class="panel exp-panel"><h2>Gefundene Expeditionsaufträge</h2><p>Beliebig viele freie reguläre LKW können gleichzeitig fahren. Gefundene Aufträge verfallen nicht.</p>${jobs.map(j=>taskRow(j,game)).join('')||'<p>Keine offenen Expeditionsaufträge dieser Region.</p>'}</section>`;
  }
  function charactersView(e){
    const slots=e.seats.map((id,i)=>`<div class="exp-slot"><label for="exp-seat-${i}">Sitz ${i+1}</label><select id="exp-seat-${i}"><option value="">Frei</option>${E.CHARACTERS.filter(d=>e.characters[d.id]).map(d=>`<option value="${d.id}" ${id===d.id?'selected':''}>${d.name}</option>`).join('')}</select>${button('seat','Übernehmen',`data-slot="${i}"`)}</div>`).join('');
    const cards=E.CHARACTERS.map(d=>{
      const c=e.characters[d.id];if(!c)return `<article class="panel exp-panel rarity-${d.rarity}"><h3>${d.name} · ${rarityNames[d.rarity]}</h3><p>Noch nicht gefunden. Regionen zeigen ihre Charakterpools.</p></article>`;
      const cost=c.level<10?E.upgradeCost(d,c.level+1):null;
      const value=d.base+(c.level-1)*d.step;
      const effect=d.bonus==='capacity'?`+${value} Punkte`:`+${(value*100).toLocaleString('de-DE')} ${['customer','referral'].includes(d.bonus)?'Prozentpunkte':'%'}`;
      return `<article class="panel exp-panel rarity-${d.rarity}"><h3>${d.name} · ${rarityNames[d.rarity]}</h3><p>Level ${c.level}/10 · ${e.seats.includes(d.id)?'Aktiv im Führungsteam':'Nicht aktiv'}</p><p>${bonusNames[d.bonus]}: ${effect}</p>${cost?`<p>Nächste Stufe: ${c.progress}/${cost.count} ${rarityNames[cost.rarity]}-Shards · Vorrat ${e.shards[cost.rarity]}</p><div class="mini-progress"><span style="width:${c.progress/cost.count*100}%"></span></div>${button('feed','1 Shard einzahlen',`data-character="${d.id}" data-amount="1"`,!e.shards[cost.rarity])}${button('feed','Passende Shards einzahlen',`data-character="${d.id}" data-amount="${cost.count}"`,!e.shards[cost.rarity])}`:'<p>Maximalstufe erreicht.</p>'}</article>`;
    }).join('');
    const shards=E.RARITIES.map((r,i)=>`<div class="exp-shard"><strong>${rarityNames[r]}: ${e.shards[r]}</strong>${i<4?button('convert','10 → 1 '+rarityNames[E.RARITIES[i+1]],`data-rarity="${r}"`,e.shards[r]<10):''}</div>`).join('');
    return `<div class="page-heading"><div><h1>Personal</h1><p>Fünf aktive Sitze. Namen, Boni und Aufwertungskosten sind Testwerte.</p></div></div><section class="panel exp-panel"><h2>Führungsteam</h2><div class="exp-slots">${slots}</div></section><section class="panel exp-panel"><h2>Universelle Shards</h2><p>Common für Level 2–3, Uncommon für 4–6, Rare für 7–9, Epic für 10. Legendary-Shards lassen sich als 10 Epic je Stück verwenden.</p>${shards}${button('legendary-convert','1 Legendary → 10 Epic','',e.shards.legendary<1)}</section><div class="exp-character-grid">${cards}</div>`;
  }
  function render(view){
    const game=adapter.game(),e=state(),now=Date.now();
    document.querySelectorAll('[data-exp-finish]').forEach(el=>el.textContent=adapter.countdown((Number(el.dataset.expFinish)-now)/1000));
    document.querySelectorAll('[data-exp-progress]').forEach(el=>{const task=e.jobs.concat(e.regions.flatMap(r=>r.missions)).find(t=>t.id===el.dataset.expProgress);if(task?.status==='active')el.style.width=Math.min(100,(now-task.startAt)/task.durationMs*100)+'%';});
    const timer=$('#exp-regen');if(timer)timer.textContent=e.points>=E.capacity(e)?'Regeneration pausiert':`Nächster Punkt in ${adapter.countdown(Math.max(0,(E.interval(e)-(now-e.regenAt))/1000))}`;
    const signature=JSON.stringify([view,selected,e.points,e.regions,e.jobs,e.characters,e.shards,e.seats,game.trucks.map(t=>[t.id,t.hubAssigned]),game.orders.filter(o=>o.status==='active').map(o=>o.truckId)]);
    if(signature===lastSignature&&view===lastView)return;
    if(document.activeElement?.tagName==='SELECT')return;
    lastSignature=signature;lastView=view;
    if(view==='personnel'){$('#view-personnel').innerHTML=charactersView(e);return;}
    $('#expedition-content').innerHTML=`<section class="panel exp-panel"><h2>${e.points} / ${E.capacity(e)} Expeditionspunkte</h2><p id="exp-regen">${e.points>=E.capacity(e)?'Regeneration pausiert':'1 Punkt je '+(E.interval(e)/60000).toFixed(1)+' Minuten'}</p><p>5 Punkte pro Endlosexpedition · +50 Punkte je neuem Spielerlevel, auch über das Limit hinaus.</p></section>${regionView(game,e)}<section class="panel exp-panel"><h2>Letzte Funde und Fortschritte</h2>${e.log.map(message=>`<p>${message}</p>`).join('')||'<p>Deine Expedition beginnt.</p>'}</section>`;
  }
  function install(a){
    adapter=a;
    const nav=document.querySelector('.nav-link[data-view="personnel"]');nav.insertAdjacentHTML('beforebegin','<button class="nav-link" data-view="expeditions"><span class="nav-icon">⌖</span> Expeditionen</button>');
    $('#view-personnel').insertAdjacentHTML('beforebegin','<div id="view-expeditions" class="view"><div class="page-heading"><div><h1>Expeditionen</h1><p>Fünf Regionen · sieben optionale Ortsmissionen und ein Endlosort je Region.</p></div></div><div id="expedition-content"></div></div>');
    document.addEventListener('click',event=>{
      const b=event.target.closest('[data-exp-action]');if(!b)return;
      const game=adapter.game(),e=state();E.sync(game,Date.now(),adapter.level());
      const action=b.dataset.expAction;let ok=false;
      if(action==='region'){selected=Number(b.dataset.region);lastSignature='';adapter.render();return;}
      if(!game.startCity){adapter.showToast('Wähle zuerst deinen Hauptsitz.');return;}
      if(action==='discover')ok=E.discover(game,Number(b.dataset.region));
      if(action==='explore'){const result=E.explore(game,Number(b.dataset.region));ok=!!result;if(result?.character)adapter.showToast(e.log[0]);}
      if(action==='assign')ok=E.assign(game,b.dataset.task,$('#truck-'+b.dataset.task)?.value);
      if(action==='claim')ok=E.claim(game,b.dataset.task,adapter.queueCustomer);
      if(action==='feed')ok=E.feed(e,b.dataset.character,Number(b.dataset.amount));
      if(action==='convert')ok=E.convert(e,b.dataset.rarity);
      if(action==='legendary-convert')ok=E.convertLegendary(e);
      if(action==='seat')ok=E.seat(e,$('#exp-seat-'+b.dataset.slot).value,Number(b.dataset.slot));
      persist(ok);
    });
  }
  root.ExpeditionUI={install,render};
})(globalThis);
