import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from '../native-shim';
import { useGame } from '../GameContext';
import { Facility } from '../types';
import { formatCurrency } from '../utils/format';

export const FacilitiesView: React.FC = () => {
  const { state, dispatch } = useGame();

  const handleBuild = (facility: Facility) => {
    dispatch({ type: 'BUILD_FACILITY', facilityId: facility.id });
  };

  const handleUpgrade = (facility: Facility) => {
    dispatch({ type: 'UPGRADE_FACILITY', facilityId: facility.id });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tesisler</Text>
      <Text style={styles.subtitle}>Mobil uyumlu kart yapısı ile inşa ve yükselt.</Text>
      {state.facilities.map((fac) => (
        <View key={fac.id} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.cardTitle}>{fac.name}</Text>
            <Text style={styles.badge}>Seviye {fac.level}</Text>
          </View>
          <Text style={styles.cardSubtitle}>{fac.description}</Text>
          <Text style={styles.meta}>Adet: {fac.count}/{fac.maxCount}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => handleBuild(fac)}>
              <Text style={styles.secondaryButtonText}>Kur ({formatCurrency(Math.floor(fac.baseBuildCost * Math.pow(1.5, fac.count)))})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={() => handleUpgrade(fac)}>
              <Text style={styles.primaryButtonText}>Seviye Atla ({formatCurrency(Math.floor(fac.baseUpgradeCost * Math.pow(1.6, fac.level)))})</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#e2e8f0',
    fontWeight: '800',
    fontSize: 16,
  },
  badge: {
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: '700',
    fontSize: 12,
  },
  cardSubtitle: {
    color: '#94a3b8',
  },
  meta: {
    color: '#cbd5e1',
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'column',
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0f172a',
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
});
