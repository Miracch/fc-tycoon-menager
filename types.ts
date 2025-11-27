
export enum Position {
  GK = 'Kaleci',
  DEF = 'Defans',
  MID = 'Orta Saha',
  FWD = 'Forvet',
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  rating: number; // Current Ability (1-100)
  maxPotential: number; // Hidden max potential (1-100)
  age: number;
  morale: number; // 0-100
  condition: number; // 0-100
  wage: number;
  value: number; // Market value
  isStarting: boolean; // True if in starting XI
  xp: number; // 0-100 Progress to next rating
  lastWeekRatingChange: number; // Tracks immediate growth (+1, 0, -1) for UI feedback
}

export type FacilityType = 'STADIUM' | 'COMMERCIAL' | 'INFRASTRUCTURE';

export interface Sponsorship {
  id: string;
  name: string;
  clickBonus: number; // Extra money per click per facility
  passiveBonus: number; // Extra money per second per facility
  cost: number; // Signing cost
  minFanReq: number; // Minimum fans required
}

export interface ClubSponsor {
  id: string;
  name: string;
  perMatchIncome: number; // Income per match played
  signingBonus: number; // Upfront cash
  minLeagueTier: number; // Required league (4=Amateur, 1=Super)
  maxTolerance: number; // How many consecutive losses before they cancel
  description: string;
}

export interface Facility {
  id: string;
  name: string; // Base name
  level: number;
  maxLevel: number;
  
  count: number; // Quantity (for Commercial)
  maxCount: number; // Limit (based on Stadium)
  
  baseBuildCost: number; // Cost to build new unit
  baseUpgradeCost: number; // Cost to level up
  
  type: FacilityType;
  description: string;
  
  // Specifics
  activeSponsor?: Sponsorship; // For commercial
  effectValue: number; // For infrastructure (e.g. condition recovery rate)
  matchDayPerFanIncome: number; // Base income per fan on match days
  dailyPassiveIncomePerFan: number; // New: Base income per fan per second (Merchandise sales)
}

export interface MatchResultDetails {
    result: 'WIN' | 'DRAW' | 'LOSS';
    scoreHome: number;
    scoreAway: number;
    attendance: number;
    stadiumCapacity: number;
    reward: {
        ticketSales: number;
        matchBonus: number;
        sponsorBonus: number; // Club sponsor income
        commercialMatchIncome: number; // Store + Buffet income based on attendance
        euroMatchIncome: number; // Champions League / Europa League bonus
        wagesPaid: number;
        totalNet: number;
    };
    droppedSponsorNames: string[]; // List of names of sponsors who left
}

export interface LeagueTeam {
    id: string;
    name: string;
    isUser: boolean;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number; // Goals For
    ga: number; // Goals Against
    points: number;
}

export type EuropeanCupStatus = 'NONE' | 'CHAMPIONS' | 'EUROPA';

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    type: 'GOOD' | 'BAD' | 'NEUTRAL';
    effect: {
        money?: number;
        fans?: number;
        morale?: number;
    };
    buttonText: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    reward: number;
    condition: (state: GameState) => boolean;
}

export interface TrophyDefinition {
    id: string;
    name: string;
    description: string;
    color: string; // CSS class for color
}

export interface TrophyHistoryItem {
    id: string;
    count: number;
}

export interface GameState {
  money: number;
  fans: number;
  week: number;
  season: number;
  leagueTier: number; // 4 = Lowest, 1 = Highest
  leaguePoints: number; // Kept for legacy/quick access, but logic should use table now
  teamName: string;
  players: Player[];
  marketPlayers: Player[]; 
  facilities: Facility[];
  clubSponsors: ClubSponsor[]; // Active shirt sponsors (Max 3)
  history: { week: number; money: number }[];
  lastMatchDetails?: MatchResultDetails;
  clickBoostTimer: number; // Seconds remaining for x10 boost
  consecutiveLosses: number; // Track losing streak for fan mechanics
  leagueTable: LeagueTeam[]; // The full standings
  europeanCup: EuropeanCupStatus; // Current season European status
  europeanTable: LeagueTeam[]; // European standings
  hasTrainedThisWeek: boolean; // Limits training to once per week
  
  // New Features
  activeEvent: GameEvent | null;
  unlockedAchievements: string[];
  trophyHistory: TrophyHistoryItem[];
}

export interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  playMatch: () => void;
  clickForMoney: () => void;
  resetSave: () => void;
}

export type GameAction =
  | { type: 'TICK' }
  | { type: 'CLICK_MONEY' }
  | { type: 'SET_TEAM_NAME'; name: string }
  | { type: 'BUILD_FACILITY'; facilityId: string } // Increase Count
  | { type: 'UPGRADE_FACILITY'; facilityId: string } // Increase Level
  | { type: 'SIGN_SPONSOR'; facilityId: string; sponsor: Sponsorship }
  | { type: 'SIGN_CLUB_SPONSOR'; sponsor: ClubSponsor }
  | { type: 'TERMINATE_CLUB_SPONSOR'; sponsorId: string }
  | { type: 'PLAY_MATCH'; details: MatchResultDetails; points: number }
  | { type: 'NEW_SEASON'; promoted: boolean; relegated: boolean; position: number }
  | { type: 'BUY_PLAYER'; player: Player }
  | { type: 'SELL_PLAYER'; playerId: string }
  | { type: 'SWAP_LINEUP'; player1Id: string; player2Id: string }
  | { type: 'TRAIN_TEAM'; typeId: 'CONDITION' | 'MORALE' | 'SKILL'; cost: number }
  | { type: 'REFRESH_MARKET' }
  | { type: 'WATCH_AD_BOOST' }
  | { type: 'WATCH_AD_CONDITION' }
  | { type: 'WATCH_AD_TRIPLE_MATCH' }
  | { type: 'WATCH_AD_WONDERKID' }
  | { type: 'TRIGGER_EVENT'; event: GameEvent }
  | { type: 'RESOLVE_EVENT' }
  | { type: 'CLAIM_ACHIEVEMENT'; id: string }
  | { type: 'RESET_GAME' };
