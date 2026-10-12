const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const elements=new Map();const el=k=>{if(!elements.has(k))elements.set(k,{innerHTML:'',textContent:'',close(){}});return elements.get(k);};
const randomMath=Object.create(Math);randomMath.random=()=>.5;
const storage=new Map();
const ctx=vm.createContext({Date,Math:randomMath,Intl,Number,JSON,setTimeout,clearTimeout,document:{querySelector:el},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../expeditions.js'),'utf8'),ctx);
const src=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
vm.runInContext(src.slice(0,src.indexOf("  document.addEventListener('click'"))+`\n globalThis.api={newGame,createOrder,freeTrucks,truckSpeed,rollGearLoot,queueCustomerTrip,settleTrips,saleBlockReason,renderCustomers,renderSpecialTrips,setGame:g=>game=g,mute:()=>{render=()=>{};showToast=()=>{};}};})();`,ctx);
const a=ctx.api;a.mute();const g=a.newGame('hamburg');a.setGame(g);
assert.ok(g.orders.every(o=>!o.customer),'no customers before region discovery');
g.expeditions.unlockedCustomers.push('nordbau');randomMath.random=()=>0;
const o=a.createOrder(99,{category:'national'});assert.equal(o.customer,'nordbau');
const task={id:'E-1',status:'active',truckId:g.trucks[0].id,finishAt:Date.now()+10000};g.expeditions.jobs.push(task);
assert.equal(a.freeTrucks().length,1);assert.match(a.saleBlockReason(g.trucks[0]),/Expedition/);
g.expeditions.characters.navigator={level:1,progress:0};g.expeditions.seats[0]='navigator';assert.equal(a.truckSpeed(g.trucks[0]),1.01);
for(const stage of [1,2,3]) {
 const loot=a.rollGearLoot({kind:'referral',customer:'nordbau',distance:100,volume:10,expeditionStage:stage});
 assert.equal(!!loot.epic,stage>=2);assert.equal(!!loot.legendary,stage>=3);
}
const special=a.queueCustomerTrip({customer:'nordbau',category:'national',homeCity:'hamburg',expeditionStage:1},'special');assert.equal(special.expeditionStage,1);
a.renderCustomers();assert.match(el('#customer-list').innerHTML,/Nordbau/);assert.doesNotMatch(el('#customer-list').innerHTML,/Frischgut/);
console.log('expedition integration: customers, vehicle reservation, bonuses, staged customer loot and stage inheritance: OK');
