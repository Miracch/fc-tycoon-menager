
import { Facility, Player, Position, Sponsorship, ClubSponsor, LeagueTeam, Achievement, GameEvent, TrophyDefinition } from './types';

// Economy scaled down for Local Amateur start
export const INITIAL_MONEY = 10000;
export const INITIAL_FANS = 50;

// 6 Tiers: 6 (Lowest/Start) -> 1 (Highest)
export const LEAGUE_NAMES: Record<number, string> = {
  6: "Yerel Amatör Lig",     // Level 0
  5: "Bölgesel Amatör Lig",  // Level 1
  4: "Ulusal Yarı-Pro Lig",  // Level 2
  3: "TFF 3. Lig",           // Level 3
  2: "TFF 2. Lig",           // Level 4
  1: "Süper Lig"             // Level 5
};

// AI Team Names per Tier
export const AI_TEAM_NAMES: Record<number, string[]> = {
    6: [ // Yerel Amatör
        "Yıldız Kahve", "Köyiçi İdman", "Sanayi Çıraklar", "Lise Gücü", "Mahalle United",
        "Kasaplar SK", "Terziler Birliği", "Çay Ocağı FK", "Park Gençlik", "Site Sakinleri",
        "Pazar Esnafı", "Kıraathane City", "Dolmuşçular", "Halı Saha GSK", "Apartman Yöneticileri"
    ],
    5: [ // Bölgesel Amatör
        "İlçe Belediye", "Bucak Spor", "Kasaba Gençlik", "Yol Spor", "Maden İş",
        "Liman Gücü", "Orman İşletme", "Köy Hizmetleri", "Şeker Spor", "Demir Yolu",
        "Fabrikalar SK", "Baraj Spor", "Tarım Kredi", "Yaylalılar", "Sahil Kasabası"
    ],
    4: [ // Ulusal Yarı-Pro
        "Petrol Ofisi", "Kömür İşletmeleri", "Çelik Sanayi", "Anadolu Kaplanları", "Trakya Birlik",
        "Ege Yıldızı", "Akdeniz Fırtına", "Karadeniz Uşaklar", "Doğu Kartalları", "Güneydoğu Gençlik",
        "İç Anadolu FK", "Başkent Akademi", "Üniversiteliler", "Polis Gücü", "Askeri İdman"
    ],
    3: [ // 3. Lig
        "Karaköy FK", "Sarıyer Birlik", "Karşıyaka 1912", "Göztepe Yalı", "Sakarya Nehir",
        "Kocaeli Körfez", "Bursa Timsah", "Eskişehir Es-Es", "Ankara Gücü", "Adana Demir",
        "Mersin İdman", "Antalya Akrep", "Konya Kartal", "Sivas Yiğido", "Trabzon 1461"
    ],
    2: [ // 2. Lig
        "Şehir United", "Büyükşehir Bld", "Real Anadolu", "Atletik Şehir", "Sporting Kasaba",
        "Olimpik Şehir", "Dinamo Bölge", "Lokomotif Semt", "Körfez FK", "Vadi Spor",
        "Zirve Spor", "Şampiyon FK", "Aslanlar", "Kaplanlar", "Yunuslar", "Kartallar", "Şahinler"
    ],
    1: [ // Süper Lig
        "Galata Sarayı", "Fener Bahçesi", "Beşiktaşlılar", "Trabzon Fırtına", "Başak Şehir",
        "Antalya Akrep", "Konya Kartal", "Sivas Yiğido", "Adana Kaplan", "Göztepe Yalı",
        "Altay Büyük", "Kayseri Erciyes", "Rize Çay", "Hatay Medeniyet", "Gaziantep Kale"
    ]
};

export const EURO_TEAM_NAMES = [
    "Real Madrid", "Man City", "Bayern Münih", "Liverpool", "PSG", "Inter Milan", "AC Milan", 
    "Barcelona", "Arsenal", "Atletico Madrid", "Dortmund", "Juventus", "Benfica", 
    "Ajax", "Porto", "Sevilla", "Napoli", "Chelsea"
];

export const TROPHIES: Record<string, TrophyDefinition> = {
    'league_6': { id: 'league_6', name: 'Yerel Amatör Kupa', description: 'Yerel Amatör Lig Şampiyonu', color: 'text-slate-400' },
    'league_5': { id: 'league_5', name: 'Bölgesel Kupa', description: 'Bölgesel Amatör Lig Şampiyonu', color: 'text-slate-300' },
    'league_4': { id: 'league_4', name: 'Yarı-Pro Kupa', description: 'Ulusal Yarı-Pro Lig Şampiyonu', color: 'text-slate-200' },
    'league_3': { id: 'league_3', name: '3. Lig Kupası', description: 'TFF 3. Lig Şampiyonu', color: 'text-emerald-400' },
    'league_2': { id: 'league_2', name: '2. Lig Kupası', description: 'TFF 2. Lig Şampiyonu', color: 'text-emerald-500' },
    'league_1': { id: 'league_1', name: 'Süper Lig Kupası', description: 'Süper Lig Şampiyonu', color: 'text-yellow-400' },
    'europe_1': { id: 'europe_1', name: 'Şampiyonlar Kupası', description: 'Avrupa Şampiyonu', color: 'text-purple-400' },
    'europe_2': { id: 'europe_2', name: 'Avrupa Kupası', description: 'Avrupa Ligi Şampiyonu', color: 'text-blue-400' },
};

// Facility Sponsors (Buffets etc.)
export const SPONSORS: Sponsorship[] = [
    { id: 'water', name: 'Suırma Su', clickBonus: 5, passiveBonus: 2, cost: 0, minFanReq: 0 },
    { id: 'cola', name: 'Kola Koka', clickBonus: 15, passiveBonus: 8, cost: 2000, minFanReq: 300 },
    { id: 'fanta', name: 'Fanta-zi', clickBonus: 40, passiveBonus: 20, cost: 10000, minFanReq: 1000 },
    { id: 'burger', name: 'Burger Kingim', clickBonus: 100, passiveBonus: 60, cost: 40000, minFanReq: 5000 },
    { id: 'coffee', name: 'Kahve Dünyalı', clickBonus: 300, passiveBonus: 150, cost: 120000, minFanReq: 20000 },
    { id: 'tech', name: 'TeknoSağ', clickBonus: 800, passiveBonus: 500, cost: 500000, minFanReq: 100000 },
];

export const CLUB_SPONSORS: ClubSponsor[] = [
    { 
        id: 'local_shop', 
        name: 'Köşem Bakkal', 
        perMatchIncome: 500, 
        signingBonus: 2000, 
        minLeagueTier: 6, 
        maxTolerance: 6, 
        description: 'Mahalle bakkalı. Kaybetmene takılmaz, maksat destek olsun.'
    },
    { 
        id: 'car_wash', 
        name: 'Köpük Oto Yıkama', 
        perMatchIncome: 1500, 
        signingBonus: 5000, 
        minLeagueTier: 5, 
        maxTolerance: 5, 
        description: 'Temiz iş. Bölgesel tanınırlık ister.'
    },
    { 
        id: 'bet_site', 
        name: 'Beton İnşaat', 
        perMatchIncome: 5000, 
        signingBonus: 25000, 
        minLeagueTier: 4, 
        maxTolerance: 4, 
        description: 'İnşaat devi. Başarı ister.' 
    },
    { 
        id: 'airline', 
        name: 'Hava Yolları', 
        perMatchIncome: 25000, 
        signingBonus: 150000, 
        minLeagueTier: 2, 
        maxTolerance: 3, 
        description: 'Prestijli marka. Üst üste 3 yenilgiye tahammülü yok.' 
    },
    { 
        id: 'global_bank', 
        name: 'Global Bank', 
        perMatchIncome: 100000, 
        signingBonus: 1000000, 
        minLeagueTier: 1, 
        maxTolerance: 2, 
        description: 'Dünya devi. Başarısızlığı asla affetmez.' 
    },
];

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'stadium',
    name: 'Stadyum',
    level: 1,
    maxLevel: 10,
    count: 1,
    maxCount: 1,
    baseBuildCost: 0,
    baseUpgradeCost: 5000,
    type: 'STADIUM',
    description: 'Kulübün kalbi. Seviyesi yükseldikçe kapasite ve gelir artar.',
    effectValue: 0,
    matchDayPerFanIncome: 0,
    dailyPassiveIncomePerFan: 0
  },
  {
    id: 'buffet',
    name: 'Büfe',
    level: 1,
    maxLevel: 10, 
    count: 1,
    maxCount: 2, 
    baseBuildCost: 500, 
    baseUpgradeCost: 1000, 
    type: 'COMMERCIAL',
    description: 'Taraftarlara yiyecek satarak tıklama, pasif ve maç günü geliri sağlar.',
    activeSponsor: SPONSORS[0],
    effectValue: 0,
    matchDayPerFanIncome: 0.2, // $0.20 per fan base
    dailyPassiveIncomePerFan: 0.01 // Very small passive from fans
  },
  {
    id: 'store',
    name: 'Kulüp Mağazası',
    level: 1,
    maxLevel: 10, 
    count: 0, 
    maxCount: 1, 
    baseBuildCost: 2500, 
    baseUpgradeCost: 5000, 
    type: 'COMMERCIAL',
    description: 'Forma ve ürün satışı. Maç günlerinde ve günlük olarak yüksek gelir getirir.',
    effectValue: 0,
    matchDayPerFanIncome: 1.5, // $1.50 per fan base (High income on match day)
    dailyPassiveIncomePerFan: 0.05 // $0.05 per fan per second (Merch Sales)
  },
  {
    id: 'training',
    name: 'Antrenman Sahası',
    level: 1,
    maxLevel: 10,
    count: 1,
    maxCount: 1,
    baseBuildCost: 0,
    baseUpgradeCost: 2000,
    type: 'INFRASTRUCTURE',
    description: 'Oyuncuların kondisyon yenilenmesini hızlandırır.',
    effectValue: 2,
    matchDayPerFanIncome: 0,
    dailyPassiveIncomePerFan: 0
  },
  {
    id: 'youth',
    name: 'Altyapı Tesisleri',
    level: 1,
    maxLevel: 10,
    count: 1,
    maxCount: 1,
    baseBuildCost: 0,
    baseUpgradeCost: 5000,
    type: 'INFRASTRUCTURE',
    description: 'Genç yeteneklerin gelişimi için gereklidir.',
    effectValue: 1,
    matchDayPerFanIncome: 0,
    dailyPassiveIncomePerFan: 0
  },
];

export const getFacilityName = (id: string, level: number): string => {
    if (id === 'stadium') {
        if (level <= 1) return 'Toprak Saha';
        if (level <= 2) return 'Çim Saha';
        if (level <= 4) return 'Semt Stadı';
        if (level <= 6) return 'Şehir Stadı';
        if (level <= 8) return 'Ulusal Arena';
        return 'Dünya Klasmanı Mabet';
    }
    if (id === 'youth') {
        if (level <= 1) return 'Mahalle Arası';
        if (level <= 3) return 'Futbol Okulu';
        if (level <= 5) return 'Kulüp Akademisi';
        return 'Elit Akademi';
    }
    if (id === 'training') {
        if (level <= 2) return 'Halı Saha';
        if (level <= 5) return 'Tesisler';
        return 'Yüksek İrtifa Kamp Merkezi';
    }
    if (id === 'buffet') {
        return 'Büfe'; 
    }
    if (id === 'store') {
        if (level <= 2) return 'Konteyner Mağaza';
        if (level <= 5) return 'Kulüp Mağazası';
        return 'Mega Store';
    }
    return 'Bina';
};

export const getStadiumCapacity = (level: number): number => {
    return level * level * 250 + 250; // Started smaller for local amateur
};

export const getMinLeagueForStadiumLevel = (targetLevel: number): number => {
    // Return the minimum tier required (Lower number is better league)
    if (targetLevel <= 2) return 6; // Local
    if (targetLevel <= 3) return 5; // Regional
    if (targetLevel <= 4) return 4; // Semi-Pro
    if (targetLevel <= 6) return 3; // 3. Lig
    if (targetLevel <= 8) return 2; // 2. Lig
    return 1; // Super Lig
};

export const calculatePlayerValue = (rating: number, age: number, maxPotential: number): number => {
    // Exponential value curve
    let baseValue = 0;
    
    // Very Low Tier (30-45)
    if (rating < 45) baseValue = Math.pow(rating - 25, 2.2) * 2; 
    // Low Tier (45-55)
    else if (rating < 55) baseValue = Math.pow(rating - 30, 2.5) * 5;
    // Mid Tier (55-70)
    else if (rating < 70) baseValue = Math.pow(rating - 40, 3) * 10;
    // Top Tier (70+)
    else baseValue = Math.pow(rating - 45, 4) * 15;

    if (baseValue < 50) baseValue = 50;

    let ageMultiplier = 1.0;
    if (age <= 20) ageMultiplier = 1.6;
    else if (age <= 24) ageMultiplier = 1.3;
    else if (age <= 29) ageMultiplier = 1.0;
    else if (age <= 34) ageMultiplier = 0.6;
    else ageMultiplier = 0.3;

    const potentialGap = Math.max(0, maxPotential - rating);
    const potentialMultiplier = 1 + (potentialGap * 0.05);

    return Math.floor(baseValue * ageMultiplier * potentialMultiplier);
};

export const calculateWage = (rating: number, value: number): number => {
    // Wage scales with value but has a minimum living wage
    if (rating < 40) return Math.floor(20 + (rating * 1) + (value * 0.005));
    if (rating < 55) return Math.floor(100 + (rating * 5) + (value * 0.006));
    return Math.floor((value * 0.004) + (rating * 20));
};

// Initial Players are now "Local Amateur" level (Rating ~30-40)
export const INITIAL_PLAYERS: Player[] = [
  { id: 'gk1', name: 'Recep (K)', position: Position.GK, rating: 38, maxPotential: 42, age: 26, morale: 80, condition: 100, wage: 60, value: 800, isStarting: true, xp: 0, lastWeekRatingChange: 0 },
  { id: 'def1', name: 'Sedat', position: Position.DEF, rating: 35, maxPotential: 38, age: 29, morale: 75, condition: 100, wage: 50, value: 400, isStarting: true, xp: 0, lastWeekRatingChange: 0 },
  { id: 'def2', name: 'Hüseyin', position: Position.DEF, rating: 36, maxPotential: 40, age: 27, morale: 78, condition: 100, wage: 55, value: 500, isStarting: true, xp: 0, lastWeekRatingChange: 0 },
  { id: 'def3', name: 'Ali', position: Position.DEF, rating: 32, maxPotential: 50, age: 18, morale: 70, condition: 100, wage: 30, value: 1200, isStarting: true, xp: 0, lastWeekRatingChange: 0 },
  { id: 'def4', name: 'Mert', position: Position.DEF, rating: 34, maxPotential: 36, age: 24, morale: 80, condition: 95, wage: 45, value: 350, isStarting: true, xp: 0, lastWeekRatingChange: 0 },
  { id: 'mid1', name: 'Mustafa', position: Position.MID, rating: 40, maxPotential: 42, age: 30, morale: 85, condition: 100, wage: 80, value: 700, isStarting: true, xp: 0, lastWeekRatingChange: 0 },
  { id: 'mid2', name: 'Kemal', position: Position.MID, rating: 37, maxPotential: 42, age: 23, morale: 80, condition: 95, wage: 65, value: 900, isStarting: true, xp: 0, lastWeekRatingChange: 0 },
  { id: 'mid3', name: 'Yasin', position: Position.MID, rating: 33, maxPotential: 38, age: 21, morale: 75, condition: 90, wage: 40, value: 600, isStarting: true, xp: 0, lastWeekRatingChange: 0 },
  { id: 'mid4', name: 'Erkan', position: Position.MID, rating: 35, maxPotential: 35, age: 32, morale: 80, condition: 92, wage: 50, value: 200, isStarting: true, xp: 0, lastWeekRatingChange: 0 },
  { id: 'fwd1', name: 'Murat', position: Position.FWD, rating: 41, maxPotential: 43, age: 28, morale: 85, condition: 100, wage: 90, value: 1500, isStarting: true, xp: 0, lastWeekRatingChange: 0 },
  { id: 'fwd2', name: 'Serhat', position: Position.FWD, rating: 36, maxPotential: 45, age: 19, morale: 70, condition: 100, wage: 50, value: 1100, isStarting: true, xp: 0, lastWeekRatingChange: 0 },
];

const FIRST_NAMES = ['Ali', 'Burak', 'Cenk', 'Deniz', 'Emre', 'Fatih', 'Gökhan', 'Hakan', 'İlker', 'Kaan', 'Mert', 'Nihat', 'Oğuz', 'Polat', 'Rıza', 'Serkan', 'Tolga', 'Umut', 'Volkan', 'Yiğit', 'Arda', 'Semih', 'Can', 'Taylan', 'Berkan', 'Yunus', 'Barış', 'Kerem', 'Orkun', 'Ferdi'];
const LAST_NAMES = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Erkin', 'Gönül', 'Bulut', 'Korkmaz', 'Ünder', 'Tosun', 'Tekin'];

export const generateRandomPlayer = (tier: number): Player => {
  const positions = [Position.GK, Position.DEF, Position.MID, Position.FWD];
  const pos = positions[Math.floor(Math.random() * positions.length)];
  
  let baseRating = 0;
  // Tier 6 (Worst) -> Tier 1 (Best)
  switch (tier) {
      case 6: baseRating = 35; break; // Yerel
      case 5: baseRating = 45; break; // Bölgesel
      case 4: baseRating = 55; break; // Yarı-Pro
      case 3: baseRating = 62; break; // 3. Lig
      case 2: baseRating = 70; break; // 2. Lig
      case 1: baseRating = 80; break; // Süper Lig
      default: baseRating = 35;
  }
  
  const variance = Math.floor(Math.random() * 11) - 5; 
  const rating = Math.max(20, Math.min(99, baseRating + variance));
  
  const ageRoll = Math.random();
  let age = 18;
  if (ageRoll < 0.3) age = 17 + Math.floor(Math.random() * 4); 
  else if (ageRoll < 0.7) age = 21 + Math.floor(Math.random() * 7); 
  else age = 28 + Math.floor(Math.random() * 8); 

  let maxPotential = rating;
  if (age <= 21) {
      const potentialRoll = Math.random();
      if (potentialRoll > 0.85) maxPotential = rating + 10 + Math.floor(Math.random() * 10); 
      else if (potentialRoll > 0.5) maxPotential = rating + 4 + Math.floor(Math.random() * 8); 
      else maxPotential = rating + Math.floor(Math.random() * 4); 
  } else if (age <= 25) {
      maxPotential = rating + Math.floor(Math.random() * 5);
  } else {
      maxPotential = rating;
  }
  
  maxPotential = Math.min(99, maxPotential);

  const value = calculatePlayerValue(rating, age, maxPotential);
  const wage = calculateWage(rating, value);

  const name = `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;

  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    position: pos,
    rating,
    maxPotential,
    age,
    morale: 60 + Math.floor(Math.random() * 40),
    condition: 100,
    wage,
    value,
    isStarting: false,
    xp: Math.floor(Math.random() * 50),
    lastWeekRatingChange: 0
  };
};

export const generateMarketPlayers = (tier: number, count: number): Player[] => {
  return Array.from({ length: count }, () => generateRandomPlayer(tier));
};

// --- LEAGUE SIMULATION ---

export const generateLeagueTable = (tier: number, userTeamName: string): LeagueTeam[] => {
    const teams: LeagueTeam[] = [];
    
    // User Team
    teams.push({
        id: 'user_team',
        name: userTeamName,
        isUser: true,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        points: 0
    });
    
    // AI Teams (17 opponents)
    const names = AI_TEAM_NAMES[tier] || AI_TEAM_NAMES[6];
    // Shuffle and pick 17
    const shuffled = [...names].sort(() => 0.5 - Math.random()).slice(0, 17);
    
    shuffled.forEach((name, i) => {
        teams.push({
            id: `ai_${i}`,
            name: name,
            isUser: false,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gf: 0,
            ga: 0,
            points: 0
        });
    });
    
    return teams;
};

export const generateEuroTable = (userTeamName: string): LeagueTeam[] => {
    const teams: LeagueTeam[] = [];
    
    // User Team
    teams.push({
        id: 'user_team_euro',
        name: userTeamName,
        isUser: true,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        points: 0
    });
    
    // 17 AI Euro Teams
    const names = [...EURO_TEAM_NAMES].sort(() => 0.5 - Math.random()).slice(0, 17);
    
    names.forEach((name, i) => {
        teams.push({
            id: `euro_ai_${i}`,
            name: name,
            isUser: false,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gf: 0,
            ga: 0,
            points: 0
        });
    });
    
    return teams;
};

// Simulate 1 match per AI team (randomly against "each other" virtually)
export const simulateLeagueWeek = (table: LeagueTeam[]): LeagueTeam[] => {
    return table.map(team => {
        if (team.isUser) return team; // Handled by PLAY_MATCH

        // Simple probabilistic simulation
        const resultRoll = Math.random();
        let goalsFor = 0;
        let goalsAgainst = 0;
        let points = 0;
        let won = 0, drawn = 0, lost = 0;

        if (resultRoll < 0.35) {
            // Win
            won = 1;
            points = 3;
            goalsFor = Math.floor(Math.random() * 3) + 1;
            goalsAgainst = Math.floor(Math.random() * goalsFor);
        } else if (resultRoll < 0.65) {
            // Draw
            drawn = 1;
            points = 1;
            goalsFor = Math.floor(Math.random() * 3);
            goalsAgainst = goalsFor;
        } else {
            // Loss
            lost = 1;
            goalsAgainst = Math.floor(Math.random() * 3) + 1;
            goalsFor = Math.floor(Math.random() * goalsAgainst);
        }

        return {
            ...team,
            played: team.played + 1,
            won: team.won + won,
            drawn: team.drawn + drawn,
            lost: team.lost + lost,
            points: team.points + points,
            gf: team.gf + goalsFor,
            ga: team.ga + goalsAgainst
        };
    });
};

// --- ACHIEVEMENTS ---
export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_win',
        title: 'İlk Zafer',
        description: 'İlk resmi maçını kazan.',
        reward: 5000,
        condition: (state) => (state.leagueTable.find(t => t.isUser)?.won || 0) >= 1
    },
    {
        id: 'rich_club',
        title: 'Milyoner',
        description: 'Kasanda $1.000.000 biriktir.',
        reward: 50000,
        condition: (state) => state.money >= 1000000
    },
    {
        id: 'big_stadium',
        title: 'Futbol Mabedi',
        description: 'Stadyum seviyesini 5 yap.',
        reward: 25000,
        condition: (state) => (state.facilities.find(f => f.id === 'stadium')?.level || 0) >= 5
    },
    {
        id: 'full_house',
        title: 'Kapalı Gişe',
        description: 'Stadyum kapasitesini tamamen doldur.',
        reward: 10000,
        condition: (state) => {
            if (!state.lastMatchDetails) return false;
            return state.lastMatchDetails.attendance >= state.lastMatchDetails.stadiumCapacity;
        }
    },
    {
        id: 'pro_league',
        title: 'Profesyonel',
        description: '3. Lig\'e (Tier 3) yüksel.',
        reward: 100000,
        condition: (state) => state.leagueTier <= 3
    },
    {
        id: 'champion',
        title: 'Şampiyon',
        description: 'Süper Lig şampiyonu ol.',
        reward: 1000000,
        condition: (state) => state.leagueTier === 1 && state.europeanCup === 'CHAMPIONS'
    }
];

// --- RANDOM EVENTS POOL ---
export const RANDOM_EVENTS: GameEvent[] = [
    {
        id: 'viral_tweet',
        title: 'Viral Tweet',
        description: 'Kulübün sosyal medya hesabından atılan bir gol videosu viral oldu! Tüm dünya seni konuşuyor.',
        type: 'GOOD',
        effect: { fans: 500, morale: 10 },
        buttonText: 'Harika!'
    },
    {
        id: 'bus_breakdown',
        title: 'Otobüs Arızası',
        description: 'Deplasman yolunda takım otobüsü bozuldu. Tamir masrafları çıktı ve oyuncular yoruldu.',
        type: 'BAD',
        effect: { money: -2500, morale: -5 },
        buttonText: 'Şanssızlık...'
    },
    {
        id: 'school_visit',
        title: 'Okul Ziyareti',
        description: 'Oyuncuların yerel bir okulu ziyaret etti. Genç taraftarlar çok mutlu oldu.',
        type: 'GOOD',
        effect: { fans: 200, morale: 5 },
        buttonText: 'Gelecek Bizim!'
    },
    {
        id: 'equipment_theft',
        title: 'Hırsızlık Şoku',
        description: 'Antrenman sahasından bazı ekipmanlar çalındı. Yenilerini almak zorundasın.',
        type: 'BAD',
        effect: { money: -5000 },
        buttonText: 'Öde'
    },
    {
        id: 'local_sponsor',
        title: 'Yerel Destek',
        description: 'Bölgedeki bir esnaf kulübe bağışta bulundu.',
        type: 'GOOD',
        effect: { money: 1500 },
        buttonText: 'Teşekkürler'
    }
];
