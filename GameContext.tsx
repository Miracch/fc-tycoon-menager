
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { GameState, GameAction, GameContextType } from './types';
import { INITIAL_FACILITIES, INITIAL_FANS, INITIAL_MONEY, INITIAL_PLAYERS, generateMarketPlayers, calculatePlayerValue, calculateWage, getStadiumCapacity, getMinLeagueForStadiumLevel, generateLeagueTable, simulateLeagueWeek, generateRandomPlayer, RANDOM_EVENTS, ACHIEVEMENTS, generateEuroTable } from './constants';

const GameContext = createContext<GameContextType | undefined>(undefined);

// Initial placeholder name, will be replaced by user
const DEFAULT_TEAM_NAME_PLACEHOLDER = "Takımınız";

const baseState: GameState = {
  money: INITIAL_MONEY,
  fans: INITIAL_FANS,
  week: 1,
  season: 1,
  leagueTier: 6, // Start at Tier 6 (Local Amateur)
  leaguePoints: 0, 
  teamName: "", // Empty to trigger setup screen
  players: INITIAL_PLAYERS,
  marketPlayers: generateMarketPlayers(6, 12), // Tier 6 Market
  facilities: INITIAL_FACILITIES,
  clubSponsors: [], 
  history: [{ week: 1, money: INITIAL_MONEY }],
  clickBoostTimer: 0,
  consecutiveLosses: 0,
  leagueTable: generateLeagueTable(6, DEFAULT_TEAM_NAME_PLACEHOLDER),
  europeanCup: 'NONE',
  europeanTable: [],
  hasTrainedThisWeek: false,
  activeEvent: null,
  unlockedAchievements: [],
  trophyHistory: []
};

// Load from LocalStorage
const loadState = (): GameState => {
    const hasLocalStorage = typeof localStorage !== 'undefined';
    try {
        if (hasLocalStorage) {
            const saved = localStorage.getItem('fc_tycoon_save_v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Verify structure or merge with defaults to prevent crashes on updates
                return { ...baseState, ...parsed };
            }
        }
    } catch (e) {
        console.error("Failed to load save", e);
    }
    return baseState;
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'RESET_GAME': {
        localStorage.removeItem('fc_tycoon_save_v1');
        return baseState;
    }

    case 'SET_TEAM_NAME': {
        const newTable = state.leagueTable.map(team => 
            team.isUser ? { ...team, name: action.name } : team
        );
        return {
            ...state,
            teamName: action.name,
            leagueTable: newTable
        };
    }

    case 'CLICK_MONEY': {
      // Calculate active bonuses from Commercial facilities
      const commercialFacilities = state.facilities.filter(f => f.type === 'COMMERCIAL');
      
      let facilitiesBonus = 0;
      commercialFacilities.forEach(f => {
          if (f.activeSponsor) {
              facilitiesBonus += f.count * f.level * f.activeSponsor.clickBonus;
          }
      });
      
      const baseClick = 5 + (6 - state.leagueTier) * 3; // Click base value increases with league
      const fanBonus = 1 + (state.fans / 2000); 
      
      let earned = Math.floor((baseClick + facilitiesBonus) * fanBonus);

      if (state.clickBoostTimer > 0) {
          earned *= 10;
      }

      return {
        ...state,
        money: state.money + earned
      };
    }

    case 'TICK': {
      // 1. Passive Income
      const commercialFacilities = state.facilities.filter(f => f.type === 'COMMERCIAL');
      let totalPassiveIncome = 0;
      
      commercialFacilities.forEach(f => {
          if (f.activeSponsor) {
              const raw = f.count * f.level * f.activeSponsor.passiveBonus;
              const fanMultiplier = 1 + (Math.log10(Math.max(10, state.fans)) - 1); 
              totalPassiveIncome += Math.floor(raw * fanMultiplier);
          }
          if (f.dailyPassiveIncomePerFan && f.dailyPassiveIncomePerFan > 0) {
              const merchSales = f.count * f.level * f.dailyPassiveIncomePerFan * state.fans;
              totalPassiveIncome += Math.floor(merchSales);
          }
      });

      const newBoostTimer = state.clickBoostTimer > 0 ? state.clickBoostTimer - 1 : 0;

      // 2. Random Event Trigger (Reduced Frequency)
      // Old: 0.005 (0.5%) -> ~Every 200 ticks (3.3 mins)
      // New: 0.001 (0.1%) -> ~Every 1000 ticks (16.6 mins)
      let nextEvent = state.activeEvent;
      if (!nextEvent && Math.random() < 0.001) {
          const eventPool = RANDOM_EVENTS;
          nextEvent = eventPool[Math.floor(Math.random() * eventPool.length)];
      }

      // 3. Achievement Check
      let newlyUnlocked: string[] = [];
      let rewardMoney = 0;
      ACHIEVEMENTS.forEach(ach => {
          if (!state.unlockedAchievements.includes(ach.id)) {
              if (ach.condition(state)) {
                  newlyUnlocked.push(ach.id);
                  rewardMoney += ach.reward;
              }
          }
      });

      return {
        ...state,
        money: state.money + totalPassiveIncome + rewardMoney,
        clickBoostTimer: newBoostTimer,
        activeEvent: nextEvent,
        unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked]
      };
    }
    
    case 'TRIGGER_EVENT': {
        return {
            ...state,
            activeEvent: action.event
        };
    }

    case 'RESOLVE_EVENT': {
        if (!state.activeEvent) return state;
        const effect = state.activeEvent.effect;
        
        // Scale effects based on League Tier
        // Tier 6: x1
        // Tier 5: x2
        // ...
        // Tier 1: x32
        const tierMultiplier = Math.pow(2, 6 - state.leagueTier);

        const scaledMoney = effect.money ? Math.floor(effect.money * tierMultiplier) : 0;
        const scaledFans = effect.fans ? Math.floor(effect.fans * tierMultiplier) : 0;
        // Morale usually doesn't scale as it's percentage based (0-100)
        const moraleChange = effect.morale || 0;

        const newMoney = state.money + scaledMoney;
        const newFans = Math.max(0, state.fans + scaledFans);
        
        const newPlayers = state.players.map(p => ({
            ...p,
            morale: Math.min(100, Math.max(0, p.morale + moraleChange))
        }));

        return {
            ...state,
            money: newMoney,
            fans: newFans,
            players: newPlayers,
            activeEvent: null
        };
    }

    case 'CLAIM_ACHIEVEMENT': {
        // Handled automatically in TICK for now to simplify UI
        return state;
    }

    case 'BUILD_FACILITY': {
        const facIndex = state.facilities.findIndex(f => f.id === action.facilityId);
        if (facIndex === -1) return state;
        const fac = state.facilities[facIndex];

        if (fac.count >= fac.maxCount) return state; 

        const cost = Math.floor(fac.baseBuildCost * Math.pow(1.5, fac.count));
        if (state.money < cost) return state;

        const newFacilities = [...state.facilities];
        newFacilities[facIndex] = { ...fac, count: fac.count + 1 };

        return {
            ...state,
            money: state.money - cost,
            facilities: newFacilities
        };
    }

    case 'SIGN_SPONSOR': {
        const facIndex = state.facilities.findIndex(f => f.id === action.facilityId);
        if (facIndex === -1) return state;
        const fac = state.facilities[facIndex];

        if (state.money < action.sponsor.cost) return state;

        const newFacilities = [...state.facilities];
        newFacilities[facIndex] = { ...fac, activeSponsor: action.sponsor };

        return {
            ...state,
            money: state.money - action.sponsor.cost,
            facilities: newFacilities
        };
    }
    
    case 'SIGN_CLUB_SPONSOR': {
        if (state.clubSponsors.length >= 3) return state; // Max 3 sponsors
        if (state.clubSponsors.some(s => s.id === action.sponsor.id)) return state; // Already signed
        
        return {
            ...state,
            clubSponsors: [...state.clubSponsors, action.sponsor],
            money: state.money + action.sponsor.signingBonus
        };
    }

    case 'TERMINATE_CLUB_SPONSOR': {
        return {
            ...state,
            clubSponsors: state.clubSponsors.filter(s => s.id !== action.sponsorId)
        };
    }

    case 'UPGRADE_FACILITY': {
      const facilityIndex = state.facilities.findIndex(f => f.id === action.facilityId);
      if (facilityIndex === -1) return state;

      const facility = state.facilities[facilityIndex];
      const cost = Math.floor(facility.baseUpgradeCost * Math.pow(1.6, facility.level)); 

      if (state.money < cost) return state;

      // STADIUM LEAGUE CHECK
      if (facility.id === 'stadium') {
          const reqTier = getMinLeagueForStadiumLevel(facility.level + 1);
          if (state.leagueTier > reqTier) {
              return state;
          }
      }

      const newFacilities = [...state.facilities];
      const newLevel = facility.level + 1;
      
      newFacilities[facilityIndex] = {
        ...facility,
        level: newLevel,
      };

      if (facility.id === 'stadium') {
          const commercialFacs = newFacilities.filter(f => f.type === 'COMMERCIAL');
          commercialFacs.forEach(f => {
              // Scale max count of buffets/stores with stadium level
              const idx = newFacilities.findIndex(nf => nf.id === f.id);
              if (idx > -1) {
                  // Buffer starts at 2, Store starts at 1
                  const baseCount = f.id === 'buffet' ? 2 : 1; 
                  newFacilities[idx] = { ...newFacilities[idx], maxCount: baseCount + (newLevel * 2) };
              }
          });
      }

      return {
        ...state,
        money: state.money - cost,
        facilities: newFacilities,
      };
    }

    case 'PLAY_MATCH': {
      const { result, scoreHome, scoreAway, reward, attendance } = action.details;
      
      // 1. UPDATE PLAYERS (Training, etc.)
      const trainingFac = state.facilities.find(f => f.id === 'training');
      const trainingLevel = trainingFac ? trainingFac.level : 1;
      
      // Nerfed Recovery: Base 0.8 * Level, but with harder decay
      const recoveryBonus = Math.floor(trainingLevel * 0.8);

      const updatedPlayers = state.players.map(p => {
        // Higher condition loss in matches
        let conditionLoss = p.isStarting ? 15 : 2; 
        
        // Ensure net change can be negative even with high facilities
        let netConditionChange = recoveryBonus - conditionLoss;
        if (p.isStarting && netConditionChange > -3) {
            netConditionChange = -3; // Always lose at least 3 condition if starting
        }

        let newCondition = Math.min(100, Math.max(0, p.condition + netConditionChange)); 
        let newMorale = result === 'WIN' ? Math.min(100, p.morale + 5) : Math.max(10, p.morale - 3);
        
        let newRating = p.rating;
        let newXP = p.xp || 0;
        let ratingChange = 0;

        const playedFactor = p.isStarting ? 1 : 0.3; 
        const potentialGap = p.maxPotential - p.rating;
        
        if (potentialGap > 0 && p.condition > 70) {
            let xpGain = (3 + (trainingLevel * 1.5)) * playedFactor; 
            
            if (p.age < 21) xpGain *= 1.5;
            else if (p.age < 24) xpGain *= 1.2;
            else if (p.age > 30) xpGain *= 0.5;

            if (potentialGap < 5) xpGain *= 0.5;
            if (p.morale > 80) xpGain *= 1.1;

            newXP += xpGain;

            if (newXP >= 100) {
                newRating += 1;
                newXP -= 100;
                ratingChange = 1;
            }
        } else if (p.age >= 32) {
             const declineChance = (p.age - 30) * 0.05; 
             if (Math.random() < declineChance && newRating > 30) {
                 newRating -= 1;
                 ratingChange = -1;
             }
        }

        let newValue = p.value;
        if (newRating !== p.rating) {
            newValue = calculatePlayerValue(newRating, p.age, p.maxPotential);
        }

        return {
          ...p,
          rating: newRating,
          condition: newCondition,
          morale: newMorale,
          value: newValue,
          xp: Math.min(100, newXP),
          lastWeekRatingChange: ratingChange
        };
      });

      // 2. FAN DYNAMICS SCALED BY LEAGUE (EXPONENTIALLY STRONGER)
      let newConsecutiveLosses = state.consecutiveLosses;
      let fanChange = 0;

      // League Scaler: Tier 6 -> 1x, Tier 1 -> ~32x
      // Updated base to 2.0 per tier for aggressive scaling
      const leagueFanMultiplier = Math.max(1, Math.pow(2.0, (6 - state.leagueTier)));

      if (result === 'WIN') {
          newConsecutiveLosses = 0;
          // Base gain 100-150, multiplied by league tier
          const baseGain = 100 + Math.floor(Math.random() * 51);
          fanChange = Math.floor(baseGain * leagueFanMultiplier);
      } else if (result === 'DRAW') {
          newConsecutiveLosses = 0;
          fanChange = Math.floor(15 * leagueFanMultiplier);
      } else { // LOSS
          newConsecutiveLosses += 1;
          if (newConsecutiveLosses === 1) {
              fanChange = -5; // Forgiving first loss
          } else {
              // Punishment also scales
              const baseLoss = 50 * (newConsecutiveLosses - 1);
              fanChange = -Math.floor(baseLoss * (leagueFanMultiplier * 0.6)); // Loss scales slightly less aggressive than win
              if (fanChange < -2000) fanChange = -2000; // Cap loss per match
          }
      }

      // 3. SPONSOR RISK
      let nextSponsors = [...state.clubSponsors];
      const droppedSponsorNames: string[] = [];

      if (state.clubSponsors.length > 0) {
          if (newConsecutiveLosses > 0) {
              nextSponsors = state.clubSponsors.filter(s => {
                  if (newConsecutiveLosses >= s.maxTolerance) {
                      droppedSponsorNames.push(s.name);
                      return false; 
                  }
                  return true;
              });
          }
      }

      // 4. COMMERCIAL MATCH DAY INCOME
      let commercialMatchIncome = 0;
      const commercialFacilities = state.facilities.filter(f => f.type === 'COMMERCIAL');
      commercialFacilities.forEach(f => {
          if (f.count > 0) {
              let income = attendance * (f.matchDayPerFanIncome * (1 + (f.level * 0.1))) * f.count;
              if (f.activeSponsor) {
                  income *= 1.2;
              }
              commercialMatchIncome += Math.floor(income);
          }
      });

      // 5. EUROPEAN CUP BONUS
      let euroMatchIncome = 0;
      if (state.europeanCup === 'CHAMPIONS') {
          euroMatchIncome = 500000;
      } else if (state.europeanCup === 'EUROPA') {
          euroMatchIncome = 150000;
      }

      // 6. LEAGUE SIMULATION (LOCAL)
      const updatedTable = state.leagueTable.map(t => {
          if (t.isUser) {
              return {
                  ...t,
                  played: t.played + 1,
                  won: t.won + (result === 'WIN' ? 1 : 0),
                  drawn: t.drawn + (result === 'DRAW' ? 1 : 0),
                  lost: t.lost + (result === 'LOSS' ? 1 : 0),
                  gf: t.gf + scoreHome,
                  ga: t.ga + scoreAway,
                  points: t.points + action.points
              };
          }
          return t;
      });
      const simulatedTable = simulateLeagueWeek(updatedTable);
      simulatedTable.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          const gdA = a.gf - a.ga;
          const gdB = b.gf - b.ga;
          if (gdB !== gdA) return gdB - gdA;
          return b.gf - a.gf;
      });

      // 7. EUROPEAN SIMULATION (IF ACTIVE)
      let simulatedEuroTable = state.europeanTable;
      if (state.europeanCup !== 'NONE' && state.europeanTable.length > 0) {
          const updatedEuroUser = state.europeanTable.map(t => {
              if (t.isUser) {
                  return {
                      ...t,
                      played: t.played + 1,
                      won: t.won + (result === 'WIN' ? 1 : 0),
                      drawn: t.drawn + (result === 'DRAW' ? 1 : 0),
                      lost: t.lost + (result === 'LOSS' ? 1 : 0),
                      gf: t.gf + scoreHome,
                      ga: t.ga + scoreAway,
                      points: t.points + action.points
                  };
              }
              return t;
          });
          simulatedEuroTable = simulateLeagueWeek(updatedEuroUser);
          simulatedEuroTable.sort((a, b) => {
              if (b.points !== a.points) return b.points - a.points;
              return (b.gf - b.ga) - (a.gf - a.ga);
          });
      }

      const newHistory = [...state.history, { week: state.week + (state.season - 1) * 20, money: state.money }];
      if (newHistory.length > 50) newHistory.shift();
      
      const finalMatchBonus = reward.matchBonus;
      const finalTotalNet = reward.ticketSales + finalMatchBonus + euroMatchIncome + reward.sponsorBonus + commercialMatchIncome - reward.wagesPaid;

      return {
        ...state,
        money: state.money + finalTotalNet, 
        leaguePoints: state.leaguePoints + action.points, 
        leagueTable: simulatedTable,
        europeanTable: simulatedEuroTable,
        players: updatedPlayers,
        marketPlayers: Math.random() > 0.6 ? generateMarketPlayers(state.leagueTier, 10) : state.marketPlayers,
        fans: Math.max(0, state.fans + fanChange),
        week: state.week + 1,
        history: newHistory,
        lastMatchDetails: { 
            ...action.details, 
            reward: { 
                ...reward, 
                matchBonus: finalMatchBonus, 
                commercialMatchIncome, 
                euroMatchIncome,
                totalNet: finalTotalNet 
            }, 
            droppedSponsorNames 
        },
        consecutiveLosses: newConsecutiveLosses,
        clubSponsors: nextSponsors,
        hasTrainedThisWeek: false
      };
    }

    case 'NEW_SEASON': {
        let newTier = state.leagueTier;
        if (action.promoted && state.leagueTier > 1) newTier -= 1;
        if (action.relegated && state.leagueTier < 6) newTier += 1;

        // EUROPEAN QUALIFICATION & TROPHY AWARD
        let nextEuropeanCup: 'NONE' | 'CHAMPIONS' | 'EUROPA' = 'NONE';
        const newTrophyHistory = [...state.trophyHistory];
        
        // If coming FROM Super Lig
        if (state.leagueTier === 1 && !action.relegated) {
            if (action.position === 1) {
                // Champion!
                nextEuropeanCup = 'CHAMPIONS';
                // Award Super Lig Trophy
                const existing = newTrophyHistory.find(t => t.id === 'league_1');
                if (existing) existing.count++;
                else newTrophyHistory.push({ id: 'league_1', count: 1 });
            } else if (action.position >= 2 && action.position <= 4) {
                nextEuropeanCup = 'EUROPA';
            }
        } 
        // If promoted from lower league
        else if (action.promoted) {
             const trophyId = `league_${state.leagueTier}`;
             const existing = newTrophyHistory.find(t => t.id === trophyId);
             if (existing) existing.count++;
             else newTrophyHistory.push({ id: trophyId, count: 1 });
        }

        // Did we win Europe? (Simplified logic: Top of table = win)
        if (state.europeanCup !== 'NONE' && state.europeanTable.length > 0) {
             const userRank = state.europeanTable.findIndex(t => t.isUser) + 1;
             if (userRank === 1) {
                 const trophyId = state.europeanCup === 'CHAMPIONS' ? 'europe_1' : 'europe_2';
                 const existing = newTrophyHistory.find(t => t.id === trophyId);
                 if (existing) existing.count++;
                 else newTrophyHistory.push({ id: trophyId, count: 1 });
             }
        }

        const agedPlayers = state.players.map(p => {
            const newAge = p.age + 1;
            const newVal = calculatePlayerValue(p.rating, newAge, p.maxPotential);
            return { ...p, age: newAge, value: newVal, lastWeekRatingChange: 0 };
        });

        const newTable = generateLeagueTable(newTier, state.teamName);
        const newEuroTable = nextEuropeanCup !== 'NONE' ? generateEuroTable(state.teamName) : [];

        const tierMultiplier = 7 - newTier; 
        const seasonReward = 5000 * Math.pow(tierMultiplier, 2);

        return {
            ...state,
            season: state.season + 1,
            week: 1,
            leaguePoints: 0,
            leagueTable: newTable,
            europeanTable: newEuroTable,
            leagueTier: newTier,
            lastMatchDetails: undefined,
            money: state.money + seasonReward, 
            players: agedPlayers,
            marketPlayers: generateMarketPlayers(newTier, 12),
            clickBoostTimer: 0,
            consecutiveLosses: 0,
            europeanCup: nextEuropeanCup,
            hasTrainedThisWeek: false,
            trophyHistory: newTrophyHistory
        };
    }

    case 'BUY_PLAYER': {
        if (state.money < action.player.value) return state;
        if (state.players.length >= 25) return state;

        return {
            ...state,
            money: state.money - action.player.value,
            players: [...state.players, action.player],
            marketPlayers: state.marketPlayers.filter(p => p.id !== action.player.id)
        };
    }

    case 'SELL_PLAYER': {
        if (state.players.length <= 11) {
            return state; 
        }

        const player = state.players.find(p => p.id === action.playerId);
        if (!player) return state;
        
        const sellPrice = Math.floor(player.value * 0.60);

        let remainingPlayers = state.players.filter(p => p.id !== action.playerId);
        
        if (player.isStarting) {
             const sub = remainingPlayers.find(p => !p.isStarting && p.position === player.position);
             if (sub) {
                 remainingPlayers = remainingPlayers.map(p => p.id === sub.id ? { ...p, isStarting: true } : p);
             } else {
                 const anySub = remainingPlayers.find(p => !p.isStarting);
                 if (anySub) {
                     remainingPlayers = remainingPlayers.map(p => p.id === anySub.id ? { ...p, isStarting: true } : p);
                 }
             }
        }

        return {
            ...state,
            money: state.money + sellPrice, 
            players: remainingPlayers
        };
    }

    case 'SWAP_LINEUP': {
        const p1 = state.players.find(p => p.id === action.player1Id);
        const p2 = state.players.find(p => p.id === action.player2Id);

        if (!p1 || !p2) return state;

        const newP1Status = p2.isStarting;
        const newP2Status = p1.isStarting;

        if (p1.isStarting === p2.isStarting) return state;

        const updatedPlayers = state.players.map(p => {
            if (p.id === action.player1Id) return { ...p, isStarting: newP1Status };
            if (p.id === action.player2Id) return { ...p, isStarting: newP2Status };
            return p;
        });

        return {
            ...state,
            players: updatedPlayers
        };
    }

    case 'TRAIN_TEAM': {
        if (state.hasTrainedThisWeek) return state;
        if (state.money < action.cost) return state;

        const updatedPlayers = state.players.map(p => {
            const newP = { ...p };
            if (action.typeId === 'CONDITION') {
                newP.condition = Math.min(100, p.condition + 20);
            } else if (action.typeId === 'MORALE') {
                newP.morale = Math.min(100, p.morale + 15);
            } else if (action.typeId === 'SKILL') {
                if (p.rating < p.maxPotential) {
                     newP.xp = (newP.xp || 0) + 25;
                     if (newP.xp >= 100) {
                         newP.rating += 1;
                         newP.xp -= 100;
                         newP.lastWeekRatingChange = 1;
                     }
                    newP.value = calculatePlayerValue(newP.rating, newP.age, newP.maxPotential);
                }
            }
            return newP;
        });

        return {
            ...state,
            money: state.money - action.cost,
            players: updatedPlayers,
            hasTrainedThisWeek: true
        };
    }
    
    case 'REFRESH_MARKET': {
        return {
            ...state,
            marketPlayers: generateMarketPlayers(state.leagueTier, 10)
        };
    }

    case 'WATCH_AD_BOOST': {
        return {
            ...state,
            clickBoostTimer: 20
        };
    }

    case 'WATCH_AD_CONDITION': {
        const healedPlayers = state.players.map(p => ({ ...p, condition: 100 }));
        return {
            ...state,
            players: healedPlayers
        };
    }

    case 'WATCH_AD_TRIPLE_MATCH': {
        if (!state.lastMatchDetails) return state;
        const { reward } = state.lastMatchDetails;
        if (reward.totalNet <= 0) return state;
        const extraBonus = reward.totalNet * 2;
        return {
            ...state,
            money: state.money + extraBonus
        };
    }

    case 'WATCH_AD_WONDERKID': {
        const tier = state.leagueTier;
        const baseRating = 50 + ((6 - tier) * 10);
        const rating = Math.min(90, baseRating + Math.floor(Math.random() * 5));
        
        const wonderkid: any = generateRandomPlayer(tier);
        wonderkid.name = '⭐ ' + wonderkid.name;
        wonderkid.rating = rating;
        wonderkid.age = 17 + Math.floor(Math.random() * 3);
        wonderkid.maxPotential = Math.min(99, rating + 15 + Math.floor(Math.random() * 10));
        wonderkid.value = calculatePlayerValue(rating, wonderkid.age, wonderkid.maxPotential);
        wonderkid.wage = calculateWage(rating, wonderkid.value);
        
        return {
            ...state,
            marketPlayers: [wonderkid, ...state.marketPlayers]
        };
    }

    default:
      return state;
  }
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);

  // Auto-Save Effect
  useEffect(() => {
      if (state.teamName && typeof localStorage !== 'undefined') {
          localStorage.setItem('fc_tycoon_save_v1', JSON.stringify(state));
      }
  }, [state]);

  useEffect(() => {
    if (!state.teamName) return;

    const timer = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.teamName]);

  const clickForMoney = () => {
      dispatch({ type: 'CLICK_MONEY' });
  };

  const playMatch = () => {
    const startingXI = state.players.filter(p => p.isStarting);
    
    if (startingXI.length !== 11) {
        Alert.alert('Eksik İlk 11', `Maça çıkmak için İlk 11'de tam 11 oyuncu olmalı! Şu an: ${startingXI.length}`);
        return;
    }

    if (state.week > 20) {
        const userIndex = state.leagueTable.findIndex(t => t.isUser);
        const position = userIndex + 1;

        let isPromoted = false;
        let isRelegated = false;
        
        if (state.leagueTier >= 4) {
            isPromoted = position <= 2;
        } else if (state.leagueTier === 1) {
            isRelegated = position >= 16;
        } else {
            isPromoted = position <= 2;
            isRelegated = position >= 16;
        }

        dispatch({ type: 'NEW_SEASON', promoted: isPromoted, relegated: isRelegated, position: position });
        return;
    }

    const requiredRating = 35 + ((6 - state.leagueTier) * 10);
    
    const avgRating = startingXI.reduce((acc, p) => acc + (p.rating * (p.condition/100)), 0) / 11;
    const opponentRating = requiredRating + (Math.random() * 8 - 4);
    
    let result: 'WIN' | 'DRAW' | 'LOSS' = 'DRAW';
    let points = 1;
    let scoreHome = 0;
    let scoreAway = 0;
    
    const performance = avgRating * (0.95 + Math.random() * 0.20); 
    
    if (performance > opponentRating + 0.5) { 
      result = 'WIN';
      points = 3;
      scoreHome = Math.floor(Math.random() * 3) + 1;
      scoreAway = Math.floor(Math.random() * scoreHome);
    } else if (performance < opponentRating - 1.0) {
      result = 'LOSS';
      points = 0;
      scoreAway = Math.floor(Math.random() * 3) + 1;
      scoreHome = Math.floor(Math.random() * scoreAway);
    } else {
        scoreHome = Math.floor(Math.random() * 2) + 1;
        scoreAway = scoreHome;
    }

    const stadium = state.facilities.find(f => f.id === 'stadium');
    const stadiumLevel = stadium ? stadium.level : 1;
    const stadiumCapacity = getStadiumCapacity(stadiumLevel);
    
    const attendance = Math.min(state.fans, stadiumCapacity);
    
    const tierMultiplier = Math.pow(1.9, (6 - state.leagueTier));
    const ticketPrice = 1.5 * tierMultiplier; 
    
    const ticketRevenue = Math.floor(attendance * ticketPrice); 
    
    const baseWinBonus = 2000 * Math.pow(2.2, 6 - state.leagueTier);
    const baseDrawBonus = baseWinBonus * 0.3;
    
    let matchBonus = 0;
    if (result === 'WIN') matchBonus = Math.floor(baseWinBonus);
    if (result === 'DRAW') matchBonus = Math.floor(baseDrawBonus);

    let totalSponsorBonus = 0;
    let droppedSponsorNames: string[] = [];
    let currentLosses = state.consecutiveLosses;
    if (result === 'LOSS') currentLosses += 1;
    else currentLosses = 0;

    state.clubSponsors.forEach(s => {
        totalSponsorBonus += s.perMatchIncome;
        if (currentLosses >= s.maxTolerance) {
            droppedSponsorNames.push(s.name);
        }
    });

    const totalWages = state.players.reduce((acc, p) => acc + p.wage, 0);
    
    dispatch({ 
        type: 'PLAY_MATCH', 
        details: {
            result,
            scoreHome,
            scoreAway,
            attendance,
            stadiumCapacity,
            reward: {
                ticketSales: ticketRevenue,
                matchBonus,
                sponsorBonus: totalSponsorBonus,
                commercialMatchIncome: 0,
                euroMatchIncome: 0, // Calculated inside reducer
                wagesPaid: totalWages,
                totalNet: 0 // Calculated inside reducer
            },
            droppedSponsorNames
        },
        points
    });
  };

  const resetSave = () => {
      dispatch({ type: 'RESET_GAME' });
      window.location.reload();
  };

  return (
    <GameContext.Provider value={{ state, dispatch, playMatch, clickForMoney, resetSave }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
