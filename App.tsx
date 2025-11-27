import React, { useState } from 'react';
import { GameProvider } from './GameContext';
import { OfficeView } from './components/OfficeView';
import { SquadView } from './components/SquadView';
import { FacilitiesView } from './components/FacilitiesView';
import { EconomyView } from './components/EconomyView';
import { LayoutDashboard, Users, Building2, Wallet } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'office' | 'squad' | 'facilities' | 'economy'>('office');

  const renderContent = () => {
    switch (activeTab) {
      case 'office': return <OfficeView />;
      case 'squad': return <SquadView />;
      case 'facilities': return <FacilitiesView />;
      case 'economy': return <EconomyView />;
      default: return <OfficeView />;
    }
  };

  return (
    <div className="h-screen w-full bg-slate-900 text-white flex flex-col font-sans overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
         {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-16 bg-slate-950 border-t border-slate-800 flex items-center justify-around shrink-0 z-50 pb-safe">
        <NavButton 
            active={activeTab === 'office'} 
            onClick={() => setActiveTab('office')} 
            icon={<LayoutDashboard size={24} />} 
            label="Ofis" 
        />
        <NavButton 
            active={activeTab === 'squad'} 
            onClick={() => setActiveTab('squad')} 
            icon={<Users size={24} />} 
            label="Kadro" 
        />
        <NavButton 
            active={activeTab === 'facilities'} 
            onClick={() => setActiveTab('facilities')} 
            icon={<Building2 size={24} />} 
            label="Tesisler" 
        />
        <NavButton 
            active={activeTab === 'economy'} 
            onClick={() => setActiveTab('economy')} 
            icon={<Wallet size={24} />} 
            label="Finans" 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200
            ${active ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}
    >
        <div className={`mb-1 transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
            {icon}
        </div>
        <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
);

const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;