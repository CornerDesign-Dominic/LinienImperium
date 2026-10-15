(() => {
  'use strict';

  const STORAGE_KEY = 'frachtwerk-save-v2';
  const TEST_COINS_GRANT = 50000;
  const SPEED_KM_PER_SECOND = 1;
  const SPEED_LOSS_PER_TON = .01;
  const RARITY_SPEED_PER_LEVEL = .005;
  const LEGACY_COST_PER_KM = 1;
  const FREIGHT_PAY_PER_TON_KM = 1;
  const BASE_COMPLETION_PREMIUM_PER_TON = 1;
  const LOAD_COST_PER_TON_KM = .1;
  const CO2_KG_PER_TON_KM = .05275;
  const MAX_RARITY_LEVEL = 50;
  const CAPACITY_PER_MODULE = .5;
  const HUB_CYCLE_MS = 60 * 60 * 1000;
  const HUB_WORK_SECONDS = 45 * 60;
  const HUB_ROUTE_KM = 12;
  const HUB_SALE_PER_TON = 10;
  const HUB_PURCHASE_PER_TON = 3;
  const HUB_CASHBOX_CYCLES = 6;
  const HUB_MAX_SALES_LEVEL = 25;
  const PRIVATE_PICKUP_HINT_COST = 100;
  const HUB_PRICE = 0;
  const RARITIES = [
    { id: 'common', label: 'Common' },
    { id: 'uncommon', label: 'Uncommon' },
    { id: 'rare', label: 'Rare' },
    { id: 'epic', label: 'Epic' },
    { id: 'legendary', label: 'Legendär' }
  ];
  const RANK_GEAR_COSTS = {
    common: [1000, 2000, 2000, 2000, 3000, 3000, 3000, 4000, 4000, 5000],
    uncommon: [100, 200, 200, 200, 300, 300, 300, 400, 400, 500],
    rare: [25, 50, 50, 50, 75, 75, 75, 100, 100, 125],
    epic: [5, 10, 10, 10, 15, 15, 15, 20, 20, 25],
    legendary: [1, 2, 2, 2, 3, 3, 3, 4, 4, 5]
  };
  // Sonder- und Empfehlungsfahrten behalten nur ihre zusätzlichen hohen Seltenheiten.
  const GEAR_LOOT = {
    special: { epic: [.20, 5, 10] },
    referral: { epic: [.25, 5, 10], legendary: [1, 2, .25] }
  };
  const BASE_OFFERS = 5;
  const INTERNATIONAL_OFFER_CHANCE = .20;
  const CUSTOMER_OFFER_CHANCE = .05;
  const EXPEDITION_REGEN_MS = 20 * 60 * 1000;
  const EXPEDITION_COST = 5;
  const EXPEDITION_JOB_DISTANCE = 30;
  const EXPEDITION_JOB_TONS_PER_TIER = 20;
  const EXPEDITION_JOB_WEIGHTS = [
    { kind: 'character', chance: .20 },
    { kind: 'material', chance: .75 },
    { kind: 'special', chance: .045 },
    { kind: 'referral', chance: .005 }
  ];
  const EXPEDITION_CARD_CHANCES = [
    { rarity: 'common', chance: .06 },
    { rarity: 'uncommon', chance: .03 },
    { rarity: 'rare', chance: .01 }
  ];
  const EXPEDITION_STAGE_WEIGHTS = [[1], [.75, .25], [.5, .5], [.25, .5, .25], [.1, .45, .45]];
  const EXPEDITION_REGIONS = ['Region 1', 'Region 2', 'Region 3', 'Region 4', 'Region 5'];
  // Die IDs der bisherigen fünf Karten bleiben für vorhandene Spielstände erhalten.
  const EXPEDITION_CHARACTERS = [
    { id: 'navigator', name: 'Kurierwagen', rarity: 'common', region: 0, bonus: 'regen', base: 2, step: 1, vehicleTier: 2 },
    { id: 'r1_uncommon', name: 'Rallye-Transporter', rarity: 'uncommon', region: 0, bonus: 'regen', base: 3, step: 1, vehicleTier: 3 },
    { id: 'r1_rare', name: 'Pfadfinder-LKW', rarity: 'rare', region: 0, bonus: 'regen', base: 4, step: 2, vehicleTier: 5 },
    { id: 'r2_common', name: 'Versorgungswagen', rarity: 'common', region: 1, bonus: 'capacity', base: 3, step: 1, vehicleTier: 2 },
    { id: 'disponent', name: 'Vorrats-LKW', rarity: 'uncommon', region: 1, bonus: 'capacity', base: 5, step: 2, vehicleTier: 5 },
    { id: 'r2_rare', name: 'Expeditionsträger', rarity: 'rare', region: 1, bonus: 'capacity', base: 7, step: 3, vehicleTier: 4 },
    { id: 'r3_common', name: 'Schrottsammler', rarity: 'common', region: 2, bonus: 'shards', base: 2, step: 1, vehicleTier: 3 },
    { id: 'r3_uncommon', name: 'Bergungs-LKW', rarity: 'uncommon', region: 2, bonus: 'shards', base: 3, step: 1, vehicleTier: 5 },
    { id: 'forscherin', name: 'Fundort-Scanner', rarity: 'rare', region: 2, bonus: 'shards', base: 5, step: 2, vehicleTier: 4 },
    { id: 'r4_common', name: 'Geländetransporter', rarity: 'common', region: 3, bonus: 'duration', base: 4, step: 1, vehicleTier: 3 },
    { id: 'r4_uncommon', name: 'Schnellfrachter', rarity: 'uncommon', region: 3, bonus: 'duration', base: 7, step: 2, vehicleTier: 4 },
    { id: 'logistiker', name: 'Turbo-Konvoi', rarity: 'rare', region: 3, bonus: 'duration', base: 10, step: 2, vehicleTier: 6 },
    { id: 'r5_common', name: 'Handelswagen', rarity: 'common', region: 4, bonus: 'coins', base: 5, step: 1, vehicleTier: 5 },
    { id: 'r5_uncommon', name: 'Werttransporter', rarity: 'uncommon', region: 4, bonus: 'coins', base: 10, step: 2, vehicleTier: 4 },
    { id: 'pionierin', name: 'Goldkonvoi', rarity: 'rare', region: 4, bonus: 'coins', base: 15, step: 3, vehicleTier: 6 }
  ];
  const CHARACTER_LEVEL_COSTS = [1, 2, 4, 8, 16, 32, 64, 128, 256];
  const OLD_CHARACTER_COSTS = { common: 5, uncommon: 10, rare: 20, epic: 30, legendary: 40 };
  const SHARD_COMBINE_RATIO = 10;
  // Testpools je Auftragsstufe; Stufe 3 liefert im Regions-5-Maximalszenario etwa 7 Legendary-Shards/Monat.
  const EXPEDITION_SHARD_POOLS = [
    { common: .58, uncommon: .32, rare: .10 },
    { common: .37, uncommon: .31, rare: .32 },
    { common: .29, uncommon: .25, rare: .46 }
  ];
  const SPECIAL_CHANCES = {
    national: { award: .20, module: .08, referral: .04, referralModule: .20 },
    international: { award: .40, module: .12, referral: .06, referralModule: .30 }
  };
  const MAX_TRUST_LEVEL = 150;
  const CUSTOMER_SKILL_LIMITS = { pay: 100, special: 25, referral: 25 };
  const TRUST_REWARDS = { normal: 10, special: 25, referral: 100 };
  const PROJECT_DEADLINES = { special: 3600000, referral: 3 * 3600000 };
  const OVERTIME_REGEN_MS = 10 * 60000;
  const DUAL_WAY_CHANCE = .10;
  const CITY_DISTANCE_MIN = 5;
  const CITY_DISTANCE_MAX = 25;
  const CITY_VOLUME_MIN = 10;
  const CITY_VOLUME_MAX = 100;
  const TRANSPORT_BASE = {
    national: { minDistance: 30, maxDistance: 100, minVolume: 10, maxVolume: 40, premiumPerTon: BASE_COMPLETION_PREMIUM_PER_TON },
    international: { minDistance: 100, maxDistance: 200, minVolume: 10, maxVolume: 50, premiumPerTon: BASE_COMPLETION_PREMIUM_PER_TON }
  };
  const PRIVATE_PICKUP_BASE = { minDistance: 40, maxDistance: 180, minVolume: 10, maxVolume: 80 };
  const AUTO_REFRESH_MS = 15 * 60 * 1000;
  const MANUAL_REFRESH_BASE_COST = 250;
  // Firmenausbau-Items: dauerhafter gemeinsamer tkm-Zähler; andere Abteilungen
  // behalten ihre bisherigen, separat balancierten Testkosten.
  const COMPANY_BALANCE = {
    tkmPerItem: 750000, materialItemChance: .06, materialItemsByTier: [1, 2, 3], craftedOrderItems: 10,
    transportUpgradeItems: level => 2 + Math.floor((level - 1) / 10),
    transportUpgradeCoins: (kind, level) => ({ premium: 10, volume: 50, range: 100 })[kind] * level * level,
    upgradeItems: level => 1 + Math.floor((level - 1) / 25),
    upgradeCoins: level => 500 + 50 * level
  };
  const TRANSPORT_UPGRADE_LIMITS = {
    national: { premium: 100, volume: 50, range: 50 },
    international: { premium: 100, volume: 150, range: 100 }
  };
  const EMPLOYEE_HIRE_PRICE = 500;
  const DISPATCH_UNLOCK_PRICE = 5000;
  const WORKSHOP_UNLOCK_PRICE = 5000;
  const SALES_UNLOCK_PRICE = 5000;
  const MAX_OFFER_LEVEL = 10;
  const MAX_WORKSHOP_LEVEL = 50;
  const MAX_SALES_LEVEL = 3;
  const DEPARTMENTS = [
    { id: 'accounting', name: 'Buchhaltung', icon: '▣', description: 'Später für Finanzen und Abrechnungen.' },
    { id: 'hr', name: 'Personalabteilung', icon: '♙', description: 'Die Personalabteilung wird später neu gestaltet. Einstellungen sind derzeit ausgesetzt.' },
    { id: 'dispatch', name: 'Disposition', icon: '⇄', description: 'Erweitert die Auftragslisten für Regionalverkehr und Fernverkehr.' },
    { id: 'workshop', name: 'Werkstatt', icon: '⚒', description: 'Senkt die Betriebskosten deiner LKW.' },
    { id: 'fleet', name: 'Fuhrpark', icon: '▰', description: 'Später für die Verwaltung und Entwicklung deines Fuhrparks.' },
    { id: 'storage', name: 'Lager', icon: '▤', description: 'Später für die Verwaltung deiner Materialien und Gegenstände.' },
    { id: 'sales', name: 'Vertrieb & Kundenbetreuung', icon: '◎', description: 'Erlaubt, Aufträge bei Angebotswechseln anzuheften.' }
  ];
  const TRUCKS = [
    { model: 'Sprinter', capacity: 1, maxCapacityLevel: 1, emptyCostPerKm: .2, price: 4000, symbol: '🚚', description: 'Der Einstieg für den Stadtverkehr.' },
    { model: '3,5-Tonner', capacity: 1.5, maxCapacityLevel: 2, emptyCostPerKm: .5, price: 20000, symbol: '🚚', description: 'Für Stadtverkehr.' },
    { model: '7,5-Tonner', capacity: 4, maxCapacityLevel: 3, emptyCostPerKm: .65, price: 25000, symbol: '🚛', description: 'Für Aufträge im Regionalverkehr.' },
    { model: '18-Tonner', capacity: 8.5, maxCapacityLevel: 5, emptyCostPerKm: .7, price: 100000, symbol: '🚛', description: 'Nur für Aufträge im Regionalverkehr.' },
    { model: 'Sattelzug', capacity: 18, maxCapacityLevel: 12, emptyCostPerKm: 1.6, price: 500000, symbol: '🚛', description: 'Nur für Aufträge im Fernverkehr.' },
    // Tier 4 bleibt für vorhandene Spielstände der LKW mit 18 t Ladekapazität.
    { model: '26-Tonner', capacity: 13, maxCapacityLevel: 8, emptyCostPerKm: 1.05, price: 250000, symbol: '🚛', description: 'Regionalverkehr und Fernverkehr.' },
    { model: '40-t-Tautliner', capacity: 24, maxCapacityLevel: 0, emptyCostPerKm: 2.10, price: 1000000, symbol: '🚛', description: 'Nur für Aufträge im Fernverkehr.' }
  ];
  const LEGACY_TRUCK_PRICES = [450, 900, 1600, 2600, 4000];
  const CATEGORIES = [
    { id: 'city', label: 'Stadtverkehr', tiers: [0, 1] },
    { id: 'national', label: 'Regionalverkehr', tiers: [2, 3, 5] },
    { id: 'international', label: 'Fernverkehr', tiers: [4, 5, 6] }
  ];
  const CUSTOMERS = [
    { id: 'nordbau', name: 'Nordbau GmbH', initials: 'NB', industry: 'Baustoffe', cargo: 'Baustoffe', unlockLevel: 3, category: 'national' },
    { id: 'frischgut', name: 'Frischgut AG', initials: 'FG', industry: 'Lebensmittel', cargo: 'Lebensmittel', unlockLevel: 7, category: 'national' },
    { id: 'stahlwerk', name: 'Stahlwerk West', initials: 'SW', industry: 'Industrie', cargo: 'Stahlträger', unlockLevel: 10, category: 'national' },
    { id: 'alpenhandel', name: 'Alpenhandel KG', initials: 'AH', industry: 'Handel', cargo: 'Werkzeuge', unlockLevel: 12, category: 'national' },
    { id: 'eurolog', name: 'EuroLog SE', initials: 'EL', industry: 'Technik', cargo: 'Maschinenteile', unlockLevel: 17, category: 'international' }
  ];
  const EXPEDITION_CUSTOMER_IDS = ['nordbau', 'frischgut', 'stahlwerk', 'alpenhandel', 'eurolog'];
  const CARGO = [
    ['Baustoffe', '🧱'], ['Getreide', '🌾'], ['Maschinenteile', '⚙'], ['Holz', '▤'],
    ['Lebensmittel', '◈'], ['Stahlträger', '▰'], ['Papier', '▤'], ['Werkzeuge', '⚒']
  ];
  const START_CITIES = [
    { id: 'antwerp', city: 'Antwerpen', country: 'Belgien', continent: 'Europa', districts: ['Hafen', 'Centrum', 'Berchem', 'Deurne', 'Merksem', 'Wilrijk'],
      national: [['Gent', 60], ['Brüssel', 45], ['Brügge', 95], ['Lüttich', 125]], international: [['Lille', 'Frankreich', 130], ['Aachen', 'Deutschland', 150], ['Luxemburg', 'Luxemburg', 220]] },
    { id: 'hamburg', city: 'Hamburg', country: 'Deutschland', continent: 'Europa', districts: ['Hafen', 'Nord', 'Mitte', 'Altona', 'Wandsbek', 'Harburg'],
      national: [['Lübeck', 70], ['Bremen', 120], ['Lüneburg', 60], ['Kiel', 95]], international: [['Groningen', 'Niederlande', 290], ['Odense', 'Dänemark', 340], ['Stettin', 'Polen', 390]] },
    { id: 'marseille', city: 'Marseille', country: 'Frankreich', continent: 'Europa', districts: ['Vieux-Port', 'Joliette', 'Euroméditerranée', 'Prado', 'Estaque', 'Saint-Louis'],
      national: [['Aix-en-Provence', 35], ['Arles', 90], ['Toulon', 65], ['Avignon', 100]], international: [['Monaco', 'Monaco', 230], ['Genua', 'Italien', 400], ['Barcelona', 'Spanien', 520]] },
    { id: 'hochiminh', city: 'Ho-Chi-Minh-Stadt', country: 'Vietnam', continent: 'Asien', districts: ['Cát Lái', 'Thủ Đức', 'Bình Thạnh', 'Chợ Lớn', 'Tân Bình', 'Nhà Bè'],
      national: [['Biên Hòa', 35], ['Thủ Dầu Một', 35], ['Mỹ Tho', 70], ['Vũng Tàu', 95]], international: [['Svay Rieng', 'Kambodscha', 150], ['Phnom Penh', 'Kambodscha', 230], ['Pakse', 'Laos', 650]] },
    { id: 'hongkong', city: 'Hongkong', country: 'China', continent: 'Asien', districts: ['Kwai Chung', 'Tsing Yi', 'Tsuen Wan', 'Sha Tin', 'Kowloon', 'Tuen Mun'],
      national: [['Shenzhen', 50], ['Dongguan', 115], ['Huizhou', 135], ['Guangzhou', 175]], international: [['Móng Cái', 'Vietnam', 750], ['Hải Phòng', 'Vietnam', 900], ['Hanoi', 'Vietnam', 950]] },
    { id: 'shanghai', city: 'Shanghai', country: 'China', continent: 'Asien', districts: ['Waigaoqiao', 'Pudong', 'Lujiazui', 'Baoshan', 'Hongkou', 'Minhang'],
      national: [['Kunshan', 60], ['Taicang', 65], ['Suzhou', 100], ['Jiaxing', 100], ['Wuxi', 130]], international: [['Ulaanbaatar', 'Mongolei', 2500], ['Wladiwostok', 'Russland', 2800], ['Chabarowsk', 'Russland', 3100]] },
    { id: 'tangier', city: 'Tanger', country: 'Marokko', continent: 'Afrika', districts: ['Hafen', 'Medina', 'Malabata', 'Boukhalef', 'Bni Makada', 'Moghogha'],
      national: [['Asilah', 45], ['Tétouan', 60], ['Larache', 90], ['Chefchaouen', 115]], international: [['Ceuta', 'Spanien', 70], ['Melilla', 'Spanien', 410]] },
    { id: 'durban', city: 'Durban', country: 'Südafrika', continent: 'Afrika', districts: ['Hafen', 'Point', 'Berea', 'Umhlanga', 'Bluff', 'Pinetown'],
      national: [['Amanzimtoti', 30], ['Ballito', 50], ['Pietermaritzburg', 80], ['KwaDukuza', 85]], international: [['Maseru', 'Lesotho', 510], ['Mbabane', 'Eswatini', 540], ['Maputo', 'Mosambik', 600]] },
    { id: 'losangeles', city: 'Los Angeles', country: 'USA', continent: 'Nordamerika', districts: ['Hafen', 'San Pedro', 'Wilmington', 'Downtown', 'Hollywood', 'South Gate'],
      national: [['Long Beach', 35], ['Anaheim', 45], ['Irvine', 70], ['Riverside', 90], ['San Bernardino', 100]], international: [['Tijuana', 'Mexiko', 220], ['Ensenada', 'Mexiko', 330], ['Mexicali', 'Mexiko', 360]] },
    { id: 'newyork', city: 'New York', country: 'USA', continent: 'Nordamerika', districts: ['Hafen', 'Brooklyn', 'Queens', 'Bronx', 'Manhattan', 'Staten Island'],
      national: [['Newark', 30], ['Jersey City', 30], ['Yonkers', 35], ['New Brunswick', 60], ['Paterson', 35]], international: [['Montréal', 'Kanada', 600], ['Ottawa', 'Kanada', 720], ['Toronto', 'Kanada', 790]] },
    { id: 'santos', city: 'Santos', country: 'Brasilien', continent: 'Südamerika', districts: ['Hafen', 'Centro', 'Macuco', 'Gonzaga', 'Ponta da Praia', 'Embaré'],
      national: [['Praia Grande', 30], ['São Paulo', 75], ['Guarulhos', 90], ['São Bernardo do Campo', 70]], international: [['Ciudad del Este', 'Paraguay', 1100], ['Chuy', 'Uruguay', 1600], ['Buenos Aires', 'Argentinien', 2200]] },
    { id: 'callao', city: 'Callao', country: 'Peru', continent: 'Südamerika', districts: ['Hafen', 'Bellavista', 'La Perla', 'Carmen de la Legua', 'Ventanilla', 'La Punta'],
      national: [['Lima', 30], ['Lurín', 45], ['Chancay', 70], ['Pucusana', 85]], international: [['Guayaquil', 'Ecuador', 1100], ['Cuenca', 'Ecuador', 1250], ['Arica', 'Chile', 1250]] }
  ];
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const money = (value) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(value);
  const signedMoney = (value) => `${value < 0 ? '−' : '+'}${money(Math.abs(value))} M`;
  const rateMoney = (value) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(value);
  const integer = (value) => new Intl.NumberFormat('de-DE').format(value);
  const tons = (value) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(value);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (items) => items[random(0, items.length - 1)];
  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
  const newCompany = () => ({ departments: {}, offerLevel: 0, offerLevels: { city: 0, national: 0, international: 0 }, transportUpgrades: { national: { premiumLevel: 0, volumeLevel: 0, rangeLevel: 0 }, international: { premiumLevel: 0, volumeLevel: 0, rangeLevel: 0 } }, workshopLevel: 0, salesLevel: 0, employees: 0 });

  function transportRules(category, company = game?.company) {
    const base = TRANSPORT_BASE[category];
    if (!base) return null;
    const upgrade = company?.transportUpgrades?.[category] || {};
    const limits = TRANSPORT_UPGRADE_LIMITS[category];
    const level = (kind, legacy) => clamp(Math.floor(Number(upgrade[`${kind}Level`] ?? legacy) || 0), 0, limits[kind]);
    const premium = level('premium', Number(upgrade.premiumBonus) * 100);
    const volume = level('volume', upgrade.extraVolume);
    const range = level('range', upgrade.extraRange);
    return { ...base,
      maxDistance: base.maxDistance + range,
      minVolume: base.minVolume + Math.floor(volume / 2),
      maxVolume: base.maxVolume + volume,
      premiumBonus: premium / 100
    };
  }
  function routeCandidates(routes, minDistance, maxDistance) {
    const inRange = routes.filter(route => route[route.length - 1] >= minDistance && route[route.length - 1] <= maxDistance);
    if (inRange.length) return inRange;
    const gap = route => Math.max(minDistance - route[route.length - 1], 0, route[route.length - 1] - maxDistance);
    const nearest = Math.min(...routes.map(gap));
    return routes.filter(route => gap(route) === nearest);
  }
  function offerRoutes(home, category, rules, keepBase = true) {
    const routes = home[category];
    const eligible = routeCandidates(routes, rules.minDistance, rules.maxDistance);
    if (!keepBase || !TRANSPORT_BASE[category]) return eligible;
    const base = TRANSPORT_BASE[category];
    const original = routeCandidates(routes, base.minDistance, base.maxDistance);
    return [...new Set([...original, ...eligible])];
  }

  function randomCategory() {
    const roll = Math.random();
    return roll < INTERNATIONAL_OFFER_CHANCE ? 'international' : 'national';
  }
  function startCityById(id) { return START_CITIES.find(location => location.id === id); }
  function createOrder(id, options = {}) {
    const { level = 1, starter = false } = options;
    const home = startCityById(options.startCity || game?.startCity) || startCityById('hamburg');
    const category = options.category || 'national';
    const rules = options.kind === 'private' ? PRIVATE_PICKUP_BASE : transportRules(category, options.company || game?.company);
    const customers = CUSTOMERS.filter(c => c.category === category && category !== 'city' && customerUnlocked(c.id));
    const customer = options.customer === null ? null : options.customer || (!starter && customers.length > 0 && Math.random() < CUSTOMER_OFFER_CHANCE ? pick(customers).id : null);
    const [cargo, icon] = starter ? CARGO[0] : customer ? CARGO.find(([name]) => name === customerById(customer).cargo) : pick(CARGO);
    let from, to, distance, volume, destinationCountry = home.country;
    if (category === 'city') {
      const cityAreas = home.districts.map(district => `${home.city} ${district}`);
      from = starter ? cityAreas[0] : pick(cityAreas);
      to = starter ? cityAreas[1] : pick(cityAreas);
      while (to === from) to = pick(cityAreas);
      distance = starter ? 8 : random(CITY_DISTANCE_MIN, CITY_DISTANCE_MAX);
      volume = starter ? 20 : random(CITY_VOLUME_MIN, CITY_VOLUME_MAX);
    } else if (category === 'national') {
      const [destination, routeDistance] = pick(offerRoutes(home, category, rules, options.kind !== 'private'));
      from = home.city; to = destination;
      distance = routeDistance; volume = random(rules.minVolume, rules.maxVolume);
    } else {
      const [destination, country, routeDistance] = pick(offerRoutes(home, category, rules, options.kind !== 'private'));
      from = home.city; to = `${destination}, ${country}`; destinationCountry = country;
      distance = routeDistance; volume = random(rules.minVolume, rules.maxVolume);
    }
    const baseVolume = volume;
    return {
      id: `A-${String(id).padStart(4, '0')}`, cargo, icon, from, to, category, homeCity: home.id, destinationCountry,
      distance, volume, baseVolume, routeType: category === 'city' ? null : Math.random() < DUAL_WAY_CHANCE ? 'dual' : 'single',
      delivered: 0, status: 'available', customer, kind: options.kind || 'normal', completionReward: null,
      truckId: null, tripStartAt: null, createdAt: Date.now(), completedAt: null
    };
  }
  function availableOrderUsesCurrentBase(order, state) {
    if (order.status !== 'available' || !TRANSPORT_BASE[order.category]) return true;
    const rules = transportRules(order.category, state.company);
    const home = startCityById(order.homeCity || state.startCity);
    const routes = home ? offerRoutes(home, order.category, rules) : [];
    return order.volume >= TRANSPORT_BASE[order.category].minVolume && order.volume <= rules.maxVolume
      && routes.some(route => route[route.length - 1] === order.distance);
  }

  function newGame(startCity = null) {
    const state = { version: 43, startCity, company: newCompany(), hubs: [], coins: 1000, startingCoins: 1000, xp: 0, trucks: [], orders: [], customerTrust: {}, customerSkills: {}, expedition: newExpedition(), overtimePoints: 100, overtimeCapacity: 100, overtimeLastRegenAt: Date.now(), pendingLevelUps: [], inventory: { gears: Object.fromEntries(RARITIES.map(rarity => [rarity.id, 0])), capacityModules: 0, pickupHints: 0, supplierContacts: 0, companyItems: 0, companyItemTkmRemainder: 0 }, events: [], nextOrder: 1, nextTruck: 1, completed: 0,
      nextAutoRefreshAt: Date.now() + AUTO_REFRESH_MS, manualRefreshCount: 0,
      stats: { trips: 0, tons: 0, km: 0, tonKm: 0, grossRevenue: 0, contractBonusRevenue: 0, expeditionRevenue: 0, operatingCosts: 0, truckSpent: 0, manualRefreshSpent: 0, departmentSpent: 0, offerUpgradeSpent: 0, workshopUpgradeSpent: 0, salesUpgradeSpent: 0, transportUpgradeSpent: 0, hubUpgradeSpent: 0, employeeSpent: 0, employeeRefund: 0, testCoinsGranted: 0, removedUpgradeRefund: 0, removedBranchRefund: 0 } };
    if (startCity) {
      state.expedition.characters.navigator = { level: 1, progress: 0 };
      state.trucks.push(createCardTruck(EXPEDITION_CHARACTERS[0]));
      for (let i = 0; i < BASE_OFFERS; i++) state.orders.push(createOrder(state.nextOrder++, { category: randomCategory(), startCity, customer: null, company: state.company }));
      state.events.unshift({ text: `Deine Spedition in ${startCityById(startCity).city} startet mit einem Kurierwagen im Fuhrpark.`, at: Date.now() });
    }
    return state;
  }

  function loadGame() {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if ([37, 38, 39, 40, 41, 42, 43].includes(current?.version) && Array.isArray(current.trucks) && Array.isArray(current.orders) && typeof current.coins === 'number') return upgradeVehicleCardsSave(upgradeCapacitySave(upgradeItemEconomySave(upgradeCharacterSave(upgradeCompanySave(upgradeBalanceSave(ensureExpedition(refreshTruckModelNames(current))))))));
    } catch (_) { /* Beschädigte Spielstände behandelt die bestehende Migration. */ }
    const stored = loadLegacyGame();
    if (stored.version === 36) return upgradeVehicleCardsSave(upgradeCapacitySave(upgradeItemEconomySave(upgradeCharacterSave(upgradeCompanySave(upgradeBalanceSave(ensureExpedition(refreshTruckModelNames(upgradeVehicleSaleSave(stored)))))))));
    if (stored.version !== 35) return upgradeVehicleCardsSave(upgradeCapacitySave(upgradeItemEconomySave(upgradeCharacterSave(upgradeCompanySave(upgradeBalanceSave(ensureExpedition(refreshTruckModelNames(stored))))))));
    const old = stored.company?.offerLevels || {};
    stored.company ||= newCompany();
    stored.company.offerLevel = clamp((old.national || 0) + (old.international || 0), 0, MAX_OFFER_LEVEL);
    stored.version = 36;
    // Keep every legacy offer and assignment; normal replenishment fills missing slots later.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return upgradeVehicleCardsSave(upgradeCapacitySave(upgradeItemEconomySave(upgradeCharacterSave(upgradeCompanySave(upgradeBalanceSave(ensureExpedition(refreshTruckModelNames(upgradeVehicleSaleSave(stored)))))))));
  }
  function upgradeVehicleCardsSave(stored) {
    if (stored.version !== 42) return stored;
    const shards = stored.expedition?.shards;
    if (shards) {
      // Epic und Legendär behalten ihren bisherigen Umtauschwert von 10:1.
      shards.rare = (shards.rare || 0) + (shards.epic || 0) * 10 + (shards.legendary || 0) * 100;
      shards.epic = 0;
      shards.legendary = 0;
    }
    stored.version = 43;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }
  function upgradeCapacitySave(stored) {
    if (stored.version !== 41) return stored;
    for (const truck of stored.trucks) {
      const base = TRUCKS[truck.tier]?.capacity;
      const oldLevel = Math.max(0, Math.floor(Number(truck.moduleCapacityLevel) || 0));
      const purchasedCapacity = Number(truck.capacity);
      // Historisch: Stufe 1 kostete 1 Modul und gab +1 t, Stufe 2 kostete
      // weitere 3 Module und gab +1 t. Beide Bestände bleiben erhalten.
      const preservedExtra = Number.isFinite(purchasedCapacity) && Number.isFinite(base) ? Math.max(0, purchasedCapacity - base) : oldLevel;
      truck.moduleCapacityLevel = Math.max(oldLevel * 2, Math.ceil(preservedExtra / CAPACITY_PER_MODULE));
      truck.capacity = Number.isFinite(purchasedCapacity) ? Math.max(purchasedCapacity, (base ?? 0) + truck.moduleCapacityLevel * CAPACITY_PER_MODULE) : (base ?? 0) + truck.moduleCapacityLevel * CAPACITY_PER_MODULE;
      truck.moduleCapacitySpent = oldLevel >= 2 ? 4 : oldLevel === 1 ? 1 : 0;
    }
    stored.version = 42;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }
  function upgradeItemEconomySave(stored) {
    if (stored.version !== 40) return stored;
    stored.inventory ||= {};
    // Alte Aufträge und bereits festgelegte Prämien bleiben unverändert.
    // Historische tkm erzeugen unter dem neuen Schwellenwert keine Nachzahlung.
    stored.inventory.companyItemTkmRemainder = 0;
    stored.version = 41;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }
  function upgradeCharacterSave(stored) {
    if (stored.version !== 39) return stored;
    const expedition = stored.expedition ||= newExpedition();
    expedition.shards ||= {};
    expedition.specificShards ||= {};
    // Alte Shards waren nach Ziellevel statt nach Figurenseltenheit nutzbar. Die
    // gleichnamige Seltenheit dient als eindeutiger Migrationsanker. Der Faktor
    // erhält den Anteil am vollständigen Ausbau: alt 45 × Seltenheitsfaktor,
    // neu 511 Shards. Figurgebundene Vorräte werden nur einmal hinzugefügt.
    const converted = Object.fromEntries(RARITIES.map(({ id }) => [id, 0]));
    for (const { id } of RARITIES) {
      const count = Math.max(0, Math.floor(Number(expedition.shards[id]) || 0));
      if (count) converted[id] += Math.max(1, Math.round(count * 511 / (45 * OLD_CHARACTER_COSTS[id])));
    }
    for (const character of EXPEDITION_CHARACTERS.filter(card => ['navigator', 'disponent', 'forscherin', 'logistiker', 'pionierin'].includes(card.id))) {
      const oldRarity = { logistiker: 'epic', pionierin: 'legendary' }[character.id] || character.rarity;
      const count = Math.max(0, Math.floor(Number(expedition.specificShards[character.id]) || 0));
      if (count) converted[oldRarity] += Math.max(1, Math.round(count * 511 / (45 * OLD_CHARACTER_COSTS[oldRarity])));
      const card = expedition.characters?.[character.id];
      if (!card) continue;
      card.level = clamp(Math.floor(Number(card.level) || 1), 1, 10);
      if (card.level === 10) { card.progress = 0; continue; }
      const oldNeeded = card.level * OLD_CHARACTER_COSTS[oldRarity];
      const oldProgress = clamp(Number(card.progress) || 0, 0, oldNeeded - 1);
      card.progress = Math.round(oldProgress / oldNeeded * CHARACTER_LEVEL_COSTS[card.level - 1] * 1000) / 1000;
    }
    expedition.shards = converted;
    delete expedition.specificShards;
    stored.version = 40;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }
  function upgradeCompanySave(stored) {
    if (stored.version !== 38) return stored;
    stored.inventory ||= {};
    stored.inventory.companyItems = Math.max(0, Math.floor(Number(stored.inventory.companyItems) || 0));
    stored.company ||= newCompany();
    stored.company.transportUpgrades ||= {};
    for (const category of ['national', 'international']) {
      const old = stored.company.transportUpgrades[category] || {};
      const limits = TRANSPORT_UPGRADE_LIMITS[category];
      stored.company.transportUpgrades[category] = {
        premiumLevel: clamp(Math.round((Number(old.premiumBonus) || 0) * 100), 0, limits.premium),
        volumeLevel: clamp(Math.floor(Number(old.extraVolume) || 0), 0, limits.volume),
        rangeLevel: clamp(Math.floor(Number(old.extraRange) || 0), 0, limits.range)
      };
    }
    stored.stats ||= {};
    stored.stats.transportUpgradeSpent ||= 0;
    stored.stats.hubUpgradeSpent ||= 0;
    for (const order of stored.orders) if (order.completionReward) delete order.completionReward.companyItems;
    stored.nextAutoRefreshAt = Number.isFinite(stored.nextAutoRefreshAt)
      ? stored.nextAutoRefreshAt + 10 * 60 * 1000 : Date.now() + AUTO_REFRESH_MS;
    stored.version = 39;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }
  function upgradeBalanceSave(stored) {
    if (stored.version !== 37) return stored;
    let oldLevel = 1, oldThreshold = 0;
    while (stored.xp >= oldThreshold + oldLevel * 100) oldThreshold += oldLevel++ * 100;
    if (oldLevel > levelForXp(stored.xp).level) {
      stored.levelFloor = oldLevel;
      stored.levelFloorXp = stored.xp;
    }
    stored.nextAutoRefreshAt = Number.isFinite(stored.nextAutoRefreshAt)
      ? stored.nextAutoRefreshAt - 10 * 60 * 1000 : Date.now() + AUTO_REFRESH_MS;
    stored.version = 38;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }
  function refreshTruckModelNames(stored) {
    let changed = false;
    for (const truck of stored.trucks) {
      const model = TRUCKS[truck.tier];
      if (model && truck.model !== model.model) {
        truck.model = model.model;
        changed = true;
      }
    }
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }
  function upgradeVehicleSaleSave(stored) {
    for (const truck of stored.trucks) {
      // Only the original starter is known to have been free in old saves.
      truck.purchasePrice = truck.id === 'LKW-01' && truck.tier === 2 ? null : LEGACY_TRUCK_PRICES[truck.tier] ?? 0;
      truck.kmDriven = 0;
      truck.toursCompleted = 0;
      truck.ordersCompleted = 0;
      truck.historyReconstructed = true;
      // Historic hub output is pooled, so its trips cannot be assigned retroactively.
      if (truck.hubAssigned && Number.isFinite(stored.hubs?.[0]?.nextCycleAt)) {
        const h = stored.hubs[0];
        const progress = clamp((Date.now() - (h.nextCycleAt - HUB_CYCLE_MS)) / (HUB_WORK_SECONDS * 1000), 0, 1);
        truck.hubToursInCycle = Math.floor(progress * HUB_WORK_SECONDS / hubTripSeconds(truck));
      }
    }
    for (const order of stored.orders) {
      const truck = stored.trucks.find(item => item.id === order.truckId);
      if (!truck || !['active', 'completed'].includes(order.status)) continue;
      const delivered = Math.max(0, Number(order.delivered) || 0);
      const capacity = Math.max(1, Number(truck.capacity) || 1);
      const tours = Math.ceil(delivered / capacity);
      truck.toursCompleted += tours;
      truck.kmDriven += tours * (Number(order.distance) || 0) * (order.routeType === 'single' || order.routeType === 'dual' ? 2 : 1);
      if (order.status === 'completed') truck.ordersCompleted++;
    }
    stored.version = 37;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }
  function loadLegacyGame() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if ((stored?.version === 36 || stored?.version === 35) && Array.isArray(stored.trucks) && Array.isArray(stored.orders) && typeof stored.coins === 'number') return stored;
      if (stored?.version === 34 && Array.isArray(stored.trucks) && Array.isArray(stored.orders) && typeof stored.coins === 'number') return upgradeHubSave(stored);
      if (stored?.version === 33 && Array.isArray(stored.trucks) && Array.isArray(stored.orders) && typeof stored.coins === 'number') return upgradeHubSave(upgradePersonnelSave(stored));
      if (stored?.version === 32 && Array.isArray(stored.trucks) && Array.isArray(stored.orders) && typeof stored.coins === 'number') return upgradeHubSave(upgradePersonnelSave(upgradeTrustSave(stored)));
      if (stored?.version === 31 && Array.isArray(stored.trucks) && Array.isArray(stored.orders) && typeof stored.coins === 'number') return upgradeHubSave(upgradePersonnelSave(upgradeGearEconomySave(stored)));
      if (stored?.version === 30 && Array.isArray(stored.trucks) && Array.isArray(stored.orders) && typeof stored.coins === 'number') {
        stored.manualRefreshCount = Number.isSafeInteger(stored.manualRefreshCount) && stored.manualRefreshCount >= 0 ? stored.manualRefreshCount : 0;
        return upgradeHubSave(upgradePersonnelSave(upgradeSpecialTripsSave(stored)));
      }
      if (stored?.version === 29 && Array.isArray(stored.trucks) && Array.isArray(stored.orders) && typeof stored.coins === 'number') {
        return upgradeHubSave(upgradePersonnelSave(upgradeSpecialTripsSave(upgradeVehicleCapacitiesSave(stored))));
      }
    } catch (_) { /* Ein beschädigter Speicherstand startet ein neues Spiel. */ }
    const stored = loadGameV28();
    if (stored.version === 28) {
      stored.manualRefreshCount = 0;
      stored.version = 29;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
    const migrated = stored.version === 29 ? upgradeSpecialTripsSave(upgradeVehicleCapacitiesSave(stored)) : stored.version === 32 ? upgradeTrustSave(stored) : stored;
    return upgradeHubSave(migrated.version === 33 ? upgradePersonnelSave(migrated) : migrated);
  }

  function upgradeHubSave(stored) {
    stored.inventory ||= {};
    stored.inventory.pickupHints = Math.max(0, Math.floor(Number(stored.inventory.pickupHints) || 0));
    stored.inventory.supplierContacts = Math.max(0, Math.floor(Number(stored.inventory.supplierContacts) || 0));
    stored.hubs = [];
    stored.orders = stored.orders.filter(order => order.status !== 'available' || order.category !== 'city');
    if (!stored.trucks.some(truck => truck.tier >= 2) && stored.startCity) {
      const model = TRUCKS[2];
      stored.trucks.push({ id: `LKW-${String(stored.nextTruck++).padStart(2, '0')}`, tier: 2, model: model.model, capacity: model.capacity, symbol: model.symbol, rarityLevel: 0 });
    }
    stored.version = 35;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  function upgradePersonnelSave(stored) {
    const formerEmployees = Math.max(0, Math.floor(Number(stored.company?.employees) || 0));
    stored.stats ||= {};
    const recordedSpend = Number(stored.stats.employeeSpent);
    const refund = Number.isFinite(recordedSpend) && recordedSpend > 0 ? recordedSpend : formerEmployees * EMPLOYEE_HIRE_PRICE;
    stored.coins = round2(stored.coins + refund);
    stored.stats.employeeRefund = round2(refund);
    if (stored.company) stored.company.employees = 0;
    if (refund > 0) {
      stored.events ||= [];
      stored.events.unshift({ text: `${money(refund)} M für frühere Mitarbeitereinstellungen erstattet.`, at: Date.now() });
      stored.events = stored.events.slice(0, 20);
    }
    stored.version = 34;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  function upgradeSpecialTripsSave(stored) {
    stored.inventory ||= { gears: Object.fromEntries(RARITIES.map(rarity => [rarity.id, 0])) };
    stored.inventory.capacityModules = Math.max(0, Math.floor(Number(stored.inventory.capacityModules) || 0));
    for (const truck of stored.trucks) {
      truck.moduleCapacityLevel = Math.max(0, Math.floor(Number(truck.moduleCapacityLevel) || 0));
      truck.capacity = (TRUCKS[truck.tier]?.capacity ?? truck.capacity) + truck.moduleCapacityLevel;
    }
    for (const order of stored.orders) {
      order.kind ||= 'normal';
      if (order.status === 'available' && order.category === 'city' && order.customer) order.customer = null;
    }
    return upgradeGearEconomySave(stored);
  }

  function upgradeGearEconomySave(stored) {
    stored.inventory ||= {};
    stored.inventory.gears ||= {};
    for (const rarity of RARITIES) stored.inventory.gears[rarity.id] = Math.max(0, Math.floor(Number(stored.inventory.gears[rarity.id]) || 0));
    for (const truck of stored.trucks) truck.rarityLevel = Number.isInteger(truck.rarityLevel) ? clamp(truck.rarityLevel, 0, MAX_RARITY_LEVEL) : 0;
    for (const order of stored.orders) {
      const reward = order.completionReward;
      if (!reward) continue;
      if (!reward.gears) reward.gears = reward.gear && RARITIES.some(rarity => rarity.id === reward.gear) ? { [reward.gear]: 1 } : {};
      delete reward.gear;
    }
    stored.version = 32;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return upgradeTrustSave(stored);
  }

  function upgradeTrustSave(stored) {
    if (stored.version === 33) return stored;
    stored.customerTrust = {};
    for (const customer of CUSTOMERS) {
      const earned = Number(stored.customerXp?.[customer.id]);
      stored.customerTrust[customer.id] = Number.isFinite(earned) ? Math.max(0, earned) : 0;
    }
    // Alte Fähigkeiten hatten andere Wirkungen. Ihr gesamtes Budget wird durch
    // das aus erhaltenem Vertrauen neu errechnete Level ersetzt.
    stored.customerSkills = {};
    for (const order of stored.orders) {
      if (order.status === 'completed' && order.customer) order.trustAwarded = true;
    }
    delete stored.customerXp;
    stored.version = 33;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  function upgradeVehicleCapacitiesSave(stored) {
    stored.manualRefreshCount = Number.isSafeInteger(stored.manualRefreshCount) && stored.manualRefreshCount >= 0 ? stored.manualRefreshCount : 0;
    for (const truck of stored.trucks) truck.capacity = TRUCKS[truck.tier]?.capacity ?? truck.capacity;
    for (const order of stored.orders) {
      if (order.status !== 'active') continue;
      const truck = stored.trucks.find(item => item.id === order.truckId);
      if (truck) order.tripCargo = Math.min(truck.capacity, order.volume - order.delivered);
    }
    stored.version = 30;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  function loadGameV28() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored && Array.isArray(stored.trucks) && Array.isArray(stored.orders) && typeof stored.coins === 'number') {
        if (stored.version === 28) return stored;
        if (stored.version === 27) return removeBranchesSave(stored);
        if (stored.version === 26) return removeBranchesSave(removeManualVehicleUpgradesSave(stored));
        if (stored.version === 25 || stored.version === 24 || stored.version === 23 || stored.version === 22) return removeBranchesSave(removeManualVehicleUpgradesSave(upgradeRaritySpeedSave(stored)));
        if (stored.version === 21) return removeBranchesSave(removeManualVehicleUpgradesSave(upgradeRaritySpeedSave(upgradeReturnRoutesSave(stored))));
        if (stored.version === 20) return removeBranchesSave(removeManualVehicleUpgradesSave(upgradeRaritySpeedSave(upgradeReturnRoutesSave(upgradeBranchCompaniesSave(stored)))));
        if (stored.version === 19) return removeBranchesSave(removeManualVehicleUpgradesSave(upgradeRaritySpeedSave(upgradeReturnRoutesSave(upgradeBranchCompaniesSave(upgradeBranchesSave(stored))))));
        if (stored.version === 18) return removeBranchesSave(removeManualVehicleUpgradesSave(upgradeRaritySpeedSave(upgradeReturnRoutesSave(upgradeBranchCompaniesSave(upgradeBranchesSave(upgradeCustomerOfferChanceSave(stored)))))));
        if ([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].includes(stored.version)) {
          const v4 = stored.version >= 4 ? stored : upgradeGame(stored.version === 2 ? migrateGame(stored) : stored);
          const v5 = v4.version === 4 ? upgradeCompany(v4) : v4;
          const v6 = v5.version === 5 ? upgradeRefresh(v5) : v5;
          const v7 = v6.version === 6 ? upgradeStartingCoins(v6) : v6;
          const v8 = v7.version === 7 ? upgradeDispatch(v7) : v7;
          const v9 = v8.version === 8 ? upgradeWorkshopSave(v8) : v8;
          const v10 = v9.version === 9 ? upgradeVehiclePermissionsSave(v9) : v9;
          const v11 = v10.version === 10 ? upgradeSalesSave(v10) : v10;
          const v12 = v11.version === 11 ? upgradeWorkshopStepsSave(v11) : v11;
          const v13 = v12.version === 12 ? upgradeEmployeesSave(v12) : v12;
          const v14 = v13.version === 13 ? upgradeCustomerSkillsSave(v13) : v13;
          const v15 = v14.version === 14 ? upgradeCustomerSkillLevelsSave(v14) : v14;
          const v16 = v15.version === 15 ? upgradeStartCitySave(v15) : v15;
          const v17 = v16.version === 16 ? upgradeVehicleRaritySave(v16) : v16;
          const migrated = removeBranchesSave(removeManualVehicleUpgradesSave(upgradeRaritySpeedSave(upgradeReturnRoutesSave(upgradeBranchCompaniesSave(upgradeBranchesSave(upgradeCustomerOfferChanceSave(upgradeCompletionRewardsSave(v17))))))));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }
    } catch (_) { /* Ein beschädigter Speicherstand startet ein neues Spiel. */ }
    return newGame();
  }

  function migrateGame(stored) {
    const oldModels = { Stadtläufer: { tier: 2, price: 800 }, Fernfahrer: { tier: 4, price: 2200 }, Schwerlast: { tier: 4, price: 4900 } };
    const oldCapacity = Object.fromEntries(stored.trucks.map(t => [t.id, t.capacity]));
    const truckSpent = stored.trucks.reduce((sum, t) => sum + (oldModels[t.model]?.price || 0), 0);
    const trips = stored.orders.reduce((sum, o) => sum + (o.delivered > 0 ? Math.ceil(o.delivered / (oldCapacity[o.truckId] || 10)) : 0), 0);
    const km = stored.orders.reduce((sum, o) => sum + (o.delivered > 0 ? Math.ceil(o.delivered / (oldCapacity[o.truckId] || 10)) * o.distance : 0), 0);
    const tons = stored.orders.reduce((sum, o) => sum + o.delivered, 0);
    const tonKm = stored.orders.reduce((sum, o) => sum + o.delivered * o.distance, 0);
    for (const order of stored.orders) {
      if (order.status === 'active') order.tripCargo = Math.min(oldCapacity[order.truckId] || 10, order.volume - order.delivered);
    }
    for (const truck of stored.trucks) {
      truck.tier = oldModels[truck.model]?.tier ?? 2;
      truck.model = TRUCKS[truck.tier].model;
      truck.capacity = TRUCKS[truck.tier].capacity;
      truck.symbol = TRUCKS[truck.tier].symbol;
    }
    stored.stats = { trips, tons, km, tonKm,
      grossRevenue: round2(stored.coins - 1800 + truckSpent + km * LEGACY_COST_PER_KM),
      operatingCosts: km * LEGACY_COST_PER_KM, truckSpent, upgradeSpent: 0 };
    stored.version = 3;
    return stored;
  }

  function upgradeGame(stored) {
    const level = levelForXp(stored.xp).level;
    for (const order of stored.orders) {
      order.category = order.category || 'city';
    }
    stored.orders = stored.orders.filter(o => o.status !== 'available');
    for (const category of CATEGORIES) {
      stored.orders.push(createOrder(stored.nextOrder++, { level, category: category.id, customer: null }));
    }
    while (stored.orders.filter(o => o.status === 'available').length < 6) stored.orders.push(createOrder(stored.nextOrder++, { level }));
    if (!stored.trucks.some(t => t.tier <= 1) && stored.coins < TRUCKS[0].price && stored.trucks.length) {
      const truck = { id: `LKW-${String(stored.nextTruck++).padStart(2, '0')}`, tier: 0, model: TRUCKS[0].model, capacity: TRUCKS[0].capacity, symbol: '🚚' };
      stored.trucks.push(truck);
      stored.events.unshift({ text: `${truck.id} für Stadtverkehr bereitgestellt, damit du weiterfahren kannst.`, at: Date.now() });
    }
    stored.version = 4;
    return stored;
  }

  function upgradeCompany(stored) {
    stored.company = { departments: {} };
    stored.version = 5;
    return stored;
  }

  function upgradeRefresh(stored) {
    stored.nextAutoRefreshAt = Date.now() + AUTO_REFRESH_MS;
    stored.stats.manualRefreshSpent = 0;
    stored.version = 6;
    return stored;
  }

  function upgradeStartingCoins(stored) {
    stored.startingCoins = 1800;
    stored.version = 7;
    return stored;
  }

  function upgradeDispatch(stored) {
    const dispatchUnlocked = Boolean(stored.company?.departments?.dispatch);
    stored.company = { departments: { dispatch: dispatchUnlocked }, offerLevels: { city: 0, national: 0, international: 0 } };
    stored.stats.departmentSpent = 0;
    stored.stats.offerUpgradeSpent = 0;
    stored.version = 8;
    return stored;
  }

  function upgradeWorkshopSave(stored) {
    stored.company.workshopLevel = 0;
    stored.stats.workshopUpgradeSpent = 0;
    stored.version = 9;
    return stored;
  }

  function upgradeVehiclePermissionsSave(stored) {
    stored.version = 10;
    return stored;
  }

  function upgradeSalesSave(stored) {
    stored.company.salesLevel = 0;
    stored.stats.salesUpgradeSpent = 0;
    stored.version = 11;
    return stored;
  }

  function upgradeWorkshopStepsSave(stored) {
    stored.company.workshopLevel = Math.min(MAX_WORKSHOP_LEVEL, (stored.company.workshopLevel || 0) * 5);
    stored.version = 12;
    return stored;
  }

  function upgradeEmployeesSave(stored) {
    stored.company.employees = 0;
    stored.stats.employeeSpent = 0;
    stored.version = 13;
    return stored;
  }

  function upgradeCustomerSkillsSave(stored) {
    stored.customerSkills = {};
    for (const order of stored.orders) if (order.customer) order.baseVolume = order.volume;
    stored.version = 14;
    return stored;
  }

  function upgradeCustomerSkillLevelsSave(stored) {
    stored.customerSkills = {};
    for (const order of stored.orders) {
      if (order.customer && order.status === 'available' && order.baseVolume != null) order.volume = order.baseVolume;
    }
    stored.version = 15;
    return stored;
  }

  function upgradeStartCitySave(stored) {
    stored.startCity = 'hamburg';
    for (const order of stored.orders) order.homeCity = 'hamburg';
    stored.version = 16;
    return stored;
  }

  function upgradeVehicleRaritySave(stored) {
    for (const truck of stored.trucks) truck.rarityLevel = 0;
    stored.version = 17;
    return stored;
  }

  function upgradeCompletionRewardsSave(stored) {
    stored.inventory = { gears: Object.fromEntries(RARITIES.map(rarity => [rarity.id, 0])) };
    stored.stats.contractBonusRevenue = 0;
    for (const order of stored.orders) order.completionReward = order.status === 'completed' ? makeCompletionReward(order) : null;
    stored.version = 18;
    return stored;
  }

  function upgradeCustomerOfferChanceSave(stored) {
    const level = levelForXp(stored.xp).level;
    stored.orders = stored.orders.map(order => {
      if (order.status !== 'available' || !order.customer || order.pinned || Math.random() < CUSTOMER_OFFER_CHANCE) return order;
      return createOrder(stored.nextOrder++, { level, category: order.category, customer: null, startCity: stored.startCity });
    });
    stored.version = 19;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  function upgradeBranchesSave(stored) {
    stored.branches = stored.startCity ? [stored.startCity] : [];
    stored.activeBranch = stored.startCity;
    stored.stats.branchSpent = 0;
    stored.version = 20;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  function upgradeBranchCompaniesSave(stored) {
    stored.branchCompanies = Object.fromEntries(stored.branches.map(branchId => [branchId, branchId === stored.startCity ? stored.company || newCompany() : newCompany()]));
    for (const truck of stored.trucks) truck.branchId = stored.startCity;
    delete stored.company;
    stored.version = 21;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  function upgradeReturnRoutesSave(stored) {
    for (const order of stored.orders) {
      order.routeType = order.category === 'city' ? null : order.status === 'available' ? (Math.random() < DUAL_WAY_CHANCE ? 'dual' : 'single') : 'legacy';
    }
    stored.version = 22;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  function upgradeRaritySpeedSave(stored) {
    for (const truck of stored.trucks) {
      truck.rarityLevel = Number.isInteger(truck.rarityLevel) ? clamp(truck.rarityLevel, 0, MAX_RARITY_LEVEL) : 0;
    }
    stored.version = 26;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  function removeManualVehicleUpgradesSave(stored) {
    const refundable = [stored.stats.upgradeSpent, stored.stats.vehicleUnlockSpent]
      .reduce((sum, amount) => sum + (Number.isFinite(amount) ? Math.max(0, amount) : 0), 0);
    stored.coins = round2(stored.coins + refundable);
    stored.stats.removedUpgradeRefund = (stored.stats.removedUpgradeRefund || 0) + refundable;
    delete stored.stats.upgradeSpent;
    delete stored.stats.vehicleUnlockSpent;
    for (const company of Object.values(stored.branchCompanies || {})) delete company.vehicleUnlocks;
    for (const truck of stored.trucks) {
      truck.capacity = TRUCKS[truck.tier]?.capacity ?? truck.capacity;
      delete truck.speedLevel;
      delete truck.capacityLevel;
    }
    for (const order of stored.orders) {
      if (order.status !== 'active') continue;
      const truck = stored.trucks.find(item => item.id === order.truckId);
      if (truck) order.tripCargo = Math.min(truck.capacity, order.volume - order.delivered);
    }
    stored.version = 27;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  function removeBranchesSave(stored) {
    const home = startCityById(stored.startCity) ? stored.startCity : 'hamburg';
    const companies = Object.values(stored.branchCompanies || {});
    const headquarters = stored.branchCompanies?.[home] || stored.company || newCompany();
    const merged = {
      departments: {}, offerLevels: { city: 0, national: 0, international: 0 },
      workshopLevel: 0, salesLevel: 0, employees: 0
    };
    for (const company of companies.length ? companies : [headquarters]) {
      for (const [id, unlocked] of Object.entries(company.departments || {})) if (unlocked) merged.departments[id] = true;
      for (const category of CATEGORIES) merged.offerLevels[category.id] = Math.max(merged.offerLevels[category.id], company.offerLevels?.[category.id] || 0);
      merged.workshopLevel = Math.max(merged.workshopLevel, company.workshopLevel || 0);
      merged.salesLevel = Math.max(merged.salesLevel, company.salesLevel || 0);
      merged.employees += company.employees || 0;
    }
    const branchRefund = Number.isFinite(stored.stats?.branchSpent) ? Math.max(0, stored.stats.branchSpent) : 0;
    stored.coins = round2(stored.coins + branchRefund);
    stored.stats.removedBranchRefund = round2((stored.stats.removedBranchRefund || 0) + branchRefund);
    delete stored.stats.branchSpent;
    stored.startCity = home;
    stored.company = merged;
    stored.hubs = [];
    for (const truck of stored.trucks) delete truck.branchId;
    stored.orders = stored.orders.filter(order => order.status !== 'available' || !order.homeCity || order.homeCity === home);
    for (const order of stored.orders) order.homeCity = home;
    delete stored.branches;
    delete stored.activeBranch;
    delete stored.branchCompanies;
    stored.version = 28;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  let game;
  game = loadGame();
  let currentView = 'dashboard';
  let selectedExpeditionRegion = null;
  let selectedExpeditionNode = 0;
  let selectedTruckId = null;
  let pendingSaleTruckId = null;
  let pendingSaleQuote = null;
  let selectedProjectId = null;
  let selectedFleetTemplate = 0;
  let selectedExpeditionJobGroup = null;
  let selectedDepartmentId = null;
  let bulkRewardIds = [];
  let levelAllocation = { expedition: 0, overtime: 0 };
  let lastPaint = 0;
  let toastTimer;

  function newExpedition() {
    return { points: 50, lastRegenAt: Date.now(), regions: EXPEDITION_REGIONS.map(() => ({ discovered: 0, deliveries: Array(7).fill(false), endlessUnlocked: false, moduleAwarded: false, finalClaimed: false, customerUnlocked: false })), jobs: [], missions: [], shards: Object.fromEntries(RARITIES.map(r => [r.id, 0])), characters: {}, seats: Array(5).fill(null), fleetTemplates: [Array(5).fill(null), Array(5).fill(null)], nextMission: 1 };
  }
  function ensureExpedition(stored) {
    let changed = false;
    stored.company ||= newCompany();
    stored.company.transportUpgrades ||= {};
    for (const category of ['national', 'international']) {
      if (!stored.company.transportUpgrades[category]) {
        stored.company.transportUpgrades[category] = { premiumLevel: 0, volumeLevel: 0, rangeLevel: 0 };
        changed = true;
      }
    }
    if (stored.startCity) {
      const outdated = stored.orders.filter(order => !availableOrderUsesCurrentBase(order, stored));
      if (outdated.length) {
        stored.orders = stored.orders.filter(order => availableOrderUsesCurrentBase(order, stored));
        for (const order of outdated) {
          const replacement = createOrder(stored.nextOrder++, { category: order.category, startCity: stored.startCity, customer: null, company: stored.company });
          replacement.pinned = Boolean(order.pinned);
          stored.orders.push(replacement);
        }
        changed = true;
      }
    }
    if (!stored.expedition) {
      stored.expedition = newExpedition();
      // Existing accepted contracts and earned trust remain available after migration.
      for (const order of stored.orders) if (order.customer && order.status !== 'available') {
        const index = EXPEDITION_CUSTOMER_IDS.indexOf(order.customer);
        if (index >= 0) { stored.expedition.regions[index].discovered = 7; stored.expedition.regions[index].endlessUnlocked = true; stored.expedition.regions[index].customerUnlocked = true; }
      }
      for (const customer of CUSTOMERS) if ((stored.customerTrust?.[customer.id] || 0) > 0) {
        const region = stored.expedition.regions[EXPEDITION_CUSTOMER_IDS.indexOf(customer.id)];
        region.discovered = 7;
        region.endlessUnlocked = true;
        region.customerUnlocked = true;
      }
      changed = true;
    }
    if (stored.version < 40) stored.expedition.specificShards ||= {};
    stored.expedition.jobs ||= [];
    for (const region of stored.expedition.regions) {
      if (region.moduleAwarded === undefined) {
        // Old completed Großaufträge already awarded their module and customer.
        const previouslyCompleted = Boolean(region.endlessUnlocked);
        region.moduleAwarded = previouslyCompleted || region.discovered >= 7;
        region.finalClaimed = previouslyCompleted;
        region.customerUnlocked = previouslyCompleted || Boolean(region.customerUnlocked);
        if (!previouslyCompleted && region.discovered >= 7) stored.inventory.capacityModules++;
        if (region.discovered >= 7) region.endlessUnlocked = true;
        changed = true;
      }
    }
    for (const mission of stored.expedition.missions || []) {
      const region = stored.expedition.regions[mission.region];
      if (mission.status === 'completed' && !mission.claimedAt && ((mission.kind === 'delivery' && region?.deliveries[mission.place]) || (mission.kind === 'final' && region?.finalClaimed))) {
        mission.claimedAt = mission.endsAt || Date.now();
        changed = true;
      }
    }
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }
  function expeditionBonus(kind) {
    return game.expedition.seats.reduce((sum, id) => {
      const character = EXPEDITION_CHARACTERS.find(c => c.id === id);
      const level = game.expedition.characters[id]?.level || 0;
      return sum + (character?.bonus === kind && level ? character.base + (level - 1) * character.step : 0);
    }, 0);
  }
  function expeditionCapacity() {
    return 50 + (game.expedition.levelCapacityBonus || 0) + game.expedition.regions.reduce((sum, region) => sum + region.deliveries.filter(Boolean).length, 0) + expeditionBonus('capacity');
  }
  function regenerateExpedition(now = Date.now()) {
    const expedition = game.expedition;
    if (expedition.points >= expeditionCapacity()) { expedition.lastRegenAt = now; return false; }
    const interval = EXPEDITION_REGEN_MS / (1 + Math.min(20, expeditionBonus('regen')) / 100);
    const earned = Math.floor(Math.max(0, now - expedition.lastRegenAt) / interval);
    if (!earned) return false;
    expedition.points = Math.min(expeditionCapacity(), expedition.points + earned);
    expedition.lastRegenAt += earned * interval;
    if (expedition.points >= expeditionCapacity()) expedition.lastRegenAt = now;
    return true;
  }
  function regenerateOvertime(now = Date.now()) {
    const capacity = game.overtimeCapacity ?? 100;
    game.overtimeLastRegenAt ||= now;
    if (game.overtimePoints >= capacity) { game.overtimeLastRegenAt = now; return false; }
    const earned = Math.floor(Math.max(0, now - game.overtimeLastRegenAt) / OVERTIME_REGEN_MS);
    if (!earned) return false;
    game.overtimePoints = Math.min(capacity, game.overtimePoints + earned);
    game.overtimeLastRegenAt = game.overtimePoints >= capacity ? now : game.overtimeLastRegenAt + earned * OVERTIME_REGEN_MS;
    save();
    return true;
  }
  function spendExpeditionPoints(amount) {
    regenerateExpedition();
    if (game.expedition.points < amount) return false;
    game.expedition.points -= amount;
    game.expedition.lastRegenAt = Date.now();
    return true;
  }
  function expeditionRegionOpen(index) {
    return Number.isInteger(index) && index >= 0 && index < game.expedition.regions.length
      && game.expedition.regions.slice(0, index).every(region => region.endlessUnlocked);
  }
  function expeditionRegionCompleted(region) {
    return region.discovered === 7 && region.endlessUnlocked && region.moduleAwarded && region.finalClaimed && region.deliveries.every(Boolean);
  }
  function expeditionDiscoveryCost(index, place) { return 3 + index * 9 + Math.floor(place / 2); }
  function discoverExpeditionPlace(index) {
    const region = game.expedition.regions[index];
    if (!region || !expeditionRegionOpen(index) || region.discovered >= 7) return false;
    const cost = expeditionDiscoveryCost(index, region.discovered);
    if (!spendExpeditionPoints(cost)) return false;
    region.discovered++;
    if (region.discovered === 7 && !region.moduleAwarded) {
      region.endlessUnlocked = true;
      region.moduleAwarded = true;
      game.inventory.capacityModules++;
      addEvent(`${EXPEDITION_REGIONS[index]}: Endlosort freigelegt · 1 Kapazitätsmodul erhalten.`);
    }
    addEvent(`${EXPEDITION_REGIONS[index]}: Ort ${region.discovered} entdeckt.`);
    save(); render(); return true;
  }
  function expeditionTruckFree(id) { return freeTrucks().some(truck => truck.id === id && truck.tier >= 2); }
  function expeditionDuration(index, kind, place = 0) {
    const hours = kind === 'delivery' ? (2 + index * 8 + place * 3) : (8 + index * 40);
    return hours * 3600000 * (1 - Math.min(40, expeditionBonus('duration')) / 100);
  }
  function drawExpeditionJob(index) {
    const region = game.expedition.regions[index];
    if (!region?.endlessUnlocked || !expeditionRegionOpen(index) || !spendExpeditionPoints(EXPEDITION_COST)) return false;
    const draw = Math.random();
    let cardTotal = 0;
    const foundRarity = EXPEDITION_CARD_CHANCES.find(item => (cardTotal += item.chance) > draw)?.rarity;
    if (foundRarity) {
      const card = EXPEDITION_CHARACTERS.find(item => item.region === index && item.rarity === foundRarity);
      if (!game.expedition.characters[card.id]) game.expedition.characters[card.id] = { level: 1, progress: 0 };
      else game.expedition.shards[card.rarity]++;
      addEvent(`${EXPEDITION_REGIONS[index]}: ${card.name} gefunden.`);
      save(); render(); showToast(`${card.name} gefunden.`);
      return `card:${card.id}`;
    }
    const roll = (draw - cardTotal) / (1 - cardTotal);
    let cumulative = 0;
    const kind = EXPEDITION_JOB_WEIGHTS.find(item => (cumulative += item.chance) > roll)?.kind || 'material';
    if (kind === 'special' || kind === 'referral') {
      const customer = customerById(EXPEDITION_CUSTOMER_IDS[index]);
      queueCustomerTrip({ category: customer.category, customer: customer.id, homeCity: game.startCity, region: index }, kind);
    } else {
      const stageRoll = Math.random();
      let stageTotal = 0;
      const tier = EXPEDITION_STAGE_WEIGHTS[index].findIndex(weight => (stageTotal += weight) > stageRoll) + 1;
      game.expedition.jobs.push({ id: game.expedition.nextMission++, region: index, kind, tier: tier || 1, createdAt: Date.now() });
    }
    addEvent(`${EXPEDITION_REGIONS[index]}: ${expeditionJobLabel(kind)} ausgelost.`);
    save(); render(); showToast(`${expeditionJobLabel(kind)} erhalten.`);
    return kind;
  }
  function expeditionJobLabel(kind) {
    return { character: 'Fahrzeugkartenauftrag', material: 'Materialauftrag', special: 'Sonderfahrt', referral: 'Empfehlungsauftrag' }[kind] || 'Expeditionsauftrag';
  }
  function expeditionJobTier(entry) { return [1, 2, 3].includes(entry.tier) ? entry.tier : 1; }
  function rollExpeditionShard(tier) {
    const pool = EXPEDITION_SHARD_POOLS[tier - 1];
    const roll = Math.random();
    let total = 0;
    return Object.entries(pool).find(([, chance]) => (total += chance) > roll)?.[0] || Object.keys(pool).at(-1);
  }
  function expeditionJobVolume(entry) { return expeditionJobTier(entry) * EXPEDITION_JOB_TONS_PER_TIER; }
  function expeditionTransportPlan(job, truck, startedAt = Date.now()) {
    const volume = expeditionJobVolume(job);
    const durationFactor = 1 - Math.min(40, expeditionBonus('duration')) / 100;
    const route = { distance: EXPEDITION_JOB_DISTANCE, routeType: 'single' };
    const tours = [];
    let remaining = volume;
    let nextAt = startedAt;
    while (remaining > 0) {
      const cargo = Math.min(truck.capacity, remaining);
      const endsAt = nextAt + tourSeconds(route, truck, cargo) * durationFactor * 1000;
      tours.push({ cargo, startsAt: nextAt, endsAt });
      remaining = round2(remaining - cargo);
      nextAt = endsAt;
    }
    return { volume, delivered: 0, completedTours: 0, tours };
  }
  function expeditionTransportProgress(mission, now = Date.now()) {
    const transport = mission.transport;
    if (!transport) return 0;
    const next = transport.tours[transport.completedTours];
    const inTransit = next ? next.cargo * clamp((now - next.startsAt) / (next.endsAt - next.startsAt), 0, 1) : 0;
    return clamp((transport.delivered + inTransit) / transport.volume * 100, 0, 100);
  }
  function startExpeditionMission(index, kind, truckId, place = 0) {
    const region = game.expedition.regions[index];
    if (!region || !expeditionTruckFree(truckId) || !expeditionRegionOpen(index)) return false;
    if (kind === 'delivery' && (!Number.isInteger(place) || place < 0 || place >= 7 || place >= region.discovered || region.deliveries[place] || game.expedition.missions.some(m => m.region === index && m.kind === 'delivery' && m.place === place))) return false;
    if (kind === 'final' && (region.discovered < 7 || region.finalClaimed || game.expedition.missions.some(m => m.region === index && m.kind === 'final'))) return false;
    const job = kind === 'endless' ? game.expedition.jobs.find(item => item.id === place && item.region === index) : null;
    if (kind === 'endless' && (!region.endlessUnlocked || !job)) return false;
    if (!['delivery', 'final', 'endless'].includes(kind)) return false;
    const now = Date.now();
    const transport = job ? expeditionTransportPlan(job, truckById(truckId), now) : null;
    if (job) game.expedition.jobs.splice(game.expedition.jobs.indexOf(job), 1);
    game.expedition.missions.push({ id: game.expedition.nextMission++, jobId: job?.id, tier: job?.tier, region: index, kind, lootKind: job?.kind || 'material', place, truckId, startedAt: now, endsAt: transport ? transport.tours.at(-1).endsAt : now + expeditionDuration(index, kind, place), transport, status: 'active' });
    addEvent(`${truckId} startet ${kind === 'endless' ? 'Expeditionsauftrag' : kind === 'final' ? 'einmaligen Endlosort-Auftrag' : 'Ortsmission'} in ${EXPEDITION_REGIONS[index]}.`);
    save(); render(); return true;
  }
  function awardExpeditionLoot(mission) {
    const expedition = game.expedition;
    const region = mission.region;
    const coins = Math.round((mission.lootKind === 'character' ? 5 : 15) * (region + 1) * (1 + expeditionBonus('coins') / 100));
    game.coins = round2(game.coins + coins);
    game.stats.expeditionRevenue = round2((game.stats.expeditionRevenue || 0) + coins);
    const reward = [`${coins} M`];
    // Jede Shardrolle nutzt den gespeicherten Auftragsrang; Stufe 1/2 schließen höhere Seltenheiten aus.
    if (mission.lootKind === 'character' || Math.random() < .2) {
      const amount = 1 + (Math.random() < .2 + expeditionBonus('shards') / 100 ? 1 : 0);
      for (let i = 0; i < amount; i++) {
        const rarity = rollExpeditionShard(expeditionJobTier(mission));
        expedition.shards[rarity]++;
        reward.push(`1 ${rarity}-Shard`);
      }
    }
    if (mission.lootKind === 'character') {
      const rarity = rollExpeditionShard(expeditionJobTier(mission));
      expedition.shards[rarity]++;
      reward.push(`1 ${rarity}-Shard`);
    }
    if (mission.lootKind === 'material' && Math.random() < .003) { game.inventory.capacityModules++; reward.push('1 Kapazitätsmodul'); }
    if (mission.lootKind === 'material') {
      const items = Math.random() < COMPANY_BALANCE.materialItemChance ? COMPANY_BALANCE.materialItemsByTier[expeditionJobTier(mission) - 1] : 0;
      mission.companyItemsAwarded = items;
      if (items) {
        game.inventory.companyItems = (game.inventory.companyItems || 0) + items;
        reward.push(`${items} Firmenausbau-Item${items === 1 ? '' : 's'}`);
      }
    }
    mission.reward = reward.join(' · ');
  }
  function settleExpeditions(now = Date.now()) {
    let changed = regenerateExpedition(now);
    for (const mission of game.expedition.missions) {
      if (mission.status !== 'active') continue;
      if (mission.kind === 'endless' && mission.transport) {
        const transport = mission.transport;
        while (transport.completedTours < transport.tours.length && transport.tours[transport.completedTours].endsAt <= now) {
          transport.delivered = round2(transport.delivered + transport.tours[transport.completedTours].cargo);
          transport.completedTours++;
          changed = true;
        }
        if (transport.completedTours < transport.tours.length) continue;
        transport.delivered = transport.volume;
      } else if (mission.endsAt > now) continue;
      mission.status = 'completed';
      const region = game.expedition.regions[mission.region];
      if (mission.kind === 'delivery') mission.reward = '+1 maximale Expeditionskapazität · bereit zum Abholen';
      else if (mission.kind === 'final') mission.reward = `${customerById(EXPEDITION_CUSTOMER_IDS[mission.region]).name} · Freischaltung bereit zum Abholen`;
      else if (mission.kind === 'endless') awardExpeditionLoot(mission);
      addEvent(`${EXPEDITION_REGIONS[mission.region]}: ${mission.reward || 'Mission abgeschlossen'}.`);
      changed = true;
    }
    if (game.expedition.missions.length > 120) {
      const recentCompleted = game.expedition.missions.filter(m => m.status === 'completed').slice(-100);
      game.expedition.missions = game.expedition.missions.filter(m => m.status === 'active' || (['delivery', 'final'].includes(m.kind) && !m.claimedAt && !recentCompleted.includes(m))).concat(recentCompleted);
    }
    if (changed) save();
    return changed;
  }
  function claimExpeditionMission(missionId) {
    const mission = game.expedition.missions.find(item => item.id === missionId && item.status === 'completed' && !item.claimedAt && ['delivery', 'final'].includes(item.kind));
    if (!mission) return false;
    const region = game.expedition.regions[mission.region];
    if (mission.kind === 'delivery' && !region.deliveries[mission.place]) region.deliveries[mission.place] = true;
    if (mission.kind === 'final' && !region.finalClaimed) {
      region.finalClaimed = true;
      region.customerUnlocked = true;
    }
    mission.claimedAt = Date.now();
    mission.reward = mission.kind === 'delivery' ? '+1 maximale Expeditionskapazität abgeholt' : `${customerById(EXPEDITION_CUSTOMER_IDS[mission.region]).name} freigeschaltet`;
    addEvent(`${EXPEDITION_REGIONS[mission.region]}: ${mission.reward}.`);
    save(); render(); return true;
  }
  function fleetTemplate(index) {
    game.expedition.fleetTemplates ||= [Array(5).fill(null), Array(5).fill(null)];
    return index === 0 ? game.expedition.seats : game.expedition.fleetTemplates?.[index - 1];
  }
  function assignCharacterSeat(id, seat, template = 0) {
    if (!Number.isInteger(seat) || seat < 0 || seat >= 5 || !game.expedition.characters[id]) return false;
    const seats = fleetTemplate(template);
    if (!seats) return false;
    const previous = seats.indexOf(id);
    if (previous >= 0) seats[previous] = null;
    seats[seat] = id;
    save(); render(); return true;
  }
  function giveCharacterShard(id, fill = false) {
    const character = EXPEDITION_CHARACTERS.find(c => c.id === id);
    const card = game.expedition.characters[id];
    if (!character || !card || card.level >= 10) return false;
    const tier = character.rarity;
    const available = game.expedition.shards[tier] || 0;
    if (!available) return false;
    const needed = CHARACTER_LEVEL_COSTS[card.level - 1];
    const amount = Math.min(available, fill ? Math.ceil(needed - card.progress) : 1);
    game.expedition.shards[tier] -= amount;
    card.progress += amount;
    if (card.progress >= needed) {
      card.progress = card.level < 9 ? Math.round((card.progress - needed) * 1000) / 1000 : 0;
      card.level++;
      addEvent(`${character.name} erreicht Stufe ${card.level}.`);
    }
    save(); render(); return true;
  }
  function combineExpeditionShards(tier) {
    const tiers = EXPEDITION_CARD_CHANCES.map(item => item.rarity);
    const index = tiers.indexOf(tier);
    if (index < 0 || index >= tiers.length - 1 || game.expedition.shards[tier] < SHARD_COMBINE_RATIO) return false;
    game.expedition.shards[tier] -= SHARD_COMBINE_RATIO;
    game.expedition.shards[tiers[index + 1]]++;
    save(); render(); return true;
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(game)); }
    catch (_) { showToast('Der Browser konnte den Spielstand nicht speichern.'); }
  }
  function addEvent(text) { game.events.unshift({ text, at: Date.now() }); game.events = game.events.slice(0, 20); }
  function showToast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
  }
  function playerXpForNextLevel(level) { return level < 25 ? 100 * level : 4 * level * level; }
  function levelForXp(xp, state) {
    let level = 1, start = 0, need = playerXpForNextLevel(level);
    while (xp >= start + need) { start += need; level++; need = playerXpForNextLevel(level); }
    const floor = state?.levelFloor;
    if (Number.isSafeInteger(floor) && floor >= level && floor > 1) {
      let nextThreshold = start;
      for (let current = level; current <= floor; current++) nextThreshold += playerXpForNextLevel(current);
      const progressStart = Number.isFinite(state.levelFloorXp) ? state.levelFloorXp : xp;
      return { level: floor, within: Math.max(0, xp - progressStart), need: nextThreshold - progressStart };
    }
    return { level, within: xp - start, need };
  }
  function trustTotalForLevel(level) { return level * 110 + 5 * level * (level - 1); }
  function customerLevel(trust) {
    let level = 0;
    while (level < MAX_TRUST_LEVEL && trust >= trustTotalForLevel(level + 1)) level++;
    return level;
  }
  function customerNext(trust) {
    const level = customerLevel(trust);
    return level < MAX_TRUST_LEVEL ? trustTotalForLevel(level + 1) : null;
  }
  function customerSkillLevels(customerId) { return game?.customerSkills?.[customerId] || { pay: 0, special: 0, referral: 0 }; }
  function availableCustomerSkillPoints(customerId) {
    const skills = customerSkillLevels(customerId);
    return Math.max(0, customerLevel(game.customerTrust[customerId] || 0) - skills.pay - skills.special - skills.referral);
  }
  function allocateCustomerSkill(customerId, kind) {
    const customer = customerById(customerId);
    if (!customer || !customerUnlocked(customerId) || !Object.hasOwn(CUSTOMER_SKILL_LIMITS, kind) || availableCustomerSkillPoints(customerId) < 1) return false;
    const skills = game.customerSkills[customerId] ||= { pay: 0, special: 0, referral: 0 };
    if (skills[kind] >= CUSTOMER_SKILL_LIMITS[kind]) return false;
    skills[kind]++;
    addEvent(`${customer.name}: Fähigkeitspunkt für ${kind === 'pay' ? 'Vergütung' : kind === 'special' ? 'Sonderfahrtchance' : 'Empfehlungschance'} verteilt.`);
    save(); render(); showToast(`${customer.name}: Skillpunkt verteilt.`);
    return true;
  }
  function customerTripChance(order, kind) {
    const base = SPECIAL_CHANCES[order.category]?.[kind] || 0;
    const skill = order.customer ? customerSkillLevels(order.customer)[kind === 'award' ? 'special' : 'referral'] || 0 : 0;
    return base + skill * .001;
  }
  function truckById(id) { return game.trucks.find(t => t.id === id); }
  function vehicleCardById(id) { return EXPEDITION_CHARACTERS.find(card => card.id === id); }
  function createCardTruck(card) {
    const model = TRUCKS[card.vehicleTier];
    return { id: `KARTE-${card.id}`, cardId: card.id, tier: card.vehicleTier, model: card.name, capacity: model.capacity, symbol: model.symbol, rarityLevel: 0, purchasePrice: null, kmDriven: 0, toursCompleted: 0, ordersCompleted: 0 };
  }
  function cardInGarage(id) { return game.trucks.some(truck => truck.cardId === id); }
  function addCardToGarage(id) {
    const card = vehicleCardById(id);
    const owned = game.expedition.characters[id];
    if (!card || !owned || cardInGarage(id) || regularTruckCount() >= 10) return false;
    game.trucks.push(owned.parkedTruck || createCardTruck(card));
    delete owned.parkedTruck;
    addEvent(`${card.name} im Fuhrpark eingesetzt.`);
    save(); render(); return true;
  }
  function removeCardFromGarage(id) {
    const index = game.trucks.findIndex(truck => truck.cardId === id);
    if (index < 0) return false;
    const truck = game.trucks[index];
    if (game.orders.some(order => order.status === 'active' && order.truckId === truck.id) || game.expedition.missions.some(mission => mission.status === 'active' && mission.truckId === truck.id)) return false;
    game.expedition.characters[id].parkedTruck = truck;
    game.trucks.splice(index, 1);
    addEvent(`${truck.model} aus dem Fuhrpark genommen.`);
    save(); render(); return true;
  }
  function companyFor() { return game.company; }
  function trucksAt() { return game.trucks; }
  function dispatchCapacity() { return 10; }
  function hubCapacity() { return Math.max(1, Math.floor(levelForXp(game.xp, game).level * .75)); }
  function hub() { return game.hubs[0] || null; }
  function hubTrucks() { return game.trucks.filter(truck => truck.tier <= 1 && truck.hubAssigned); }
  function cityTruckCount() { return game.trucks.filter(truck => truck.tier <= 1).length; }
  function regularTruckCount() { return game.trucks.filter(truck => truck.tier >= 2).length; }
  function hubSalesPercent(level) { return 75 + level; }
  function hubTripSeconds(truck) { return HUB_ROUTE_KM / truckSpeed(truck, truck.capacity) + HUB_ROUTE_KM / truckSpeed(truck, 0); }
  function hubHourlyCapacity() { return round2(hubTrucks().reduce((sum, truck) => sum + Math.floor(HUB_WORK_SECONDS / hubTripSeconds(truck)) * truck.capacity, 0)); }
  function hubSecondsUntilFull(h, now) {
    if (!h) return null;
    const remainingCycles = Math.max(0, HUB_CASHBOX_CYCLES - h.cashboxCycles);
    if (!remainingCycles) return 0;
    if (!hubTrucks().length) return null;
    return Math.max(0, (h.nextCycleAt - now + (remainingCycles - 1) * HUB_CYCLE_MS) / 1000);
  }
  function hubUpgradeContactCost(level) { return level * 5; }
  function completeHubUpgrade(h, at) {
    if (!h.construction || h.construction.finishAt > at) return false;
    h.salesLevel = h.construction.level;
    h.construction = null;
    addEvent(`Stadthub: Vertrieb Stufe ${h.salesLevel} abgeschlossen.`);
    return true;
  }
  function accrueHubCycle(h, at) {
    const cycleStart = h.nextCycleAt - HUB_CYCLE_MS;
    const progress = clamp((at - cycleStart) / (HUB_WORK_SECONDS * 1000), 0, 1);
    const capacity = h.cycleCapacity ?? hubHourlyCapacity();
    const tonsDelivered = round2(capacity * hubSalesPercent(h.cycleSalesLevel ?? h.salesLevel) / 100);
    if (tonsDelivered <= 0) return false;
    if (h.cashboxCycles < HUB_CASHBOX_CYCLES) {
      for (const truck of hubTrucks()) {
        const tours = Math.floor(progress * HUB_WORK_SECONDS / hubTripSeconds(truck));
        const additional = Math.max(0, tours - (truck.hubToursInCycle || 0));
        truck.hubToursInCycle = tours;
        truck.kmDriven = (truck.kmDriven || 0) + additional * HUB_ROUTE_KM * 2;
        truck.toursCompleted = (truck.toursCompleted || 0) + additional;
      }
    }
    h.cycleHintTotal ??= random(8, 12);
    const targetCoins = round2(tonsDelivered * (HUB_SALE_PER_TON - HUB_PURCHASE_PER_TON) * progress);
    const targetHints = Math.floor(h.cycleHintTotal * progress);
    const targetTons = round2(tonsDelivered * progress);
    const previousCoins = h.cyclePaidCoins || 0;
    const previousHints = h.cyclePaidHints || 0;
    const previousTons = h.cyclePaidTons || 0;
    h.cyclePaidCoins = targetCoins;
    h.cyclePaidHints = targetHints;
    h.cyclePaidTons = targetTons;
    if (h.cashboxCycles >= HUB_CASHBOX_CYCLES) return false;
    const coins = round2(targetCoins - previousCoins);
    const hints = targetHints - previousHints;
    const delivered = round2(targetTons - previousTons);
    if (!coins && !hints && !delivered) return false;
    h.cashboxCoins = round2(h.cashboxCoins + coins);
    h.cashboxHints += hints;
    h.totalTons = round2((h.totalTons || 0) + delivered);
    return true;
  }
  function beginHubCycle(h) {
    for (const truck of hubTrucks()) truck.hubToursInCycle = 0;
    h.cycleCapacity = hubHourlyCapacity();
    h.cycleSalesLevel = h.salesLevel;
    h.cycleHintTotal = h.cycleCapacity > 0 ? random(8, 12) : 0;
    h.cyclePaidCoins = 0;
    h.cyclePaidHints = 0;
    h.cyclePaidTons = 0;
  }
  function settleHub(now) {
    const h = hub();
    if (!h) return false;
    let changed = false;
    while (h.nextCycleAt <= now && h.cashboxCycles < HUB_CASHBOX_CYCLES) {
      changed = accrueHubCycle(h, h.nextCycleAt) || changed;
      if ((h.cycleCapacity ?? hubHourlyCapacity()) > 0) h.cashboxCycles++;
      h.nextCycleAt += HUB_CYCLE_MS;
      changed = completeHubUpgrade(h, h.nextCycleAt - HUB_CYCLE_MS) || changed;
      beginHubCycle(h);
      changed = true;
      if (!h.cycleCapacity) {
        h.nextCycleAt += Math.floor((now - h.nextCycleAt) / HUB_CYCLE_MS + 1) * HUB_CYCLE_MS;
        break;
      }
    }
    if (h.nextCycleAt <= now && h.cashboxCycles >= HUB_CASHBOX_CYCLES) {
      h.nextCycleAt += Math.floor((now - h.nextCycleAt) / HUB_CYCLE_MS + 1) * HUB_CYCLE_MS;
      changed = completeHubUpgrade(h, now) || changed;
      beginHubCycle(h);
      changed = true;
    }
    changed = accrueHubCycle(h, now) || changed;
    changed = completeHubUpgrade(h, now) || changed;
    if (changed) save();
    return changed;
  }
  function buyHub() {
    if (hub() || !game.startCity || game.coins < HUB_PRICE) return;
    game.coins = round2(game.coins - HUB_PRICE);
    game.hubs.push({ id: 'city-hub', nextCycleAt: Date.now() + HUB_CYCLE_MS, cycleCapacity: 0, cycleSalesLevel: 0, cycleHintTotal: 0, cyclePaidCoins: 0, cyclePaidHints: 0, cyclePaidTons: 0, salesLevel: 0, construction: null, cashboxCoins: 0, cashboxHints: 0, cashboxCycles: 0, totalTons: 0 });
    addEvent(`Stadthub in ${startCityById(game.startCity).city} eröffnet.`);
    save(); render(); showToast('Stadthub eröffnet.');
  }
  function toggleHubTruck(id) {
    const h = hub();
    const truck = truckById(id);
    if (!h || !truck || truck.tier > 1 || game.orders.some(order => order.status === 'active' && order.truckId === id)) return;
    settleHub(Date.now());
    const wasEmpty = hubTrucks().length === 0;
    truck.hubAssigned = !truck.hubAssigned;
    if (truck.hubAssigned) truck.hubToursInCycle = Math.floor(clamp((Date.now() - (h.nextCycleAt - HUB_CYCLE_MS)) / (HUB_WORK_SECONDS * 1000), 0, 1) * HUB_WORK_SECONDS / hubTripSeconds(truck));
    if (wasEmpty && truck.hubAssigned) { h.nextCycleAt = Date.now() + HUB_CYCLE_MS; beginHubCycle(h); }
    addEvent(`${truck.id} ${truck.hubAssigned ? 'dem Stadthub zugeteilt' : 'aus dem Stadthub entfernt'}.`);
    save(); render();
  }
  function collectHub() {
    const h = hub();
    if (!h) return;
    settleHub(Date.now());
    if (!h.cashboxCoins && !h.cashboxHints) return;
    game.coins = round2(game.coins + h.cashboxCoins);
    game.stats.hubRevenue = round2((game.stats.hubRevenue || 0) + h.cashboxCoins);
    game.inventory.pickupHints += h.cashboxHints;
    h.totalCollected = round2((h.totalCollected || 0) + h.cashboxCoins);
    addEvent(`Stadthub: ${money(h.cashboxCoins)} M und ${h.cashboxHints} Abholhinweise abgeholt.`);
    h.cashboxCoins = 0; h.cashboxHints = 0; h.cashboxCycles = 0;
    save(); render(); showToast('Hub-Ertrag abgeholt.');
  }
  function startHubUpgrade() {
    const h = hub();
    if (!h || h.construction || h.salesLevel >= HUB_MAX_SALES_LEVEL) return;
    const level = h.salesLevel + 1;
    const cost = hubUpgradeContactCost(level);
    const itemCost = COMPANY_BALANCE.upgradeItems(level);
    const coinCost = COMPANY_BALANCE.upgradeCoins(level);
    if (game.inventory.supplierContacts < cost || game.inventory.companyItems < itemCost || game.coins < coinCost) return;
    settleHub(Date.now());
    game.inventory.supplierContacts -= cost;
    game.inventory.companyItems -= itemCost;
    game.coins = round2(game.coins - coinCost);
    game.stats.hubUpgradeSpent = (game.stats.hubUpgradeSpent || 0) + coinCost;
    const startedAt = Date.now();
    h.construction = { level, startedAt, finishAt: startedAt + level * 12 * HUB_CYCLE_MS };
    addEvent(`Stadthub: Vertrieb Stufe ${level} im Ausbau (${level * 12} Stunden).`);
    save(); render(); showToast('Ausbau gestartet.');
  }
  function combinePickupHints() {
    if (game.inventory.pickupHints < PRIVATE_PICKUP_HINT_COST) return;
    game.inventory.pickupHints -= PRIVATE_PICKUP_HINT_COST;
    const order = createOrder(game.nextOrder++, { category: 'national', customer: null, kind: 'private' });
    order.status = 'queued';
    order.cargo = 'Privatabholung'; order.icon = '⌖';
    game.orders.push(order);
    addEvent(`${PRIVATE_PICKUP_HINT_COST} Abholhinweise zu Privatabholung ${order.id} kombiniert.`);
    save(); render(); showToast('Privatabholung in Vorräte gelegt.');
  }
  function craftCustomerOrder() {
    const customers = CUSTOMERS.filter(customer => customerUnlocked(customer.id));
    if (!customers.length || game.inventory.companyItems < COMPANY_BALANCE.craftedOrderItems) return false;
    const customer = pick(customers);
    const order = createOrder(game.nextOrder, { category: customer.category, customer: customer.id });
    order.kind = 'normal';
    order.crafted = true;
    order.status = 'queued';
    game.inventory.companyItems -= COMPANY_BALANCE.craftedOrderItems;
    game.nextOrder++;
    game.orders.push(order);
    addEvent(`${customer.name}: Kundenauftrag ${order.id} hergestellt.`);
    save(); render(); showToast('Kundenauftrag in Vorräte gelegt.');
    return true;
  }
  function openCraftedOrderDialog(orderId) {
    const order = game.orders.find(item => item.id === orderId && item.crafted && item.status === 'queued');
    if (!order) return;
    const trucks = eligibleFreeTrucks(order);
    $('#assign-title').textContent = `Kundenauftrag ${order.id}`;
    $('#assign-description').textContent = `${customerById(order.customer).name} · ${categoryById(order.category).label} · ${order.from} → ${order.to} · ${tons(order.volume)} t · ${order.distance} km. Wähle einen passenden freien LKW.`;
    $('#assign-vehicles').innerHTML = trucks.length ? trucks.map(truck => `<button type="button" class="assign-choice" data-choose-crafted="${truck.id}" data-order="${order.id}"><span><strong>${truck.symbol} ${truck.model} · ${truck.id}</strong><small>${tons(truck.capacity)} t pro Tour · ${duration(orderDuration(order, truck))}</small></span><span>Auftrag zuweisen ↗</span></button>`).join('') : '<p>Derzeit ist kein geeigneter LKW frei.</p>';
    $('#assign-dialog').showModal();
  }
  function assignCraftedOrder(orderId, truckId) {
    const order = game.orders.find(item => item.id === orderId && item.crafted && item.status === 'queued');
    const truck = order && eligibleFreeTrucks(order).find(item => item.id === truckId);
    if (!truck) return false;
    order.status = 'active'; order.truckId = truck.id; order.tripStartAt = Date.now();
    order.tripCargo = Math.min(truck.capacity, order.volume);
    addEvent(`${truck.id} startet Kundenauftrag ${order.id}.`);
    save(); $('#assign-dialog').close(); render(); return true;
  }
  function openPrivatePickupDialog(orderId) {
    const order = game.orders.find(item => item.id === orderId && item.kind === 'private' && item.status === 'queued');
    if (!order) return;
    const trucks = eligibleFreeTrucks(order);
    $('#assign-title').textContent = `Privatabholung ${order.id}`;
    $('#assign-description').textContent = `${order.from} → ${order.to} · ${tons(order.volume)} t · ${order.distance} km. Lieferantenkontakte als Abschlussbeute.`;
    $('#assign-vehicles').innerHTML = trucks.length ? trucks.map(truck => `<button type="button" class="assign-choice" data-choose-private="${truck.id}" data-order="${order.id}"><span class="assign-choice-top"><span><strong>${truck.symbol} ${truck.model} · ${truck.id}</strong><small>${tons(truck.capacity)} t pro Tour · ${duration(orderDuration(order, truck))}</small></span><strong class="assign-choice-profit">${signedMoney(estimatedProfit(order, truck))}</strong></span></button>`).join('') : '<p>Derzeit ist kein geeigneter LKW frei.</p>';
    $('#assign-dialog').showModal();
  }
  function assignPrivatePickup(orderId, truckId) {
    const order = game.orders.find(item => item.id === orderId && item.kind === 'private' && item.status === 'queued');
    const truck = order && eligibleFreeTrucks(order).find(item => item.id === truckId);
    if (!truck) return;
    order.status = 'active'; order.truckId = truck.id; order.tripStartAt = Date.now();
    order.tripCargo = Math.min(truck.capacity, order.volume);
    addEvent(`${truck.id} startet Privatabholung ${order.id}.`);
    save(); $('#assign-dialog').close(); render();
  }
  function operatingCostPerKm(truck) { const company = companyFor(); return TRUCKS[truck.tier].emptyCostPerKm - (company.departments.workshop ? company.workshopLevel : 0) * .001; }
  function vehicleCostRange() {
    const trucks = game.trucks.length ? game.trucks : TRUCKS.map((_, tier) => ({ tier }));
    const costs = trucks.map(operatingCostPerKm);
    const low = Math.min(...costs), high = Math.max(...costs);
    return `${rateMoney(low)}${low === high ? '' : `–${rateMoney(high)}`} M/km`;
  }
  function offerLimit() { const company = companyFor(); return BASE_OFFERS + (company.departments.dispatch ? company.offerLevel || 0 : 0); }
  function offerUpgradeCost() { return 500 * ((companyFor().offerLevel || 0) + 1); }
  function workshopUpgradeCost() { return 100 * Math.ceil((companyFor().workshopLevel + 1) / 5); }
  function salesUpgradeCost() { return 500 * (companyFor().salesLevel + 1); }
  function transportUpgradeCost(category, kind) {
    const limits = TRANSPORT_UPGRADE_LIMITS[category];
    if (!limits || !Object.hasOwn(limits, kind)) return null;
    const level = companyFor().transportUpgrades[category][`${kind}Level`];
    if (level >= limits[kind]) return null;
    return { items: COMPANY_BALANCE.transportUpgradeItems(level + 1), coins: COMPANY_BALANCE.transportUpgradeCoins(kind, level + 1) };
  }
  function upgradeTransport(category, kind) {
    const cost = transportUpgradeCost(category, kind);
    if (!cost || game.inventory.companyItems < cost.items || game.coins < cost.coins) return false;
    game.inventory.companyItems -= cost.items;
    game.coins = round2(game.coins - cost.coins);
    game.stats.transportUpgradeSpent = (game.stats.transportUpgradeSpent || 0) + cost.coins;
    companyFor().transportUpgrades[category][`${kind}Level`]++;
    addEvent(`${categoryById(category).label}: ${kind === 'premium' ? 'Prämie' : kind === 'volume' ? 'Menge' : 'Reichweite'} ausgebaut.`);
    save(); render(); return true;
  }
  function pinnedOrders() { return game.orders.filter(order => order.status === 'available' && ['national', 'international'].includes(order.category) && order.pinned); }
  function pinLimit() { return 1 + (companyFor().salesLevel || 0); }
  function unlockDepartment(id) {
    const price = id === 'dispatch' ? DISPATCH_UNLOCK_PRICE : id === 'workshop' ? WORKSHOP_UNLOCK_PRICE : id === 'sales' ? SALES_UNLOCK_PRICE : null;
    if (price === null || companyFor().departments[id] || game.coins < price) return;
    game.coins = round2(game.coins - price);
    game.stats.departmentSpent += price;
    companyFor().departments[id] = true;
    const name = DEPARTMENTS.find(department => department.id === id).name;
    addEvent(`${name} für ${money(price)} M eröffnet.`);
    save(); render(); showToast(`${name} freigeschaltet.`);
  }
  function upgradeSales() {
    if (!companyFor().departments.sales || companyFor().salesLevel >= MAX_SALES_LEVEL) return;
    const cost = salesUpgradeCost();
    const items = COMPANY_BALANCE.upgradeItems(companyFor().salesLevel + 1);
    if (game.coins < cost || game.inventory.companyItems < items) return;
    game.coins = round2(game.coins - cost);
    game.inventory.companyItems -= items;
    game.stats.salesUpgradeSpent += cost;
    companyFor().salesLevel++;
    addEvent(`Vertrieb Stufe ${companyFor().salesLevel}: ${pinLimit()} Aufträge gleichzeitig haltbar.`);
    save(); render(); showToast(`${pinLimit()} Aufträge kannst du jetzt gleichzeitig halten.`);
  }
  function toggleOrderPin(orderId) {
    const order = game.orders.find(o => o.id === orderId && o.status === 'available' && ['national', 'international'].includes(o.category));
    if (!order) return false;
    if (!order.pinned && pinnedOrders().length >= pinLimit()) {
      showToast(`Du kannst nur ${pinLimit()} ${pinLimit() === 1 ? 'Auftrag' : 'Aufträge'} halten.`);
      return false;
    }
    order.pinned = !order.pinned;
    addEvent(`${order.id} ${order.pinned ? 'gehalten' : 'freigegeben'}.`);
    save(); render(); showToast(order.pinned ? `${order.id} bleibt bei Angebotswechseln erhalten.` : `${order.id} ist wieder frei.`);
    return true;
  }
  function upgradeWorkshop() {
    if (!companyFor().departments.workshop || companyFor().workshopLevel >= MAX_WORKSHOP_LEVEL) return;
    const cost = workshopUpgradeCost();
    const items = COMPANY_BALANCE.upgradeItems(companyFor().workshopLevel + 1);
    if (game.coins < cost || game.inventory.companyItems < items) return;
    game.coins = round2(game.coins - cost);
    game.inventory.companyItems -= items;
    game.stats.workshopUpgradeSpent += cost;
    companyFor().workshopLevel++;
    addEvent(`Werkstatt Stufe ${companyFor().workshopLevel}: −${rateMoney(companyFor().workshopLevel * .001)} M/km für jeden LKW.`);
    save(); render(); showToast(`Werkstatt-Rabatt: ${rateMoney(companyFor().workshopLevel * .001)} M/km.`);
  }
  function upgradeOfferLimit() {
    if (!companyFor().departments.dispatch) return;
    const currentLevel = companyFor().offerLevel || 0;
    if (currentLevel >= MAX_OFFER_LEVEL) return;
    const cost = offerUpgradeCost();
    const items = COMPANY_BALANCE.upgradeItems(currentLevel + 1);
    if (game.coins < cost || game.inventory.companyItems < items) return;
    game.coins = round2(game.coins - cost);
    game.inventory.companyItems -= items;
    game.stats.offerUpgradeSpent += cost;
    companyFor().offerLevel = currentLevel + 1;
    replenishOrders();
    addEvent(`Disposition: Stufe ${currentLevel + 1} · ${offerLimit()} verfügbare Aufträge.`);
    save(); render(); showToast(`Jetzt ${offerLimit()} verfügbare Aufträge.`);
  }
  function freeTrucks() { return game.trucks.filter(t => !t.hubAssigned && !game.orders.some(o => o.status === 'active' && o.truckId === t.id) && !game.expedition.missions.some(m => m.status === 'active' && m.truckId === t.id)); }
  function customerById(id) { return CUSTOMERS.find(c => c.id === id); }
  function customerUnlocked(id, state = game) {
    const regionIndex = EXPEDITION_CUSTOMER_IDS.indexOf(id);
    return regionIndex >= 0 && Boolean(state?.expedition?.regions[regionIndex]?.customerUnlocked);
  }
  function categoryById(id) { return CATEGORIES.find(c => c.id === id) || CATEGORIES[0]; }
  function canTruckTakeOrder(truck, order) { return !truck.hubAssigned && categoryById(order.category).tiers.includes(truck.tier); }
  function eligibleFreeTrucks(order) { return freeTrucks().filter(t => canTruckTakeOrder(t, order)); }
  function truckSpeed(truck, cargo = 0) {
    const rarity = Number.isInteger(truck.rarityLevel) ? clamp(truck.rarityLevel, 0, MAX_RARITY_LEVEL) : 0;
    return SPEED_KM_PER_SECOND * (1 + rarity * RARITY_SPEED_PER_LEVEL) * (1 - cargo * SPEED_LOSS_PER_TON);
  }
  function speedLabel(speed) { return `${rateMoney(speed)} km/s`; }
  function truckRarity(truck) {
    const total = Number.isInteger(truck.rarityLevel) ? clamp(truck.rarityLevel, 0, MAX_RARITY_LEVEL) : 0;
    const rarity = RARITIES[Math.min(Math.floor(total / 10), RARITIES.length - 1)];
    return { ...rarity, level: total === MAX_RARITY_LEVEL ? 10 : total % 10, total };
  }
  function rarityBadge(truck) {
    const rarity = truckRarity(truck);
    return `<span class="rarity-badge rarity-${rarity.id}" aria-label="${rarity.label}, Stufe ${rarity.level} von 10"><strong>${rarity.level} ★</strong><small>${rarity.label}</small></span>`;
  }
  function tripSeconds(order, truck, cargo) { return order.distance / truckSpeed(truck, cargo); }
  function hasReturnLeg(order) { return order.routeType === 'single' || order.routeType === 'dual'; }
  function paidLegs(order) { return order.routeType === 'dual' ? 2 : 1; }
  function completionPremium(order) {
    if (order.kind === 'private') return 0;
    const rules = transportRules(order.category);
    return round2(order.volume * paidLegs(order) * (rules?.premiumPerTon || BASE_COMPLETION_PREMIUM_PER_TON) * (1 + (rules?.premiumBonus || 0)));
  }
  function drivenLegs(order) { return hasReturnLeg(order) ? 2 : 1; }
  function tourSeconds(order, truck, cargo) {
    const outward = tripSeconds(order, truck, cargo);
    if (order.routeType === 'dual') return outward * 2;
    return outward + (order.routeType === 'single' ? tripSeconds(order, truck, 0) : 0);
  }
  function routeTypeLabel(order) { return order.routeType === 'single' ? 'Single Way' : order.routeType === 'dual' ? 'Dual Way' : ''; }
  function freightRevenue(order) {
    const paySkill = order.customer ? customerSkillLevels(order.customer).pay : 0;
    return round2(order.volume * paidLegs(order) * order.distance * FREIGHT_PAY_PER_TON_KM * (1 + paySkill * .001));
  }
  function tourEconomics(order, truck, cargo, deliveredBefore) {
    const paidTons = paidLegs(order);
    const paySkill = order.customer ? customerSkillLevels(order.customer).pay : 0;
    const freightRate = order.distance * FREIGHT_PAY_PER_TON_KM * (1 + paySkill * .001);
    const revenue = round2((deliveredBefore + cargo) * paidTons * freightRate) - round2(deliveredBefore * paidTons * freightRate);
    const loadedCost = round2((deliveredBefore + cargo) * paidTons * order.distance * LOAD_COST_PER_TON_KM) - round2(deliveredBefore * paidTons * order.distance * LOAD_COST_PER_TON_KM);
    const distanceCost = round2(order.distance * drivenLegs(order) * operatingCostPerKm(truck));
    return { revenue: round2(revenue), loadedCost: round2(loadedCost), distanceCost, cost: round2(loadedCost + distanceCost) };
  }
  function orderEconomics(order, truck) {
    let delivered = 0;
    const total = { revenue: 0, loadedCost: 0, distanceCost: 0, cost: 0, trips: 0 };
    while (delivered < order.volume) {
      const cargo = Math.min(truck.capacity, order.volume - delivered);
      const tour = tourEconomics(order, truck, cargo, delivered);
      for (const key of ['revenue', 'loadedCost', 'distanceCost', 'cost']) total[key] = round2(total[key] + tour[key]);
      total.trips++;
      delivered += cargo;
    }
    total.bonus = completionPremium(order);
    total.transportProfit = round2(total.revenue - total.cost);
    total.totalProfit = round2(total.transportProfit + total.bonus);
    return total;
  }
  function estimatedProfit(order, truck) { return orderEconomics(order, truck).totalProfit; }
  function rankGearCost(truck) {
    const current = truckRarity(truck);
    return current.total >= MAX_RARITY_LEVEL ? Infinity : RANK_GEAR_COSTS[current.id][current.level];
  }
  function saleGearRefund(truck) {
    const refund = {};
    RARITIES.forEach((rarity, index) => {
      const levels = Math.max(0, Math.min(10, (truck.rarityLevel || 0) - index * 10));
      const invested = RANK_GEAR_COSTS[rarity.id].slice(0, levels).reduce((sum, cost) => sum + cost, 0);
      refund[rarity.id] = Math.floor(invested / 2);
    });
    return refund;
  }
  function saleQuote(truck) {
    const km = Math.max(0, Number(truck.kmDriven) || 0);
    const rate = .95 - .8 * Math.min(km, 500000) / 500000;
    const price = Number.isFinite(truck.purchasePrice) ? truck.purchasePrice : TRUCKS[truck.tier].price;
    return { coins: round2(price * rate), gears: saleGearRefund(truck), modulesLost: truck.moduleCapacitySpent ?? (truck.moduleCapacityLevel || 0) };
  }
  function saleBlockReason(truck) {
    if (!truck) return 'Fahrzeug nicht gefunden.';
    if (truck.cardId) return 'Fahrzeugkarten können nicht verkauft werden.';
    if (game.orders.some(order => order.status === 'active' && order.truckId === truck.id) || game.expedition.missions.some(m => m.status === 'active' && m.truckId === truck.id)) return 'Ein laufender Auftrag muss zuerst abgeschlossen werden.';
    if (truck.tier >= 2 && regularTruckCount() <= 1) return 'Mindestens ein regulärer Auftrags-LKW muss bleiben.';
    return null;
  }
  function openSaleDialog(truckId) {
    const truck = truckById(truckId);
    const reason = saleBlockReason(truck);
    if (reason) { showToast(reason); return false; }
    if (truck.hubAssigned) settleHub(Date.now());
    const quote = saleQuote(truck);
    pendingSaleTruckId = truckId;
    pendingSaleQuote = quote;
    $('#sale-dialog-title').textContent = `${truck.model} · ${truck.id} verkaufen?`;
    $('#sale-dialog-content').innerHTML = `<p>Dieser Verkauf entfernt das Fahrzeug endgültig und gibt seinen Fahrzeugplatz frei.</p><div class="sale-summary"><div><span>Münzerlös</span><strong>+${money(quote.coins)} M</strong></div>${RARITIES.map(rarity => `<div><span>${rarity.label}-Zahnräder</span><strong>+${integer(quote.gears[rarity.id])}</strong></div>`).join('')}<div><span>Kapazitätsmodule verloren</span><strong>${integer(quote.modulesLost)}</strong></div></div><p>Die Zahnrad-Rückgabe beträgt 50 % der je Seltenheit insgesamt investierten Zahnräder, auf ganze Zahnräder abgerundet. Rang und Ausbauten gehen verloren.</p>`;
    $('#truck-dialog').close();
    $('#sale-dialog').showModal();
    return true;
  }
  function confirmSale() {
    const truck = truckById(pendingSaleTruckId);
    if (saleBlockReason(truck)) { $('#sale-dialog').close(); return false; }
    if (truck.hubAssigned) settleHub(Date.now());
    const quote = saleQuote(truck);
    if (JSON.stringify(quote) !== JSON.stringify(pendingSaleQuote)) {
      pendingSaleQuote = quote;
      $('#sale-dialog-content').innerHTML = `<p>Die Fahrleistung hat sich seit der Vorschau geändert. Bitte den aktualisierten Verkauf erneut öffnen.</p>`;
      $('#sale-dialog').close();
      showToast('Fahrzeugdaten geändert. Verkaufsvorschau bitte erneut öffnen.');
      return false;
    }
    game.coins = round2(game.coins + quote.coins);
    for (const rarity of RARITIES) game.inventory.gears[rarity.id] += quote.gears[rarity.id];
    game.trucks.splice(game.trucks.indexOf(truck), 1);
    if (truck.hubAssigned) {
      const h = hub();
      h.nextCycleAt = Date.now() + HUB_CYCLE_MS;
      beginHubCycle(h);
    }
    addEvent(`${truck.model} (${truck.id}) für ${money(quote.coins)} M verkauft.`);
    pendingSaleTruckId = null;
    pendingSaleQuote = null;
    $('#sale-dialog').close();
    save(); render(); showToast(`${truck.model} verkauft.`);
    return true;
  }
  function rewardGearRows(reward) {
    return RARITIES.map(rarity => ({ rarity, count: reward.gears?.[rarity.id] || 0 })).filter(row => row.count > 0);
  }
  function rollGearLoot(order) {
    if (order.kind === 'private') return {};
    const gears = {};
    const tonKm = Math.max(0, order.distance * order.volume);
    const rollBlocks = (size, chances) => {
      const full = Math.floor(tonKm / size);
      const remainder = tonKm % size;
      let total = 0;
      for (let i = 0; i < full + (remainder > 0 ? 1 : 0); i++) {
        if (i === full && Math.random() >= remainder / size) continue;
        const roll = Math.random();
        if (roll < chances[0]) total++;
        else if (roll < chances[1]) total += 2;
      }
      return total;
    };
    gears.common = rollBlocks(100, [.4, .6]);
    gears.uncommon = rollBlocks(1000, [.18, .25]);
    if (order.customer) gears.rare = rollBlocks(1000, [.08, .08]);
    const table = GEAR_LOOT[order.kind];
    if (table) {
      if (table.epic && Math.random() < table.epic[0]) gears.epic = random(table.epic[1], table.epic[2]);
      if (table.legendary) gears.legendary = table.legendary[0] + (Math.random() < table.legendary[2] ? 1 : 0);
    }
    return Object.fromEntries(Object.entries(gears).filter(([, amount]) => amount > 0));
  }
  function companyItemProgress(order, previous = game.inventory.companyItemTkmRemainder || 0) {
    if (order.kind !== 'normal' || !TRANSPORT_BASE[order.category]) return { items: 0, remainder: previous };
    const delivered = Math.min(order.volume, order.delivered ?? order.volume);
    const loadedTonKm = Math.max(0, order.distance * delivered * paidLegs(order));
    const total = previous + loadedTonKm;
    return { items: Math.floor(total / COMPANY_BALANCE.tkmPerItem), remainder: total % COMPANY_BALANCE.tkmPerItem };
  }
  function makeCompletionReward(order, companyItems = 0) {
    const rules = SPECIAL_CHANCES[order.category];
    const moduleChance = order.kind === 'special' ? rules?.module : order.kind === 'referral' ? rules?.referralModule : 0;
    return { coins: completionPremium(order), premiumPerTon: order.kind === 'private' ? 0 : BASE_COMPLETION_PREMIUM_PER_TON, premiumBonus: transportRules(order.category)?.premiumBonus || 0, gears: rollGearLoot(order), companyItems, capacityModule: Boolean(moduleChance && Math.random() < moduleChance), supplierContacts: order.kind === 'private' ? 1 + (Math.random() < .2 ? 1 : 0) : 0, claimedAt: null };
  }
  function queueCustomerTrip(source, kind) {
    const order = createOrder(game.nextOrder++, { category: source.category, customer: source.customer, startCity: source.homeCity, kind });
    const region = Number.isInteger(source.region) ? source.region : Math.max(0, EXPEDITION_CUSTOMER_IDS.indexOf(source.customer));
    const names = kind === 'referral'
      ? ['Großprojekt Hafenverbund', 'Großprojekt Versorgungskette', 'Großprojekt Industrieanlage', 'Großprojekt Fernkorridor', 'Großprojekt Kontinentalnetz']
      : ['Großauftrag Stadtversorgung', 'Großauftrag Baustellenlogistik', 'Großauftrag Materialbergung', 'Großauftrag Ferntransport', 'Großauftrag Handelsroute'];
    order.projectName = names[region];
    order.projectRegion = region;
    order.volume = (kind === 'referral' ? 1100 : 400) + region * (kind === 'referral' ? 140 : 60);
    order.baseVolume = order.volume;
    order.distance = (kind === 'referral' ? 240 : 120) + region * (kind === 'referral' ? 40 : 25);
    order.routeType = 'single';
    order.deadlineMs = PROJECT_DEADLINES[kind];
    order.status = 'queued';
    game.orders.push(order);
    addEvent(`${customerById(source.customer).name}: ${kind === 'special' ? 'Sonderfahrt' : 'Empfehlungsfahrt'} ${order.id} erhalten.`);
    return order;
  }
  function projectFleetVehicles(template) {
    const ids = fleetTemplate(template);
    if (!ids || !ids.some(Boolean) || new Set(ids.filter(Boolean)).size !== ids.filter(Boolean).length) return null;
    const vehicles = ids.filter(Boolean).map(cardId => {
      const card = vehicleCardById(cardId);
      if (!card || !game.expedition.characters[cardId]) return null;
      const truck = game.trucks.find(item => item.cardId === cardId) || game.expedition.characters[cardId].parkedTruck;
      return { ...truck || createCardTruck(card), cardId };
    });
    return vehicles.some(vehicle => !vehicle) ? null : vehicles;
  }
  function fillProjectTrips(order, at) {
    const project = order.project;
    let remaining = Math.max(0, order.volume - order.delivered - project.vehicles.reduce((sum, vehicle) => sum + (vehicle.cargo || 0), 0));
    for (const vehicle of project.vehicles) {
      if (vehicle.cargo || remaining <= 0) continue;
      vehicle.cargo = Math.min(vehicle.capacity, remaining);
      remaining -= vehicle.cargo;
      vehicle.nextAt = at + tourSeconds(order, vehicle, vehicle.cargo) * 1000;
    }
  }
  function projectEstimatedEnd(order, now = Date.now()) {
    const copy = { ...order, project: { ...order.project, vehicles: order.project.vehicles.map(vehicle => ({ ...vehicle })) } };
    let guard = 0;
    while (copy.delivered < copy.volume && guard++ < 10000) {
      fillProjectTrips(copy, now);
      const next = copy.project.vehicles.filter(vehicle => vehicle.cargo).sort((a, b) => a.nextAt - b.nextAt)[0];
      if (!next) return Infinity;
      now = next.nextAt;
      copy.delivered += Math.min(next.cargo, copy.volume - copy.delivered);
      next.cargo = 0;
    }
    return now;
  }
  function startFleetProject(orderId, template, now = Date.now()) {
    const order = game.orders.find(item => item.id === orderId && item.status === 'queued' && PROJECT_DEADLINES[item.kind]);
    const vehicles = projectFleetVehicles(template);
    if (!order || !vehicles) return false;
    order.status = 'active';
    order.project = { template, startedAt: now, deadlineAt: now + order.deadlineMs, vehicles: vehicles.map(vehicle => ({ ...vehicle, cargo: 0, nextAt: null })) };
    fillProjectTrips(order, now);
    addEvent(`${order.projectName} ${order.id} mit Flotte ${template + 1} gestartet.`);
    save(); render(); return true;
  }
  function finishFleetProject(order, at) {
    order.status = 'completed'; order.completedAt = at;
    order.project.vehicles.forEach(vehicle => { vehicle.cargo = 0; vehicle.nextAt = null; });
    for (const vehicle of order.project.vehicles) {
      const record = game.trucks.find(item => item.cardId === vehicle.cardId) || game.expedition.characters[vehicle.cardId]?.parkedTruck;
      if (record) record.ordersCompleted = (record.ordersCompleted || 0) + 1;
    }
    order.completionReward = makeCompletionReward(order);
    if (order.customer) {
      game.customerTrust[order.customer] = (game.customerTrust[order.customer] || 0) + (TRUST_REWARDS[order.kind] || 0);
      if (order.kind === 'special' && Math.random() < customerTripChance(order, 'referral')) queueCustomerTrip(order, 'referral');
    }
    game.completed++;
    addEvent(`${order.projectName} ${order.id} abgeschlossen. Belohnung bereit.`);
  }
  function settleFleetProjects(now = Date.now()) {
    let changed = false;
    for (const order of game.orders) {
      if (order.status !== 'active' || !order.project) continue;
      const deadline = order.project.deadlineAt;
      while (order.status === 'active') {
        const vehicle = order.project.vehicles.filter(item => item.cargo).sort((a, b) => a.nextAt - b.nextAt)[0];
        if (!vehicle || vehicle.nextAt > Math.min(now, deadline)) break;
        const at = vehicle.nextAt;
        const cargo = Math.min(vehicle.cargo, order.volume - order.delivered);
        const { revenue, cost } = tourEconomics(order, vehicle, cargo, order.delivered);
        game.coins = round2(game.coins + revenue - cost);
        game.stats.grossRevenue = round2(game.stats.grossRevenue + revenue);
        game.stats.operatingCosts = round2(game.stats.operatingCosts + cost);
        vehicle.cargo = 0; vehicle.nextAt = null;
        order.delivered += cargo;
        const parked = game.trucks.find(item => item.cardId === vehicle.cardId) || game.expedition.characters[vehicle.cardId]?.parkedTruck;
        if (parked) { parked.kmDriven = (parked.kmDriven || 0) + order.distance * 2; parked.toursCompleted = (parked.toursCompleted || 0) + 1; }
        game.stats.trips++;
        game.stats.tons += cargo;
        game.stats.km += order.distance * 2;
        game.stats.tonKm += cargo * order.distance;
        const oldLevel = levelForXp(game.xp, game).level;
        game.xp = round2(game.xp + cargo);
        const newLevel = levelForXp(game.xp, game).level;
        if (newLevel > oldLevel) {
          game.expedition.points += 50 * (newLevel - oldLevel);
          for (let level = oldLevel + 1; level <= newLevel; level++) game.pendingLevelUps.push(level);
        }
        changed = true;
        if (order.delivered >= order.volume) { finishFleetProject(order, at); break; }
        fillProjectTrips(order, at);
      }
      if (order.status === 'active' && now >= deadline) {
        order.status = 'failed'; order.project.vehicles.forEach(vehicle => { vehicle.cargo = 0; vehicle.nextAt = null; });
        addEvent(`${order.projectName} ${order.id}: Frist abgelaufen.`);
        changed = true;
      }
    }
    if (changed) save();
    return changed;
  }
  function spendOvertime(orderId, amount, now = Date.now()) {
    if (![1, 5, 10].includes(amount)) return false;
    const order = game.orders.find(item => item.id === orderId && item.status === 'active' && item.project);
    if (!order) return false;
    settleFleetProjects(now);
    if (order.status !== 'active' || now >= order.project.deadlineAt) return false;
    regenerateOvertime(now);
    if (game.overtimePoints < amount) return false;
    game.overtimePoints -= amount;
    let delivered = 0;
    let bonusHits = 0;
    for (let i = 0; i < amount; i++) { const hit = Math.random() < .01; delivered += hit ? 11 : 10; if (hit) bonusHits++; }
    order.delivered = Math.min(order.volume, order.delivered + delivered);
    if (order.delivered >= order.volume) finishFleetProject(order, now);
    addEvent(`${amount} Überstundenpunkte: ${tons(delivered)} t sofort geliefert${bonusHits ? ` · ${bonusHits} Bonus` : ''}.`);
    save(); render(); return true;
  }
  function orderDuration(order, truck) {
    let remaining = order.volume - order.delivered;
    let seconds = 0;
    while (remaining > 0) {
      const cargo = Math.min(truck.capacity, remaining);
      seconds += tourSeconds(order, truck, cargo);
      remaining -= cargo;
    }
    return seconds;
  }
  function remainingOrderSeconds(order, truck, now = Date.now()) {
    if (!order || order.status !== 'active') return 0;
    let remaining = Math.max(0, order.volume - order.delivered);
    if (!remaining) return 0;
    const currentCargo = Math.min(order.tripCargo ?? truck.capacity, remaining);
    let seconds = tourSeconds(order, truck, currentCargo);
    remaining -= currentCargo;
    while (remaining > 0) {
      const cargo = Math.min(truck.capacity, remaining);
      seconds += tourSeconds(order, truck, cargo);
      remaining -= cargo;
    }
    return Math.max(0, seconds - (now - (order.tripStartAt ?? now)) / 1000);
  }
  function countdown(seconds) {
    const total = Math.max(0, Math.ceil(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total % 3600 / 60);
    const remainder = total % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }
  function duration(seconds) {
    const s = Math.max(0, Math.ceil(seconds));
    if (s < 60) return `${s} Sek.`;
    const m = Math.floor(s / 60), rem = s % 60;
    return rem ? `${m} Min. ${rem} Sek.` : `${m} Min.`;
  }
  function estimatedProfitPerMinute(order, truck) {
    return estimatedProfit(order, truck) * 60 / orderDuration(order, truck);
  }

  function settleTrips(now) {
    let changed = false;
    for (const order of game.orders) {
      if (order.status !== 'active' || order.project) continue;
      const truck = truckById(order.truckId);
      if (!truck) { order.status = order.kind === 'normal' && !order.crafted ? 'available' : 'queued'; order.truckId = null; order.tripStartAt = null; changed = true; continue; }
      while (order.status === 'active') {
        const cargo = order.tripCargo ?? Math.min(truck.capacity, order.volume - order.delivered);
        const tripMs = tourSeconds(order, truck, cargo) * 1000;
        if (now - order.tripStartAt < tripMs) break;
        const loadedCargo = cargo * paidLegs(order);
        const beforeLevel = levelForXp(game.xp, game).level;
        const { revenue, cost } = tourEconomics(order, truck, cargo, order.delivered);
        const earnedXp = loadedCargo;
        game.coins = round2(game.coins + revenue - cost);
        game.xp = round2(game.xp + earnedXp);
        game.stats.trips++;
        game.stats.tons += loadedCargo;
        game.stats.km += order.distance * drivenLegs(order);
        truck.kmDriven = (truck.kmDriven || 0) + order.distance * drivenLegs(order);
        truck.toursCompleted = (truck.toursCompleted || 0) + 1;
        game.stats.tonKm += loadedCargo * order.distance;
        game.stats.grossRevenue = round2(game.stats.grossRevenue + revenue);
        game.stats.operatingCosts = round2(game.stats.operatingCosts + cost);
        order.delivered += cargo;
        order.tripStartAt += tripMs;
        order.tripCargo = Math.min(truck.capacity, order.volume - order.delivered);
        changed = true;
        if (levelForXp(game.xp, game).level > beforeLevel) {
          const levels = levelForXp(game.xp, game).level - beforeLevel;
          game.expedition.points += 50 * levels;
          game.pendingLevelUps ||= [];
          for (let level = beforeLevel + 1; level <= beforeLevel + levels; level++) game.pendingLevelUps.push(level);
          addEvent(`Level ${levelForXp(game.xp, game).level} erreicht! +${50 * levels} Expeditionspunkte und ${5 * levels} frei verteilbare Punkte.`);
        }
        if (order.delivered >= order.volume) {
          order.status = 'completed'; order.completedAt = order.tripStartAt; order.tripStartAt = null; order.tripCargo = null;
          if (order.customer && !order.trustAwarded) {
            const oldLevel = customerLevel(game.customerTrust[order.customer] || 0);
            game.customerTrust[order.customer] = (game.customerTrust[order.customer] || 0) + (TRUST_REWARDS[order.kind] || 0);
            order.trustAwarded = true;
            const newLevel = customerLevel(game.customerTrust[order.customer]);
            if (newLevel > oldLevel) addEvent(`${customerById(order.customer).name}: Vertrauenslevel ${newLevel} erreicht.`);
          }
          const itemProgress = companyItemProgress(order);
          game.inventory.companyItemTkmRemainder = itemProgress.remainder;
          order.completionReward = makeCompletionReward(order, itemProgress.items);
          const rules = SPECIAL_CHANCES[order.category];
          if (rules && order.customer && order.kind === 'normal' && Math.random() < customerTripChance(order, 'award')) queueCustomerTrip(order, 'special');
          if (rules && order.customer && order.kind === 'special' && Math.random() < customerTripChance(order, 'referral')) queueCustomerTrip(order, 'referral');
          game.completed++;
          truck.ordersCompleted = (truck.ordersCompleted || 0) + 1;
          addEvent(`${order.cargo} nach ${order.to} geliefert · ${order.volume} t abgeschlossen.`);
          showToast(`Auftrag ${order.id} abgeschlossen! LKW ist wieder frei.`);
        }
      }
    }
    if (changed) { replenishOrders(); save(); }
    return changed;
  }

  function applyOrderReward(order) {
    const reward = order?.completionReward;
    if (order?.status !== 'completed' || !reward || reward.claimedAt) return false;
    reward.claimedAt = Date.now();
    game.coins = round2(game.coins + reward.coins);
    game.stats.contractBonusRevenue = round2(game.stats.contractBonusRevenue + reward.coins);
    for (const { rarity, count } of rewardGearRows(reward)) game.inventory.gears[rarity.id] += count;
    game.inventory.companyItems = (game.inventory.companyItems || 0) + (reward.companyItems || 0);
    if (reward.capacityModule) game.inventory.capacityModules++;
    if (reward.supplierContacts) game.inventory.supplierContacts += reward.supplierContacts;
    return true;
  }

  function claimOrderReward(orderId) {
    const order = game.orders.find(item => item.id === orderId && item.status === 'completed');
    const reward = order?.completionReward;
    if (!reward) return;
    const newlyClaimed = applyOrderReward(order);
    if (newlyClaimed) {
      addEvent(order.kind === 'private' ? `${order.id}: ${reward.supplierContacts} Lieferantenkontakte abgeholt.` : `${order.id}: Auftragsprämie ${money(reward.coins)} M und ${rewardGearRows(reward).reduce((sum, row) => sum + row.count, 0)} Zahnräder abgeholt.`);
      save(); render();
    }
    $('#reward-dialog-title').textContent = `${order.cargo} · ${order.id}`;
    $('#reward-dialog-content').innerHTML = `<p class="reward-summary">${order.kind === 'private' ? 'Privatabholung' : categoryById(order.category).label} · ${order.volume * paidLegs(order)} t transportiert</p>${reward.coins ? `<div class="reward-result"><div class="reward-result-icon">◈</div><div><strong>+${money(reward.coins)} M</strong><span>Auftragsprämie nach Abschluss</span></div></div>` : ''}${rewardGearRows(reward).map(({ rarity, count }) => `<div class="reward-result reward-gear rarity-${rarity.id}"><div class="reward-result-icon">⚙</div><div><strong>+${integer(count)} ${rarity.label}-Zahnräder</strong><span>In deinen Vorräten gelagert</span></div></div>`).join('')}${reward.companyItems ? `<div class="reward-result"><div class="reward-result-icon">▤</div><div><strong>+${integer(reward.companyItems)} Firmenausbau-Items</strong><span>In deinen Vorräten gelagert</span></div></div>` : ''}${reward.capacityModule ? '<div class="reward-result"><div class="reward-result-icon">▣</div><div><strong>+1 Kapazitätsmodul</strong><span>In deinen Vorräten gelagert</span></div></div>' : ''}${reward.supplierContacts ? `<div class="reward-result"><div class="reward-result-icon">⌖</div><div><strong>+${reward.supplierContacts} Lieferantenkontakte</strong><span>Für den Stadthub-Ausbau</span></div></div>` : ''}<p class="reward-claim-state">${newlyClaimed ? 'Prämie abgeholt und gespeichert.' : 'Diese Prämie wurde bereits abgeholt.'}</p>`;
    if (!$('#reward-dialog').open) $('#reward-dialog').showModal();
  }

  function openBulkRewardDialog() {
    const pending = game.orders.filter(order => order.status === 'completed' && order.completionReward && !order.completionReward.claimedAt);
    if (!pending.length) return;
    bulkRewardIds = pending.map(order => order.id);
    const totalCoins = round2(pending.reduce((sum, order) => sum + order.completionReward.coins, 0));
    const gearRows = RARITIES.map(rarity => ({ rarity, count: pending.reduce((sum, order) => sum + (order.completionReward.gears?.[rarity.id] || 0), 0) })).filter(row => row.count);
    const modules = pending.filter(order => order.completionReward.capacityModule).length;
    const contacts = pending.reduce((sum, order) => sum + (order.completionReward.supplierContacts || 0), 0);
    const companyItems = pending.reduce((sum, order) => sum + (order.completionReward.companyItems || 0), 0);
    $('#bulk-reward-content').innerHTML = `<p class="reward-summary">${pending.length} ${pending.length === 1 ? 'Auftragsprämie' : 'Auftragsprämien'} zum Abholen</p>${totalCoins ? `<div class="reward-result"><div class="reward-result-icon">◈</div><div><strong>+${money(totalCoins)} M</strong><span>Auftragsprämien gesamt</span></div></div>` : ''}${gearRows.map(({ rarity, count }) => `<div class="reward-result reward-gear rarity-${rarity.id}"><div class="reward-result-icon">⚙</div><div><strong>${count} × ${rarity.label}-Zahnrad</strong><span>Für deine Vorräte</span></div></div>`).join('')}${companyItems ? `<div class="reward-result"><div class="reward-result-icon">▤</div><div><strong>+${integer(companyItems)} Firmenausbau-Items</strong><span>Für deine Vorräte</span></div></div>` : ''}${modules ? `<div class="reward-result"><div class="reward-result-icon">▣</div><div><strong>${modules} × Kapazitätsmodul</strong><span>Für deine Vorräte</span></div></div>` : ''}${contacts ? `<div class="reward-result"><div class="reward-result-icon">⌖</div><div><strong>${contacts} × Lieferantenkontakt</strong><span>Für deinen Stadthub</span></div></div>` : ''}`;
    $('#bulk-reward-dialog').showModal();
  }

  function confirmBulkRewards() {
    let claimed = 0;
    let totalCoins = 0;
    let totalGears = 0;
    for (const orderId of bulkRewardIds) {
      const order = game.orders.find(item => item.id === orderId);
      if (!applyOrderReward(order)) continue;
      claimed++;
      totalCoins += order.completionReward.coins;
      totalGears += rewardGearRows(order.completionReward).reduce((sum, row) => sum + row.count, 0);
    }
    if (claimed) {
      addEvent(`${claimed} ${claimed === 1 ? 'Auftragsprämie' : 'Auftragsprämien'} gesammelt: ${money(round2(totalCoins))} M${totalGears ? ` und ${totalGears} ${totalGears === 1 ? 'Zahnrad' : 'Zahnräder'}` : ''} abgeholt.`);
      save();
    }
    $('#bulk-reward-dialog').close();
    bulkRewardIds = [];
    if (claimed) render();
  }

  function replenishOrders() {
    if (!game.startCity) return;
    game.orders = game.orders.filter(order => order.status !== 'available' || (order.category !== 'city' && (!order.customer || customerUnlocked(order.customer))));
    const available = () => game.orders.filter(o => o.status === 'available' && o.category !== 'city');
    while (available().length > offerLimit()) {
      const excess = available();
      const removable = excess.find(o => !o.pinned);
      if (!removable) break;
      game.orders = game.orders.filter(o => o !== removable);
    }
    while (available().length < offerLimit()) game.orders.push(createOrder(game.nextOrder++, { category: randomCategory() }));
  }
  function replaceAvailableOffers(categories) {
    game.orders = game.orders.filter(order => order.status !== 'available' || !categories.includes(order.category) || order.pinned);
    replenishOrders();
    if ($('#assign-dialog').open) $('#assign-dialog').close();
  }
  function manualRefreshCost() {
    return MANUAL_REFRESH_BASE_COST * Math.max(1, game.trucks.length) * (1 + game.manualRefreshCount);
  }
  function manualRefreshOrders() {
    const cost = manualRefreshCost();
    if (game.coins < cost) return false;
    replaceAvailableOffers(['national', 'international']);
    game.coins = round2(game.coins - cost);
    game.stats.manualRefreshSpent += cost;
    game.manualRefreshCount++;
    addEvent(`Auftragsbörse manuell erneuert (−${money(cost)} M).`);
    save();
    return true;
  }
  function autoRefreshOrders(now) {
    if (!game.startCity) return false;
    if (now < game.nextAutoRefreshAt) return false;
    const categories = CATEGORIES.filter(category => category.id !== 'city').map(category => category.id);
    replaceAvailableOffers(categories);
    game.manualRefreshCount = 0;
    game.nextAutoRefreshAt += Math.floor((now - game.nextAutoRefreshAt) / AUTO_REFRESH_MS + 1) * AUTO_REFRESH_MS;
    addEvent('Die Auftragsbörse hat alle Angebote automatisch erneuert.');
    save();
    if (currentView === 'orders') showToast('Neue Angebote sind automatisch eingetroffen.');
    return true;
  }
  function buyTruck(modelIndex) {
    if (!Number.isInteger(modelIndex) || modelIndex < 0 || modelIndex > 1) return false;
    const model = TRUCKS[modelIndex];
    if (modelIndex <= 1 && !hub()) { showToast('Eröffne zuerst den Stadthub.'); return; }
    if (modelIndex <= 1 ? cityTruckCount() >= hubCapacity() : regularTruckCount() >= dispatchCapacity()) { showToast('Das Fahrzeuglimit ist erreicht.'); return; }
    if (!model || game.coins < model.price) return;
    const truck = { id: `LKW-${String(game.nextTruck++).padStart(2, '0')}`, tier: modelIndex, model: model.model, capacity: model.capacity, symbol: model.symbol, rarityLevel: 0, hubAssigned: modelIndex <= 1, purchasePrice: model.price, kmDriven: 0, toursCompleted: 0, ordersCompleted: 0 };
    if (modelIndex <= 1) settleHub(Date.now());
    const wasEmpty = modelIndex <= 1 && hubTrucks().length === 0;
    game.coins = round2(game.coins - model.price); game.trucks.push(truck);
    if (modelIndex <= 1 && !wasEmpty) {
      const h = hub();
      truck.hubToursInCycle = Math.floor(clamp((Date.now() - (h.nextCycleAt - HUB_CYCLE_MS)) / (HUB_WORK_SECONDS * 1000), 0, 1) * HUB_WORK_SECONDS / hubTripSeconds(truck));
    }
    if (wasEmpty) { const h = hub(); h.nextCycleAt = Date.now() + HUB_CYCLE_MS; beginHubCycle(h); }
    game.stats.truckSpent += model.price;
    addEvent(`${truck.model} (${truck.id}) gekauft.`); save(); render(); showToast(`${truck.model} gekauft.`);
  }
  function upgradeTruckRarity(truckId) {
    const truck = game.trucks.find(item => item.id === truckId);
    if (!truck) return;
    const current = truckRarity(truck);
    const cost = rankGearCost(truck);
    if (current.total >= MAX_RARITY_LEVEL || game.inventory.gears[current.id] < cost) return;
    game.inventory.gears[current.id] -= cost;
    truck.rarityLevel = current.total + 1;
    const next = truckRarity(truck);
    addEvent(`${truck.id}: ${next.label} ${next.level} ★ erreicht (${integer(cost)} ${current.label}-Zahnräder verbraucht).`);
    save(); render(); showToast(`${truck.id}: ${next.label} ${next.level} ★ erreicht.`);
  }
  function assignOrder(orderId, truckId) {
    const order = game.orders.find(o => o.id === orderId && o.status === 'available' && (!o.customer || customerUnlocked(o.customer)));
    const truck = eligibleFreeTrucks(order || { category: 'city' }).find(t => t.id === truckId);
    if (!order || !truck) return;
    order.status = 'active'; order.pinned = false; order.truckId = truckId; order.tripStartAt = Date.now(); order.tripCargo = Math.min(truck.capacity, order.volume - order.delivered);
    addEvent(`${truck.id} startet ${order.cargo}: ${order.from} → ${order.to}.`);
    replenishOrders();
    save(); $('#assign-dialog').close(); render(); showToast(`${truck.id} ist unterwegs!`);
  }
  function upgradeTruckCapacity(truckId) {
    const truck = truckById(truckId);
    if (!truck) return false;
    const level = truck.moduleCapacityLevel || 0;
    const maximum = TRUCKS[truck.tier]?.maxCapacityLevel ?? 0;
    if (level >= maximum || game.inventory.capacityModules < 1) return false;
    game.inventory.capacityModules--;
    truck.moduleCapacityLevel = level + 1;
    truck.moduleCapacitySpent = (truck.moduleCapacitySpent || 0) + 1;
    truck.capacity = round2((truck.capacity ?? TRUCKS[truck.tier].capacity) + CAPACITY_PER_MODULE);
    addEvent(`${truck.id}: Kapazität auf ${tons(truck.capacity)} t erhöht (1 Kapazitätsmodul).`);
    save(); render(); showToast(`${truck.id}: +0,5 t Kapazität.`);
    return true;
  }

  function setView(view) {
    currentView = view;
    $$('.view').forEach(el => el.classList.toggle('active', el.id === `view-${view}`));
    $$('.nav-link').forEach(el => el.classList.toggle('active', el.dataset.view === view));
    location.hash = view === 'fleet' ? 'garage' : view;
    render();
  }
  function openIdleOrders(categoryId) {
    const category = CATEGORIES.find(item => item.id === categoryId);
    if (!category) return;
    if (!freeTrucks().some(truck => category.tiers.includes(truck.tier))) return;
    setView('orders');
  }
  function orderCustomer(order) { return order.customer ? customerById(order.customer).name : 'Freie Frachtbörse'; }
  function progress(order) { return clamp(order.delivered / order.volume * 100, 0, 100); }

  function renderStats() {
    const level = levelForXp(game.xp, game);
    $('#topbar-coins').textContent = `${money(game.coins)} M`;
    $('#topbar-level').textContent = level.level;
    const expeditionPoints = $('#topbar-expedition-points');
    expeditionPoints.textContent = `${integer(game.expedition.points)} / ${integer(expeditionCapacity())}`;
    expeditionPoints.setAttribute('aria-label', `${integer(game.expedition.points)} von ${integer(expeditionCapacity())} Expeditionspunkten`);
    const overtimePoints = $('#topbar-overtime-points');
    overtimePoints.textContent = `${integer(game.overtimePoints ?? 100)} / ${integer(game.overtimeCapacity ?? 100)}`;
    overtimePoints.setAttribute('aria-label', `${integer(game.overtimePoints ?? 100)} von ${integer(game.overtimeCapacity ?? 100)} Überstundenpunkten`);
    $('#stat-active').textContent = game.orders.filter(o => o.status === 'active').length + game.expedition.missions.filter(m => m.status === 'active').length;
    $('#stat-fleet').textContent = `${game.trucks.length} ${game.trucks.length === 1 ? 'Fahrzeug' : 'Fahrzeuge'} im Fuhrpark`;
    $('#nav-order-count').textContent = game.orders.filter(o => o.status === 'available').length;
  }
  function renderLevelUpDialog() {
    const level = game.pendingLevelUps?.[0];
    if (!level) return;
    const remaining = 5 - levelAllocation.expedition - levelAllocation.overtime;
    $('#level-up-title').textContent = `Herzlichen Glückwunsch zu Level ${level}!`;
    $('#level-up-description').textContent = 'Du erhältst weiterhin 50 Expeditionspunkte. Verteile zusätzlich 5 Punkte dauerhaft auf die beiden Vorräte. Jede Zuweisung erhöht Maximum und aktuellen Vorrat.';
    $('#level-up-allocation').innerHTML = `<p class="level-up-remaining">Noch ${remaining} von 5 Punkten verteilen</p>${[['expedition', 'Expeditionspunkte', game.expedition.points, expeditionCapacity()], ['overtime', 'Überstundenpunkte', game.overtimePoints ?? 100, game.overtimeCapacity ?? 100]].map(([kind, label, current, capacity]) => `<div class="level-up-row"><span><strong>${label}</strong><small>Aktuell ${integer(current)} / ${integer(capacity)} · nach Zuweisung +${levelAllocation[kind]}</small></span><div class="level-up-stepper"><button type="button" data-level-allocate="${kind}:-1" aria-label="${label} um einen Punkt verringern" ${levelAllocation[kind] ? '' : 'disabled'}>−</button><output>${levelAllocation[kind]}</output><button type="button" data-level-allocate="${kind}:1" aria-label="${label} um einen Punkt erhöhen" ${remaining ? '' : 'disabled'}>+</button></div></div>`).join('')}`;
    $('#confirm-level-up').disabled = remaining !== 0;
  }
  function maybeShowLevelUpDialog() {
    if (!game.pendingLevelUps?.length || $('#level-up-dialog').open || document.querySelector('dialog[open]')) return;
    levelAllocation = { expedition: 0, overtime: 0 };
    renderLevelUpDialog();
    $('#level-up-dialog').showModal();
  }
  function adjustLevelAllocation(kind, change) {
    if (!game.pendingLevelUps?.length || !['expedition', 'overtime'].includes(kind) || ![-1, 1].includes(change)) return false;
    const next = levelAllocation[kind] + change;
    if (next < 0 || next + levelAllocation[kind === 'expedition' ? 'overtime' : 'expedition'] > 5) return false;
    levelAllocation[kind] = next;
    renderLevelUpDialog();
    return true;
  }
  function confirmLevelUpAllocation() {
    if (!game.pendingLevelUps?.length || levelAllocation.expedition + levelAllocation.overtime !== 5) return false;
    game.expedition.levelCapacityBonus = (game.expedition.levelCapacityBonus || 0) + levelAllocation.expedition;
    game.expedition.points += levelAllocation.expedition;
    game.overtimeCapacity = (game.overtimeCapacity ?? 100) + levelAllocation.overtime;
    game.overtimePoints = (game.overtimePoints ?? 100) + levelAllocation.overtime;
    const level = game.pendingLevelUps.shift();
    addEvent(`Level ${level}: ${levelAllocation.expedition} Expeditionspunkte und ${levelAllocation.overtime} Überstundenpunkte dauerhaft zugewiesen.`);
    save();
    if ($('#level-up-dialog').open) $('#level-up-dialog').close();
    render();
    maybeShowLevelUpDialog();
    return true;
  }
  function renderDashboard() {
    const home = startCityById(game.startCity);
    $('#stat-headquarters').textContent = home?.city || '–';
    $('#stat-headquarters-country').textContent = home?.country || 'Startort auswählen';
    $('#stat-km-location').textContent = home?.city || 'Startwerte';
    $('#stat-km-cost').textContent = vehicleCostRange();
    $('#stat-km-pay').textContent = `${rateMoney(FREIGHT_PAY_PER_TON_KM)} M`;
    $('#stat-km-balance').textContent = `${rateMoney(LOAD_COST_PER_TON_KM)} M`;
    $('#stat-km-balance-row').className = '';
    const h = hub();
    const fullIn = hubSecondsUntilFull(h, Date.now());
    $('#hub-dashboard-coins').textContent = `${money(h?.cashboxCoins || 0)} M`;
    $('#hub-dashboard-hints').textContent = `${integer(h?.cashboxHints || 0)} Abholhinweise`;
    $('#hub-dashboard-cycles').textContent = `${Math.min(h?.cashboxCycles || 0, HUB_CASHBOX_CYCLES)} / ${HUB_CASHBOX_CYCLES} Stunden`;
    $('#hub-dashboard-timer-label').textContent = !h ? 'Noch nicht eröffnet' : fullIn === 0 ? 'Kassenbestand voll' : fullIn === null ? 'Keine Stadttransporter im Hub' : 'Voll in';
    $('#hub-dashboard-timer').textContent = fullIn === null ? '–' : countdown(fullIn);
    $('#hub-dashboard-collect').hidden = !h;
    $('#hub-dashboard-collect').disabled = !h || !h.cashboxCoins && !h.cashboxHints;
    $('#hub-dashboard-open').hidden = !!h;
    const busyTruckIds = new Set(game.orders.filter(order => order.status === 'active').map(order => order.truckId));
    const idleTrucks = game.trucks.filter(truck => !busyTruckIds.has(truck.id) && !truck.hubAssigned && !game.expedition.missions.some(m => m.status === 'active' && m.truckId === truck.id));
    const idleList = $('#idle-trucks-list');
    const idleSignature = idleTrucks.map(truck => `${truck.id}:${truck.tier}`).join(',');
    if (idleList.dataset.signature !== idleSignature) {
      idleList.innerHTML = idleTrucks.length ? TRUCKS.map((model, tier) => {
        const ofType = idleTrucks.filter(truck => truck.tier === tier);
        if (!ofType.length) return '';
        const links = tier <= 1 ? '<button type="button" class="idle-order-link" data-go="hub">Zum Stadthub ↗</button>' : CATEGORIES.filter(category => category.id !== 'city' && category.tiers.includes(tier)).map(category => `<button type="button" class="idle-order-link" data-idle-orders data-category="${category.id}" aria-label="${category.label} öffnen">${category.label} <span aria-hidden="true">↗</span></button>`).join('');
        return `<section class="idle-type"><div class="idle-type-heading"><span class="idle-type-icon" aria-hidden="true">${model.symbol}</span><h3>${model.model}</h3><strong class="idle-type-count">${ofType.length}</strong></div><div class="idle-branch"><span>${ofType.length} frei</span><div class="idle-order-links">${links}</div></div></section>`;
      }).join('') : `<div class="empty-state"><div class="empty-icon">${game.trucks.length ? '▰' : '🚚'}</div><h3>${game.trucks.length ? 'Alle LKW sind unterwegs' : 'Noch keine LKW vorhanden'}</h3>${game.trucks.length ? '' : '<p>Kaufe deinen ersten LKW beim Händler.</p><button class="button button-primary" data-go="dealer">Zum Händler</button>'}</div>`;
      idleList.dataset.signature = idleSignature;
    }
    const visible = game.orders.filter(order => order.status === 'completed' && order.completionReward && !order.completionReward.claimedAt).sort((a, b) => b.completedAt - a.completedAt);
    $('#collect-all-rewards').disabled = visible.length === 0;
    const completedList = $('#completed-orders-list');
    const listSignature = visible.map(order => `${order.id}:${order.completedAt}:${order.volume}`).join('|');
    if (completedList.dataset.signature !== listSignature) {
      completedList.innerHTML = visible.length ? `<div class="completed-orders-scroll">${visible.map(order => `<button type="button" class="completed-order" data-claim-order="${order.id}"><span class="completed-order-icon">${order.icon}</span><span class="completed-order-main"><strong>${order.cargo} · ${order.id}</strong><small>${order.kind === 'private' ? 'Privatabholung' : categoryById(order.category).label} · ${order.volume * paidLegs(order)} t transportiert · ${new Date(order.completedAt || order.createdAt).toLocaleDateString('de-DE')}</small></span><span class="completed-order-action">${order.kind === 'private' ? `${order.completionReward.supplierContacts} Kontakte abholen` : `Prämie abholen · +${money(order.completionReward.coins)} M`}</span></button>`).join('')}</div>` : '';
      completedList.dataset.signature = listSignature;
    }
  }
  function renderInventory() {
    const privateTrips = game.orders.filter(order => order.kind === 'private' && ['queued', 'active'].includes(order.status));
    const craftedTrips = game.orders.filter(order => order.crafted && ['queued', 'active'].includes(order.status));
    const materials = [
      { name: 'Firmenausbau-Items', icon: '▤', amount: game.inventory.companyItems || 0, detail: `${integer(game.inventory.companyItemTkmRemainder || 0)} / ${integer(COMPANY_BALANCE.tkmPerItem)} beladene tkm zum nächsten Item` },
      { name: 'Abholhinweise', icon: '⌖', amount: game.inventory.pickupHints || 0, detail: 'Material für Privatabholungen' },
      { name: 'Lieferantenkontakte', icon: '◈', amount: game.inventory.supplierContacts || 0, detail: 'Material für den Stadthub' },
      { name: 'Kapazitätsmodule', icon: '▣', amount: game.inventory.capacityModules || 0, detail: 'Für Fahrzeuge im Fuhrpark' }
    ].filter(item => item.amount > 0);
    const gears = RARITIES.map(rarity => ({
      name: `${rarity.label}-Zahnrad`, icon: '⚙', amount: game.inventory.gears[rarity.id] || 0,
      detail: 'Für Fahrzeugränge', rarity: rarity.id
    })).filter(item => item.amount > 0);
    const itemCard = item => `<article class="inventory-item ${item.rarity ? `rarity-${item.rarity}` : ''}"><span class="inventory-item-count" aria-label="Anzahl ${integer(item.amount)}">${integer(item.amount)}</span><span class="inventory-item-icon" aria-hidden="true">${item.icon}</span><div class="inventory-item-info"><strong>${item.name}</strong><small>${item.detail}</small></div></article>`;
    const section = (title, cards) => cards.length ? `<section class="inventory-section"><h2 class="inventory-section-title">${title}</h2><div class="inventory-item-grid">${cards.join('')}</div></section>` : '';
    const tripCards = privateTrips.map(order => `<article class="inventory-item inventory-trip"><span class="inventory-item-count">${order.status === 'active' ? 'UNTERWEGS' : 'BEREIT'}</span><span class="inventory-item-icon" aria-hidden="true">⌖</span><div class="inventory-item-info"><strong>Privatabholung</strong><small>${order.id}</small><small>${order.from} → ${order.to}</small><small>${tons(order.volume)} t · ${order.distance} km</small></div>${order.status === 'queued' ? `<button class="button button-primary" data-start-private="${order.id}">LKW zuweisen</button>` : ''}</article>`);
    const craftedCards = craftedTrips.map(order => `<article class="inventory-item inventory-trip"><span class="inventory-item-count">${order.status === 'active' ? 'UNTERWEGS' : 'BEREIT'}</span><span class="inventory-item-icon" aria-hidden="true">◎</span><div class="inventory-item-info"><strong>${customerById(order.customer).name}</strong><small>${categoryById(order.category).label} · ${order.id}</small><small>${order.from} → ${order.to}</small><small>${tons(order.volume)} t · ${order.distance} km</small></div>${order.status === 'queued' ? `<button class="button button-primary" data-start-crafted="${order.id}">LKW zuweisen</button>` : ''}</article>`);
    const projectCards = game.orders.filter(order => PROJECT_DEADLINES[order.kind] && order.status === 'queued').map(order => `<article class="inventory-item inventory-trip"><span class="inventory-item-count">${order.kind === 'referral' ? 'EPIC' : 'RARE'}</span><span class="inventory-item-icon" aria-hidden="true">${order.kind === 'referral' ? '★' : '✦'}</span><div class="inventory-item-info"><strong>${order.projectName}</strong><small>${tons(order.volume)} t · ${order.distance} km · Frist ${duration(order.deadlineMs / 1000)}</small></div><button class="button button-primary" data-project-open="${order.id}">Öffnen</button></article>`);
    const content = section('Materialien', materials.map(itemCard))
      + section('Zahnräder', gears.map(itemCard))
      + section('Großaufträge und Projekte', projectCards)
      + section('Privatabholungen', tripCards)
      + section('Hergestellte Kundenaufträge', craftedCards);
    $('#inventory-content').innerHTML = content || '<div class="inventory-empty"><span class="inventory-empty-icon">▣</span><h2>Deine Vorräte sind leer</h2><p>Gesammelte Materialien und hergestellte Aufträge erscheinen hier.</p></div>';
  }
  function renderDevelopment() {
    const hints = game.inventory.pickupHints || 0;
    const items = game.inventory.companyItems || 0;
    const customers = CUSTOMERS.filter(customer => customerUnlocked(customer.id));
    $('#development-content').innerHTML = `<section class="panel development-section"><div class="section-head"><h2>Herstellungen</h2></div><article class="development-recipe"><div class="development-recipe-main"><span class="development-recipe-icon">⌖</span><div><h3>Privatabholung</h3><p>Stelle aus Abholhinweisen einen Auftrag her. Der fertige Auftrag erscheint in den Vorräten und kann dort einem LKW zugewiesen werden.</p></div></div><div class="development-recipe-action"><span class="development-material">Abholhinweise <strong>${integer(hints)} / ${PRIVATE_PICKUP_HINT_COST}</strong></span><button type="button" class="button button-primary" data-combine-hints ${hints < PRIVATE_PICKUP_HINT_COST ? 'disabled' : ''}>Privatabholung herstellen</button></div></article><article class="development-recipe"><div class="development-recipe-main"><span class="development-recipe-icon">◎</span><div><h3>Kundenauftrag</h3><p>Ein zufälliger freigeschalteter Stammkunde erhält einen normalen Auftrag. Der Auftrag bleibt in den Vorräten, bis du einen passenden LKW zuweist. Auch dieser Auftrag zählt nach Abschluss für den gemeinsamen Tonnenkilometer-Fortschritt.</p></div></div><div class="development-recipe-action"><span class="development-material">Firmenausbau-Items <strong>${integer(items)} / ${COMPANY_BALANCE.craftedOrderItems}</strong></span><button type="button" class="button button-primary" data-craft-customer ${!customers.length || items < COMPANY_BALANCE.craftedOrderItems ? 'disabled' : ''}>Kundenauftrag herstellen</button>${customers.length ? '' : '<small>Erst einen Stammkunden freischalten</small>'}</div></article></section>`;
    $('#development-content').innerHTML += `<section class="panel development-section"><div class="section-head"><h2>Universelle Shards kombinieren</h2></div><p>${SHARD_COMBINE_RATIO} Shards einer Seltenheit ergeben 1 Shard der nächsthöheren Seltenheit.</p><div class="development-shard-grid">${RARITIES.slice(0, 3).map((rarity, index) => `<div class="expedition-shard"><strong>${rarity.label}: ${integer(game.expedition.shards[rarity.id])}</strong>${index < 2 ? `<button class="button button-outline" data-shard-combine="${rarity.id}" ${game.expedition.shards[rarity.id] < SHARD_COMBINE_RATIO ? 'disabled' : ''}>${SHARD_COMBINE_RATIO} zu 1 ${RARITIES[index + 1].label}</button>` : ''}</div>`).join('')}</div></section>`;
  }
  function renderHub() {
    const el = $('#hub-content');
    const h = hub();
    if (!h) {
      el.innerHTML = `<section class="panel hub-main"><h2>Verteilerzentrum in ${startCityById(game.startCity)?.city || 'deiner Stadt'}</h2><p>Stadttransporter fahren hier selbstständig. Der Vertrieb kauft jede Stunde neue Ware ein; pro Stunde sind 45 Minuten für Fahrten und 15 Minuten Pause vorgesehen.</p><button class="button button-primary" data-buy-hub>Stadthub kostenlos eröffnen</button></section>`;
      return;
    }
    const fleet = game.trucks.filter(truck => truck.tier <= 1);
    const hourlyTons = round2(hubHourlyCapacity() * hubSalesPercent(h.salesLevel) / 100);
    const construction = h.construction;
    const cycleSeconds = Math.max(0, (h.nextCycleAt - Date.now()) / 1000);
    const untilPurchase = countdown(cycleSeconds);
    const phase = h.cashboxCycles >= HUB_CASHBOX_CYCLES ? 'Kassenbestand voll · bitte abholen' : cycleSeconds > 15 * 60 ? 'Verteilung läuft' : 'Pause bis zum nächsten Einkauf';
    const nextLevel = h.salesLevel + 1;
    const cost = hubUpgradeContactCost(nextLevel);
    el.innerHTML = `<div class="hub-grid"><section class="panel hub-main"><div class="section-head"><h2>${startCityById(game.startCity)?.city || 'Stadthub'}</h2><span class="pill pill-green">AKTIV</span></div><div class="hub-metrics"><div><span>Stadttransporter</span><strong>${hubTrucks().length} / ${hubCapacity()}</strong></div><div><span>Vertrieb</span><strong>Stufe ${h.salesLevel} / 25</strong></div><div><span>Einkaufsmenge</span><strong>${hubSalesPercent(h.salesLevel)} %</strong></div><div><span>Ware je Stunde</span><strong>${tons(hourlyTons)} t</strong></div></div><p>${phase} · Nächster Einkauf in ${untilPurchase}. 12 km je Richtung, 45 Minuten Fahrzeit pro Stunde.</p><p>Vorläufige Rechnung: ${rateMoney(HUB_SALE_PER_TON)} M Verkauf und ${rateMoney(HUB_PURCHASE_PER_TON)} M Einkauf je Tonne. Keine XP und kein Zahnradloot.</p></section><section class="panel hub-main"><div class="section-head"><h2>Kassenbestand</h2><span>${Math.min(h.cashboxCycles, HUB_CASHBOX_CYCLES)} / ${HUB_CASHBOX_CYCLES} Stunden</span></div><div class="hub-cash">${money(h.cashboxCoins)} M</div><p>${h.cashboxHints} Abholhinweise warten auf Abholung. Während der 45 Arbeitsminuten wachsen Kasse und Hinweise laufend.</p><button class="button button-primary" data-collect-hub ${h.cashboxCoins || h.cashboxHints ? '' : 'disabled'}>Ertrag und Hinweise abholen</button></section></div><section class="panel hub-main"><div class="section-head"><h2>Vertrieb ausbauen</h2><span class="pill ${construction ? 'pill-green' : 'pill-gray'}">${construction ? 'IM BAU' : 'BEREIT'}</span></div>${construction ? `<p>Stufe ${construction.level} ist in Arbeit. Fertig in ${countdown((construction.finishAt - Date.now()) / 1000)}. Der Hub arbeitet währenddessen weiter; der höhere Einkaufswert gilt nach Fertigstellung.</p>` : h.salesLevel >= HUB_MAX_SALES_LEVEL ? '<p>Maximalstufe erreicht: Der Vertrieb kauft 100 % der stündlich verteilbaren Menge ein.</p>' : `<p>Stufe ${nextLevel}: +1 Prozentpunkt Einkaufsmenge. Bauzeit ${nextLevel * 12} Stunden. Benötigt ${cost} Lieferantenkontakte, ${COMPANY_BALANCE.upgradeItems(nextLevel)} Firmenausbau-Items und ${money(COMPANY_BALANCE.upgradeCoins(nextLevel))} M.</p><button class="button button-primary" data-upgrade-hub ${game.inventory.supplierContacts >= cost && game.inventory.companyItems >= COMPANY_BALANCE.upgradeItems(nextLevel) && game.coins >= COMPANY_BALANCE.upgradeCoins(nextLevel) ? '' : 'disabled'}>Ausbau starten</button>`}</section><section class="panel hub-main"><div class="section-head"><h2>Stadttransporter</h2><button class="text-button" data-go="dealer">Zum Händler ↗</button></div>${fleet.length ? fleet.map(truck => { const active = game.orders.some(order => order.status === 'active' && order.truckId === truck.id); return `<div class="hub-truck-row"><span>${truck.symbol} <strong>${truck.model} · ${truck.id}</strong><small>${tons(truck.capacity)} t · ${truckRarity(truck).label} ${truckRarity(truck).level} ★</small></span><button class="button button-outline" data-toggle-hub-truck="${truck.id}" ${active ? 'disabled' : ''}>${truck.hubAssigned ? 'Aus Hub nehmen' : 'Im Hub einsetzen'}</button></div>`; }).join('') : '<p>Du besitzt noch keinen Stadttransporter.</p>'}</section>`;
  }
  function projectCardMarkup(order) {
    const label = order.kind === 'referral' ? 'Empfehlungsprojekt' : 'Sonderauftrag';
    const state = order.status === 'queued' ? 'BEREIT' : order.status === 'active' ? 'LÄUFT' : order.status === 'failed' ? 'FRIST ABGELAUFEN' : order.completionReward?.claimedAt ? 'BELOHNUNG ABGEHOLT' : 'BELOHNUNG BEREIT';
    return `<button type="button" class="project-card rarity-${order.kind === 'referral' ? 'epic' : 'rare'}" data-project-open="${order.id}"><span class="project-card-kind">${label} · ${EXPEDITION_REGIONS[order.projectRegion || 0]}</span><strong>${order.projectName || label}</strong><small>${customerById(order.customer)?.name || 'Expedition'} · ${tons(order.volume)} t · ${order.distance} km · Frist ${duration((order.deadlineMs || PROJECT_DEADLINES[order.kind]) / 1000)}</small><span class="pill ${order.status === 'completed' ? 'pill-green' : 'pill-gray'}">${state}</span></button>`;
  }
  function renderSpecialTrips() {
    const el = $('#special-content');
    const projects = game.orders.filter(order => PROJECT_DEADLINES[order.kind]);
    const order = projects.find(item => item.id === selectedProjectId);
    if (!order) {
      selectedProjectId = null;
      el.innerHTML = `<div class="project-overview"><div class="project-intro"><h2>Großaufträge und Projekte</h2><p>Finde Sonderaufträge bei Stammkunden und auf Expeditionen. Wähle eine deiner drei Flottenvorlagen und liefere vor Ablauf der Frist.</p><button type="button" class="button button-outline" data-go="personnel">Flottenvorlagen bearbeiten</button></div>${projects.length ? projects.slice().reverse().map(projectCardMarkup).join('') : '<p>Noch keine Großaufträge gefunden.</p>'}</div>`;
      return;
    }
    const active = order.status === 'active';
    const now = Date.now();
    const remaining = active ? Math.max(0, order.project.deadlineAt - now) : 0;
    const estimated = active ? projectEstimatedEnd(order, now) : null;
    const fleet = active ? order.project.vehicles : [];
    const available = [0, 1, 2].map(template => ({ template, vehicles: projectFleetVehicles(template) }));
    const options = order.status === 'queued' ? `<div class="project-template-choices">${available.map(({ template, vehicles }) => {
      const preview = vehicles ? { ...order, delivered: 0, project: { vehicles: vehicles.map(vehicle => ({ ...vehicle, cargo: 0, nextAt: null })) } } : null;
      const seconds = preview ? (projectEstimatedEnd(preview, now) - now) / 1000 : null;
      return `<button type="button" class="project-template-option" data-project-start="${order.id}:${template}" ${vehicles ? '' : 'disabled'}><strong>Flotte ${template + 1}</strong><small>${vehicles ? `${vehicles.map(vehicle => vehicle.model).join(' · ')}<br>Voraussichtlich ${duration(seconds)} · Frist ${duration(order.deadlineMs / 1000)}${seconds * 1000 > order.deadlineMs ? ' · Überstunden nötig' : ''}` : 'Mindestens eine Karte einsetzen'}</small></button>`;
    }).join('')}</div>` : '';
    const fleetStrip = active ? `<div class="project-fleet-strip">${fleet.map(vehicle => `<span title="${vehicle.model}: ${tons(vehicle.capacity)} t"><strong>${vehicle.symbol}</strong><small>${vehicle.model}<br>${tons(vehicle.capacity)} t</small></span>`).join('')}</div>` : '';
    const overtime = active ? `<div class="project-overtime"><h3>Überstunden machen</h3><p>1 Punkt liefert 10 t sofort. Pro Punkt besteht 1 % Chance auf 1 t extra. ${integer(game.overtimePoints)} / ${integer(game.overtimeCapacity)} Punkte · 1 Punkt alle 10 Minuten.</p><div class="project-overtime-actions">${[1, 5, 10].map(amount => `<button type="button" class="button button-primary" data-project-overtime="${order.id}:${amount}" ${game.overtimePoints >= amount ? '' : 'disabled'}>${amount} ${amount === 1 ? 'Punkt' : 'Punkte'} · ${amount * 10} t</button>`).join('')}</div></div>` : '';
    const deadlineText = active ? duration(remaining / 1000) : order.status === 'failed' ? 'Abgelaufen' : order.status === 'completed' ? 'Geschafft' : duration(order.deadlineMs / 1000);
    const fleetTimeText = active ? duration((estimated - now) / 1000) : order.status === 'completed' ? 'Geliefert' : order.status === 'failed' ? 'Nicht geschafft' : 'Vorlage wählen';
    const completed = order.status === 'completed' && !order.completionReward?.claimedAt ? `<button type="button" class="button button-primary" data-claim-order="${order.id}">Belohnung einsammeln</button>` : '';
    el.innerHTML = `<button type="button" class="text-button special-back" data-project-back>← Alle Großaufträge</button><article class="project-detail"><div class="project-hero project-hero-${order.kind}"><img src="assets/project-${order.kind}.svg" alt="${order.kind === 'special' ? 'Frachtterminal' : 'Großes Logistikprojekt'}"><div class="project-hero-copy"><span>${order.kind === 'referral' ? 'EMPFEHLUNGSPROJEKT' : 'SONDERAUFTRAG'} · ${EXPEDITION_REGIONS[order.projectRegion || 0]}</span><h2>${order.projectName || 'Großauftrag'}</h2><p>${customerById(order.customer)?.name || 'Expedition'} · ${order.from} → ${order.to}</p></div></div><div class="project-body"><div class="project-timing"><div><small>FRIST ${active ? 'VERBLEIBEND' : 'INSGESAMT'}</small><strong>${deadlineText}</strong></div><div><small>FLOTTE BRAUCHT NOCH</small><strong>${fleetTimeText}</strong></div></div><div class="project-deadline-track"><span style="width:${active ? remaining / order.deadlineMs * 100 : order.status === 'queued' ? 100 : 0}%"></span></div><div class="project-cargo"><span>${tons(order.delivered)} / ${tons(order.volume)} t geliefert · ${order.distance} km je Tour</span><div class="mini-progress"><span style="width:${progress(order)}%"></span></div></div>${options}${fleetStrip}${overtime}${completed}${order.status === 'failed' ? '<p class="project-failed">Die Frist ist abgelaufen. Für diesen Auftrag gibt es keine Belohnung.</p>' : ''}${order.status === 'completed' && order.completionReward?.claimedAt ? '<p>Belohnung abgeholt.</p>' : ''}</div></article>`;
  }
  function renderExpeditionJobs() {
    const el = $('#expedition-jobs-content');
    const types = [
      { kind: 'character', label: 'Fahrzeugkartenaufträge', icon: '▰' },
      { kind: 'material', label: 'Materialaufträge', icon: '▣' }
    ];
    const pending = game.expedition.jobs;
    const missions = game.expedition.missions.filter(m => m.kind === 'endless');
    if (!selectedExpeditionJobGroup) {
      el.innerHTML = `<div class="expedition-jobs-head"><span>AUFTRAGSART</span>${[1, 2, 3].map(tier => `<strong>STUFE ${tier}</strong>`).join('')}</div>${types.map(type => `<section class="expedition-jobs-row"><h2>${type.label}</h2><div class="expedition-jobs-cards">${[1, 2, 3].map(tier => {
        const ready = pending.filter(job => job.kind === type.kind && expeditionJobTier(job) === tier).length;
        const active = missions.filter(m => m.lootKind === type.kind && m.status === 'active' && expeditionJobTier(m) === tier).length;
        return `<button type="button" class="special-customer-card expedition-job-card" data-expedition-job-group="${type.kind}:${tier}"><span class="special-initials">${type.icon}</span><span><strong>${type.label} · Stufe ${tier}</strong><small>${ready} bereit · ${active} unterwegs</small></span><span>›</span></button>`;
      }).join('')}</div></section>`).join('')}`;
      return;
    }
    const [kind, tierText] = selectedExpeditionJobGroup.split(':');
    const tier = Number(tierText);
    const type = types.find(item => item.kind === kind);
    if (!type || ![1, 2, 3].includes(tier)) { selectedExpeditionJobGroup = null; renderExpeditionJobs(); return; }
    const ready = pending.filter(job => job.kind === kind && expeditionJobTier(job) === tier).sort((a, b) => a.createdAt - b.createdAt);
    const active = missions.filter(m => m.lootKind === kind && m.status === 'active' && expeditionJobTier(m) === tier);
    const completed = missions.filter(m => m.lootKind === kind && m.status === 'completed' && expeditionJobTier(m) === tier).slice(-20).reverse();
    const row = (title, meta, end) => `<article class="special-trip-row expedition-job-row"><div><strong>${title}</strong><small>${meta}</small></div><div>${end}</div></article>`;
    const readyRows = ready.length ? ready.map(job => row(`${expeditionJobLabel(kind)} #${job.id}`, `${EXPEDITION_REGIONS[job.region]} · ${expeditionJobVolume(job)} t · ${EXPEDITION_JOB_DISTANCE} km je Richtung`, `<button type="button" class="button button-primary" data-open-expedition-job="${job.region}:${job.id}">Auftrag durchführen</button>`)).join('') : '<p>Keine Aufträge offen.</p>';
    const activeRows = active.length ? active.map(mission => {
      const transport = mission.transport;
      const progress = expeditionTransportProgress(mission);
      const detail = transport ? `${tons(transport.delivered)} / ${tons(transport.volume)} t · ${transport.completedTours} / ${transport.tours.length} Touren · ${Math.round(progress)} %` : 'Unterwegs';
      return row(`${expeditionJobLabel(kind)} #${mission.jobId || mission.id}`, `${EXPEDITION_REGIONS[mission.region]} · LKW ${mission.truckId} · ${detail}`, `<strong>${countdown((mission.endsAt - Date.now()) / 1000)}</strong><small>Restzeit</small><div class="mini-progress"><span style="width:${progress}%"></span></div>`);
    }).join('') : '<p>Keine laufenden Aufträge.</p>';
    const completedRows = completed.length ? completed.map(m => row(`${expeditionJobLabel(kind)} #${m.jobId || m.id}`, EXPEDITION_REGIONS[m.region], `<strong>Abgeschlossen</strong><small>${m.reward || 'Belohnung erhalten'}</small>`)).join('') : '<p>Noch keine Aufträge abgeschlossen.</p>';
    el.innerHTML = `<button type="button" class="text-button special-back" data-expedition-job-back>← Übersicht</button><div class="page-heading"><div><div class="eyebrow">STUFE ${tier}</div><h2>${type.label}</h2></div><span class="pill pill-gray">${ready.length} bereit</span></div><h3>Verfügbare Aufträge</h3>${readyRows}<h3>Laufende Aufträge</h3>${activeRows}<h3>Abgeschlossene Aufträge</h3>${completedRows}`;
  }
  function renderOrders() {
    const secondsLeft = Math.max(0, Math.ceil((game.nextAutoRefreshAt - Date.now()) / 1000));
    $('#order-refresh-countdown').textContent = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
    $('#held-offers-count').textContent = `${pinnedOrders().length} / ${pinLimit()} Aufträge gehalten`;
    const refreshButton = $('#refresh-orders');
    const refreshCost = manualRefreshCost();
    refreshButton.disabled = game.coins < refreshCost;
    refreshButton.textContent = `↻ Neue Angebote · ${money(refreshCost)} M`;
    refreshButton.title = game.coins < refreshCost ? `${money(refreshCost)} Münzen erforderlich` : 'Alle verfügbaren Angebote erneuern';
    const orders = game.orders.filter(o => o.status === 'available' && o.category !== 'city' && (!o.customer || customerUnlocked(o.customer))).sort((a, b) => a.createdAt - b.createdAt);
    $('#orders-list').innerHTML = orders.length ? orders.map(o => {
      const freight = freightRevenue(o);
      const eligible = eligibleFreeTrucks(o);
      const actionLabel = eligible.length ? 'Zuweisen' : freeTrucks().length ? 'Passender LKW fehlt' : 'Kein LKW frei';
      const action = `<button class="button button-primary" data-assign="${o.id}" ${eligible.length ? '' : 'disabled'}>${actionLabel}</button>`;
      const lockIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0${o.pinned ? 'v3' : ''}"/></svg>`;
      const pinAction = `<button type="button" class="order-lock-toggle ${o.pinned ? 'locked' : ''}" data-pin="${o.id}" aria-pressed="${Boolean(o.pinned)}" aria-label="${o.pinned ? 'Auftrag freigeben' : 'Auftrag halten'}" title="${o.pinned ? 'Gehaltenen Auftrag freigeben' : 'Auftrag bei Angebotswechseln halten'}">${lockIcon}</button>`;
      const route = o.category === 'city' ? (startCityById(o.homeCity)?.city || o.from.split(' ')[0]) : `${o.from} → ${o.to}`;
      const customer = o.customer ? `<span class="order-customer-badge">★ ${customerById(o.customer).name}</span>` : '';
      const routeBadge = hasReturnLeg(o) ? `<span class="order-route-badge ${o.routeType === 'dual' ? 'order-route-dual' : ''}">${routeTypeLabel(o)}</span>` : '';
      return `<article class="order-card ${o.pinned ? 'order-pinned' : ''} ${o.customer ? 'order-client rarity-uncommon' : ''}"><div class="order-main"><div class="order-name">${o.icon} ${o.cargo} · ${route}</div><div class="order-customer"><span class="pill pill-gray">${categoryById(o.category).label}</span>${customer}${routeBadge}<span class="order-id">${o.id}</span></div></div><div class="order-distance"><div class="order-stat-label">${hasReturnLeg(o) ? 'EINFACHE STRECKE' : 'STRECKE'}</div><div class="order-stat-value">${o.distance} km</div></div><div class="order-volume"><div class="order-stat-label">${o.routeType === 'dual' ? 'VOLUMEN JE RICHTUNG' : 'VOLUMEN'}</div><div class="order-stat-value">${o.volume} t</div></div><div class="order-profit"><div class="order-stat-label">FRACHTVERGÜTUNG</div><div class="order-stat-value">${money(freight)} M</div></div><div class="order-actions">${action}${pinAction}</div></article>`;
    }).join('') : `<div class="empty-state"><div class="empty-icon">▤</div><h3>Hier ist gerade nichts</h3><p>Neue Aufträge erscheinen nach abgeschlossenen Lieferungen.</p></div>`;
  }
  function fleetTable(trucks, title) {
    const rows = trucks.map(t => {
      const order = game.orders.find(o => o.status === 'active' && o.truckId === t.id);
      const expedition = game.expedition.missions.find(m => m.status === 'active' && m.truckId === t.id);
      const expeditionLabel = expedition?.transport ? `${expeditionJobLabel(expedition.lootKind)} · ${tons(expedition.transport.delivered)}/${tons(expedition.transport.volume)} t · ${Math.round(expeditionTransportProgress(expedition))} %` : expedition ? `Expedition · ${EXPEDITION_REGIONS[expedition.region]}` : '';
      return `<tr data-fleet-truck="${t.id}" tabindex="0" aria-label="Details zu ${t.model} ${t.id} öffnen"><td><span class="fleet-vehicle"><span class="fleet-vehicle-icon">${t.symbol}</span><span><strong>${t.model}</strong><small>${t.cardId ? `${vehicleCardById(t.cardId).rarity}-Karte · ` : ''}${t.id}</small></span></span></td><td>${rarityBadge(t)}</td><td><span class="pill ${order || expedition || t.hubAssigned ? 'pill-green' : 'pill-gray'}">${order || expedition ? 'UNTERWEGS' : t.hubAssigned ? 'IM HUB' : 'FREI'}</span></td><td>${tons(t.capacity)} t</td><td>${speedLabel(truckSpeed(t))} / ${speedLabel(truckSpeed(t, t.capacity))}</td><td>${rateMoney(operatingCostPerKm(t))} M/km</td><td>${order ? `<span class="fleet-order">${order.id} · ${tons(order.delivered)}/${tons(order.volume)} t<small>Restzeit ${countdown(remainingOrderSeconds(order, t))}</small></span>` : expedition ? `${expeditionLabel}<small>Restzeit ${countdown((expedition.endsAt - Date.now()) / 1000)}</small>` : t.hubAssigned ? 'Stadthub' : '–'}</td><td class="fleet-table-arrow">›</td></tr>`;
    }).join('') || '<tr><td class="fleet-table-empty" colspan="8">Noch keine Fahrzeuge in dieser Gruppe.</td></tr>';
    return `<section class="fleet-section"><div class="fleet-section-heading"><h2>${title}</h2><span>${trucks.length} LKW</span></div><div class="fleet-table-wrap"><table class="fleet-table"><caption class="sr-only">${title}</caption><thead><tr><th>Fahrzeug</th><th>Stufe</th><th>Status</th><th>Kapazität</th><th>Tempo leer / beladen</th><th>Betriebskosten</th><th>Auftrag</th><th><span class="sr-only">Details</span></th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }
  function renderFleet() {
    const trucks = trucksAt();
    $('#fleet-summary-text').textContent = `${regularTruckCount()} / 10 Kartenfahrzeuge · ${cityTruckCount()} / ${hubCapacity()} Stadttransporter`;
    $('#fleet-list').innerHTML = fleetTable(trucks.filter(truck => truck.cardId), 'Kartenfahrzeuge') + fleetTable(trucks.filter(truck => truck.tier <= 1), 'Stadthub');
    if ($('#truck-dialog').open) renderTruckDialog();
  }
  function renderDealer() {
    $('#market-capacity-text').textContent = `${cityTruckCount()} / ${hubCapacity()} Stadttransporter · Fahrzeugkarten für Regional- und Fernverkehr findest du auf Expeditionen`;
    const cards = TRUCKS.slice(0, 2).map((t, i) => {
      const full = cityTruckCount() >= hubCapacity();
      const label = i <= 1 && !hub() ? 'Erst Stadthub eröffnen' : full ? 'Fahrzeuglimit erreicht' : game.coins < t.price ? 'Zu wenig Münzen' : 'LKW kaufen';
      return `<article class="shop-card"><div class="truck-visual">${t.symbol}</div><h3>${t.model}</h3><p>${t.description}</p><div class="truck-details"><span>Kapazität</span><strong>${tons(t.capacity)} t / Tour</strong></div><div class="truck-details"><span>Tempo leer / voll</span><strong>${speedLabel(truckSpeed(t))} / ${speedLabel(truckSpeed(t, t.capacity))}</strong></div><div class="truck-details"><span>Fahrzeugpreis</span><strong>${rateMoney(operatingCostPerKm({ tier: i }))} M/km</strong></div><div class="truck-details"><span>Einsatz</span><strong>${i <= 1 ? 'Stadthub' : CATEGORIES.filter(c => c.id !== 'city' && c.tiers.includes(i)).map(c => c.label).join(' + ')}</strong></div><div class="shop-price">${money(t.price)} <small>Münzen</small></div><button class="button button-primary" data-buy="${i}" ${full || game.coins < t.price || i <= 1 && !hub() ? 'disabled' : ''}>${label}</button></article>`;
    });
    $('#shop-list').innerHTML = `<section class="dealer-section"><div class="fleet-section-heading"><h2>Stadttransporter</h2></div><div class="shop-grid">${cards.join('')}</div></section>`;
  }
  function renderTruckDialog() {
    const truck = game.trucks.find(t => t.id === selectedTruckId);
    if (!truck) { if ($('#truck-dialog').open) $('#truck-dialog').close(); return; }
    const order = game.orders.find(o => o.status === 'active' && o.truckId === truck.id);
    const expeditionMission = game.expedition.missions.find(m => m.status === 'active' && m.truckId === truck.id);
    const currentCargo = order ? (order.tripCargo ?? Math.min(truck.capacity, order.volume - order.delivered)) : 0;
    const expeditionDetail = expeditionMission?.transport ? `<div class="truck-dialog-order"><div class="upgrade-title"><span>${expeditionJobLabel(expeditionMission.lootKind)} · Stufe ${expeditionJobTier(expeditionMission)}</span><span>${tons(expeditionMission.transport.delivered)} / ${tons(expeditionMission.transport.volume)} t</span></div><div class="truck-dialog-route">${EXPEDITION_REGIONS[expeditionMission.region]} · ${expeditionMission.transport.completedTours} / ${expeditionMission.transport.tours.length} Touren · ${Math.round(expeditionTransportProgress(expeditionMission))} %</div><div class="truck-dialog-route">Restzeit ${countdown((expeditionMission.endsAt - Date.now()) / 1000)}</div><div class="mini-progress"><span style="width:${expeditionTransportProgress(expeditionMission)}%"></span></div></div>` : expeditionMission ? `<div class="truck-dialog-order">Expedition in ${EXPEDITION_REGIONS[expeditionMission.region]} · Restzeit ${countdown((expeditionMission.endsAt - Date.now()) / 1000)}</div>` : '';
    $('#truck-dialog-title').textContent = `${truck.symbol} ${truck.model} · ${truck.id}`;
    $('#truck-dialog-content').innerHTML = `<div class="truck-dialog-status"><span class="pill ${order || expeditionMission || truck.hubAssigned ? 'pill-green' : 'pill-gray'}">${order || expeditionMission ? 'UNTERWEGS' : truck.hubAssigned ? 'IM HUB' : 'FREI'}</span> <span class="pill pill-gray">${startCityById(game.startCity).city}</span></div><div class="truck-dialog-facts"><div><span>Kapazität</span><strong>${tons(truck.capacity)} t pro Tour</strong></div><div><span>Tempo leer</span><strong>${speedLabel(truckSpeed(truck))}</strong></div><div><span>Tempo voll beladen</span><strong>${speedLabel(truckSpeed(truck, truck.capacity))}</strong></div><div><span>Betriebskosten</span><strong>${rateMoney(operatingCostPerKm(truck))} M/km</strong></div></div>${order ? `<div class="truck-dialog-order"><div class="upgrade-title"><span>Aktueller Auftrag ${order.id}</span><span>${tons(order.delivered)} / ${tons(order.volume)} t</span></div><div class="truck-dialog-route">${order.cargo} · ${order.from} → ${order.to}</div><div class="truck-dialog-route">Aktuelle Ladung: ${tons(currentCargo)} t · ${speedLabel(truckSpeed(truck, currentCargo))} beladen · Restzeit Auftrag ${countdown(remainingOrderSeconds(order, truck))}</div><div class="mini-progress"><span style="width:${progress(order)}%"></span></div></div>` : expeditionDetail || (truck.tier <= 1 ? `<button type="button" class="button button-outline truck-dialog-orders" data-go="hub">Zum Stadthub</button>` : `<button type="button" class="button button-outline truck-dialog-orders" data-truck-orders>Auftrag suchen</button>`)}`;
    const rarity = truckRarity(truck);
    const gearCount = game.inventory.gears[rarity.id];
    const gearCost = rankGearCost(truck);
    const maxed = rarity.total >= MAX_RARITY_LEVEL;
    $('#truck-dialog-content').insertAdjacentHTML('afterbegin', `<div class="truck-rarity-panel rarity-${rarity.id}"><div><span class="truck-rarity-eyebrow">FAHRZEUGSTUFE</span><div class="truck-rarity-name">${rarity.label}</div><small>Gesamtstufe ${rarity.total} / ${MAX_RARITY_LEVEL}</small></div><div class="truck-rarity-level">${rarity.level} ★<small>/ 10</small></div></div><button type="button" class="button button-primary truck-rarity-upgrade" data-upgrade-rarity="${truck.id}" ${maxed || gearCount < gearCost ? 'disabled' : ''}>${maxed ? 'Maximale Fahrzeugstufe erreicht' : `+1 ★ · ${integer(gearCost)} ${rarity.label}-Zahnräder`}</button><p class="truck-rarity-note">${maxed ? 'Dieses Fahrzeug ist vollständig aufgewertet.' : `${integer(gearCount)} ${rarity.label}-Zahnräder vorhanden · ${integer(gearCost)} benötigt.`}</p>`);
    const capacityLevel = truck.moduleCapacityLevel || 0;
    const maximumCapacityLevel = TRUCKS[truck.tier].maxCapacityLevel;
    const maximumCapacity = TRUCKS[truck.tier].capacity + maximumCapacityLevel * CAPACITY_PER_MODULE;
    $('#truck-dialog-content').insertAdjacentHTML('beforeend', `<div class="truck-capacity-panel"><h3>Kapazität ausbauen</h3><p>Ausbaustufe ${capacityLevel} / ${maximumCapacityLevel} · Aktuell ${tons(truck.capacity)} t · Maximum ${tons(maximumCapacity)} t · ${game.inventory.capacityModules || 0} Kapazitätsmodule vorhanden</p>${capacityLevel > maximumCapacityLevel ? '<p>Älterer Spielstand: Bereits erworbene Kapazität bleibt erhalten.</p>' : ''}<button type="button" class="button button-primary" data-upgrade-capacity="${truck.id}" ${capacityLevel >= maximumCapacityLevel || (game.inventory.capacityModules || 0) < 1 ? 'disabled' : ''}>${capacityLevel >= maximumCapacityLevel ? 'Maximale Kapazität erreicht' : '+0,5 t · 1 Kapazitätsmodul'}</button></div>`);
    const blocked = truck.cardId ? game.orders.some(order => order.status === 'active' && order.truckId === truck.id) || game.expedition.missions.some(mission => mission.status === 'active' && mission.truckId === truck.id) : saleBlockReason(truck);
    $('#truck-dialog-content').insertAdjacentHTML('beforeend', `<div class="truck-sale-panel"><div class="truck-dialog-facts"><div><span>Gefahrene Kilometer</span><strong>${integer(truck.kmDriven || 0)} km</strong></div><div><span>Touren / Aufträge abgeschlossen</span><strong>${integer(truck.toursCompleted || 0)} / ${integer(truck.ordersCompleted || 0)}</strong></div></div>${truck.historyReconstructed ? '<p>Älterer Spielstand: Fahrten aus vorhandenen Aufträgen rekonstruiert. Frühere Fahrten können fehlen.</p>' : ''}${truck.cardId ? `<button type="button" class="button button-outline" data-garage-remove="${truck.cardId}" ${blocked ? 'disabled' : ''}>Aus Fuhrpark nehmen</button>${blocked ? '<p>Der laufende Auftrag muss zuerst abgeschlossen werden.</p>' : ''}` : `<button type="button" class="button button-outline" data-open-sale="${truck.id}" ${blocked ? 'disabled' : ''}>Fahrzeug verkaufen</button>${blocked ? `<p>${blocked}</p>` : ''}`}</div>`);
  }
  function openTruckDialog(truckId) {
    if (!game.trucks.some(t => t.id === truckId)) return;
    selectedTruckId = truckId;
    renderTruckDialog();
    if (!$('#truck-dialog').open) $('#truck-dialog').showModal();
  }
  function renderStatistics() {
    const stats = game.stats;
    const transportProfit = round2(stats.grossRevenue - stats.operatingCosts);
    const profit = round2(transportProfit + (stats.hubRevenue || 0));
    const co2 = stats.tonKm * CO2_KG_PER_TON_KM;
    const cards = [
      ['Anzahl LKW', integer(game.trucks.length), 'Aktueller Bestand'],
      ['Aufträge', integer(game.completed), `${integer(game.orders.filter(o => o.status === 'active').length)} in Arbeit`],
      ['Touren', integer(stats.trips), 'Abgeschlossene Touren'],
      ['Tonnen', `${integer(stats.tons)} <small>t</small>`, 'Summe aller LKW-Touren'],
      ['Hub-Tonnen', `${money(hub()?.totalTons || 0)} <small>t</small>`, 'Im Stadthub verteilt'],
      ['Kilometer', `${integer(stats.km)} <small>km</small>`, 'Hin- und Rückfahrten'],
      ['Tonnenkilometer', `${integer(stats.tonKm)} <small>tkm</small>`, 'Tonnen × Kilometer'],
      ['XP', integer(game.xp), `Spielerlevel ${levelForXp(game.xp, game).level}`],
      ['Ertrag', `${money(stats.grossRevenue)} <small>M</small>`, 'Brutto aus Transporten'],
      ['Prämien', `${money(stats.contractBonusRevenue)} <small>M</small>`, 'Abgeholte Abschlussprämien'],
      ['Stadthub', `${money(stats.hubRevenue || 0)} <small>M</small>`, 'Abgeholter passiver Ertrag'],
      ['Fahrtkosten', `${money(stats.operatingCosts)} <small>M</small>`, 'Fahrzeugkilometer und Lastkosten'],
      ['Gewinn', `${money(profit)} <small>M</small>`, 'Transporte und Stadthub'],
      ['CO₂-Ausstoß', `${money(co2)} <small>kg</small>`, 'Beladene Strecken'],
      ['Guthaben', `${money(game.coins)} <small>M</small>`, 'Nach Käufen, Ausbauten und Angebotswechseln']
    ];
    $('#statistics-grid').innerHTML = cards.map(([label, value, note]) => `<article class="statistics-card"><div class="statistics-card-label">${label}</div><div class="statistics-card-value">${value}</div><div class="statistics-card-note">${note}</div></article>`).join('');
    $('#finance-list').innerHTML = [
      ['Startkapital', `+${money(game.startingCoins)} M`],
      ['Testmünzen', `+${money(stats.testCoinsGranted || 0)} M`],
      ...(stats.removedUpgradeRefund ? [['Erstattete LKW-Ausbauten', `+${money(stats.removedUpgradeRefund)} M`]] : []),
      ['Transportertrag', `+${money(stats.grossRevenue)} M`],
      ['Expeditionsertrag', `+${money(stats.expeditionRevenue || 0)} M`],
      ['Auftragsprämien', `+${money(stats.contractBonusRevenue)} M`],
      ['Stadthub', `+${money(stats.hubRevenue || 0)} M`],
      ['Betriebskosten', `−${money(stats.operatingCosts)} M`],
      ['Transportgewinn', `+${money(transportProfit)} M`],
      ['LKW-Käufe', `−${money(stats.truckSpent)} M`],
      ['Abteilungen freischalten', `−${money(stats.departmentSpent)} M`],
      ['Mitarbeiter einstellen', `−${money(stats.employeeSpent)} M`],
      ...(stats.employeeRefund ? [['Erstattete Einstellungen', `+${money(stats.employeeRefund)} M`]] : []),
      ['Auftragslisten ausbauen', `−${money(stats.offerUpgradeSpent)} M`],
      ['Werkstatt ausbauen', `−${money(stats.workshopUpgradeSpent)} M`],
      ['Vertrieb ausbauen', `−${money(stats.salesUpgradeSpent)} M`],
      ['Transportsegmente ausbauen', `−${money(stats.transportUpgradeSpent || 0)} M`],
      ['Stadthub-Vertrieb ausbauen', `−${money(stats.hubUpgradeSpent || 0)} M`],
      ...(stats.removedBranchRefund ? [['Erstattete Niederlassungen', `+${money(stats.removedBranchRefund)} M`]] : []),
      ['Manuelle Angebotswechsel', `−${money(stats.manualRefreshSpent)} M`],
      ['Aktuelles Guthaben', `${money(game.coins)} M`]
    ].map(([label, value], i, rows) => `<div class="finance-row ${i === rows.length - 1 ? 'total' : ''}"><span>${label}</span><strong>${value}</strong></div>`).join('');
  }
  function renderCustomers() {
    const unlocked = CUSTOMERS.filter(c => customerUnlocked(c.id));
    $('#customer-list').innerHTML = unlocked.length ? unlocked.map(c => {
      const trust = game.customerTrust[c.id] || 0, level = customerLevel(trust), next = customerNext(trust);
      const start = trustTotalForLevel(level);
      const pct = next ? (trust - start) / (next - start) * 100 : 100;
      const skills = customerSkillLevels(c.id);
      const available = availableCustomerSkillPoints(c.id);
      const spent = skills.pay + skills.special + skills.referral;
      const base = SPECIAL_CHANCES[c.category];
      const skillRows = [
        { kind: 'pay', label: 'Frachtvergütung', value: `+${(skills.pay * .1).toFixed(1).replace('.', ',')} % · ${skills.pay}/100 Punkte · max. +10 %` },
        { kind: 'special', label: 'Sonderfahrtchance', value: `+${(skills.special * .1).toFixed(1).replace('.', ',')} Prozentpunkte · ${skills.special}/25 · max. +2,5` },
        { kind: 'referral', label: 'Empfehlungschance', value: `+${(skills.referral * .1).toFixed(1).replace('.', ',')} Prozentpunkte · ${skills.referral}/25 · max. +2,5` }
      ].map(skill => `<div class="customer-skill-row"><span>${skill.label}<small>${skill.value}</small></span><button class="customer-skill-button" data-customer-skill="${skill.kind}" data-customer="${c.id}" aria-label="${skill.label} für ${c.name} erhöhen" title="1 Fähigkeitspunkt ausgeben" ${available && skills[skill.kind] < CUSTOMER_SKILL_LIMITS[skill.kind] ? '' : 'disabled'}>+</button></div>`).join('');
      const chanceText = base ? `<p>Aktuell: Sonderfahrt ${money((base.award + skills.special * .001) * 100)} % · Empfehlung ${money((base.referral + skills.referral * .001) * 100)} %</p>` : '';
      return `<article class="customer-card"><div class="customer-avatar">${c.initials}</div><h3>${c.name}</h3><p>${c.industry} · ${categoryById(c.category).label}</p><div class="customer-level"><span>Vertrauenslevel <strong>${level} / ${MAX_TRUST_LEVEL}</strong></span><span>${integer(trust)}${next ? ` / ${integer(next)}` : ''} Vertrauen</span></div><div class="mini-progress"><span style="width:${pct}%"></span></div><div class="customer-skills"><div class="customer-skill-heading"><span>FÄHIGKEITSPUNKTE</span><strong>${integer(spent)} verbraucht · ${integer(available)} frei</strong></div><p>1 Punkt je Aufstieg ab Level 0</p>${skillRows}${chanceText}</div></article>`;
    }).join('') : '<div class="customer-locked"><div class="empty-icon">◎</div><h3>Noch keine Stammkunden</h3><p>Schließe den einmaligen Endlosort-Auftrag ab und hole seine Freischaltung ab.</p></div>';
  }
  function renderExpeditions() {
    const expedition = game.expedition;
    const capacity = expeditionCapacity();
    const free = freeTrucks().filter(truck => truck.tier >= 2);
    const truckChoices = (region, kind, place) => free.length ? `<div class="expedition-truck-choices">${free.map(t => `<button class="button button-outline" data-expedition-start="${region}:${kind}:${place}:${t.id}">${t.symbol} ${t.id} einsetzen</button>`).join('')}</div>` : '<p>Ein freier regulärer LKW wird benötigt.</p>';
    $('#expedition-status').innerHTML = `<strong>${integer(expedition.points)} / ${integer(capacity)} Punkte</strong><span>${expedition.points >= capacity ? 'Regeneration pausiert' : '1 Punkt je 20 Minuten · Über dem Limit pausiert die Regeneration'} · 5 Punkte je Auslosung · +50 je Spielerlevel</span>`;
    if (selectedExpeditionRegion === null) {
      $('#expedition-regions').innerHTML = `<div class="expedition-region-list">${expedition.regions.map((region, index) => {
        const open = expeditionRegionOpen(index);
        const completed = region.deliveries.filter(Boolean).length;
        return `<button type="button" class="expedition-region-card ${open ? '' : 'is-locked'}" data-expedition-region="${index}" ${open ? '' : 'disabled'}><span class="expedition-region-number">${String(index + 1).padStart(2, '0')}</span><span class="expedition-region-copy"><strong>${EXPEDITION_REGIONS[index]}</strong><small>${open ? `${region.discovered} / 7 Orte entdeckt · ${completed} / 7 Kapazitätsmissionen abgeholt · Endlosort-Auftrag ${region.finalClaimed ? 'abgeholt' : 'offen'}` : 'Nach Freilegung des vorherigen Endlosorts verfügbar'}</small></span><span class="pill ${expeditionRegionCompleted(region) ? 'pill-green' : 'pill-gray'}">${expeditionRegionCompleted(region) ? 'ABGESCHLOSSEN' : region.endlessUnlocked ? 'ENDLOSORT OFFEN' : open ? 'IN ERFORSCHUNG' : 'GESPERRT'}</span><span class="expedition-region-arrow">${open ? '›' : '⌁'}</span></button>`;
      }).join('')}</div>`;
    } else {
      const index = selectedExpeditionRegion;
      const region = expedition.regions[index];
      if (!region || !expeditionRegionOpen(index)) { selectedExpeditionRegion = null; renderExpeditions(); return; }
      const active = expedition.missions.filter(m => m.region === index && m.status === 'active');
      const nodes = Array.from({ length: 7 }, (_, place) => {
        const discovered = place < region.discovered;
        const complete = region.deliveries[place];
        const state = complete ? 'complete' : discovered ? 'discovered' : place === region.discovered ? 'next' : 'locked';
        return `<button type="button" class="expedition-map-node ${state} ${selectedExpeditionNode === place ? 'selected' : ''}" data-expedition-node="${place}" aria-pressed="${selectedExpeditionNode === place}"><span>${place + 1}</span><small>Ort ${place + 1}</small></button>`;
      }).join('');
      const endlessState = expeditionRegionCompleted(region) ? 'complete' : region.endlessUnlocked ? 'discovered' : region.discovered === 7 ? 'next' : 'locked';
      const selected = selectedExpeditionNode;
      let detail;
      if (selected < 7) {
        const discovered = selected < region.discovered;
        const done = region.deliveries[selected];
        const mission = expedition.missions.find(m => m.region === index && m.kind === 'delivery' && m.place === selected);
        detail = `<h3>Ort ${selected + 1}</h3>${!discovered ? selected === region.discovered ? `<p>Entdecke diesen Ort für ${expeditionDiscoveryCost(index, selected)} Expeditionspunkte.</p><button class="button button-primary" data-expedition-discover="${index}" ${expedition.points < expeditionDiscoveryCost(index, selected) ? 'disabled' : ''}>Ort entdecken · ${expeditionDiscoveryCost(index, selected)} Punkte</button>` : '<p>Entdecke zuerst die vorherigen Orte.</p>' : done ? '<p>Ortsmission abgeschlossen. +1 maximale Expeditionskapazität wurde abgeholt.</p>' : mission?.status === 'completed' ? `<p>Ortsmission abgeschlossen. Die Belohnung wartet auf dich.</p><button class="button button-primary" data-expedition-claim="${mission.id}">+1 Expeditionskapazität abholen</button>` : mission?.status === 'active' ? `<p>${mission.truckId} ist unterwegs · ${countdown((mission.endsAt - Date.now()) / 1000)} verbleibend.</p>` : `<p>Optionale LKW-Mission · ${Math.round(expeditionDuration(index, 'delivery', selected) / 3600000)} Stunden · einmalig +1 maximale Expeditionskapazität.</p>${truckChoices(index, 'delivery', selected)}`}`;
      } else {
        const finalMission = expedition.missions.find(m => m.region === index && m.kind === 'final');
        const jobs = expedition.jobs.filter(job => job.region === index);
        const running = active.filter(m => m.kind === 'endless');
        const finalDetail = region.finalClaimed ? `<p>Einmaliger Transportauftrag abgeholt. ${customerById(EXPEDITION_CUSTOMER_IDS[index]).name} ist freigeschaltet.</p>` : finalMission?.status === 'completed' ? `<p>Einmaliger Transportauftrag abgeschlossen. Hole die Freischaltung ab.</p><button class="button button-primary" data-expedition-claim="${finalMission.id}">Stammkunden freischalten</button>` : finalMission?.status === 'active' ? `<p>Einmaliger Transportauftrag mit ${finalMission.truckId} läuft · ${countdown((finalMission.endsAt - Date.now()) / 1000)} verbleibend.</p>` : `<p>Einmaliger Transportauftrag · ${Math.round(expeditionDuration(index, 'final') / 3600000)} Stunden. Nach Abschluss und Abholung wird ${customerById(EXPEDITION_CUSTOMER_IDS[index]).name} freigeschaltet.</p>${truckChoices(index, 'final', 0)}`;
        detail = `<h3>Endlosort</h3>${region.discovered < 7 ? '<p>Entdecke zuerst alle sieben Orte. Ihre optionalen LKW-Missionen dürfen später erledigt werden.</p>' : `<p>Endlosort freigelegt · 1 Kapazitätsmodul erhalten · nächste Region offen.</p>${finalDetail}<button class="button button-primary" data-expedition-open="${index}">Endlosexpedition öffnen</button><div class="expedition-job-summary"><strong>${jobs.length} bereit · ${running.length} unterwegs · ${region.deliveries.filter(Boolean).length}/7 Ortsbelohnungen abgeholt</strong><button type="button" class="button button-outline" data-go="expedition-jobs">Zu Expeditionsaufträgen</button></div>`}`;
      }
      $('#expedition-regions').innerHTML = `<button class="button button-outline expedition-back" data-expedition-back>← Alle Regionen</button><section class="panel expedition-map-card"><div class="section-head"><div><div class="eyebrow">REGION ${index + 1}</div><h2>${EXPEDITION_REGIONS[index]}</h2></div><span class="pill ${region.endlessUnlocked ? 'pill-green' : 'pill-gray'}">${region.discovered}/7 Orte entdeckt</span></div><div class="expedition-map-layout"><div class="expedition-map-column"><div class="expedition-map">${nodes}<button type="button" class="expedition-map-node endless ${endlessState} ${selected === 7 ? 'selected' : ''}" data-expedition-node="7" aria-pressed="${selected === 7}"><span>∞</span><small>Endlosort</small></button></div><div class="expedition-map-legend"><span>● Entdecken</span><span>● Entdeckt</span><span>● Mission abgeschlossen</span></div></div><section class="expedition-node-detail">${detail}</section></div></section>`;
    }
    const recent = expedition.missions.filter(m => m.status === 'completed').slice(-8).reverse();
    $('#expedition-history').innerHTML = recent.length ? recent.map(m => `<div class="expedition-history-row"><strong>${EXPEDITION_REGIONS[m.region]} · ${m.kind === 'endless' ? 'Endlosauftrag' : m.kind === 'final' ? 'Einmaliger Endlosort-Auftrag' : `Ort ${m.place + 1}`}</strong><span>${m.reward || 'Abgeschlossen'}${['delivery', 'final'].includes(m.kind) && !m.claimedAt ? ` · <button class="button button-outline" data-expedition-claim="${m.id}">Abholen</button>` : ''}</span></div>`).join('') : '<p>Noch keine Expedition abgeschlossen.</p>';
    $('#expedition-history-panel').hidden = selectedExpeditionRegion === null;
  }
  function renderExpeditionDrawDialog(index) {
    const region = game.expedition.regions[index];
    if (!region?.endlessUnlocked || !expeditionRegionOpen(index)) return false;
    const stageRows = EXPEDITION_STAGE_WEIGHTS[index].map((chance, tier) => `<span>Stufe ${tier + 1}: ${money(chance * 100)} %</span>`).join(' · ');
    $('#expedition-draw-title').textContent = `${EXPEDITION_REGIONS[index]} · Endlosexpedition`;
    $('#expedition-draw-content').innerHTML = `<p><strong>${integer(game.expedition.points)} / ${integer(expeditionCapacity())} Expeditionspunkte</strong></p><p>Jede Expedition kann eine Fahrzeugkarte dieser Region finden. Duplikate geben 1 Shard derselben Seltenheit.</p><div class="expedition-draw-chances">${EXPEDITION_CARD_CHANCES.map(item => { const card = EXPEDITION_CHARACTERS.find(c => c.region === index && c.rarity === item.rarity); return `<div><span>${card.name} · ${item.rarity}</span><strong>${money(item.chance * 100)} %</strong></div>`; }).join('')}${EXPEDITION_JOB_WEIGHTS.map(item => `<div><span>${expeditionJobLabel(item.kind)}</span><strong>${money(item.chance * 90)} %</strong></div>`).join('')}</div><p>Fahrzeugkartenaufträge geben Shards, aber keine weiteren Karten. Auftragsstufen: ${stageRows}. Sonderaufträge und Empfehlungsprojekte wachsen mit der Region und werden von einer Flottenvorlage gefahren.</p><button type="button" class="button button-primary" data-expedition-draw="${index}" ${game.expedition.points < EXPEDITION_COST ? 'disabled' : ''}>Expedition starten · 5 Punkte</button><p>Gefundene Großaufträge erscheinen auch in den Vorräten und werden mit einer Flottenvorlage gestartet.</p>`;
    return true;
  }
  function openExpeditionDrawDialog(index) {
    if (!renderExpeditionDrawDialog(index)) return;
    $('#expedition-draw-dialog').showModal();
  }
  function renderPersonnel() {
    const expedition = game.expedition;
    const labels = { regen: 'Expeditionsregeneration', capacity: 'Expeditionskapazität', shards: 'Zusatz-Shard-Chance', duration: 'Kürzere Expeditionsdauer', coins: 'Expeditionsmünzen' };
    const currentTemplate = fleetTemplate(selectedFleetTemplate);
    $('#personnel-slots').innerHTML = `<div class="fleet-template-tabs">${[0, 1, 2].map(index => `<button type="button" class="button ${selectedFleetTemplate === index ? 'button-primary' : 'button-outline'}" data-fleet-template="${index}">Flotte ${index + 1} · ${fleetTemplate(index).filter(Boolean).length}/5</button>`).join('')}</div><p>Flotte 1 gibt die bisherigen Expeditionsboni. Für Großaufträge wählst du eine der drei Vorlagen. Expeditionstransporte fahren Fahrzeuge aus dem Fuhrpark.</p>` + currentTemplate.map((id, index) => `<div class="expedition-seat"><strong>Flottenplatz ${index + 1}: ${id ? EXPEDITION_CHARACTERS.find(c => c.id === id)?.name || 'Unbekannt' : 'Frei'}</strong>${id ? `<button class="button button-outline" data-character-remove="${selectedFleetTemplate}:${index}">Entfernen</button>` : ''}</div>`).join('');
    $('#personnel-slot-count').textContent = `${currentTemplate.filter(Boolean).length} / 5 Flottenplätze`;
    $('#personnel-cards').innerHTML = EXPEDITION_CHARACTERS.map(c => {
      const card = expedition.characters[c.id];
      const model = TRUCKS[c.vehicleTier];
      const routes = CATEGORIES.filter(category => category.id !== 'city' && category.tiers.includes(c.vehicleTier)).map(category => category.label).join(' + ');
      const vehicleData = `<p>${model.model} · ${tons(model.capacity)} t Nutzgewicht · ${routes}</p><p>Basisgeschwindigkeit ${speedLabel(truckSpeed({ rarityLevel: 0 }))} leer · ${speedLabel(truckSpeed({ rarityLevel: 0 }, model.capacity))} voll · ${rateMoney(model.emptyCostPerKm)} M/km</p>`;
      if (!card) return `<article class="personnel-card rarity-${c.rarity}"><span class="pill pill-gray">${c.rarity}</span><h3>${c.name}</h3><p>${EXPEDITION_REGIONS[c.region]} · Noch nicht gefunden</p>${vehicleData}</article>`;
      const tier = card.level < 10 ? c.rarity : null;
      const cost = card.level < 10 ? CHARACTER_LEVEL_COSTS[card.level - 1] : 0;
      const bonus = c.base + (card.level - 1) * c.step;
      const parked = cardInGarage(c.id);
      const truck = game.trucks.find(item => item.cardId === c.id);
      const busy = truck && (game.orders.some(order => order.status === 'active' && order.truckId === truck.id) || expedition.missions.some(mission => mission.status === 'active' && mission.truckId === truck.id));
      return `<article class="personnel-card rarity-${c.rarity}"><span class="pill pill-green">${c.rarity}</span><h3>${c.name}</h3><p>${EXPEDITION_REGIONS[c.region]} · Stufe ${card.level}/10 · ${labels[c.bonus]} +${bonus}${c.bonus === 'capacity' ? '' : ' %'}</p>${vehicleData}<p>${tier ? `${card.progress}/${cost} ${tier}-Shards bis Stufe ${card.level + 1}` : 'Maximalstufe'}</p>${tier ? `<button class="button button-primary" data-character-shard="${c.id}" ${expedition.shards[tier] ? '' : 'disabled'}>1 ${tier}-Shard zuweisen</button><button class="button button-outline" data-character-fill="${c.id}" ${expedition.shards[tier] ? '' : 'disabled'}>Bis zum nächsten Level einzahlen</button>` : ''}<button class="button button-primary" data-garage-${parked ? 'remove' : 'add'}="${c.id}" ${parked ? busy ? 'disabled' : '' : regularTruckCount() >= 10 ? 'disabled' : ''}>${parked ? 'Aus Fuhrpark nehmen' : 'In Fuhrpark einsetzen'}</button><div class="expedition-truck-choices">${currentTemplate.map((id, seat) => `<button class="button button-outline" data-character-seat="${c.id}:${selectedFleetTemplate},${seat}" ${id === c.id ? 'disabled' : ''}>Flotte ${selectedFleetTemplate + 1} · Platz ${seat + 1}</button>`).join('')}</div></article>`;
    }).join('');
  }
  function renderCompany() {
    $('#company-department-intro').textContent = `Abteilungen am Hauptsitz in ${startCityById(game.startCity).city}`;
    $('#hub-capacity-text').textContent = `${cityTruckCount()} von ${hubCapacity()} Stadttransporterplätzen belegt. ${hub() ? 'Dein Stadthub ist geöffnet.' : 'Dein Stadthub kann kostenlos eröffnet werden.'}`;
    $('#transport-item-stock').textContent = `${integer(game.inventory.companyItems || 0)} Firmenausbau-Items · ${integer(game.inventory.companyItemTkmRemainder || 0)} / ${integer(COMPANY_BALANCE.tkmPerItem)} tkm`;
    $('#transport-upgrade-grid').innerHTML = ['national', 'international'].flatMap(category => ['premium', 'volume', 'range'].map(kind => {
      const upgrade = companyFor().transportUpgrades[category];
      const level = upgrade[`${kind}Level`];
      const limit = TRANSPORT_UPGRADE_LIMITS[category][kind];
      const rules = transportRules(category);
      const cost = transportUpgradeCost(category, kind);
      const value = kind === 'premium' ? `+${level} % auf die Abschlussprämie` : kind === 'volume' ? `${rules.minVolume}–${rules.maxVolume} t Auftragsmenge` : `${rules.minDistance}–${rules.maxDistance} km Obergrenze`;
      const title = kind === 'premium' ? 'Prämie' : kind === 'volume' ? 'Menge' : 'Reichweite';
      return `<article class="offer-upgrade-card"><div class="department-card-head"><h3>${categoryById(category).label} · ${title}</h3><span class="pill ${cost ? 'pill-gray' : 'pill-green'}">${level} / ${limit}</span></div><p>${value}</p><button type="button" class="button button-primary" data-upgrade-transport="${category}:${kind}" ${!cost || game.coins < cost.coins || game.inventory.companyItems < cost.items ? 'disabled' : ''}>${cost ? `${cost.items} Items + ${money(cost.coins)} M` : 'Maximal ausgebaut'}</button></article>`;
    })).join('');
    $('#company-departments').innerHTML = DEPARTMENTS.map(department => {
      const unlocked = !!companyFor().departments[department.id];
      const status = department.id === 'hr' ? 'Neugestaltung in Vorbereitung' : !unlocked ? 'Gesperrt' : department.id === 'workshop' ? `Stufe ${companyFor().workshopLevel} / ${MAX_WORKSHOP_LEVEL}` : department.id === 'sales' ? `Stufe ${companyFor().salesLevel} / ${MAX_SALES_LEVEL}` : 'Freigeschaltet';
      return `<article class="department-card ${unlocked ? '' : 'department-locked'}"><div class="department-icon">${department.icon}</div><h3>${department.name}</h3><p>${status}</p><button type="button" class="button ${unlocked ? 'button-primary' : 'button-outline'}" data-open-department="${department.id}" aria-label="${department.name} ${department.id === 'hr' ? 'ansehen' : 'ausbauen'}">${department.id === 'hr' ? 'Ansehen' : 'Ausbauen'}</button></article>`;
    }).join('');
    $('#hr-upgrades').hidden = selectedDepartmentId !== 'hr' || !companyFor().departments.hr;
    $('#dispatch-upgrades').hidden = selectedDepartmentId !== 'dispatch' || !companyFor().departments.dispatch;
    if (companyFor().departments.dispatch) {
      const currentLevel = companyFor().offerLevel || 0;
      const maxed = currentLevel >= MAX_OFFER_LEVEL;
      const cost = maxed ? 0 : offerUpgradeCost();
      const items = COMPANY_BALANCE.upgradeItems(currentLevel + 1);
      const label = maxed ? 'Maximal ausgebaut' : `Ausbauen · ${items} Items + ${money(cost)} M`;
      $('#dispatch-upgrade-list').innerHTML = `<article class="offer-upgrade-card"><div class="department-card-head"><h3>Auftragsbörse</h3><span class="pill ${maxed ? 'pill-green' : 'pill-gray'}">Stufe ${currentLevel} / ${MAX_OFFER_LEVEL}</span></div><p>${offerLimit()} verfügbare Aufträge insgesamt${maxed ? ' · Maximum erreicht' : ' · nächste Stufe +1'}</p><div class="upgrade-pips">${Array.from({ length: MAX_OFFER_LEVEL }, (_, i) => `<span class="upgrade-pip ${i < currentLevel ? 'filled' : ''}"></span>`).join('')}</div><button class="button button-primary" data-upgrade-offers="all" ${maxed || game.coins < cost || game.inventory.companyItems < items ? 'disabled' : ''}>${label}</button></article>`;
    }
    $('#workshop-upgrades').hidden = selectedDepartmentId !== 'workshop' || !companyFor().departments.workshop;
    if (companyFor().departments.workshop) {
      const level = companyFor().workshopLevel;
      const maxed = level >= MAX_WORKSHOP_LEVEL;
      const cost = maxed ? 0 : workshopUpgradeCost();
      $('#workshop-level').textContent = `Stufe ${level} / ${MAX_WORKSHOP_LEVEL}`;
      $('#workshop-rate').textContent = `${rateMoney(level * .001)} M / km Rabatt`;
      $('#workshop-discount').textContent = `Aktuelle Fahrzeugpreise: ${vehicleCostRange()}`;
      $('#workshop-pips').innerHTML = Array.from({ length: MAX_WORKSHOP_LEVEL }, (_, i) => `<span class="upgrade-pip ${i < level ? 'filled' : ''}"></span>`).join('');
      const button = $('#workshop-upgrade-button');
      const items = COMPANY_BALANCE.upgradeItems(level + 1);
      button.disabled = maxed || game.coins < cost || game.inventory.companyItems < items;
      button.textContent = maxed ? 'Maximal ausgebaut' : `Nächste Stufe · ${items} Items + ${money(cost)} M`;
    }
    $('#sales-upgrades').hidden = selectedDepartmentId !== 'sales' || !companyFor().departments.sales;
    if (companyFor().departments.sales) {
      const level = companyFor().salesLevel;
      const maxed = level >= MAX_SALES_LEVEL;
      const cost = maxed ? 0 : salesUpgradeCost();
      $('#sales-level').textContent = `Stufe ${level} / ${MAX_SALES_LEVEL}`;
      $('#sales-pin-count').textContent = `${pinnedOrders().length} / ${pinLimit()} gehalten`;
      $('#sales-pips').innerHTML = Array.from({ length: MAX_SALES_LEVEL }, (_, i) => `<span class="upgrade-pip ${i < level ? 'filled' : ''}"></span>`).join('');
      const button = $('#sales-upgrade-button');
      const items = COMPANY_BALANCE.upgradeItems(level + 1);
      button.disabled = maxed || game.coins < cost || game.inventory.companyItems < items;
      button.textContent = maxed ? 'Maximal ausgebaut' : `Stufe ${level + 1} · ${items} Items + ${money(cost)} M`;
    }
    renderDepartmentDialog();
  }
  function renderDepartmentDialog() {
    const department = DEPARTMENTS.find(item => item.id === selectedDepartmentId);
    if (!department) return;
    $('#department-dialog-location').textContent = `HAUPTSITZ ${startCityById(game.startCity).city.toUpperCase()}`;
    $('#department-dialog-title').textContent = department.name;
    const unlocked = !!companyFor().departments[department.id];
    const locked = $('#department-locked-content');
    locked.hidden = unlocked;
    if (unlocked) { locked.innerHTML = ''; return; }
    const available = ['dispatch', 'workshop', 'sales'].includes(department.id);
    const price = department.id === 'dispatch' ? DISPATCH_UNLOCK_PRICE : department.id === 'workshop' ? WORKSHOP_UNLOCK_PRICE : SALES_UNLOCK_PRICE;
    locked.innerHTML = `<p>${department.description}</p>${available ? `<div class="department-unlock"><span>Freischaltung</span><strong>${money(price)} M</strong></div><button type="button" class="button button-primary" data-unlock-department="${department.id}" ${game.coins < price ? 'disabled' : ''}>${game.coins < price ? 'Zu wenig Münzen' : 'Freischalten'}</button>` : '<p>Diese Abteilung wird später freigeschaltet.</p>'}`;
  }
  function openDepartmentDialog(id) {
    if (!DEPARTMENTS.some(department => department.id === id)) return;
    selectedDepartmentId = id;
    renderCompany();
    $('#department-dialog').showModal();
  }
  function pageHelp(view = currentView) {
    const percent = value => `${money(value * 100)} %`;
    const level = levelForXp(game.xp, game).level;
    const projectTons = kind => `${kind === 'special' ? 400 : 1100} + Regionsindex × ${kind === 'special' ? 60 : 140} t`;
    const projectKm = kind => `${kind === 'special' ? 120 : 240} + Regionsindex × ${kind === 'special' ? 25 : 40} km`;
    const pages = {
      dashboard: ['Dashboard', [
        ['Spielerlevel', `<p>Transportierte Tonnen geben XP: <code>XP je Tour = gelieferte Tonnen × bezahlte Richtungen</code> (bei Dual Way also doppelt). Für den nächsten Aufstieg benötigt Level L bis Level 24 <code>100 × L XP</code>, danach <code>4 × L² XP</code>. Aktuell: Level ${level}, nächste Stufe nach ${integer(playerXpForNextLevel(level))} XP ab Beginn dieses Levels.</p><p>Je Aufstieg: sofort 50 Expeditionspunkte sowie 5 dauerhaft verteilbare Punkte für Expeditions- und Überstundenmaximum. Jeder verteilte Punkt füllt den entsprechenden Vorrat ebenfalls um 1.</p>`],
        ['Münzen und Testknöpfe', `<p>Tourgewinn = Frachtvergütung − Fahrzeugkosten − Lastkosten. Abschlussprämien werden separat abgeholt. Der Testknopf schreibt ${integer(TEST_COINS_GRANT)} M gut; „Spielstand zurücksetzen“ beginnt einen neuen lokalen Spielstand.</p>`],
        ['Automatischer Fortschritt', '<p>Aufträge, Projekte und Expeditionen laufen nach Uhrzeit weiter. Beim erneuten Öffnen werden fällige Touren und Belohnungen nachberechnet. Der Spielstand liegt im Browser.</p>']
      ]],
      orders: ['Aufträge', [
        ['Angebote und Chancen', `<p>${BASE_OFFERS} Angebote zu Beginn, mit Disposition höchstens ${BASE_OFFERS + MAX_OFFER_LEVEL}. Jedes neue Angebot ist mit ${percent(1 - INTERNATIONAL_OFFER_CHANCE)} Regionalverkehr oder ${percent(INTERNATIONAL_OFFER_CHANCE)} Fernverkehr. Pro Angebot gibt es ${percent(CUSTOMER_OFFER_CHANCE)} Grundchance auf einen freigeschalteten Stammkunden des Segments. Fahrart: ${percent(1 - DUAL_WAY_CHANCE)} Single Way, ${percent(DUAL_WAY_CHANCE)} Dual Way.</p>`],
        ['Transportrechnung', `<p><code>Fracht = gelieferte t × einfache km × ${rateMoney(FREIGHT_PAY_PER_TON_KM)} M/tkm × bezahlte Richtungen</code>. Single Way bezahlt nur die Hinfahrt; Dual Way beide Richtungen. <code>Lastkosten = gelieferte t × einfache km × ${rateMoney(LOAD_COST_PER_TON_KM)} M/tkm × bezahlte Richtungen</code>. Fahrzeugkosten = gefahrene km einschließlich Rückfahrt × Betriebskosten des Fahrzeugs je km.</p><p>Abschlussprämie = Auftragsvolumen × bezahlte Richtungen × ${rateMoney(BASE_COMPLETION_PREMIUM_PER_TON)} M/t × (1 + Firmenprämienbonus). Sie wird nach Abschluss abgeholt.</p>`],
        ['Zeit, Aktualisierung und Halten', `<p>Tourzeit = Strecke / Tempo beladen + Rückweg / Tempo leer; bei Dual Way ist auch der Rückweg beladen. Alle ${AUTO_REFRESH_MS / 60000} Minuten kommen automatisch neue Angebote. Manuell kostet der Wechsel <code>${MANUAL_REFRESH_BASE_COST} M × max(1, eigene Fahrzeuge) × (1 + manuelle Wechsel seit dem letzten automatischen Wechsel)</code>. ${pinLimit()} Angebot(e) können derzeit gehalten werden; gehaltene Angebote überstehen beide Wechselarten.</p>`]
      ]],
      special: ['Großaufträge', [
        ['Fund und Umfang', `<p>Normale Stammkundenaufträge finden einen Sonderauftrag mit ${percent(SPECIAL_CHANCES.national.award)} im Regionalverkehr oder ${percent(SPECIAL_CHANCES.international.award)} im Fernverkehr, jeweils plus Kundenfähigkeit. Expeditionen geben absolut ${percent(EXPEDITION_JOB_WEIGHTS[2].chance * .9)} Sonderaufträge und ${percent(EXPEDITION_JOB_WEIGHTS[3].chance * .9)} Empfehlungsprojekte pro Auslosung. Umfang Sonderauftrag: <code>${projectTons('special')}</code>, <code>${projectKm('special')}</code>; Empfehlungsprojekt: <code>${projectTons('referral')}</code>, <code>${projectKm('referral')}</code>. Der Regionsindex ist 0 bis 4.</p>`],
        ['Frist und Flotte', `<p>Sonderauftrag: ${PROJECT_DEADLINES.special / 60000} Minuten Frist. Empfehlungsprojekt: ${PROJECT_DEADLINES.referral / 3600000} Stunden. Eine der drei Flottenvorlagen fährt mit 1 bis 5 Karten; jedes Fahrzeug hat eigene Nutzlast und eigenes Tempo. Die Prognose simuliert alle noch nötigen Touren. Eine Karte darf parallel in mehreren Projekten und im Fuhrpark fahren. Bei Fristablauf ohne vollständige Lieferung scheitert der Auftrag ohne Abschlussbelohnung.</p>`],
        ['Überstunden und Beute', `<p>Überstunden: 1, 5 oder 10 Punkte je Klick. Pro Punkt werden sofort 10 t geliefert; unabhängig je Punkt besteht ${percent(.01)} Chance auf 1 t zusätzlich. Regeneration: 1 Punkt je ${OVERTIME_REGEN_MS / 60000} Minuten bis zum persönlichen Maximum. Nach erfolgreichem Abschluss wird die Belohnung abgeholt. Modulchance: Sonderauftrag ${percent(SPECIAL_CHANCES.national.module)} regional / ${percent(SPECIAL_CHANCES.international.module)} fern; Empfehlungsprojekt ${percent(SPECIAL_CHANCES.national.referralModule)} / ${percent(SPECIAL_CHANCES.international.referralModule)}. Erfolgreiche Sonderaufträge finden zusätzlich mit ${percent(SPECIAL_CHANCES.national.referral)} / ${percent(SPECIAL_CHANCES.international.referral)} plus Kundenfähigkeit ein Empfehlungsprojekt.</p>`]
      ]],
      'expedition-jobs': ['Expeditionsaufträge', [
        ['Fund und Stufen', `<p>Bei jeder Endlosexpedition entfallen absolut ${percent(EXPEDITION_JOB_WEIGHTS[0].chance * .9)} auf einen Fahrzeugkartenauftrag und ${percent(EXPEDITION_JOB_WEIGHTS[1].chance * .9)} auf einen Materialauftrag. Stufe 1/2/3 transportiert ${EXPEDITION_JOB_TONS_PER_TIER}/${EXPEDITION_JOB_TONS_PER_TIER * 2}/${EXPEDITION_JOB_TONS_PER_TIER * 3} t. Die Stufenverteilung hängt von der Region ab; Region 5: ${EXPEDITION_STAGE_WEIGHTS[4].map(percent).join(' / ')}.</p>`],
        ['Touren und Beute', `<p>Ein freies geeignetes Fuhrparkfahrzeug fährt je Tour ${EXPEDITION_JOB_DISTANCE} km beladen hin und ${EXPEDITION_JOB_DISTANCE} km leer zurück. Touren = aufrunden(Restvolumen / Nutzlast), die letzte Tour kann kleiner sein. Fahrzeugkartenaufträge geben 2 garantierte Shards und mit ${percent(.2)} plus Flottenbonus einen weiteren. Materialaufträge geben mit ${percent(.2)} Shards, ${percent(.003)} ein Kapazitätsmodul und ${percent(COMPANY_BALANCE.materialItemChance)} Firmenausbau-Items.</p>`]
      ]],
      fleet: ['Fuhrpark', [
        ['Plätze und Fahrzeuge', `<p>${dispatchCapacity()} Plätze für Kartenfahrzeuge; jede gefundene Karte kann einmal eingesetzt werden. Sie kann zugleich in einer Flottenvorlage stehen. Der Händler verkauft nur Stadttransporter. Geeignete Klassen: Regionalverkehr 7,5-Tonner, 18-Tonner und 26-Tonner; Fernverkehr Sattelzug, 26-Tonner und 40-t-Tautliner.</p>`],
        ['Tempo und Ausbauten', `<p><code>Tempo = ${SPEED_KM_PER_SECOND} km/s × (1 + ${RARITY_SPEED_PER_LEVEL} × Rangstufen) × (1 − ${SPEED_LOSS_PER_TON} × geladene t)</code>. Jede Rangstufe bringt 0,5 % auf das Basistempo; maximal ${MAX_RARITY_LEVEL} Stufen. 1 Kapazitätsmodul bringt ${tons(CAPACITY_PER_MODULE)} t innerhalb der Modellgrenze. Die Werkstatt senkt die Fahrzeugkosten um 0,001 M/km je Stufe.</p>`],
        ['Einsetzen und Herausnehmen', '<p>Eine Karte bleibt in deiner Sammlung. Beim Herausnehmen bleiben Rang, Kapazität und Fahrstatistik erhalten. Karten mit laufendem normalen Auftrag oder Expeditionsauftrag können erst danach herausgenommen werden. Großaufträge nutzen eine Momentaufnahme der Kartenwerte beim Start.</p>']
      ]],
      dealer: ['Händler', [
        ['Kauf und Limit', `<p>Es werden nur Sprinter (${money(TRUCKS[0].price)} M, ${tons(TRUCKS[0].capacity)} t) und 3,5-Tonner (${money(TRUCKS[1].price)} M, ${tons(TRUCKS[1].capacity)} t) für den Stadthub verkauft. Vor dem Kauf muss der Stadthub eröffnet sein. Stadtfahrzeuglimit = <code>max(1, abrunden(Spielerlevel × 0,75))</code>; aktuell ${hubCapacity()}.</p>`],
        ['Betrieb', `<p>Leerfahrt-Betriebskosten: Sprinter ${rateMoney(TRUCKS[0].emptyCostPerKm)} M/km, 3,5-Tonner ${rateMoney(TRUCKS[1].emptyCostPerKm)} M/km, abzüglich Werkstattbonus. Beide fahren mit der allgemeinen Tempoformel und können Kapazitätsmodule und Zahnräder nutzen. Regionale und ferne Fahrzeuge findest du als Karten auf Expeditionen.</p>`]
      ]],
      hub: ['Stadthub', [
        ['Zyklus und Leistung', `<p>Eröffnung: ${HUB_PRICE} M. Ein Zyklus dauert ${HUB_CYCLE_MS / 60000} Minuten: ${HUB_WORK_SECONDS / 60} Minuten Fahrten, ${HUB_CYCLE_MS / 60000 - HUB_WORK_SECONDS / 60} Minuten Pause. Eine Fahrzeugtour fährt ${HUB_ROUTE_KM} km beladen und ${HUB_ROUTE_KM} km leer. Stündliche Kapazität = Summe je Fahrzeug aus <code>abrunden(${HUB_WORK_SECONDS} Sekunden / Tourdauer) × Nutzlast</code>.</p>`],
        ['Einkauf und Kasse', `<p>Der Vertrieb kauft ${hubSalesPercent(hub()?.salesLevel || 0)} % der möglichen Stundenmenge (Basis 75 %, +1 Prozentpunkt je Stufe bis 100 %). Pro verkaufter Tonne: ${rateMoney(HUB_SALE_PER_TON)} M Verkauf − ${rateMoney(HUB_PURCHASE_PER_TON)} M Einkauf. Pro Arbeitsstunde fallen 8–12 Abholhinweise an. Nach ${HUB_CASHBOX_CYCLES} nicht abgeholten Zyklen ist die Kasse voll.</p>`],
        ['Ausbau', `<p>Nächste Vertriebsstufe N kostet <code>5 × N Lieferantenkontakte</code>, <code>1 + abrunden((N−1)/25) Firmenausbau-Items</code> und <code>500 + 50 × N M</code>. Bauzeit = <code>12 × N Stunden</code>; maximale Stufe ${HUB_MAX_SALES_LEVEL}.</p>`]
      ]],
      inventory: ['Vorräte', [
        ['Was hier liegt', '<p>Zahnräder verbessern Fahrzeugränge; Kapazitätsmodule erhöhen Nutzlast. Abholhinweise werden zu Privatabholungen verarbeitet, Lieferantenkontakte bauen den Stadthub aus. Firmenausbau-Items dienen Firmenausbauten und Kundenaufträgen. Gefundene Großaufträge bleiben hier bis zum Start als Einträge sichtbar.</p>'],
        ['Erzeugung und Zufall', `<p>Für je ${integer(COMPANY_BALANCE.tkmPerItem)} tatsächlich beladene Tonnenkilometer normaler Regional- und Fernaufträge entsteht 1 Firmenausbau-Item; der Restzähler bleibt erhalten. Material-Expeditionsaufträge geben mit ${percent(COMPANY_BALANCE.materialItemChance)} zusätzlich 1/2/3 Items nach Auftragsstufe und mit ${percent(.003)} ein Kapazitätsmodul. Stadt-Hub-Zyklen erzeugen 8–12 Abholhinweise.</p>`],
        ['Zahnradloot', '<p>Je 100 tkm: Common 40 % für 1 und weitere 20 % für 2 Zahnräder. Je 1.000 tkm: Uncommon 18 % für 1 und weitere 7 % für 2. Bei Kundenaufträgen: Rare 8 % für 1. Teilblöcke werden anteilig ausgewürfelt. Sonder- und Empfehlungsprojekte können zusätzlich Epic oder Legendär geben.</p>']
      ]],
      development: ['Entwicklung', [
        ['Herstellung', `<p>${PRIVATE_PICKUP_HINT_COST} Abholhinweise ergeben eine Privatabholung. ${COMPANY_BALANCE.craftedOrderItems} Firmenausbau-Items ergeben einen Kundenauftrag für einen zufälligen freigeschalteten Stammkunden. Beide Aufträge bleiben in den Vorräten, bis ein passendes Fuhrparkfahrzeug zugewiesen wird.</p>`],
        ['Shards', `<p>${SHARD_COMBINE_RATIO} Shards einer Seltenheit werden zu 1 Shard der nächsten. Common → Uncommon → Rare. Fahrzeugkarten steigen durch Shards ihrer Seltenheit bis Level 10 auf; Kosten je Stufe: ${CHARACTER_LEVEL_COSTS.join(', ')} Shards.</p>`]
      ]],
      company: ['Firma', [
        ['Abteilungen', `<p>Disposition, Werkstatt und Vertrieb kosten je ${money(DISPATCH_UNLOCK_PRICE)} M zur Freischaltung. Disposition: <code>${BASE_OFFERS} + Stufe</code> verfügbare Angebote bis ${BASE_OFFERS + MAX_OFFER_LEVEL}; nächste Stufe kostet <code>500 × neue Stufe M</code> plus Items. Werkstatt: −0,001 M/km je Stufe bis ${MAX_WORKSHOP_LEVEL}; Kosten <code>100 × aufrunden(neue Stufe/5) M</code> plus Items. Vertrieb: <code>1 + Stufe</code> haltbare Aufträge bis ${1 + MAX_SALES_LEVEL}; nächste Stufe kostet <code>500 × neue Stufe M</code> plus Items.</p>`],
        ['Transportsegmente', '<p>Prämienausbau gibt +1 Prozentpunkt auf die einmalige Abschlussprämie je Stufe. Mengenausbau: Maximum +1 t je Stufe, Minimum +1 t je zwei Stufen. Reichweitenstufe erweitert die obere Routengrenze um 1 km. Kosten für neue Stufe N: 2 + abrunden((N−1)/10) Items; Münzen Prämie 10×N², Menge 50×N², Reichweite 100×N².</p>']
      ]],
      expeditions: ['Expeditionen', [
        ['Punkte und Freischaltung', `<p>Start: ${EXPEDITION_COST * 10} Expeditionspunkte. 1 Punkt regeneriert je ${EXPEDITION_REGEN_MS / 60000} Minuten, beeinflusst durch Flotte 1. Eine Endlosexpedition kostet ${EXPEDITION_COST} Punkte. Ort 1–7 einer Region kostet <code>3 + 9 × Regionsindex + abrunden(Ortsindex/2)</code> Punkte. Region und Endlosort öffnen nach dem 7. Ort der vorherigen Region.</p>`],
        ['Fundchancen je Auslosung', `<p>Genau eine der drei regionalen Karten: Common ${percent(EXPEDITION_CARD_CHANCES[0].chance)}, Uncommon ${percent(EXPEDITION_CARD_CHANCES[1].chance)}, Rare ${percent(EXPEDITION_CARD_CHANCES[2].chance)}. Die übrigen ${percent(1 - EXPEDITION_CARD_CHANCES.reduce((sum, item) => sum + item.chance, 0))}: Fahrzeugkartenauftrag ${percent(EXPEDITION_JOB_WEIGHTS[0].chance * .9)}, Materialauftrag ${percent(EXPEDITION_JOB_WEIGHTS[1].chance * .9)}, Sonderauftrag ${percent(EXPEDITION_JOB_WEIGHTS[2].chance * .9)}, Empfehlungsprojekt ${percent(EXPEDITION_JOB_WEIGHTS[3].chance * .9)}. Duplikate geben 1 Shard der Karten-Seltenheit.</p>`],
        ['Missionen', '<p>Jeder der sieben Orte hat eine einmalige Kapazitätsmission (+1 maximale Expeditionskapazität nach Abholung). Das Freilegen des Endlosorts gibt 1 Modul; sein einmaliger Auftrag schaltet nach Abholung den regionalen Stammkunden frei. Fahrzeuge für diese Transporte kommen aus dem Fuhrpark.</p>']
      ]],
      personnel: ['Flotte', [
        ['Vorlagen und Boni', '<p>Es gibt drei Vorlagen mit je fünf Plätzen. Eine Karte darf je Vorlage einmal eingesetzt werden und zusätzlich im Fuhrpark stehen. Flotte 1 bestimmt die bisherigen Boni für Expeditionsregeneration, Punktemaximum, Zusatz-Shards, kürzere Missionen und Expeditionsmünzen. Für Großaufträge wählst du beim Start eine der drei Vorlagen; eine Karte genügt. Dieselbe Vorlage darf mehrere Projekte parallel fahren.</p>'],
        ['Kartenwerte', `<p>Jede Region bietet Common ${percent(EXPEDITION_CARD_CHANCES[0].chance)}, Uncommon ${percent(EXPEDITION_CARD_CHANCES[1].chance)} und Rare ${percent(EXPEDITION_CARD_CHANCES[2].chance)} je Endlosexpedition. Kartenlevel 1–10; Shardkosten: ${CHARACTER_LEVEL_COSTS.join(', ')}. Bonus einer eingesetzten Karte = <code>Grundwert + (Kartenlevel − 1) × Stufenschritt</code>. Als Fahrzeug gelten die Modell-Nutzlast, der Fahrzeugrang und die Tempoformel.</p>`]
      ]],
      statistics: ['Statistiken', [
        ['Transportwerte', `<p>Gelieferte Tonnen zählen pro bezahlter Richtung: Dual Way zählt Hin- und Rückfracht. Gefahrene Kilometer enthalten auch leere Rückfahrten. Tonnenkilometer = gelieferte t × einfache km × bezahlte Richtungen. CO₂ ist eine Schätzung: <code>beladene tkm × ${money(CO2_KG_PER_TON_KM * 1000)} g/tkm</code>; leere Fahrten fehlen darin.</p>`],
        ['Münzenbilanz', '<p>Transportgewinn = gebuchte Frachtumsätze − Fahrzeug- und Lastkosten. Abgeholte Auftragsprämien und Expeditionsmünzen werden separat gezählt. Käufe, Ausbauten und Testmünzen stehen als eigene Posten in der Bilanz.</p>']
      ]],
      customers: ['Stammdaten', [
        ['Freischaltung und Vertrauen', `<p>Ein Kunde wird durch den einmaligen Endlosort-Auftrag seiner Region freigeschaltet. Normale Aufträge geben ${TRUST_REWARDS.normal}, Sonderaufträge ${TRUST_REWARDS.special} und Empfehlungsprojekte ${TRUST_REWARDS.referral} Vertrauen. Für Kundenlevel L sind insgesamt <code>110 × L + 5 × L × (L − 1)</code> Vertrauen nötig, maximal Level ${MAX_TRUST_LEVEL}. Jeder Aufstieg gibt 1 verteilbaren Fähigkeitspunkt.</p>`],
        ['Kundenfähigkeiten', `<p>Vergütung: +0,1 % Frachtvergütung je Punkt (max. ${CUSTOMER_SKILL_LIMITS.pay}). Sonderauftragchance: +0,1 Prozentpunkt je Punkt (max. ${CUSTOMER_SKILL_LIMITS.special}) auf die Basis ${percent(SPECIAL_CHANCES.national.award)} regional / ${percent(SPECIAL_CHANCES.international.award)} fern. Empfehlungschance: +0,1 Prozentpunkt je Punkt (max. ${CUSTOMER_SKILL_LIMITS.referral}) auf die Basis ${percent(SPECIAL_CHANCES.national.referral)} / ${percent(SPECIAL_CHANCES.international.referral)}. Die Zuteilung bleibt bestehen.</p>`]
      ]]
    };
    const sourceNames = {
      dashboard: 'playerXpForNextLevel, TEST_COINS_GRANT',
      orders: 'BASE_OFFERS, INTERNATIONAL_OFFER_CHANCE, CUSTOMER_OFFER_CHANCE, tourEconomics, manualRefreshCost',
      special: 'PROJECT_DEADLINES, OVERTIME_REGEN_MS, queueCustomerTrip, spendOvertime, settleFleetProjects',
      'expedition-jobs': 'EXPEDITION_JOB_WEIGHTS, EXPEDITION_JOB_TONS_PER_TIER, expeditionTransportPlan, awardExpeditionLoot',
      fleet: 'TRUCKS, CATEGORIES, truckSpeed, upgradeTruckCapacity, RANK_GEAR_COSTS',
      dealer: 'TRUCKS, hubCapacity, buyTruck',
      hub: 'HUB_CYCLE_MS, HUB_WORK_SECONDS, HUB_ROUTE_KM, hubHourlyCapacity, hubSalesPercent',
      inventory: 'COMPANY_BALANCE, rollGearLoot, awardExpeditionLoot',
      development: 'PRIVATE_PICKUP_HINT_COST, SHARD_COMBINE_RATIO, CHARACTER_LEVEL_COSTS',
      company: 'DEPARTMENTS, TRANSPORT_UPGRADE_LIMITS, COMPANY_BALANCE, transportRules',
      expeditions: 'EXPEDITION_CARD_CHANCES, EXPEDITION_JOB_WEIGHTS, EXPEDITION_STAGE_WEIGHTS, expeditionDuration',
      personnel: 'EXPEDITION_CHARACTERS, CHARACTER_LEVEL_COSTS, expeditionBonus',
      statistics: 'CO2_KG_PER_TON_KM, tourEconomics, renderStatistics',
      customers: 'SPECIAL_CHANCES, TRUST_REWARDS, CUSTOMER_SKILL_LIMITS, trustTotalForLevel'
    };
    const page = pages[view];
    return page ? [page[0], [...page[1], ['Werte im Code ändern', `<p>Die zugehörigen Konstanten und Funktionen stehen in <code>app.js</code>: <code>${sourceNames[view]}</code>.</p>`]]] : ['Spielregeln', [['Hilfe', '<p>Für diese Seite liegen noch keine Regeln vor.</p>']]];
  }
  function openPageHelp() {
    const [title, sections] = pageHelp();
    $('#page-help-title').textContent = `${title}: Regeln und Berechnungen`;
    $('#page-help-content').innerHTML = sections.map(([heading, content]) => `<section class="page-help-section"><h3>${heading}</h3>${content}</section>`).join('');
    $('#page-help-dialog').showModal();
  }
  function render() {
    renderStats();
    if (currentView === 'dashboard') renderDashboard();
    if (currentView === 'orders') renderOrders();
    if (currentView === 'fleet') renderFleet();
    if (currentView === 'dealer') renderDealer();
    if (currentView === 'inventory') renderInventory();
    if (currentView === 'development') renderDevelopment();
    if (currentView === 'company') renderCompany();
    if (currentView === 'statistics') renderStatistics();
    if (currentView === 'customers') renderCustomers();
    if (currentView === 'expeditions') renderExpeditions();
    if (currentView === 'personnel') renderPersonnel();
    if (currentView === 'special') renderSpecialTrips();
    if (currentView === 'expedition-jobs') renderExpeditionJobs();
    if (currentView === 'hub') renderHub();
  }

  function showStartDialog() {
    if (game.startCity) return;
    const continents = [...new Set(START_CITIES.map(location => location.continent))];
    $('#start-city-list').innerHTML = continents.map(continent => `<section class="start-city-region"><h3>${continent}</h3><div class="start-city-grid">${START_CITIES.filter(location => location.continent === continent).map(location => `<button type="button" class="start-city-choice" data-start-city="${location.id}"><span>⌖</span><span><strong>${location.city}</strong><small>${location.country}</small></span></button>`).join('')}</div></section>`).join('');
    if (!$('#start-dialog').open) $('#start-dialog').showModal();
  }

  function chooseStartCity(id) {
    const home = startCityById(id);
    if (!home || game.startCity) return;
    game = newGame(id);
    save();
    $('#start-dialog').close();
    setView('dashboard');
    showToast(`Deine Spedition startet in ${home.city}.`);
  }

  function openAssignDialog(orderId) {
    const order = game.orders.find(o => o.id === orderId && o.status === 'available');
    if (!order || !eligibleFreeTrucks(order).length) return;
    $('#assign-title').textContent = `${order.cargo} nach ${order.to}`;
    const routeDetails = order.routeType === 'single' ? 'Single Way: Rückfahrt leer und unbezahlt' : order.routeType === 'dual' ? 'Dual Way: Rückfracht wird ebenfalls vergütet' : categoryById(order.category).label;
    $('#assign-description').textContent = `${routeDetails} · ${order.volume} t · ${order.distance} km je Strecke · ${orderCustomer(order)}. Wähle einen passenden freien LKW.`;
    $('#assign-vehicles').innerHTML = eligibleFreeTrucks(order).map(t => {
      const result = orderEconomics(order, t);
      const drivenKm = result.trips * order.distance * drivenLegs(order);
      const tonKm = order.volume * order.distance * paidLegs(order);
      const paySkill = order.customer ? customerSkillLevels(order.customer).pay : 0;
      const freightLabel = `Frachtvergütung · ${tons(tonKm)} tkm × ${rateMoney(FREIGHT_PAY_PER_TON_KM)} M/tkm${paySkill ? ` × ${money(100 + paySkill * .1)} % Kundenfähigkeit` : ''}`;
      return `<button type="button" class="assign-choice" data-choose="${t.id}" data-order="${order.id}"><span class="assign-choice-top"><span><strong>${t.symbol} ${t.model} · ${t.id}</strong><small>${tons(t.capacity)} t pro Tour · ${result.trips} Touren · ${duration(orderDuration(order, t))}</small></span><strong class="assign-choice-profit ${result.totalProfit < 0 ? 'is-negative' : ''}">${signedMoney(result.totalProfit)}</strong></span><span class="assign-breakdown"><span><span>${freightLabel}</span><strong>${signedMoney(result.revenue)}</strong></span><span><span>Fahrzeug · ${integer(drivenKm)} km × ${rateMoney(operatingCostPerKm(t))} M</span><strong>${signedMoney(-result.distanceCost)}</strong></span><span><span>Lastkosten · ${tons(tonKm)} tkm × ${rateMoney(LOAD_COST_PER_TON_KM)} M</span><strong>${signedMoney(-result.loadedCost)}</strong></span><span class="assign-breakdown-subtotal"><span>Transportgewinn</span><strong>${signedMoney(result.transportProfit)}</strong></span><span><span>Auftragsprämie · nach Abschluss abholen</span><strong>${signedMoney(result.bonus)}</strong></span></span><span class="assign-choice-foot">Gesamtgewinn inkl. Prämie · ${signedMoney(round2(estimatedProfitPerMinute(order, t)))} / Min. · Auftrag zuweisen ↗</span></button>`;
    }).join('');
    $('#assign-dialog').showModal();
  }
  function openExpeditionJobDialog(region, jobId) {
    const job = game.expedition.jobs.find(item => item.id === jobId && item.region === region);
    if (!job || !game.expedition.regions[region]?.endlessUnlocked) return;
    $('#assign-title').textContent = `${expeditionJobLabel(job.kind)} #${job.id}`;
    $('#assign-description').textContent = `${EXPEDITION_REGIONS[region]} · Stufe ${expeditionJobTier(job)} · ${expeditionJobVolume(job)} t · ${EXPEDITION_JOB_DISTANCE} km hin und ${EXPEDITION_JOB_DISTANCE} km zurück je Tour. Wähle einen freien regulären LKW.`;
    const trucks = freeTrucks().filter(truck => truck.tier >= 2);
    $('#assign-vehicles').innerHTML = trucks.length ? trucks.map(truck => {
      const plan = expeditionTransportPlan(job, truck);
      const totalSeconds = (plan.tours.at(-1).endsAt - plan.tours[0].startsAt) / 1000;
      return `<button type="button" class="assign-choice" data-choose-expedition="${region}:${jobId}:${truck.id}"><span><strong>${truck.symbol} ${truck.model} · ${truck.id}</strong><small>${tons(truck.capacity)} t pro Tour · ${plan.tours.length} Touren · ca. ${duration(totalSeconds)}</small></span><span>Auftrag zuweisen ↗</span></button>`;
    }).join('') : '<p>Derzeit ist kein regulärer LKW frei.</p>';
    $('#assign-dialog').showModal();
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.levelAllocate) {
      const [kind, change] = target.dataset.levelAllocate.split(':');
      adjustLevelAllocation(kind, Number(change));
      return;
    }
    if (target.dataset.idleOrders !== undefined) { openIdleOrders(target.dataset.category); return; }
    if (target.dataset.view) setView(target.dataset.view);
    if (target.dataset.go) setView(target.dataset.go);
    if (target.dataset.buyHub !== undefined) buyHub();
    if (target.dataset.toggleHubTruck) toggleHubTruck(target.dataset.toggleHubTruck);
    if (target.dataset.collectHub !== undefined) collectHub();
    if (target.dataset.upgradeHub !== undefined) startHubUpgrade();
    if (target.dataset.combineHints !== undefined) combinePickupHints();
    if (target.dataset.craftCustomer !== undefined) craftCustomerOrder();
    if (target.dataset.startPrivate) openPrivatePickupDialog(target.dataset.startPrivate);
    if (target.dataset.startCrafted) openCraftedOrderDialog(target.dataset.startCrafted);
    if (target.dataset.buy !== undefined) buyTruck(Number(target.dataset.buy));
    if (target.dataset.garageAdd) addCardToGarage(target.dataset.garageAdd);
    if (target.dataset.garageRemove) removeCardFromGarage(target.dataset.garageRemove);
    if (target.dataset.upgradeRarity) upgradeTruckRarity(target.dataset.upgradeRarity);
    if (target.dataset.upgradeCapacity) upgradeTruckCapacity(target.dataset.upgradeCapacity);
    if (target.dataset.openSale) openSaleDialog(target.dataset.openSale);
    if (target.dataset.projectOpen) { selectedProjectId = target.dataset.projectOpen; setView('special'); renderSpecialTrips(); }
    if (target.dataset.projectBack !== undefined) { selectedProjectId = null; renderSpecialTrips(); }
    if (target.dataset.projectStart) { const [id, template] = target.dataset.projectStart.split(':'); startFleetProject(id, Number(template)); }
    if (target.dataset.projectOvertime) { const [id, amount] = target.dataset.projectOvertime.split(':'); spendOvertime(id, Number(amount)); }
    if (target.dataset.expeditionJobGroup) { selectedExpeditionJobGroup = target.dataset.expeditionJobGroup; renderExpeditionJobs(); }
    if (target.dataset.expeditionJobBack !== undefined) { selectedExpeditionJobGroup = null; renderExpeditionJobs(); }
    if (target.dataset.openExpeditionJob) {
      const [region, jobId] = target.dataset.openExpeditionJob.split(':').map(Number);
      openExpeditionJobDialog(region, jobId);
    }
    if (target.dataset.chooseExpedition) {
      const [region, jobId, truckId] = target.dataset.chooseExpedition.split(':');
      if (startExpeditionMission(Number(region), 'endless', truckId, Number(jobId))) $('#assign-dialog').close();
    }
    if (target.dataset.truckOrders !== undefined) { $('#truck-dialog').close(); setView('orders'); }
    if (target.dataset.openDepartment) openDepartmentDialog(target.dataset.openDepartment);
    if (target.dataset.unlockDepartment) unlockDepartment(target.dataset.unlockDepartment);
    if (target.dataset.upgradeOffers) upgradeOfferLimit(target.dataset.upgradeOffers);
    if (target.dataset.upgradeWorkshop !== undefined) upgradeWorkshop();
    if (target.dataset.upgradeSales !== undefined) upgradeSales();
    if (target.dataset.upgradeTransport) {
      const [category, kind] = target.dataset.upgradeTransport.split(':');
      upgradeTransport(category, kind);
    }
    if (target.dataset.customerSkill) allocateCustomerSkill(target.dataset.customer, target.dataset.customerSkill);
    if (target.dataset.expeditionRegion !== undefined) { selectedExpeditionRegion = Number(target.dataset.expeditionRegion); selectedExpeditionNode = Math.min(game.expedition.regions[selectedExpeditionRegion].discovered, 7); renderExpeditions(); }
    if (target.dataset.expeditionBack !== undefined) { selectedExpeditionRegion = null; renderExpeditions(); }
    if (target.dataset.expeditionNode !== undefined) { selectedExpeditionNode = Number(target.dataset.expeditionNode); renderExpeditions(); }
    if (target.dataset.expeditionOpen !== undefined) openExpeditionDrawDialog(Number(target.dataset.expeditionOpen));
    if (target.dataset.expeditionDraw !== undefined) {
      const index = Number(target.dataset.expeditionDraw);
      const found = drawExpeditionJob(index);
      if (found && renderExpeditionDrawDialog(index)) $('#expedition-draw-content').insertAdjacentHTML('afterbegin', `<p class="expedition-draw-result">Gefunden: ${found.startsWith('card:') ? EXPEDITION_CHARACTERS.find(card => card.id === found.slice(5)).name : expeditionJobLabel(found)}</p>`);
    }
    if (target.dataset.expeditionClaim !== undefined) claimExpeditionMission(Number(target.dataset.expeditionClaim));
    if (target.dataset.expeditionDiscover !== undefined) discoverExpeditionPlace(Number(target.dataset.expeditionDiscover));
    if (target.dataset.expeditionStart) {
      const [region, kind, place, truckId] = target.dataset.expeditionStart.split(':');
      startExpeditionMission(Number(region), kind, truckId, Number(place));
    }
    if (target.dataset.characterSeat) {
      const [id, seat] = target.dataset.characterSeat.split(':');
      const [template, slot] = seat.split(',').map(Number);
      assignCharacterSeat(id, slot, template);
    }
    if (target.dataset.fleetTemplate !== undefined) { selectedFleetTemplate = Number(target.dataset.fleetTemplate); renderPersonnel(); }
    if (target.dataset.characterRemove !== undefined) { const [template, seat] = target.dataset.characterRemove.split(':').map(Number); const slots = fleetTemplate(template); if (slots) { slots[seat] = null; save(); render(); } }
    if (target.dataset.characterShard) giveCharacterShard(target.dataset.characterShard);
    if (target.dataset.characterFill) giveCharacterShard(target.dataset.characterFill, true);
    if (target.dataset.shardCombine) combineExpeditionShards(target.dataset.shardCombine);
    if (target.dataset.startCity) chooseStartCity(target.dataset.startCity);
    if (target.dataset.pin) toggleOrderPin(target.dataset.pin);
    if (target.dataset.assign) openAssignDialog(target.dataset.assign);
    if (target.dataset.choose) assignOrder(target.dataset.order, target.dataset.choose);
    if (target.dataset.choosePrivate) assignPrivatePickup(target.dataset.order, target.dataset.choosePrivate);
    if (target.dataset.chooseCrafted) assignCraftedOrder(target.dataset.order, target.dataset.chooseCrafted);
    if (target.dataset.claimOrder) claimOrderReward(target.dataset.claimOrder);
  });
  $('#fleet-list').addEventListener('click', event => {
    const row = event.target.closest('tr[data-fleet-truck]');
    if (row) openTruckDialog(row.dataset.fleetTruck);
  });
  $('#fleet-list').addEventListener('keydown', event => {
    if (!['Enter', ' '].includes(event.key)) return;
    const row = event.target.closest('tr[data-fleet-truck]');
    if (!row) return;
    event.preventDefault();
    openTruckDialog(row.dataset.fleetTruck);
  });
  $('#close-truck-dialog').addEventListener('click', () => $('#truck-dialog').close());
  $('#close-expedition-draw').addEventListener('click', () => $('#expedition-draw-dialog').close());
  $('#page-help-button').addEventListener('click', openPageHelp);
  $('#close-page-help').addEventListener('click', () => $('#page-help-dialog').close());
  $('#level-up-dialog').addEventListener('cancel', event => event.preventDefault());
  $('#confirm-level-up').addEventListener('click', confirmLevelUpAllocation);
  $('#truck-dialog').addEventListener('close', () => { selectedTruckId = null; });
  $('#cancel-sale').addEventListener('click', () => $('#sale-dialog').close());
  $('#close-sale-dialog').addEventListener('click', () => $('#sale-dialog').close());
  $('#confirm-sale').addEventListener('click', confirmSale);
  $('#sale-dialog').addEventListener('close', () => { pendingSaleTruckId = null; pendingSaleQuote = null; });
  $('#close-reward-dialog').addEventListener('click', () => $('#reward-dialog').close());
  $('#reward-done-button').addEventListener('click', () => $('#reward-dialog').close());
  $('#collect-all-rewards').addEventListener('click', openBulkRewardDialog);
  $('#confirm-bulk-reward').addEventListener('click', confirmBulkRewards);
  $('#close-bulk-reward').addEventListener('click', () => $('#bulk-reward-dialog').close());
  $('#cancel-bulk-reward').addEventListener('click', () => $('#bulk-reward-dialog').close());
  $('#bulk-reward-dialog').addEventListener('close', () => { bulkRewardIds = []; });
  $('#start-dialog').addEventListener('cancel', event => event.preventDefault());
  $('#close-department-dialog').addEventListener('click', () => $('#department-dialog').close());
  $('#department-dialog').addEventListener('close', () => { selectedDepartmentId = null; });
  $('#refresh-orders').addEventListener('click', () => {
    if (!manualRefreshOrders()) { showToast(`${money(manualRefreshCost())} Münzen für neue Angebote nötig.`); return; }
    render(); showToast('Neue Angebote sind eingetroffen.');
  });
  $('#test-coins-button').addEventListener('click', () => {
    game.coins = round2(game.coins + TEST_COINS_GRANT);
    game.stats.testCoinsGranted = (game.stats.testCoinsGranted || 0) + TEST_COINS_GRANT;
    save(); render(); showToast(`${money(TEST_COINS_GRANT)} Testmünzen gutgeschrieben.`);
  });
  $('#reset-button').addEventListener('click', () => {
    if (!confirm('Den lokalen Spielstand wirklich zurücksetzen? Alle LKW und Fortschritte gehen verloren.')) return;
    game = newGame(); save(); setView('dashboard'); showStartDialog();
  });
  window.addEventListener('hashchange', () => {
    const requested = location.hash.slice(1);
    const view = requested === 'garage' ? 'fleet' : requested;
    if (['dashboard', 'orders', 'special', 'fleet', 'dealer', 'hub', 'inventory', 'development', 'company', 'personnel', 'expeditions', 'statistics', 'customers'].includes(view) && view !== currentView) setView(view);
  });
  function tick() {
    const now = Date.now();
    $('#game-clock').textContent = new Date(now).toLocaleTimeString('de-DE');
    const refreshed = autoRefreshOrders(now);
    const tripsSettled = settleTrips(now);
    const projectsSettled = settleFleetProjects(now);
    const overtimeRegenerated = regenerateOvertime(now);
    const expeditionsSettled = settleExpeditions(now);
    settleHub(now);
    if (tripsSettled || projectsSettled || overtimeRegenerated || expeditionsSettled || refreshed || now - lastPaint > 500) { render(); lastPaint = now; }
    maybeShowLevelUpDialog();
  }
  const requested = location.hash.slice(1);
  const requestedView = requested === 'garage' ? 'fleet' : requested;
  for (const id of ['hr-upgrades', 'dispatch-upgrades', 'workshop-upgrades', 'sales-upgrades']) {
    $('#department-detail-content').appendChild($(`#${id}`));
  }
  replenishOrders();
  save();
  if (game.startCity && ['dashboard', 'orders', 'special', 'expedition-jobs', 'fleet', 'dealer', 'hub', 'inventory', 'development', 'company', 'personnel', 'expeditions', 'statistics', 'customers'].includes(requestedView)) currentView = requestedView;
  setView(currentView);
  showStartDialog();
  tick();
  setInterval(tick, 250);
})();
