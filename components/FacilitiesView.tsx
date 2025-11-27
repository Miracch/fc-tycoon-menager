
import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { Facility, Sponsorship, ClubSponsor } from '../types';
import { SPONSORS, CLUB_SPONSORS, getFacilityName, getStadiumCapacity, getMinLeagueForStadiumLevel, LEAGUE_NAMES } from '../constants';
import { Hammer, ShoppingBag, Landmark, Zap, Handshake, Lock, ArrowUpCircle, X, Briefcase, TrendingUp, Users, Shield, AlertTriangle, Plus, Wallet, ShoppingCart, Store, Trash2 } from 'lucide-react';

export const FacilitiesView: React.FC = () => {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'commercial' | 'infrastructure'>('commercial');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [clubSponsorModalOpen, setClubSponsorModalOpen] = useState(false);
  
  // Custom Confirmation Modal State
  const [terminateSponsor, setTerminateSponsor] = useState<ClubSponsor | null>(null);

  const stadium = state.facilities.find(f => f.type === 'STADIUM')!;
  const currentCapacity = getStadiumCapacity(stadium.level);
  const nextCapacity = getStadiumCapacity(stadium.level + 1);

  // Check stadium league requirement
  const nextLevelReqTier = getMinLeagueForStadiumLevel(stadium.level + 1);
  const nextLevelReqName = LEAGUE_NAMES[nextLevelReqTier];
  const isStadiumLeagueLocked = state.leagueTier > nextLevelReqTier; 
  
  const totalFacilityClickBonus = state.facilities
    .filter(f => f.type === 'COMMERCIAL')
    .reduce((acc, f) => acc + (f.count * f.level * (f.activeSponsor?.clickBonus || 0)), 0);

  const formatMoney = (val: number) => {
      if (val >= 1000000) return `$${(val/1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val/1000).toFixed(0)}K`;
      return `$${val}`;
  };

  const handleSponsorClick = (facilityId: string) => {
      setSelectedFacilityId(facilityId);
      setSponsorModalOpen(true);
  };

  const getSelectedFacilityName = () => {
      if (!selectedFacilityId) return '';
      const fac = state.facilities.find(f => f.id === selectedFacilityId);
      return fac ? getFacilityName(fac.id, fac.level).toUpperCase() : '';
  };

  const CommercialTab = () => (
      <div className="grid grid-cols-1 gap-3 pb-24">
          
          {/* CLUB SPONSORS CARD (3 SLOTS) */}
          <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 rounded-2xl p-4 border border-indigo-500/30 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center">
                     <div className="p-3 bg-indigo-600 rounded-xl mr-3 text-white shadow-lg">
                         <Shield size={20} />
                     </div>
                     <div>
                         <h3 className="font-bold text-white text-base">Forma Sponsorları</h3>
                         <div className="text-[10px] text-indigo-200">En Fazla 3 Anlaşma</div>
                     </div>
                 </div>
                 <div className="text-right">
                     <div className="text-emerald-400 font-mono font-bold text-base">
                         +{formatMoney(state.clubSponsors.reduce((acc, s) => acc + s.perMatchIncome, 0))}/maç
                     </div>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(index => {
                      const sponsor = state.clubSponsors[index];
                      if (sponsor) {
                          // FILLED SLOT
                          return (
                              <div key={index} className="bg-indigo-950/50 p-2 rounded-xl border border-indigo-800 flex flex-col justify-between h-28 relative overflow-hidden group/slot">
                                  <div className="flex justify-between items-start">
                                      <div className="min-w-0">
                                        <div className="text-[10px] font-bold text-white truncate leading-tight mb-1">{sponsor.name}</div>
                                        <div className="text-[9px] font-mono text-emerald-400">+{formatMoney(sponsor.perMatchIncome)}</div>
                                      </div>
                                      <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTerminateSponsor(sponsor);
                                        }}
                                        className="text-rose-400 hover:text-rose-200 bg-rose-900/20 hover:bg-rose-900/80 p-1.5 rounded-lg transition-colors shrink-0 z-10"
                                        title="Anlaşmayı Feshet"
                                      >
                                          <Trash2 size={12} />
                                      </button>
                                  </div>
                                  
                                  <div className="mt-2">
                                    <div className="flex items-center text-[9px] text-rose-300 mb-0.5">
                                        <AlertTriangle size={8} className="mr-1" />
                                        <span>Risk: {state.consecutiveLosses}/{sponsor.maxTolerance}</span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-rose-500 h-full transition-all" 
                                            style={{ width: `${Math.min(100, (state.consecutiveLosses / sponsor.maxTolerance) * 100)}%` }}
                                        ></div>
                                    </div>
                                  </div>
                              </div>
                          );
                      } else {
                          // EMPTY SLOT
                          return (
                              <button 
                                key={index}
                                onClick={() => setClubSponsorModalOpen(true)}
                                className="bg-slate-900/30 p-2 rounded-xl border-2 border-dashed border-indigo-500/30 flex flex-col items-center justify-center h-28 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-colors"
                              >
                                  <div className="bg-indigo-600/20 p-2 rounded-full mb-2">
                                      <Plus size={16} className="text-indigo-400" />
                                  </div>
                                  <div className="text-[9px] font-bold text-indigo-300 uppercase">Sponsor Ekle</div>
                              </button>
                          );
                      }
                  })}
              </div>
          </div>

          {state.facilities.filter(f => f.type === 'COMMERCIAL').map(fac => {
              const buildCost = Math.floor(fac.baseBuildCost * Math.pow(1.5, fac.count));
              const upgradeCost = Math.floor(fac.baseUpgradeCost * Math.pow(1.6, fac.level));
              
              const canAffordBuild = state.money >= buildCost;
              const canAffordUpgrade = state.money >= upgradeCost;
              const isMaxCount = fac.count >= fac.maxCount;
              
              const singleClickBonus = fac.activeSponsor?.clickBonus || 0;
              const singlePassiveBonus = fac.activeSponsor?.passiveBonus || 0;
              
              const totalClickBonus = singleClickBonus * fac.count * fac.level;
              const totalPassiveBonus = singlePassiveBonus * fac.count * fac.level;
              
              // New Daily Passive Income
              const dailyMerchIncome = Math.floor(fac.count * fac.level * (fac.dailyPassiveIncomePerFan || 0) * state.fans);

              // Estimate match day income
              const stadiumCap = getStadiumCapacity(state.facilities.find(f => f.id === 'stadium')?.level || 1);
              const estAttendance = Math.min(state.fans, stadiumCap);
              const estMatchDayIncome = Math.floor(estAttendance * (fac.matchDayPerFanIncome * (1 + (fac.level * 0.1))) * fac.count * (fac.activeSponsor ? 1.2 : 1));

              return (
                <div key={fac.id} className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50 relative overflow-hidden group">
                     {/* Header */}
                     <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center">
                             <div className={`p-3 rounded-xl mr-3 text-white shadow-lg ${fac.id === 'store' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}`}>
                                 {fac.id === 'store' ? <Store size={20} /> : <ShoppingBag size={20} />}
                             </div>
                             <div>
                                 <h3 className="font-bold text-white text-base">{getFacilityName(fac.id, fac.level)}</h3>
                                 <div className="flex items-center space-x-2 mt-0.5">
                                     <span className="text-[10px] font-bold bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                        Level {fac.level}
                                     </span>
                                     <span className="text-[10px] font-bold bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                        {fac.count}/{fac.maxCount} Şube
                                     </span>
                                 </div>
                             </div>
                         </div>
                         <div className="text-right">
                             <div className="text-emerald-400 font-mono font-bold text-xs">+{totalClickBonus}$/tık</div>
                             <div className="text-blue-400 font-mono font-bold text-[10px]">+{totalPassiveBonus}$/sn</div>
                             {dailyMerchIncome > 0 && (
                                <div className="text-purple-400 font-mono font-bold text-[10px] mt-0.5">+{formatMoney(dailyMerchIncome)}/sn (Satış)</div>
                             )}
                         </div>
                     </div>

                     {/* Sponsor Area */}
                     <div className="bg-slate-950/40 rounded-xl p-3 mb-4 border border-slate-800/50 flex justify-between items-center">
                         <div className="flex items-center">
                             {fac.activeSponsor ? (
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs mr-2 border border-slate-600">
                                        {fac.activeSponsor.name.substring(0,1)}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-xs">{fac.activeSponsor.name}</div>
                                        <div className="text-[9px] text-slate-400">Aktif Sponsor</div>
                                    </div>
                                </div>
                             ) : (
                                 <div className="text-xs text-slate-500 italic">Sponsor Yok</div>
                             )}
                         </div>
                         <button 
                            onClick={() => handleSponsorClick(fac.id)}
                            className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors font-bold border border-slate-600"
                         >
                             {fac.activeSponsor ? 'DEĞİŞTİR' : 'ANLAŞMA YAP'}
                         </button>
                     </div>

                     {/* Match Day Info Box */}
                     <div className="bg-slate-700/30 rounded-lg p-2 mb-3 border border-slate-600/30 flex items-center justify-between">
                        <div className="flex items-center text-[10px] text-amber-300 font-bold">
                             <Users size={12} className="mr-1.5"/>
                             Maç Günü Geliri
                        </div>
                        <div className="text-white font-mono font-bold text-xs">
                             ~{formatMoney(estMatchDayIncome)} <span className="text-[9px] text-slate-400 opacity-70">/maç</span>
                        </div>
                     </div>

                     {/* Actions Grid */}
                     <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => dispatch({ type: 'BUILD_FACILITY', facilityId: fac.id })}
                            disabled={!canAffordBuild || isMaxCount}
                            className={`py-2.5 rounded-xl font-bold text-[10px] transition-all flex flex-col items-center justify-center border
                                ${!isMaxCount && canAffordBuild
                                    ? 'bg-amber-600/90 hover:bg-amber-500 text-white border-amber-500/50 shadow-lg shadow-amber-900/20' 
                                    : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed border-slate-700'
                                }`}
                        >
                            {isMaxCount ? (
                                <span className="flex items-center"><Lock size={12} className="mr-1"/> LİMİT DOLU</span>
                            ) : (
                                <>
                                    <span className="mb-0.5">YENİ ŞUBE</span>
                                    <span className="font-mono opacity-80">{formatMoney(buildCost)}</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => dispatch({ type: 'UPGRADE_FACILITY', facilityId: fac.id })}
                            disabled={!canAffordUpgrade}
                            className={`py-2.5 rounded-xl font-bold text-[10px] transition-all flex flex-col items-center justify-center border
                                ${canAffordUpgrade
                                    ? 'bg-indigo-600/90 hover:bg-indigo-500 text-white border-indigo-500/50 shadow-lg shadow-indigo-900/20' 
                                    : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed border-slate-700'
                                }`}
                        >
                            <span className="mb-0.5">KALİTE YÜKSELT</span>
                            <span className="font-mono opacity-80">{formatMoney(upgradeCost)}</span>
                        </button>
                     </div>
                </div>
              );
          })}
      </div>
  );

  const InfrastructureTab = () => (
    <div className="grid grid-cols-1 gap-3 pb-24">
        {state.facilities.filter(f => f.type === 'INFRASTRUCTURE').map(fac => {
            const upgradeCost = Math.floor(fac.baseUpgradeCost * Math.pow(1.6, fac.level));
            const canAfford = state.money >= upgradeCost;
            
            return (
                <div key={fac.id} className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50 relative overflow-hidden">
                    <div className="flex items-center mb-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl mr-3 text-white shadow-lg">
                            <Zap size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white text-base leading-tight">{getFacilityName(fac.id, fac.level)}</h3>
                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{fac.name} • Lvl {fac.level}</div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 mb-3">
                        <p className="text-[10px] text-slate-300 leading-relaxed mb-2">{fac.description}</p>
                        <div className="flex items-center text-[10px] font-bold">
                            <TrendingUp size={10} className="mr-1 text-emerald-400" />
                            <span className="text-slate-400 mr-1">Etki:</span>
                            <span className="text-white">+{fac.effectValue * fac.level}</span>
                            <span className="text-slate-600 mx-2">➜</span>
                            <span className="text-emerald-400">+{fac.effectValue * (fac.level + 1)}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => dispatch({ type: 'UPGRADE_FACILITY', facilityId: fac.id })}
                        disabled={!canAfford}
                        className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex justify-between px-4 items-center shadow-lg
                            ${canAfford 
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20' 
                                : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                            }`}
                    >
                        <span>SEVİYE YÜKSELT</span>
                        <span className="font-mono">{formatMoney(upgradeCost)}</span>
                    </button>
                </div>
            );
        })}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-950">
      
      {/* Terminate Club Sponsor Confirmation Modal */}
      {terminateSponsor && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur p-6 animate-in fade-in">
             <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full max-w-xs text-center relative">
                 <div className="w-16 h-16 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-rose-500/50">
                     <AlertTriangle size={32} className="text-rose-500" />
                 </div>
                 <h3 className="text-lg font-black text-white mb-2">Anlaşmayı Feshet?</h3>
                 <p className="text-slate-400 text-xs mb-6">
                     <span className="text-white font-bold">{terminateSponsor.name}</span> ile olan sponsorluk anlaşmasını bitirmek üzeresin. Maç başı gelirden vazgeçmiş olacaksın.
                 </p>
                 <div className="flex space-x-3">
                     <button 
                        onClick={() => setTerminateSponsor(null)}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-700"
                     >
                         VAZGEÇ
                     </button>
                     <button 
                        onClick={() => {
                            dispatch({ type: 'TERMINATE_CLUB_SPONSOR', sponsorId: terminateSponsor.id });
                            setTerminateSponsor(null);
                        }}
                        className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-500 shadow-lg shadow-rose-900/30"
                     >
                         FESHET
                     </button>
                 </div>
             </div>
        </div>
      )}

      {/* Club Sponsor Modal */}
      {clubSponsorModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                      <h3 className="text-lg font-black text-white flex items-center tracking-tight">
                          <Shield className="mr-2 text-indigo-400" size={20} /> FORMA SPONSORLARI
                      </h3>
                      <button onClick={() => setClubSponsorModalOpen(false)} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 text-white transition-colors">
                          <X size={16} />
                      </button>
                  </div>
                  
                  <div className="overflow-y-auto p-4 space-y-3">
                      <div className="text-xs text-slate-400 mb-2">Maksimum 3 adet sponsorla anlaşabilirsin.</div>
                      {CLUB_SPONSORS.map(sponsor => {
                          const isTierLocked = state.leagueTier > sponsor.minLeagueTier;
                          const isAlreadySigned = state.clubSponsors.some(s => s.id === sponsor.id);

                          return (
                              <div key={sponsor.id} className={`p-4 rounded-2xl border transition-all relative
                                  ${isTierLocked || isAlreadySigned
                                      ? 'bg-slate-950 border-slate-900 opacity-50' 
                                      : 'bg-slate-800 border-slate-700 hover:border-indigo-500/50'
                                  }`}>
                                  
                                  {isAlreadySigned && (
                                     <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 rounded-2xl">
                                         <div className="text-emerald-400 font-bold uppercase text-xs border border-emerald-500/50 px-2 py-1 rounded bg-emerald-900/50">Anlaşıldı</div>
                                     </div>
                                  )}

                                  <div className="flex justify-between items-start mb-2">
                                      <div className="font-bold text-white text-sm">{sponsor.name}</div>
                                      <div className="text-right">
                                          {isTierLocked ? (
                                              <span className="text-[9px] text-rose-400 font-bold flex items-center"><Lock size={8} className="mr-1"/> {LEAGUE_NAMES[sponsor.minLeagueTier]}</span>
                                          ) : (
                                              <>
                                                  <div className="text-[10px] text-emerald-400 font-mono font-bold">+{formatMoney(sponsor.signingBonus)} İmza</div>
                                                  <div className="text-[9px] text-indigo-300">+{formatMoney(sponsor.perMatchIncome)}/maç</div>
                                              </>
                                          )}
                                      </div>
                                  </div>
                                  
                                  <div className="text-[10px] text-slate-400 mb-3">{sponsor.description}</div>
                                  
                                  <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                                      <div className="text-[10px] text-rose-300 flex items-center"><AlertTriangle size={10} className="mr-1"/> Tolerans: {sponsor.maxTolerance} Mağlubiyet</div>
                                      <button 
                                        disabled={isTierLocked || isAlreadySigned}
                                        onClick={() => {
                                            dispatch({ type: 'SIGN_CLUB_SPONSOR', sponsor });
                                            setClubSponsorModalOpen(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all
                                            ${!isTierLocked && !isAlreadySigned
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/30'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                      >
                                          İMZALA
                                      </button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}
      
      {/* Sponsor Modal (Facility Sponsors) */}
      {sponsorModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                      <h3 className="text-lg font-black text-white flex items-center tracking-tight">
                          <Briefcase className="mr-2 text-emerald-400" size={20} /> {getSelectedFacilityName()} SPONSORLARI
                      </h3>
                      <button onClick={() => setSponsorModalOpen(false)} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 text-white transition-colors">
                          <X size={16} />
                      </button>
                  </div>
                  
                  <div className="overflow-y-auto p-4 space-y-3">
                      {SPONSORS.map(sponsor => {
                          const isAffordable = state.money >= sponsor.cost;
                          const hasFans = state.fans >= sponsor.minFanReq;
                          const isLocked = !hasFans;

                          return (
                              <div key={sponsor.id} className={`p-4 rounded-2xl border-2 transition-all relative
                                  ${isLocked 
                                      ? 'bg-slate-950 border-slate-900 opacity-50' 
                                      : 'bg-slate-800 border-slate-700 hover:border-emerald-500/50'
                                  }`}>
                                  
                                  {isLocked && (
                                      <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 rounded-2xl backdrop-blur-[1px]">
                                          <div className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-full flex items-center border border-slate-700 shadow-xl font-bold">
                                              <Lock size={10} className="mr-1.5" /> {sponsor.minFanReq.toLocaleString()} Taraftar
                                          </div>
                                      </div>
                                  )}

                                  <div className="flex justify-between items-start mb-2">
                                      <div className="font-bold text-white text-base">{sponsor.name}</div>
                                      <div className="flex flex-col items-end">
                                        <div className="text-emerald-400 font-mono font-bold text-xs">+{sponsor.clickBonus}$/tık</div>
                                        <div className="text-blue-400 font-mono font-bold text-[10px]">+{sponsor.passiveBonus}$/sn</div>
                                      </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
                                      <div className="text-[10px] text-slate-500 uppercase font-bold">Anlaşma Bedeli</div>
                                      <button 
                                        disabled={isLocked || !isAffordable}
                                        onClick={() => {
                                            if (selectedFacilityId) {
                                                dispatch({ type: 'SIGN_SPONSOR', facilityId: selectedFacilityId, sponsor });
                                                setSponsorModalOpen(false);
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all
                                            ${isAffordable && !isLocked
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/30'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                      >
                                          {sponsor.cost === 0 ? 'ÜCRETSİZ' : formatMoney(sponsor.cost)}
                                      </button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* Hero Header (Stadium) */}
      <div className="bg-slate-950 px-4 pt-4 pb-2 shrink-0 z-20">
         <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-black text-white tracking-tight">Tesisler</h2>
             
             {/* Wallet Display in Header */}
             <div className="flex items-center gap-2">
                 <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center">
                      <Wallet size={16} className="text-emerald-400 mr-2" />
                      <div>
                          <div className="text-[8px] text-slate-400 font-bold uppercase">Bakiye</div>
                          <div className="text-sm font-black text-white leading-none font-mono">{formatMoney(state.money)}</div>
                      </div>
                  </div>
                 <div className="flex flex-col items-end">
                     <span className="text-[10px] text-slate-400 font-bold uppercase">Toplam Gelir</span>
                     <span className="text-emerald-400 font-mono font-bold text-sm">+{totalFacilityClickBonus}$/tık</span>
                 </div>
             </div>
         </div>

         {/* Hero Card - Stadium */}
         <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700 shadow-xl relative overflow-hidden group mb-4">
              <div className="absolute -right-6 -bottom-6 text-white opacity-5 rotate-12 transform group-hover:scale-110 transition-transform duration-700">
                  <Landmark size={140} />
              </div>
              
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <div className="text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-1">STADYUM LVL {stadium.level}</div>
                          <h2 className="text-xl font-black text-white leading-none mb-1">{getFacilityName('stadium', stadium.level)}</h2>
                          <div className="flex items-center text-xs text-slate-400 mt-2 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800 w-fit">
                              <Users size={12} className="mr-1.5 text-blue-400"/>
                              <span>Kapasite: <span className="text-white font-bold">{currentCapacity.toLocaleString()}</span></span>
                              <span className="text-slate-600 mx-1.5">➜</span>
                              <span className="text-emerald-400 font-bold">{nextCapacity.toLocaleString()}</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                      <div className="text-[10px] text-slate-400">Ticari Limit: <span className="text-white font-bold">{stadium.level * 2 + 2}</span></div>
                      
                      {isStadiumLeagueLocked ? (
                          <div className="flex items-center bg-rose-900/40 text-rose-300 px-3 py-2 rounded-xl text-[10px] font-bold border border-rose-500/30">
                              <Lock size={12} className="mr-1.5"/>
                              HEDEF: {nextLevelReqName}
                          </div>
                      ) : (
                          state.money >= Math.floor(stadium.baseUpgradeCost * Math.pow(1.6, stadium.level)) ? (
                                <button 
                                onClick={() => dispatch({ type: 'UPGRADE_FACILITY', facilityId: 'stadium' })}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-[10px] font-bold shadow-lg flex items-center"
                                >
                                    <ArrowUpCircle size={14} className="mr-1" />
                                    GELİŞTİR ({formatMoney(Math.floor(stadium.baseUpgradeCost * Math.pow(1.6, stadium.level)))})
                                </button>
                          ) : (
                              <div className="text-[10px] font-mono text-slate-500 bg-slate-950/50 px-2 py-1 rounded border border-slate-800">
                                  Hedef: {formatMoney(Math.floor(stadium.baseUpgradeCost * Math.pow(1.6, stadium.level)))}
                              </div>
                          )
                      )}
                  </div>
              </div>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button 
                onClick={() => setActiveTab('commercial')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center
                    ${activeTab === 'commercial' 
                        ? 'bg-slate-700 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-300'}`}
            >
                <ShoppingBag size={14} className="mr-1.5" /> TİCARİ
            </button>
            <button 
                onClick={() => setActiveTab('infrastructure')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center
                    ${activeTab === 'infrastructure' 
                        ? 'bg-slate-700 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Hammer size={14} className="mr-1.5" /> ALTYAPI
            </button>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
          {activeTab === 'commercial' ? <CommercialTab /> : <InfrastructureTab />}
      </div>
    </div>
  );
};
