import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { GameProvider } from './GameContext';
import { OfficeView } from './components/OfficeView';
import { SquadView } from './components/SquadView';
import { FacilitiesView } from './components/FacilitiesView';
import { EconomyView } from './components/EconomyView';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'office' | 'squad' | 'facilities' | 'economy'>('office');

  const renderContent = () => {
    switch (activeTab) {
      case 'office':
        return <OfficeView />;
      case 'squad':
        return <SquadView />;
      case 'facilities':
        return <FacilitiesView />;
      case 'economy':
        return <EconomyView />;
      default:
        return <OfficeView />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>{renderContent()}</View>
      <View style={styles.navbar}>
        <NavButton label="Ofis" active={activeTab === 'office'} onPress={() => setActiveTab('office')} icon="🏢" />
        <NavButton label="Kadro" active={activeTab === 'squad'} onPress={() => setActiveTab('squad')} icon="👥" />
        <NavButton label="Tesisler" active={activeTab === 'facilities'} onPress={() => setActiveTab('facilities')} icon="🏟️" />
        <NavButton label="Finans" active={activeTab === 'economy'} onPress={() => setActiveTab('economy')} icon="💰" />
      </View>
    </SafeAreaView>
  );
};

const NavButton: React.FC<{ label: string; active: boolean; onPress: () => void; icon: string }> = ({ label, active, onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={[styles.navButton, active && styles.navButtonActive]}>
    <Text style={[styles.navIcon, active && styles.navIconActive]}>{icon}</Text>
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const App: React.FC = () => (
  <GameProvider>
    <AppContent />
  </GameProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0b1222',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
  },
  navButtonActive: {},
  navIcon: {
    fontSize: 20,
    color: '#94a3b8',
    marginBottom: 4,
  },
  navIconActive: {
    color: '#fbbf24',
  },
  navLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#fbbf24',
  },
});

export default App;
