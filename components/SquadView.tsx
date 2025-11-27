
import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import { Player, Position } from '../types';
import { User, Users, Activity, Heart, TrendingUp, DollarSign, Shirt, Dumbbell, RefreshCw, ShoppingCart, Star, AlertCircle, Lock, X, Shield, Tv, Layers, ArrowLeftRight, Zap, Trophy, ChevronsUp, TrendingDown, Smile, Meh, Frown, Flame, Snowflake, Award, Sparkles, Wallet, ChevronDown, Telescope, Clock } from 'lucide-react';

const PositionBadge: React.FC<{ position: Position, size?: 'sm' | 'md' }> = ({ position, size = 'sm' }) => {
  let color = 'bg-slate-600 text-slate-200';
  let border = 'border-slate-500';
  
  if (position === Position.GK) { color = 'bg-yellow-900/60 text-yellow-400'; border = 'border-yellow-600/50'; }
  if (position === Position.DEF) { color = 'bg-blue-900/60 text-blue-400'; border = 'border-blue-600/50'; }
  if (position === Position.MID) { color = 'bg-emerald-900/60 text-emerald-400'; border = 'border-emerald-600/50'; }
  if (position === Position.FWD) { color = 'bg-rose-900/60 text-rose-400'; border = 'border-rose-600/50'; }

  const px = size === 'md' ? 'px-3 py-1 text-xs' : 'px-1.5 py-0.5 text-[9px]';

  return (
    <span className={`${color} border ${border} ${px} font-bold rounded uppercase tracking-wider shadow-sm`}>
      {position}
    </span>
  );
};

export const SquadView: React.FC = () => {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'lineup' | 'squad' | 'training' | 'market'>('lineup');
  
  // Modals
  const [sellModalPlayer, setSellModalPlayer] = useState<Player | null>(null);
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<Player | null>(null);
  
  // Selection for Lineup Swap
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Ad State
  const [adPlaying, setAdPlaying] = useState(false);
  const [adTimer, setAdTimer] = useState(0);
  const [adType, setAdType] = useState<'CONDITION' | 'WONDERKID'>('CONDITION');

  useEffect(() => {
      let interval: any;
      if (adPlaying && adTimer > 0) {
          interval = setInterval(() => {
              setAdTimer(prev => prev - 1);
          }, 1000);
      } else if (adPlaying && adTimer === 0) {
          // Reward
          if (adType === 'CONDITION') {
            dispatch({ type: 'WATCH_AD_CONDITION' });
          } else if (adType === 'WONDERKID') {
            dispatch({ type: 'WATCH_AD_WONDERKID' });
          }
          setAdPlaying(false);
      }
      return () => clearInterval(interval);
  }, [adPlaying, adTimer, dispatch, adType]);

  const handleWatchAd = (type: 'CONDITION' | 'WONDERKID') => {
      setAdType(type);
      setAdTimer(3);
      setAdPlaying(true);
  };

  const getConditionColor = (val: number) => {
    if (val > 80) return 'text-emerald-500';
    if (val > 50) return 'text-yellow-500';
    return 'text-rose-500';
  };

  const getMoraleIcon = (val: number, size: number = 12) => {
      if (val > 80) return <Flame size={size} className="text-amber-500 fill-amber-500 animate-pulse" />; // On Fire
      if (val > 50) return <Smile size={size} className="text-blue-400" />;
      if (val > 30) return <Meh size={size} className="text-slate-400" />;
      return <Snowflake size={size} className="text-cyan-300" />; // Cold
  };

  const formatMoney = (val: number) => {
      if (val >= 1000000) return `$${(val/1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val/1000).toFixed(0)}K`;
      return `$${val}`;
  };

  // --- Calculations for Team Power ---
  const starters = state.players.filter(p => p.isStarting);
  const teamRating = starters.length > 0 
      ? Math.round(starters.reduce((acc, p) => acc + p.rating, 0) / starters.length) 
      : 0;
  
  // Line Calculations
  const defPlayers = starters.filter(p => p.position === Position.GK || p.position === Position.DEF);
  const midPlayers = starters.filter(p => p.position === Position.MID);
  const fwdPlayers = starters.filter(p => p.position === Position.FWD);

  const defRating = defPlayers.length > 0 ? Math.round(defPlayers.reduce((a,b) => a+b.rating, 0)/defPlayers.length) : 0;
  const midRating = midPlayers.length > 0 ? Math.round(midPlayers.reduce((a,b) => a+b.rating, 0)/midPlayers.length) : 0;
  const fwdRating = fwdPlayers.length > 0 ? Math.round(fwdPlayers.reduce((a,b) => a+b.rating, 0)/fwdPlayers.length) : 0;

  const renderStars = (rating: number) => {
      const starCount = rating / 20; // 0 to 5
      const fullStars = Math.floor(starCount);
      const hasHalfStar = starCount % 1 >= 0.5;
      
      return (
          <div className="flex space-x-0.5">
              {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={`${i < fullStars ? 'text-yellow-400 fill-yellow-400' : (i === fullStars && hasHalfStar) ? 'text-yellow-400 fill-yellow-400/50' : 'text-slate-700'}`} 
                  />
              ))}
          </div>
      );
  };

  const handleSwap = (playerId: string) => {
    if (!selectedPlayerId) {
        setSelectedPlayerId(playerId);
    } else {
        if (selectedPlayerId !== playerId) {
            dispatch({ type: 'SWAP_LINEUP', player1Id: selectedPlayerId, player2Id: playerId });
        }
        setSelectedPlayerId(null);
    }
  };

  // Check stats for training buttons
  const isConditionFull = state.players.every(p => p.condition >= 99);
  const isMoraleFull = state.players.every(p => p.morale >= 99);
  const trainedThisWeek = state.hasTrainedThisWeek;

  // --- RENDER PLAYER PROFILE MODAL ---
  const renderPlayerProfile = () => {
      if (!selectedPlayerProfile) return null;
      const p = selectedPlayerProfile;
      const progressPct = p.xp || 0;
      
      let headerGradient = 'from-slate-700 to-slate-900';
      let accentColor = 'text-slate-400';
      if (p.position === Position.GK) { headerGradient = 'from-yellow-600 to-yellow-900'; accentColor = 'text-yellow-400'; }
      else if (p.position === Position.DEF) { headerGradient = 'from-blue-600 to-blue-900'; accentColor = 'text-blue-400'; }
      else if (p.position === Position.MID) { headerGradient = 'from-emerald-600 to-emerald-900'; accentColor = 'text-emerald-400'; }
      else if (p.position === Position.FWD) { headerGradient = 'from-rose-600 to-rose-900'; accentColor = 'text-rose-400'; }

      const canSell = state.players.length > 11;

      return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Close Button */}
                  <button 
                      onClick={() => setSelectedPlayerProfile(null)}
                      className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
                  >
                      <X size={20} />
                  </button>

                  {/* Header Card */}
                  <div className={`bg-gradient-to-br ${headerGradient} p-6 pb-12 relative overflow-hidden shrink-0`}>
                      <div className="absolute top-0 right-0 p-8 opacity-20 transform rotate-12 scale-150">
                          <User size={120} />
                      </div>
                      
                      <div className="relative z-10 flex flex-col items-center mt-2">
                          <div className="w-24 h-24 bg-slate-900/30 backdrop-blur-md rounded-2xl border-2 border-white/20 flex items-center justify-center shadow-2xl mb-3 relative group">
                              <span className="text-5xl font-black text-white drop-shadow-lg">{p.rating}</span>
                              <div className="absolute -bottom-3 px-3 py-1 bg-black/50 backdrop-blur rounded-lg border border-white/10 shadow-lg">
                                  <PositionBadge position={p.position} size="md" />
                              </div>
                          </div>
                          
                          <h2 className="text-2xl font-black text-white leading-tight text-center mt-2">{p.name}</h2>
                          <div className="flex items-center space-x-2 text-white/80 text-xs font-bold uppercase tracking-wider mt-1">
                              <span>{p.age} Yaş</span>
                              <span>•</span>
                              <span className="font-mono">{formatMoney(p.value)}</span>
                          </div>
                      </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 bg-slate-950 p-6 -mt-8 rounded-t-[2rem] relative z-10 overflow-y-auto border-t border-slate-800">
                      
                      {/* Detailed Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Maaş</div>
                              <div className="text-lg font-black text-white font-mono">{formatMoney(p.wage)}</div>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Potansiyel</div>
                              <div className={`text-lg font-black ${p.rating >= p.maxPotential ? 'text-slate-400' : 'text-emerald-400'}`}>
                                  {p.maxPotential}
                              </div>
                          </div>
                      </div>

                      {/* XP Bar */}
                      <div className="mb-6 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                          <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold text-slate-400 uppercase flex items-center">
                                  <Sparkles size={12} className="mr-1 text-yellow-400" /> Gelişim (XP)
                              </span>
                              <span className="text-xs font-bold text-emerald-400">{progressPct}%</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: `${progressPct}%` }}></div>
                          </div>
                      </div>

                      {/* Status Bars */}
                      <div className="space-y-3 mb-6">
                           <div>
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-xs font-bold text-slate-500 uppercase">Kondisyon</span>
                                   <span className={`text-xs font-bold ${getConditionColor(p.condition)}`}>{p.condition}</span>
                               </div>
                               <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                   <div className={`h-full rounded-full transition-all ${p.condition > 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${p.condition}%` }}></div>
                               </div>
                           </div>
                           <div>
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-xs font-bold text-slate-500 uppercase">Moral</span>
                                   <span className="text-xs font-bold text-indigo-400">{p.morale}</span>
                               </div>
                               <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                   <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${p.morale}%` }}></div>
                               </div>
                           </div>
                      </div>
                      
                      {/* Action Button: Sell */}
                      <button 
                          disabled={!canSell}
                          onClick={() => {
                              setSelectedPlayerProfile(null);
                              setSellModalPlayer(p);
                          }}
                          className={`w-full py-4 rounded-xl flex items-center justify-center font-black text-xs uppercase tracking-wide transition-all shadow-lg
                              ${canSell 
                                  ? 'bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 border border-rose-500/30 hover:border-rose-500/50' 
                                  : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'}`}
                      >
                          {canSell ? (
                              <><DollarSign size={16} className="mr-2" /> SATIŞ LİSTESİNE KOY</>
                          ) : (
                              <><Lock size={14} className="mr-2" /> KADRO LİMİTİ (MİN 11)</>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const renderSellModal = () => {
    if (!sellModalPlayer) return null;
    const sellPrice = Math.floor(sellModalPlayer.value * 0.60);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur p-6 animate-in fade-in">
             <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full max-w-xs text-center">
                 <div className="w-16 h-16 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-rose-500/50">
                     <DollarSign size={32} className="text-rose-500" />
                 </div>
                 <h3 className="text-xl font-black text-white mb-2">Oyuncuyu Sat?</h3>
                 <p className="text-slate-400 text-sm mb-6">
                     <span className="text-white font-bold">{sellModalPlayer.name}</span> isimli oyuncuyu satarak <span className="text-emerald-400 font-bold font-mono">{formatMoney(sellPrice)}</span> gelir elde edeceksin. Bu işlem geri alınamaz.
                 </p>
                 <div className="flex space-x-3">
                     <button 
                        onClick={() => setSellModalPlayer(null)}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-700"
                     >
                         İPTAL
                     </button>
                     <button 
                        onClick={() => {
                            dispatch({ type: 'SELL_PLAYER', playerId: sellModalPlayer.id });
                            setSellModalPlayer(null);
                        }}
                        className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-500 shadow-lg shadow-rose-900/30"
                     >
                         SAT
                     </button>
                 </div>
             </div>
        </div>
    );
  };

  // --- RENDER HELPERS ---
  const renderPlayerRow = (p: Player, mode: 'swap' | 'view') => {
      const isSelected = selectedPlayerId === p.id;
      const progressPct = p.xp || 0;

      // Simple View (for Lineup/Swap)
      if (mode === 'swap') {
          return (
            <div 
                key={p.id}
                onClick={() => handleSwap(p.id)}
                className={`relative bg-slate-800/80 backdrop-blur border rounded-xl p-2.5 flex items-center justify-between transition-all active:scale-[0.98] mb-2
                    ${isSelected 
                        ? 'border-yellow-500 bg-yellow-900/20 ring-1 ring-yellow-500 shadow-lg z-10' 
                        : p.isStarting ? 'border-slate-700 hover:border-slate-600' : 'border-slate-700/50 opacity-90'
                    }
                `}
            >
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border shadow-inner
                        ${p.isStarting ? 'bg-indigo-900/40 border-indigo-500/30 text-indigo-200' : 'bg-slate-700 border-slate-600 text-slate-400'}
                    `}>
                        {p.rating}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-white text-xs leading-none">{p.name}</h4>
                            <PositionBadge position={p.position} />
                        </div>
                        <div className="flex items-center space-x-2 mt-1.5">
                            <div className="flex items-center text-[10px]">
                                <Heart size={10} className={`mr-0.5 ${getConditionColor(p.condition)}`} /> 
                                <div className="w-8 h-1 bg-slate-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${p.condition > 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{width: `${p.condition}%`}}></div>
                                </div>
                            </div>
                            <div className="flex items-center text-[10px]">
                                {getMoraleIcon(p.morale, 10)}
                                <div className="w-8 h-1 bg-slate-700 rounded-full ml-1 overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{width: `${p.morale}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isSelected && selectedPlayerId !== p.id && (
                    <div className="bg-yellow-500 text-black p-2 rounded-full animate-pulse shadow-lg">
                        <ArrowLeftRight size={16} />
                    </div>
                )}
            </div>
          );
      }

      // Detailed View (for Squad List)
      return (
          <div 
              key={p.id}
              onClick={() => setSelectedPlayerProfile(p)}
              className="relative bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-3 flex items-center justify-between transition-all active:scale-[0.98] mb-2 hover:border-slate-600 shadow-sm"
          >
              <div className="flex items-center gap-3 flex-1">
                  {/* Avatar / Rating */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border shadow-inner shrink-0
                      ${p.isStarting ? 'bg-indigo-900/40 border-indigo-500/30 text-indigo-200' : 'bg-slate-700 border-slate-600 text-slate-400'}
                  `}>
                      {p.rating}
                  </div>
                  
                  {/* Name & Basic Info */}
                  <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-white text-sm truncate">{p.name}</h4>
                          <PositionBadge position={p.position} />
                      </div>
                      <div className="flex items-center text-[10px] text-slate-400 gap-2">
                           <span className="flex items-center"><Clock size={10} className="mr-1"/> {p.age} Yaş</span>
                           <span className="flex items-center text-rose-300"><DollarSign size={10} className="mr-0.5"/> {formatMoney(p.wage)}/hf</span>
                      </div>
                  </div>
              </div>

              {/* Status Bars (Right Side) */}
              <div className="flex flex-col gap-1.5 w-24 shrink-0 border-l border-slate-700/50 pl-3 ml-2">
                  {/* XP */}
                  <div className="flex flex-col">
                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold uppercase mb-0.5">
                          <span>XP</span>
                          <span className="text-emerald-400">{progressPct}%</span>
                      </div>
                      <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{width: `${progressPct}%`}}></div>
                      </div>
                  </div>
                  {/* Condition */}
                  <div className="flex flex-col">
                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold uppercase mb-0.5">
                           <Heart size={8} className={getConditionColor(p.condition)} />
                           <span className={getConditionColor(p.condition)}>{p.condition}</span>
                      </div>
                      <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full ${p.condition > 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{width: `${p.condition}%`}}></div>
                      </div>
                  </div>
                  {/* Morale */}
                  <div className="flex flex-col">
                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold uppercase mb-0.5">
                           <Smile size={8} className="text-indigo-400" />
                           <span className="text-indigo-400">{p.morale}</span>
                      </div>
                      <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{width: `${p.morale}%`}}></div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderPitchView = () => {
    // Pitch Logic: Group starters by Position for visual placement
    // 4-4-2 simple visual logic
    const gk = starters.find(p => p.position === Position.GK);
    const defs = starters.filter(p => p.position === Position.DEF).slice(0, 4);
    const mids = starters.filter(p => p.position === Position.MID).slice(0, 4);
    const fwds = starters.filter(p => p.position === Position.FWD).slice(0, 2);

    const renderPin = (p: Player & { styleLeft: string; styleTop: string }) => (
        <div 
            key={p.id} 
            onClick={() => handleSwap(p.id)}
            className={`flex flex-col items-center absolute transform -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer z-10
                ${selectedPlayerId === p.id ? 'scale-125 z-20 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 'active:scale-95'}
            `}
            style={{ left: p.styleLeft, top: p.styleTop }}
        >
            <div className="relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-lg font-black text-xs
                    ${selectedPlayerId === p.id 
                        ? 'bg-yellow-500 border-white text-black' 
                        : 'bg-slate-900/90 border-white/80 text-white backdrop-blur-sm'}
                `}>
                    {p.rating}
                </div>
                <div className="absolute -top-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-white/50">
                    {getMoraleIcon(p.morale, 8)}
                </div>
            </div>
            
            <div className="mt-1 flex flex-col items-center">
                <span className="text-[9px] font-bold text-white bg-black/60 px-1.5 rounded backdrop-blur-sm whitespace-nowrap mb-0.5 border border-black/20">
                    {p.name.split(' ').pop()}
                </span>
                {/* Condition Bar */}
                <div className="w-8 h-1 bg-black/50 rounded-full overflow-hidden border border-white/20">
                    <div 
                        className={`h-full ${p.condition > 70 ? 'bg-green-500' : p.condition > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                        style={{ width: `${p.condition}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );

    // Coordinate mapping for visual pitch
    const mappedGK = gk ? [{...gk, styleLeft: '50%', styleTop: '88%'}] : [];
    const mappedDEFs = defs.map((p, i) => ({...p, styleLeft: `${20 + i * 20}%`, styleTop: '68%'}));
    const mappedMIDs = mids.map((p, i) => ({...p, styleLeft: `${20 + i * 20}%`, styleTop: '42%'}));
    const mappedFWDs = fwds.map((p, i) => ({...p, styleLeft: `${35 + i * 30}%`, styleTop: '18%'}));
    
    const allPins = [...mappedGK, ...mappedDEFs, ...mappedMIDs, ...mappedFWDs];
    const benchPlayers = state.players.filter(p => !p.isStarting);
    // Sort bench by rating
    benchPlayers.sort((a,b) => b.rating - a.rating);

    return (
        <div className="flex flex-col h-full pb-24">
            
            {/* 1. PITCH AREA */}
            <div className="px-4 pt-2">
                {/* Team Power Header - PREMIUM REDESIGN */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-4 border border-indigo-500/30 mb-3 relative overflow-hidden shadow-lg">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Trophy size={100} className="text-white" />
                    </div>
                    
                    <div className="relative z-10 flex justify-between items-center">
                        {/* Left: Overall Rating */}
                        <div className="flex items-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl rotate-3 flex items-center justify-center shadow-lg border-2 border-yellow-300 mr-4 group">
                                <span className="text-3xl font-black text-white -rotate-3 drop-shadow-md">{teamRating}</span>
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1.5">Takım Gücü</h2>
                                {renderStars(teamRating)}
                                <div className="text-[9px] text-indigo-300 font-bold mt-1 uppercase tracking-wide">Genel Reyting</div>
                            </div>
                        </div>

                        {/* Right: Line Stats */}
                        <div className="flex space-x-2">
                            <div className="bg-slate-900/60 backdrop-blur rounded-lg p-1.5 border border-slate-700 text-center min-w-[36px]">
                                <div className="text-[8px] font-bold text-blue-400 mb-0.5">DEF</div>
                                <div className="font-black text-white text-sm">{defRating}</div>
                            </div>
                            <div className="bg-slate-900/60 backdrop-blur rounded-lg p-1.5 border border-slate-700 text-center min-w-[36px]">
                                <div className="text-[8px] font-bold text-emerald-400 mb-0.5">ORT</div>
                                <div className="font-black text-white text-sm">{midRating}</div>
                            </div>
                            <div className="bg-slate-900/60 backdrop-blur rounded-lg p-1.5 border border-slate-700 text-center min-w-[36px]">
                                <div className="text-[8px] font-bold text-rose-400 mb-0.5">HÜC</div>
                                <div className="font-black text-white text-sm">{fwdRating}</div>
                            </div>
                        </div>
                    </div>

                    {selectedPlayerId && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-yellow-300 font-bold animate-pulse bg-black/50 px-3 py-1 rounded-full border border-yellow-500/50 backdrop-blur-sm">
                          <ArrowLeftRight size={12} className="inline mr-1"/> OYUNCU DEĞİŞTİR
                      </div>
                    )}
                </div>

                {/* The Pitch */}
                <div className="relative w-full aspect-[3/4] max-h-[400px] bg-emerald-700 rounded-2xl border-4 border-emerald-900/50 shadow-inner overflow-hidden mx-auto">
                    {/* Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.1)_2px,transparent_2px)] bg-[size:40px_40px] opacity-20"></div>
                    <div className="absolute inset-0 flex flex-col">
                        <div className="flex-1 bg-white/5"></div>
                        <div className="flex-1 bg-transparent"></div>
                        <div className="flex-1 bg-white/5"></div>
                        <div className="flex-1 bg-transparent"></div>
                    </div>
                    
                    {/* Markings */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-b-2 border-x-2 border-white/30 rounded-b-lg"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t-2 border-x-2 border-white/30 rounded-t-lg"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 -translate-y-1/2"></div>

                    {/* Players */}
                    {allPins.map(renderPin)}
                </div>
            </div>

            {/* 2. BENCH AREA */}
            <div className="mt-4 px-4">
                <div className="flex items-center mb-2">
                     <ChevronDown size={14} className="text-slate-500 mr-1" />
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Yedek Kulübesi ({benchPlayers.length})</h3>
                </div>
                <div className="space-y-1">
                    {benchPlayers.length > 0 ? (
                        benchPlayers.map(p => renderPlayerRow(p, 'swap'))
                    ) : (
                        <div className="text-center py-4 text-slate-600 text-xs italic bg-slate-900/50 rounded-xl border border-slate-800">
                            Yedek oyuncu yok.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  const renderSquadList = () => {
      // Full List, sorted by Position then Rating
      const allPlayers = [...state.players];
      const posOrder = { [Position.GK]: 1, [Position.DEF]: 2, [Position.MID]: 3, [Position.FWD]: 4 };
      allPlayers.sort((a, b) => posOrder[a.position] - posOrder[b.position] || b.rating - a.rating);

      const avgCondition = Math.round(state.players.reduce((a, b) => a + b.condition, 0) / state.players.length);
      const avgMorale = Math.round(state.players.reduce((a, b) => a + b.morale, 0) / state.players.length);

      return (
          <div className="px-4 pt-4 pb-24">
              {/* TEAM STATUS HEADER */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/50 flex items-center shadow-md">
                      <div className="p-2 bg-emerald-500/20 rounded-xl mr-3 text-emerald-400">
                          <Heart size={18} />
                      </div>
                      <div className="flex-1">
                          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Takım Kondisyon</div>
                          <div className="flex items-center space-x-2">
                              <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${avgCondition}%` }}></div>
                              </div>
                              <span className="text-xs font-black text-white">{avgCondition}%</span>
                          </div>
                      </div>
                  </div>
                  <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/50 flex items-center shadow-md">
                      <div className="p-2 bg-indigo-500/20 rounded-xl mr-3 text-indigo-400">
                          <Smile size={18} />
                      </div>
                      <div className="flex-1">
                          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Takım Morali</div>
                          <div className="flex items-center space-x-2">
                              <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${avgMorale}%` }}></div>
                              </div>
                              <span className="text-xs font-black text-white">{avgMorale}%</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Tüm Oyuncular ({allPlayers.length}/25)</h3>
              </div>
              {allPlayers.map(p => renderPlayerRow(p, 'view'))}
          </div>
      );
  };

  const renderTraining = () => {
      const trainingFac = state.facilities.find(f => f.id === 'training');
      const level = trainingFac ? trainingFac.level : 1;
      
      const condCost = 500 * level;
      const moraleCost = 1000 * level;
      const skillCost = 5000 * level;

      return (
          <div className="p-4 space-y-4 pb-24">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-center">
                  <h3 className="text-white font-black text-lg mb-1">Takım Antrenmanı</h3>
                  <p className="text-slate-400 text-xs">Tesis Seviyesi: <span className="text-emerald-400 font-bold">{level}</span></p>
                  {trainedThisWeek && (
                      <p className="text-rose-400 text-[10px] font-bold mt-1 uppercase border border-rose-500/30 bg-rose-900/20 rounded px-2 py-1 inline-block">
                          Bu hafta kamp yapıldı! Haftaya tekrar dene.
                      </p>
                  )}
              </div>

              {/* Condition */}
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                          <div className="p-2 bg-emerald-500/20 rounded-lg mr-3 text-emerald-400"><Heart size={20}/></div>
                          <div>
                              <div className="font-bold text-white text-sm">Fiziksel Yükleme</div>
                              <div className="text-[10px] text-slate-400">+20 Kondisyon (Tüm Takım)</div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Pay Button */}
                    <button
                        onClick={() => dispatch({ type: 'TRAIN_TEAM', typeId: 'CONDITION', cost: condCost })}
                        disabled={state.money < condCost || isConditionFull || trainedThisWeek}
                        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center transition-colors
                            ${state.money >= condCost && !isConditionFull && !trainedThisWeek
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {trainedThisWeek ? 'BU HAFTA YAPILDI' : isConditionFull ? 'KONDİSYONLAR DOLU' : `UYGULA (-${formatMoney(condCost)})`}
                    </button>

                    {/* Free Ad Button (Always Visible unless full) */}
                    {!isConditionFull && (
                        <button
                           onClick={() => handleWatchAd('CONDITION')}
                           disabled={adPlaying}
                           className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs flex items-center justify-center transition-colors shadow-lg shadow-purple-900/20 border border-purple-400/30"
                        >
                           {adPlaying ? `REKLAM İZLENİYOR (${adTimer})` : <><Tv size={14} className="mr-2"/> ÜCRETSİZ YENİLE (REKLAM)</>}
                        </button>
                    )}
                  </div>
              </div>

              {/* Morale */}
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                          <div className="p-2 bg-blue-500/20 rounded-lg mr-3 text-blue-400"><Smile size={20}/></div>
                          <div>
                              <div className="font-bold text-white text-sm">Moral Motivasyon</div>
                              <div className="text-[10px] text-slate-400">+15 Moral (Tüm Takım)</div>
                          </div>
                      </div>
                  </div>
                  <button
                        onClick={() => dispatch({ type: 'TRAIN_TEAM', typeId: 'MORALE', cost: moraleCost })}
                        disabled={state.money < moraleCost || isMoraleFull || trainedThisWeek}
                        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center transition-colors
                            ${state.money >= moraleCost && !isMoraleFull && !trainedThisWeek
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {trainedThisWeek ? 'BU HAFTA YAPILDI' : isMoraleFull ? 'MORALLER YÜKSEK' : `UYGULA (-${formatMoney(moraleCost)})`}
                    </button>
              </div>

              {/* Skill */}
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                          <div className="p-2 bg-yellow-500/20 rounded-lg mr-3 text-yellow-400"><Dumbbell size={20}/></div>
                          <div>
                              <div className="font-bold text-white text-sm">Teknik Antrenman</div>
                              <div className="text-[10px] text-slate-400">+25 XP (Gelişime Açık Olanlar)</div>
                          </div>
                      </div>
                  </div>
                  <button
                        onClick={() => dispatch({ type: 'TRAIN_TEAM', typeId: 'SKILL', cost: skillCost })}
                        disabled={state.money < skillCost || trainedThisWeek}
                        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center transition-colors
                            ${state.money >= skillCost && !trainedThisWeek
                                ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-900/20' 
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {trainedThisWeek ? 'BU HAFTA YAPILDI' : `UYGULA (-${formatMoney(skillCost)})`}
                    </button>
              </div>

          </div>
      );
  };

  const renderMarket = () => {
    return (
        <div className="pb-24 px-4 pt-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-white text-lg">Transfer Pazarı</h3>
                <button 
                    onClick={() => dispatch({ type: 'REFRESH_MARKET' })}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
                >
                    <RefreshCw size={16} />
                </button>
            </div>
            
            {/* WONDERKID SCOUT AD */}
            <div className="mb-4 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-4 border border-indigo-500/50 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Telescope size={80} className="text-white"/></div>
                <div className="relative z-10 flex flex-col items-start">
                    <div className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wide animate-pulse">Özel Fırsat</div>
                    <h3 className="text-white font-black text-lg mb-1">YILDIZ AVCISI</h3>
                    <p className="text-indigo-200 text-xs mb-3 max-w-[80%]">Reklam izle ve pazar listesine yüksek potansiyelli (Scout onaylı) bir genç yetenek ekle.</p>
                    
                    <button
                        onClick={() => handleWatchAd('WONDERKID')}
                        disabled={adPlaying}
                        className="w-full py-3 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl font-black text-xs flex items-center justify-center transition-colors shadow-lg"
                    >
                        {adPlaying ? `SCOUT ARANIYOR (${adTimer})...` : <><Tv size={16} className="mr-2"/> SCOUT GÖNDER (ÜCRETSİZ)</>}
                    </button>
                </div>
            </div>
            
            <div className="space-y-3">
                {state.marketPlayers.map(p => {
                    const canAfford = state.money >= p.value;
                    const isSquadFull = state.players.length >= 25;
                    const isWonderkid = p.name.includes('⭐');
                    
                    return (
                        <div key={p.id} className={`border rounded-xl p-3 flex justify-between items-center
                            ${isWonderkid ? 'bg-gradient-to-r from-yellow-900/20 to-slate-800/50 border-yellow-500/50' : 'bg-slate-800/50 border-slate-700'}
                        `}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm
                                    ${isWonderkid ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'}
                                `}>
                                    {p.rating}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-bold text-white text-sm">{p.name}</h4>
                                        <PositionBadge position={p.position} />
                                    </div>
                                    <div className="flex items-center text-[10px] text-slate-400 gap-2">
                                         <span className="flex items-center"><Clock size={10} className="mr-1"/> {p.age} Yaş</span>
                                         <span className="flex items-center text-rose-300"><DollarSign size={10} className="mr-0.5"/> {formatMoney(p.wage)}/hf</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => dispatch({ type: 'BUY_PLAYER', player: p })}
                                disabled={!canAfford || isSquadFull}
                                className={`px-4 py-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all
                                    ${canAfford && !isSquadFull
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                <span className="mb-0.5">SATIN AL</span>
                                <span className="font-mono text-[10px] opacity-90">{formatMoney(p.value)}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
            
            {state.marketPlayers.length === 0 && (
                <div className="text-center py-8 text-slate-500 italic bg-slate-900/30 rounded-2xl border border-slate-800">
                    Pazarda uygun oyuncu yok. Yenilemeyi dene.
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
        {renderSellModal()}
        {renderPlayerProfile()}
        
        {/* Sub Navigation */}
        <div className="p-2 shrink-0 z-20 bg-slate-950">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('lineup')}
                    className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                        ${activeTab === 'lineup' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    İlk 11
                </button>
                <button 
                    onClick={() => setActiveTab('squad')}
                    className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                        ${activeTab === 'squad' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Kadro
                </button>
                <button 
                    onClick={() => setActiveTab('training')}
                    className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                        ${activeTab === 'training' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Antrenman
                </button>
                <button 
                    onClick={() => setActiveTab('market')}
                    className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                        ${activeTab === 'market' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Transfer
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
            {activeTab === 'lineup' && renderPitchView()}
            {activeTab === 'squad' && renderSquadList()}
            {activeTab === 'training' && renderTraining()}
            {activeTab === 'market' && renderMarket()}
        </div>

        {/* AD OVERLAY */}
        {adPlaying && (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin mb-8"></div>
                <div className="text-2xl font-black mb-2">PARTNER REKLAMI</div>
                <div className="text-sm text-slate-400">
                    {adType === 'CONDITION' ? 'Kondisyonlar Yenileniyor...' : 'Scout Raporu Hazırlanıyor...'}
                </div>
                <div className="mt-8 text-4xl font-mono font-bold">{adTimer}</div>
            </div>
        )}
    </div>
  );
};
