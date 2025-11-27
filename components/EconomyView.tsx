import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGame } from '../GameContext';
import { formatCurrency } from '../utils/format';

export const EconomyView: React.FC = () => {
  const { state, dispatch } = useGame();

  const totalPassive = state.facilities
    .filter((f) => f.type === 'COMMERCIAL')
    .reduce((acc, fac) => {
      let val = 0;
      if (fac.activeSponsor) {
        const raw = fac.count * fac.level * fac.activeSponsor.passiveBonus;
        const fanMultiplier = 1 + (Math.log10(Math.max(10, state.fans)) - 1);
        val += Math.floor(raw * fanMultiplier);
      }
      if (fac.dailyPassiveIncomePerFan && fac.dailyPassiveIncomePerFan > 0) {
        val += Math.floor(fac.count * fac.level * fac.dailyPassiveIncomePerFan * state.fans);
      }
      return acc + val;
    }, 0);

  const resetSave = () => dispatch({ type: 'RESET_GAME' });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Finans</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Nakit</Text>
        <Text style={styles.cardValue}>{formatCurrency(state.money)}</Text>
        <Text style={styles.cardLabel}>Günlük Pasif Gelir</Text>
        <Text style={styles.cardValue}>{formatCurrency(totalPassive)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Son 10 Hafta</Text>
      <View style={styles.historyList}>
        {state.history.slice(-10).map((h) => (
          <View style={styles.historyRow} key={h.week}>
            <Text style={styles.historyText}>Hafta {h.week}</Text>
            <Text style={styles.historyValue}>{formatCurrency(h.money)}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={resetSave} style={styles.dangerButton}>
        <Text style={styles.dangerText}>Kaydı Sıfırla</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 14,
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  cardValue: {
    color: '#e2e8f0',
    fontWeight: '800',
    fontSize: 18,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
    marginTop: 8,
  },
  historyList: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#0b1222',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  historyText: {
    color: '#cbd5e1',
  },
  historyValue: {
    color: '#22c55e',
    fontWeight: '700',
  },
  dangerButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#b91c1c',
  },
  dangerText: {
    color: '#e2e8f0',
    fontWeight: '800',
  },
});
