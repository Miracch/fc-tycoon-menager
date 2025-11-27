
import React from 'react';
import { useGame } from '../GameContext';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { DollarSign, MousePointer, Clock, TrendingDown, Shield, Ticket, Briefcase, Activity, ShoppingBag } from 'lucide-react';
import { getStadiumCapacity } from '../constants';

export const EconomyView: React.FC = () => {
  const { state } = useGame();

  const formatMoney = (val: number) => {
      if (val >= 1000000) return `$${(val/1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val/1000).toFixed(0)}K`;
      return `$${val}`;
  };

  const totalWages = state.players.reduce((acc, p) => acc + p.wage, 0);
  
  const stadium = state.facilities.find(f => f.id === 'stadium');
  const stadiumIncome = stadium ? Math.floor(state.fans / 100) * stadium.level : 0;
  
  const commercialFacilities = state.facilities.filter(f => f.type === 'COMMERCIAL');
  
  let sponsorPassiveIncome = 0;
  let merchandiseIncome = 0;

  commercialFacilities.forEach(f => {
      // 1. Sponsor Passive
      if (f.activeSponsor) {
          const raw = f.count * f.level * f.activeSponsor.passiveBonus;
          const fanMultiplier = 1 + (Math.log10(Math.max(10, state.fans)) - 1);
          sponsorPassiveIncome += Math.floor(raw * fanMultiplier);
      }
      // 2. Merchandise Sales (Daily)
      if (f.dailyPassiveIncomePerFan && f.dailyPassiveIncomePerFan > 0) {
          merchandiseIncome += Math.floor(f.count * f.level * f.dailyPassiveIncomePerFan * state.fans);
      }
  });
  
  const totalPassiveIncome = stadiumIncome + sponsorPassiveIncome + merchandiseIncome;

  const clubSponsorIncome = state.clubSponsors.reduce((acc, s) => acc + s.perMatchIncome, 0);

  // Estimate Ticket Sales
  const stadiumLevel = stadium ? stadium.level : 1;
  const capacity = getStadiumCapacity(stadiumLevel);
  const estAttendance = Math.min(state.fans, capacity);
  const tierMultiplier = Math.pow(1.9, (6 - state.leagueTier));
  const ticketPrice = 1.5 * tierMultiplier;
  const estTicketRevenue = Math.floor(estAttendance * ticketPrice);

  // Estimate Commercial Match Income
  let estCommercialMatchIncome = 0;
  commercialFacilities.forEach(f => {
      if (f.count > 0) {
          let income = estAttendance * (f.matchDayPerFanIncome * (1 + (f.level * 0.1))) * f.count;
          if (f.activeSponsor) {
              income *= 1.2;
          }
          estCommercialMatchIncome += Math.floor(income);
      }
  });

  const estNetMatchIncome = (estTicketRevenue + clubSponsorIncome + estCommercialMatchIncome) - totalWages;

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-950 px-4 pt-4 pb-2 shrink-0">
         <h2 className="text-2xl font-black text-white tracking-tight mb-4">Finans Merkezi</h2>
         
         {/* Main Balance Bento */}
         <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl p-6 shadow-xl shadow-emerald-900/20 mb-4 border border-emerald-500/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-emerald-200">
                <DollarSign size={100} />
            </div>
            <div className="relative z-10">
                <span className="text-emerald-200 font-bold text-xs uppercase tracking-wider">Toplam Kasa</span>
                <div className="text-4xl font-black text-white tracking-tighter mt-1">
                    ${state.money.toLocaleString()}
                </div>
            </div>
         </div>

         {/* Cash Flow Forecast Grid */}
         <div className="grid grid-cols-2 gap-3 mb-4">
             {/* Passive Flow (Realtime) */}
             <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 relative overflow-hidden">
                 <div className="flex items-center text-blue-400 mb-2">
                     <Clock size={16} className="mr-2"/>
                     <span className="text-[10px] font-bold uppercase">Pasif Akış</span>
                 </div>
                 <div className="text-2xl font-black text-white font-mono">
                     +{formatMoney(totalPassiveIncome)}<span className="text-xs text-slate-500 ml-1">/sn</span>
                 </div>
             </div>

             {/* Match Flow (Per Match) */}
             <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 relative overflow-hidden">
                 <div className="flex items-center text-emerald-400 mb-2">
                     <Activity size={16} className="mr-2"/>
                     <span className="text-[10px] font-bold uppercase">Maç Başı Net</span>
                 </div>
                 <div className={`text-2xl font-black font-mono ${estNetMatchIncome >= 0 ? 'text-white' : 'text-rose-400'}`}>
                     {estNetMatchIncome >= 0 ? '+' : ''}{formatMoney(estNetMatchIncome)}
                 </div>
             </div>
         </div>
      </div>

      {/* Detailed Breakdown Scroll Area */}
      <div className="flex-1 px-4 pb-20 overflow-y-auto space-y-3">
          
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mt-2">Gelir Kalemleri</h3>
          
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center text-sm font-bold text-white">
                      <div className="p-1.5 bg-indigo-500/20 rounded-lg mr-2"><Shield size={14} className="text-indigo-400"/></div>
                      Forma Sponsorları
                  </div>
                  <span className="font-mono font-bold text-emerald-400">+{formatMoney(clubSponsorIncome)}/maç</span>
              </div>
              <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center text-sm font-bold text-white">
                      <div className="p-1.5 bg-amber-500/20 rounded-lg mr-2"><Ticket size={14} className="text-amber-400"/></div>
                      Bilet Satışı (Tahmini)
                  </div>
                  <span className="font-mono font-bold text-emerald-400">~{formatMoney(estTicketRevenue)}/maç</span>
              </div>
              <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center text-sm font-bold text-white">
                      <div className="p-1.5 bg-purple-500/20 rounded-lg mr-2"><ShoppingBag size={14} className="text-purple-400"/></div>
                      Maç Günü Mağaza/Büfe
                  </div>
                  <span className="font-mono font-bold text-emerald-400">~{formatMoney(estCommercialMatchIncome)}/maç</span>
              </div>
              <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center text-sm font-bold text-white">
                      <div className="p-1.5 bg-blue-500/20 rounded-lg mr-2"><Briefcase size={14} className="text-blue-400"/></div>
                      Sponsor Pasif Gelir
                  </div>
                  <span className="font-mono font-bold text-emerald-400">+{formatMoney(sponsorPassiveIncome)}/sn</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center text-sm font-bold text-white">
                      <div className="p-1.5 bg-pink-500/20 rounded-lg mr-2"><ShoppingBag size={14} className="text-pink-400"/></div>
                      Mağaza/Ürün Satışları
                  </div>
                  <span className="font-mono font-bold text-emerald-400">+{formatMoney(merchandiseIncome)}/sn</span>
              </div>
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mt-4">Gider Kalemleri</h3>

          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
               <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center text-sm font-bold text-white">
                      <div className="p-1.5 bg-rose-500/20 rounded-lg mr-2"><TrendingDown size={14} className="text-rose-400"/></div>
                      Oyuncu Maaşları
                  </div>
                  <span className="font-mono font-bold text-rose-400">-{formatMoney(totalWages)}/maç</span>
              </div>
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mt-4">Geçmiş Veriler</h3>
          
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 h-48 relative overflow-hidden">
                <div className="w-full h-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={state.history}>
                            <XAxis dataKey="week" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                itemStyle={{ color: '#10b981' }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                                labelFormatter={() => ''}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="money" 
                                stroke="#10b981" 
                                strokeWidth={3} 
                                dot={false}
                                activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
          </div>

      </div>

    </div>
  );
};
