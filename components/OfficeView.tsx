
import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import { Trophy, Users, Calendar, Coins, ArrowUpCircle, XCircle, Minus, X, Wallet, Zap, Clock, ShieldAlert, TrendingUp, TrendingDown, Ticket, Tv, Play, Flame, Lock, Shield, List, Table, PenTool, ShoppingBag, Globe, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { LEAGUE_NAMES, getStadiumCapacity, ACHIEVEMENTS, TROPHIES } from '../constants';
import { MatchResultDetails } from '../types';

export const OfficeView: React.FC = () => {
  const { state, dispatch, playMatch, clickForMoney } = useGame();
  const [clickEffect, setClickEffect] = useState(false);
  const [showStandings, setShowStandings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTrophyRoom, setShowTrophyRoom] = useState(false);
  const [standingsTab, setStandingsTab] = useState<'league' | 'europe'>('league');
  
  // Team Setup State
  const [setupName, setSetupName] = useState("");
  
  // Match Result Animation State
  const [prevWeek, setPrevWeek] = useState(state.week);
  const [lastDetails, setLastDetails] = useState<MatchResultDetails | null>(null);

  // Ad State
  const [adPlaying, setAdPlaying] = useState(false);
  const [adTimer, setAdTimer] = useState(0);
  const [adType, setAdType] = useState<'BOOST' | 'TRIPLE_MATCH'>('BOOST');

  useEffect(() => {
    if (state.week > prevWeek) {
      if (state.lastMatchDetails) {
         setLastDetails(state.lastMatchDetails);
      }
      setPrevWeek(state.week);
    }
  }, [state.week, state.lastMatchDetails, prevWeek]);

  // Ad Effect
  useEffect(() => {
      let interval: any;
      if (adPlaying && adTimer > 0) {
          interval = setInterval(() => {
              setAdTimer(prev => prev - 1);
          }, 1000);
      } else if (adPlaying && adTimer === 0) {
          // Reward: Activate Boost or x3 Match
          if (adType === 'BOOST') {
             dispatch({ type: 'WATCH_AD_BOOST' });
          } else if (adType === 'TRIPLE_MATCH') {
             dispatch({ type: 'WATCH_AD_TRIPLE_MATCH' });
             setLastDetails(null); // Close modal after reward
          }
          setAdPlaying(false);
      }
      return () => clearInterval(interval);
  }, [adPlaying, adTimer, dispatch, adType]);

  const handleWatchAd = (type: 'BOOST' | 'TRIPLE_MATCH') => {
      setAdType(type);
      setAdTimer(3); // 3 seconds ad
      setAdPlaying(true);
  };

  // --- TEAM SETUP RENDER ---
  if (!state.teamName) {
      return (
          <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6">
              <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-white">
                      <Trophy size={120} />
                  </div>

                  <div className="relative z-10 flex flex-col items-center">
                      <div className="bg-emerald-500/20 p-4 rounded-full mb-6 ring-4 ring-emerald-500/20">
                          <PenTool size={40} className="text-emerald-400" />
                      </div>
                      
                      <h1 className="text-3xl font-black text-white mb-2 text-center tracking-tight">KULÜBÜNÜ KUR</h1>
                      <p className="text-slate-400 text-center mb-8 text-sm">Futbol dünyasına adım atmaya hazır mısın? Takımına efsanevi bir isim ver.</p>
                      
                      <div className="w-full space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Takım Adı</label>
                              <input 
                                  type="text" 
                                  value={setupName}
                                  onChange={(e) => setSetupName(e.target.value)}
                                  placeholder="Örn: Aslanlar SK"
                                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-white font-bold placeholder-slate-600 outline-none transition-colors"
                                  maxLength={20}
                              />
                          </div>

                          <button 
                              onClick={() => {
                                  if (setupName.trim().length > 0) {
                                      dispatch({ type: 'SET_TEAM_NAME', name: setupName.trim() });
                                  }
                              }}
                              disabled={setupName.trim().length === 0}
                              className={`w-full py-4 rounded-xl font-black text-sm tracking-wide transition-all shadow-lg
                                  ${setupName.trim().length > 0 
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30' 
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                          >
                              KARİYERE BAŞLA
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- Calculations ---
  const stadium = state.facilities.find(f => f.id === 'stadium');
  const stadiumLevel = stadium ? stadium.level : 1;
  const currentCapacity = getStadiumCapacity(stadiumLevel);
  const capacityPercentage = Math.min(100, Math.floor((state.fans / currentCapacity) * 100));

  // Recalculate generic passive income for display (sum of all)
  const commercialFacilities = state.facilities.filter(f => f.type === 'COMMERCIAL');
  let commercialPassiveIncome = 0;
  commercialFacilities.forEach(f => {
      if (f.activeSponsor) {
          const raw = f.count * f.level * f.activeSponsor.passiveBonus;
          const fanMultiplier = 1 + (Math.log10(Math.max(10, state.fans)) - 1); 
          commercialPassiveIncome += Math.floor(raw * fanMultiplier);
      }
      if (f.dailyPassiveIncomePerFan && f.dailyPassiveIncomePerFan > 0) {
          commercialPassiveIncome += Math.floor(f.count * f.level * f.dailyPassiveIncomePerFan * state.fans);
      }
  });

  const baseClick = 15;
  let facilitiesBonus = 0;
  commercialFacilities.forEach(f => {
      if (f.activeSponsor) {
          facilitiesBonus += f.count * f.level * f.activeSponsor.clickBonus;
      }
  });
  
  const fanBonus = 1 + (state.fans / 2000); 
  
  let actualClickPower = Math.floor((baseClick + facilitiesBonus) * fanBonus);
  const isBoostActive = state.clickBoostTimer > 0;
  
  if (isBoostActive) {
      actualClickPower *= 10;
  }
  // --------------------

  const handleClick = () => {
    clickForMoney();
    setClickEffect(true);
    setTimeout(() => setClickEffect(false), 80);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
        setLastDetails(null);
    }
  };

  const isSquadValid = state.players.length >= 11;

  // Render Functions
  const renderLeagueTable = () => {
      if (!showStandings) return null;

      const activeTable = standingsTab === 'league' ? state.leagueTable : state.europeanTable;
      const hasEurope = state.europeanCup !== 'NONE' && state.europeanTable.length > 0;

      const getRowColor = (index: number) => {
          const rank = index + 1;
          
          if (standingsTab === 'league') {
              // SUPER LIG (Tier 1)
              if (state.leagueTier === 1) {
                  if (rank === 1) return 'bg-emerald-900/40 text-emerald-300'; // CL
                  if (rank <= 4) return 'bg-blue-900/40 text-blue-300'; // Europe
                  if (rank >= 16) return 'bg-rose-900/40 text-rose-300'; // Relegation
              } 
              // LOWER LEAGUES
              else {
                  if (rank <= 2) return 'bg-emerald-900/40 text-emerald-300'; // Promotion
                  if (rank >= 16 && state.leagueTier !== 6) return 'bg-rose-900/40 text-rose-300'; // Relegation
              }
          } else {
              // EUROPE
              if (rank === 1) return 'bg-purple-900/40 text-purple-300'; // Winner (Simplified)
          }
          
          return rank % 2 === 0 ? 'bg-slate-800/30' : '';
      };

      return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl flex flex-col h-[80vh]">
                   <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-3xl">
                      <div className="flex items-center gap-2">
                        <Table className="text-yellow-500" size={20} />
                        <h3 className="text-lg font-black text-white tracking-tight">PUAN DURUMU</h3>
                      </div>
                      <button onClick={() => setShowStandings(false)} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 text-white transition-colors">
                          <X size={16} />
                      </button>
                  </div>

                  {hasEurope && (
                      <div className="flex p-2 bg-slate-900 border-b border-slate-800">
                          <button 
                             onClick={() => setStandingsTab('league')}
                             className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${standingsTab === 'league' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                          >
                              {LEAGUE_NAMES[state.leagueTier]}
                          </button>
                          <button 
                             onClick={() => setStandingsTab('europe')}
                             className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${standingsTab === 'europe' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                          >
                              {state.europeanCup === 'CHAMPIONS' ? 'Şampiyonlar Ligi' : 'Avrupa Kupası'}
                          </button>
                      </div>
                  )}

                  <div className="flex-1 overflow-y-auto">
                      {activeTable.length > 0 ? (
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase sticky top-0 z-10 shadow-md">
                                <tr>
                                    <th className="p-3">#</th>
                                    <th className="p-3">Takım</th>
                                    <th className="p-3 text-center">O</th>
                                    <th className="p-3 text-center">Av</th>
                                    <th className="p-3 text-center">P</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {activeTable.map((team, index) => (
                                    <tr key={team.id} className={`border-b border-slate-800 ${getRowColor(index)} ${team.isUser ? 'font-black ring-1 ring-inset ring-yellow-500/50 bg-yellow-900/10' : ''}`}>
                                        <td className="p-3 font-mono">{index + 1}</td>
                                        <td className="p-3 font-bold truncate max-w-[120px]">
                                            {team.name}
                                            {team.isUser && <span className="ml-2 text-[8px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">SEN</span>}
                                        </td>
                                        <td className="p-3 text-center text-slate-400">{team.played}</td>
                                        <td className="p-3 text-center text-slate-400">{team.gf - team.ga}</td>
                                        <td className="p-3 text-center font-bold text-white text-sm">{team.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
                              <Globe size={48} className="mb-4 opacity-20"/>
                              <p>Henüz veri yok.</p>
                          </div>
                      )}
                  </div>

                  {standingsTab === 'league' && (
                    <div className="p-3 bg-slate-950 text-[10px] text-slate-500 border-t border-slate-800 rounded-b-3xl">
                        <div className="flex gap-3 justify-center flex-wrap">
                            {state.leagueTier === 1 ? (
                                <>
                                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> Şampiyonlar Ligi</span>
                                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Avrupa</span>
                                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span> Küme Düşme</span>
                                </>
                            ) : (
                                <>
                                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> Üst Lig</span>
                                    {state.leagueTier !== 6 && <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span> Küme Düşme</span>}
                                </>
                            )}
                        </div>
                    </div>
                  )}
              </div>
          </div>
      );
  };
  
  const renderAchievements = () => {
      if (!showAchievements) return null;
      
      const unlockedCount = state.unlockedAchievements.length;
      const totalCount = ACHIEVEMENTS.length;
      const progress = Math.round((unlockedCount / totalCount) * 100);

      return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl flex flex-col h-[70vh]">
                   <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-3xl">
                      <h3 className="text-lg font-black text-white flex items-center tracking-tight">
                          <Award className="mr-2 text-purple-400" size={20} /> BAŞARIMLAR
                      </h3>
                      <button onClick={() => setShowAchievements(false)} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 text-white transition-colors">
                          <X size={16} />
                      </button>
                  </div>
                  
                  <div className="p-4 bg-slate-950 border-b border-slate-800">
                      <div className="flex justify-between text-xs text-slate-400 font-bold uppercase mb-1">
                          <span>İlerleme</span>
                          <span>{unlockedCount}/{totalCount}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {ACHIEVEMENTS.map(ach => {
                          const isUnlocked = state.unlockedAchievements.includes(ach.id);
                          return (
                              <div key={ach.id} className={`p-3 rounded-xl border flex items-center
                                  ${isUnlocked ? 'bg-slate-800/50 border-purple-500/30' : 'bg-slate-900 border-slate-800 opacity-60'}
                              `}>
                                  <div className={`p-3 rounded-full mr-3 shrink-0 flex items-center justify-center
                                      ${isUnlocked ? 'bg-purple-500 text-white shadow-lg shadow-purple-900/20' : 'bg-slate-800 text-slate-600'}
                                  `}>
                                      {isUnlocked ? <CheckCircle2 size={20} /> : <Lock size={20} />}
                                  </div>
                                  <div>
                                      <h4 className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{ach.title}</h4>
                                      <p className="text-xs text-slate-400 leading-tight">{ach.description}</p>
                                      {isUnlocked && <div className="text-[10px] font-mono text-emerald-400 mt-1 font-bold">Ödül Alındı: ${ach.reward.toLocaleString()}</div>}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      );
  };
  
  const renderTrophyRoom = () => {
    if (!showTrophyRoom) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl flex flex-col h-[75vh]">
                 <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-3xl">
                    <h3 className="text-lg font-black text-white flex items-center tracking-tight">
                        <Trophy className="mr-2 text-yellow-500" size={20} /> KUPA MÜZESİ
                    </h3>
                    <button onClick={() => setShowTrophyRoom(false)} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
                    {Object.values(TROPHIES).map(trophy => {
                        const historyItem = state.trophyHistory.find(h => h.id === trophy.id);
                        const count = historyItem ? historyItem.count : 0;
                        const isUnlocked = count > 0;

                        return (
                            <div key={trophy.id} className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center relative overflow-hidden group
                                ${isUnlocked ? 'bg-slate-800 border-yellow-500/20 shadow-lg shadow-yellow-900/10' : 'bg-slate-900/50 border-slate-800 opacity-50 grayscale'}
                            `}>
                                {isUnlocked && (
                                    <div className="absolute inset-0 bg-yellow-500/5 blur-xl rounded-full"></div>
                                )}
                                <div className={`mb-3 transform transition-transform group-hover:scale-110 duration-500 ${trophy.color}`}>
                                    <Trophy size={48} className={isUnlocked ? 'drop-shadow-md' : 'opacity-20'} />
                                </div>
                                <h4 className={`font-bold text-xs mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{trophy.name}</h4>
                                <p className="text-[9px] text-slate-400 leading-tight mb-2">{trophy.description}</p>
                                
                                {isUnlocked ? (
                                    <div className="text-[10px] font-bold bg-yellow-500 text-black px-2 py-0.5 rounded-full shadow-lg">
                                        x{count} KAZANILDI
                                    </div>
                                ) : (
                                    <div className="text-[10px] font-bold bg-slate-800 text-slate-600 px-2 py-0.5 rounded-full border border-slate-700">
                                        KİLİTLİ
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
  };

  const renderEventModal = () => {
      if (!state.activeEvent) return null;
      const evt = state.activeEvent;
      
      const isGood = evt.type === 'GOOD';
      const bgGradient = isGood ? 'from-emerald-900/80 to-slate-900' : 'from-rose-900/80 to-slate-900';
      const iconColor = isGood ? 'text-emerald-400' : 'text-rose-400';

      return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur p-6 animate-in zoom-in-95 duration-200">
              <div className={`w-full max-w-sm rounded-[2rem] border-2 border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-br ${bgGradient}`}>
                  <div className="p-8 flex flex-col items-center text-center">
                      <div className={`p-4 rounded-full bg-white/10 mb-4 ring-4 ring-white/5 ${iconColor}`}>
                          {isGood ? <Sparkles size={48} /> : <ShieldAlert size={48} />}
                      </div>
                      
                      <h2 className="text-2xl font-black text-white mb-2 leading-tight uppercase tracking-tight">{evt.title}</h2>
                      <p className="text-slate-300 text-sm mb-6 leading-relaxed">{evt.description}</p>
                      
                      {/* Effects Preview */}
                      <div className="flex gap-2 mb-6">
                          {evt.effect.money !== undefined && (
                             <div className={`text-xs font-bold px-2 py-1 rounded border ${evt.effect.money > 0 ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500/30' : 'bg-rose-900/50 text-rose-400 border-rose-500/30'}`}>
                                 {evt.effect.money > 0 ? '+' : ''}${evt.effect.money.toLocaleString()}
                             </div>
                          )}
                          {evt.effect.fans !== undefined && (
                             <div className={`text-xs font-bold px-2 py-1 rounded border ${evt.effect.fans > 0 ? 'bg-blue-900/50 text-blue-400 border-blue-500/30' : 'bg-rose-900/50 text-rose-400 border-rose-500/30'}`}>
                                 {evt.effect.fans > 0 ? '+' : ''}{evt.effect.fans} Taraftar
                             </div>
                          )}
                          {evt.effect.morale !== undefined && (
                             <div className={`text-xs font-bold px-2 py-1 rounded border ${evt.effect.morale > 0 ? 'bg-indigo-900/50 text-indigo-400 border-indigo-500/30' : 'bg-rose-900/50 text-rose-400 border-rose-500/30'}`}>
                                 {evt.effect.morale > 0 ? '+' : ''}{evt.effect.morale} Moral
                             </div>
                          )}
                      </div>

                      <button 
                          onClick={() => dispatch({ type: 'RESOLVE_EVENT' })}
                          className="w-full bg-white text-slate-900 font-black py-4 rounded-xl text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                      >
                          {evt.buttonText}
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const renderResultOverlay = () => {
    if (!lastDetails) return null;

    const { result, scoreHome, scoreAway, reward, attendance, stadiumCapacity, droppedSponsorNames } = lastDetails;
    const isFullCapacity = attendance >= stadiumCapacity;
    const canTriple = reward.totalNet > 0;

    let bgClass = '';
    let icon = null;
    let title = '';

    switch (result) {
        case 'WIN':
            bgClass = 'bg-emerald-600 border-emerald-400';
            icon = <Trophy className="w-16 h-16 text-yellow-300 drop-shadow-lg animate-bounce" />;
            title = 'GALİBİYET!';
            break;
        case 'DRAW':
            bgClass = 'bg-orange-500 border-orange-300';
            icon = <Minus className="w-16 h-16 text-white drop-shadow-lg" />;
            title = 'BERABERLİK';
            break;
        case 'LOSS':
            bgClass = 'bg-red-600 border-red-400';
            icon = <XCircle className="w-16 h-16 text-white drop-shadow-lg" />;
            title = 'MAĞLUBİYET';
            break;
    }

    const formatMoney = (val: number) => val.toLocaleString();

    return (
        <div 
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer p-4"
        >
            <div 
                className={`${bgClass} rounded-[2rem] border-4 shadow-2xl flex flex-col items-center justify-center transform transition-all animate-[bounce_0.5s_ease-out] w-full max-w-sm relative cursor-default overflow-hidden`}
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/10 to-transparent"></div>
                
                <button 
                    onClick={() => setLastDetails(null)}
                    className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors z-20"
                >
                    <X size={20} />
                </button>

                <div className="pt-8 pb-4 flex flex-col items-center relative z-10">
                    {icon}
                    <h1 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-md mb-1">{title}</h1>
                    <div className="text-4xl font-mono font-bold text-white mb-2">{scoreHome} - {scoreAway}</div>
                    {reward.euroMatchIncome > 0 && (
                        <div className="bg-blue-600/50 px-3 py-1 rounded-full text-xs font-bold text-white border border-blue-400/30 flex items-center">
                            <Globe size={12} className="mr-1"/> AVRUPA MAÇI
                        </div>
                    )}
                </div>

                {/* Financial Receipt */}
                <div className="w-full bg-slate-900/90 backdrop-blur-sm p-5 space-y-3">
                    {droppedSponsorNames && droppedSponsorNames.length > 0 && (
                        <div className="bg-red-900/30 border border-red-500/50 p-2 rounded-lg text-red-200 text-xs font-bold flex flex-col items-center justify-center mb-2 animate-pulse text-center">
                            <div className="flex items-center mb-1">
                                <ShieldAlert size={14} className="mr-2" />
                                SPONSOR İPTALİ!
                            </div>
                            {droppedSponsorNames.map((name, i) => (
                                <div key={i} className="text-white text-[10px]">{name} anlaşmayı feshetti.</div>
                            ))}
                        </div>
                    )}
                    
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-2">MAÇ RAPORU</h3>
                    
                    {/* Attendance Info */}
                    <div className={`rounded-lg p-2 mb-3 border flex justify-between items-center text-xs
                        ${isFullCapacity ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                         <span className="text-slate-400 font-bold flex items-center"><Users size={12} className="mr-1.5"/> Seyirci</span>
                         <span className={`font-mono font-bold ${isFullCapacity ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                             {attendance?.toLocaleString()} / {stadiumCapacity?.toLocaleString()} {isFullCapacity && '(DOLU!)'}
                         </span>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center text-emerald-400">
                            <div className="flex items-center"><Ticket size={14} className="mr-2"/> Bilet Geliri</div>
                            <div className="font-mono font-bold">+${formatMoney(reward.ticketSales)}</div>
                        </div>
                        {reward.commercialMatchIncome > 0 && (
                            <div className="flex justify-between items-center text-purple-400">
                                <div className="flex items-center"><ShoppingBag size={14} className="mr-2"/> Büfe & Mağaza</div>
                                <div className="font-mono font-bold">+${formatMoney(reward.commercialMatchIncome)}</div>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-yellow-400">
                            <div className="flex items-center"><Trophy size={14} className="mr-2"/> Maç Primi</div>
                            <div className="font-mono font-bold">+${formatMoney(reward.matchBonus)}</div>
                        </div>
                        {reward.euroMatchIncome > 0 && (
                            <div className="flex justify-between items-center text-blue-300">
                                <div className="flex items-center"><Globe size={14} className="mr-2"/> Avrupa Geliri</div>
                                <div className="font-mono font-bold">+${formatMoney(reward.euroMatchIncome)}</div>
                            </div>
                        )}
                        {reward.sponsorBonus > 0 && (
                            <div className="flex justify-between items-center text-indigo-400">
                                <div className="flex items-center"><Shield size={14} className="mr-2"/> Sponsorlar</div>
                                <div className="font-mono font-bold">+${formatMoney(reward.sponsorBonus)}</div>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-rose-400 border-t border-slate-700/50 pt-2">
                            <div className="flex items-center"><TrendingDown size={14} className="mr-2"/> Oyuncu Maaşları</div>
                            <div className="font-mono font-bold">-${formatMoney(reward.wagesPaid)}</div>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-3 flex justify-between items-center mt-3 border border-slate-700">
                        <span className="text-slate-300 font-bold text-sm">NET KAZANÇ</span>
                        <span className={`font-mono font-black text-lg ${reward.totalNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {reward.totalNet >= 0 ? '+' : ''}${formatMoney(reward.totalNet)}
                        </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-4 space-y-2">
                         {canTriple && (
                             <button
                                onClick={() => handleWatchAd('TRIPLE_MATCH')}
                                className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-xl font-black text-sm transition-transform active:scale-95 shadow-xl shadow-purple-900/30 group border border-white/20"
                             >
                                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                 <div className="relative flex flex-col items-center">
                                     <div className="flex items-center mb-1">
                                         <Play size={18} className="fill-white mr-2"/>
                                         <span>SPONSOR DESTEĞİ (x3)</span>
                                     </div>
                                     <span className="text-yellow-300 font-mono text-lg font-black drop-shadow-sm">
                                         +${formatMoney(reward.totalNet * 3)}
                                     </span>
                                 </div>
                             </button>
                         )}

                        <button 
                            onClick={() => setLastDetails(null)}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-xl font-bold text-xs transition-colors border border-slate-600"
                        >
                            DEVAM ET
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-3 gap-3 bg-slate-950">
      {renderResultOverlay()}
      {renderLeagueTable()}
      {renderTrophyRoom()}
      {renderEventModal()}
      {renderAchievements()}

      {/* AD SIMULATOR OVERLAY */}
      {adPlaying && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-8"></div>
            <div className="text-2xl font-black mb-2">SPONSOR REKLAMI</div>
            <div className="text-sm text-slate-400">
                {adType === 'TRIPLE_MATCH' ? 'Ödeme Hazırlanıyor...' : 'Güçlendirme Yükleniyor...'}
            </div>
            <div className="mt-8 text-4xl font-mono font-bold">{adTimer}</div>
            <div className="absolute bottom-10 text-xs text-slate-600">Video Kapatılamaz</div>
        </div>
      )}

      {/* 1. HEADER CARD */}
      <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-slate-800 shadow-sm shrink-0 flex flex-col gap-3">
          {/* Top Row: Team & Season */}
          <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 max-w-[60%]">
                  <div 
                    onClick={() => setShowTrophyRoom(true)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-700 flex items-center justify-center shadow-lg border-2 border-yellow-400 shrink-0 cursor-pointer active:scale-95 transition-transform"
                  >
                     <Trophy size={20} className="text-white fill-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-white tracking-tight leading-none truncate">{state.teamName}</h1>
                    <div className="flex items-center mt-1">
                        {state.europeanCup === 'CHAMPIONS' && <span className="flex items-center text-[10px] font-bold text-emerald-400"><Globe size={10} className="mr-1"/> Şampiyonlar Ligi</span>}
                        {state.europeanCup === 'EUROPA' && <span className="flex items-center text-[10px] font-bold text-blue-400"><Globe size={10} className="mr-1"/> Avrupa Ligi</span>}
                    </div>
                  </div>
              </div>
              
              <div className="flex flex-col items-end w-1/3">
                  <div className="flex justify-between w-full text-[10px] text-slate-400 font-bold uppercase mb-1">
                      <span>Sezon {state.season}</span>
                      <span>Hafta {Math.min(state.week, 20)}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${(Math.min(state.week, 20) / 20) * 100}%` }}
                      ></div>
                  </div>
              </div>
          </div>

          {/* Bottom Row: League & Standings & Achievements */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
               <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">{LEAGUE_NAMES[state.leagueTier]}</span>
               </div>

               <div className="flex gap-2">
                   <button 
                      onClick={() => setShowAchievements(true)}
                      className="bg-purple-600 hover:bg-purple-500 text-white p-1.5 rounded-lg transition-all shadow-lg shadow-purple-900/20 flex items-center border border-purple-500/50 active:scale-95"
                   >
                       <Award size={16} />
                   </button>
                   <button 
                      onClick={() => setShowStandings(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-indigo-900/20 flex items-center border border-indigo-500/50 active:scale-95"
                  >
                      <Table size={12} className="mr-1.5" /> 
                      PUAN TABLOSU
                  </button>
               </div>
          </div>
      </div>

      {/* 2. STATS GRID (BENTO BOX) */}
      <div className="grid grid-cols-3 gap-2 shrink-0 h-24">
          {/* Money Box */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-3 border border-slate-700 flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5"><Wallet size={40}/></div>
              <div className="text-emerald-400 mb-1"><Wallet size={20} /></div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Kasa</div>
              <div className="text-sm font-black text-white tracking-tight">${state.money.toLocaleString()}</div>
          </div>
          
          {/* Fans Box */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-3 border border-slate-700 flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5"><Users size={40}/></div>
              <div className="text-blue-400 mb-1 flex items-center">
                  <Users size={20} />
                  {capacityPercentage >= 100 && <XCircle size={12} className="ml-1 text-red-500 animate-pulse" />}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Taraftar</div>
              <div className="text-sm font-black text-white tracking-tight">{state.fans.toLocaleString()}</div>
              <div className="text-[8px] text-slate-500 font-mono mt-0.5">Doluluk: %{capacityPercentage}</div>
          </div>

           {/* Points Box */}
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-3 border border-slate-700 flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5"><Trophy size={40}/></div>
              <div className="text-yellow-400 mb-1"><Trophy size={20} /></div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Puan</div>
              <div className="text-sm font-black text-white tracking-tight">{state.leagueTable.find(t => t.isUser)?.points || 0}</div>
          </div>
      </div>

      {/* 3. INCOME STRIP */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
           <div className={`rounded-xl p-2 border flex items-center justify-between transition-colors
                ${isBoostActive ? 'bg-amber-900/20 border-amber-500/50' : 'bg-slate-900/50 border-slate-800'}`}>
               <div className="flex items-center">
                   <div className={`p-1.5 rounded-lg mr-2 ${isBoostActive ? 'bg-amber-500 text-black' : 'bg-slate-800 text-yellow-500'}`}>
                       {isBoostActive ? <Flame size={14} className="animate-pulse"/> : <Zap size={14} />}
                   </div>
                   <div>
                       <div className={`text-[10px] font-bold uppercase ${isBoostActive ? 'text-amber-400' : 'text-slate-400'}`}>
                           {isBoostActive ? 'BOOST AKTİF!' : 'Tık Gücü'}
                       </div>
                       <div className="text-xs font-black text-white font-mono">+${actualClickPower}</div>
                   </div>
               </div>
               {isBoostActive && <div className="text-xs font-bold text-amber-500 animate-pulse">{state.clickBoostTimer}sn</div>}
           </div>

           <div className="bg-slate-900/50 rounded-xl p-2 border border-slate-800 flex items-center">
               <div className="p-1.5 rounded-lg mr-2 bg-slate-800 text-blue-400">
                   <Clock size={14} />
               </div>
               <div>
                   <div className="text-[10px] font-bold uppercase text-slate-400">Pasif Gelir</div>
                   <div className="text-xs font-black text-white font-mono">+${commercialPassiveIncome}/sn</div>
               </div>
           </div>
      </div>

      {/* 4. MATCH ACTION CARD */}
      <div className="shrink-0">
          {!isSquadValid && (
             <div className="mb-2 bg-rose-900/20 border border-rose-500/30 p-2 rounded-xl flex items-center justify-center text-xs text-rose-200 animate-pulse font-bold">
                 <ShieldAlert className="w-4 h-4 mr-2" />
                 11 KİŞİ OLMADAN MAÇA ÇIKAMAZSIN
             </div>
          )}
          
          <button
              onClick={playMatch}
              disabled={!isSquadValid}
              className={`w-full relative group overflow-hidden rounded-2xl border-2 transition-all duration-200 h-16 flex items-center justify-between px-6 shadow-xl
                  ${isSquadValid 
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 border-indigo-400/30 hover:border-indigo-300' 
                      : 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'}`}
          >
              <div className="flex flex-col items-start z-10">
                  <span className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isSquadValid ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {state.europeanCup !== 'NONE' ? 'SIRADAKİ MAÇ (LİG + AVRUPA)' : 'SIRADAKİ MAÇ'}
                  </span>
                  <span className="text-lg font-black text-white italic">MAÇA ÇIK</span>
              </div>
              <div className={`p-3 rounded-full bg-white/10 z-10 ${isSquadValid ? 'group-hover:scale-110 transition-transform' : ''}`}>
                  <Play size={24} className="text-white fill-white" />
              </div>
              
              {/* Decorative BG */}
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent skew-x-12"></div>
          </button>
      </div>

      {/* 5. BIG CLICKER AREA */}
      <div className="flex-1 min-h-0 relative">
          <button 
            onClick={handleClick}
            className="w-full h-full rounded-3xl border-4 border-emerald-900/50 relative overflow-hidden group active:scale-[0.99] transition-transform shadow-2xl"
          >
              {/* Pitch Pattern */}
              <div className="absolute inset-0 bg-emerald-800 flex flex-col">
                   {/* Stripes */}
                   {Array.from({ length: 10 }).map((_, i) => (
                       <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-emerald-700/50' : 'bg-transparent'}`}></div>
                   ))}
              </div>
              
              {/* Center Circle */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                  <div className="w-48 h-48 border-4 border-white/40 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white/40 rounded-full"></div>
                  </div>
                  <div className="absolute w-full h-1 bg-white/40"></div>
              </div>

              {/* Tap Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <div className={`text-4xl transition-transform duration-100 ${clickEffect ? 'scale-110' : 'scale-100'}`}>
                      ⚽
                  </div>
                  <div className="mt-4 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex flex-col items-center">
                      <span className="text-xs text-emerald-200 font-bold uppercase tracking-widest mb-1">GELİR ELDE ET</span>
                      <span className={`text-2xl font-black font-mono ${isBoostActive ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
                          +${actualClickPower}
                      </span>
                  </div>
                  {isBoostActive && (
                      <div className="mt-2 text-xs font-bold text-amber-500 bg-amber-950/80 px-2 py-1 rounded border border-amber-500/30 animate-bounce">
                          🔥 x10 BOOST AKTİF!
                      </div>
                  )}
              </div>

              {/* TV Button (Floating) */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleWatchAd('BOOST'); }}
                className="absolute top-4 right-4 z-30 bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-2xl shadow-lg border border-purple-400/50 flex flex-col items-center animate-pulse cursor-pointer transition-transform hover:scale-105"
              >
                  <Tv size={20} className="mb-1" />
                  <span className="text-[8px] font-bold uppercase">x10 GÜÇ</span>
              </div>

              {/* Particle Effect (Simple) */}
              {clickEffect && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-4xl font-black text-emerald-300 animate-[ping_0.5s_ease-out_1] opacity-50">+${actualClickPower}</div>
                  </div>
              )}
          </button>
      </div>
    </div>
  );
};
