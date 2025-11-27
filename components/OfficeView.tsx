import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useGame } from '../GameContext';
import { LEAGUE_NAMES, getStadiumCapacity } from '../constants';
import { formatCurrency } from '../utils/format';

export const OfficeView: React.FC = () => {
  const { state, dispatch, playMatch, clickForMoney } = useGame();
  const [teamName, setTeamName] = useState('');
  const [resultOpen, setResultOpen] = useState(false);
  const [clickPulse, setClickPulse] = useState(false);

  useEffect(() => {
    if (state.lastMatchDetails) {
      setResultOpen(true);
    }
  }, [state.lastMatchDetails]);

  const handleClick = () => {
    clickForMoney();
    setClickPulse(true);
    setTimeout(() => setClickPulse(false), 120);
  };

  if (!state.teamName) {
    return (
      <View style={styles.setupContainer}>
        <Text style={styles.setupTitle}>Kulübünü Kur</Text>
        <Text style={styles.setupSubtitle}>App Store ve Google Play için hazır mobil arayüz.</Text>
        <TextInput
          placeholder="Takım adı"
          placeholderTextColor="#94a3b8"
          value={teamName}
          onChangeText={setTeamName}
          style={styles.input}
        />
        <TouchableOpacity
          disabled={!teamName.trim()}
          onPress={() => dispatch({ type: 'SET_TEAM_NAME', name: teamName.trim() })}
          style={[styles.primaryButton, !teamName.trim() && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>Karriere Başla</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stadium = state.facilities.find((f) => f.id === 'stadium');
  const capacity = getStadiumCapacity(stadium ? stadium.level : 1);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Sezon {state.season} · Hafta {state.week}</Text>
          <Text style={styles.title}>{state.teamName}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{LEAGUE_NAMES[state.leagueTier]}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <InfoCard label="Bütçe" value={formatCurrency(state.money)} />
        <InfoCard label="Taraftar" value={state.fans.toLocaleString('tr-TR')} />
      </View>

      <View style={styles.row}>
        <InfoCard label="Tesis Kapasitesi" value={`${capacity.toLocaleString('tr-TR')} kişi`} />
        <InfoCard label="Sermaye" value={state.leaguePoints + ' puan'} />
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Gelir Topla</Text>
        <Text style={styles.actionSubtitle}>Boost açık: {state.clickBoostTimer > 0 ? '10x' : '1x'}</Text>
        <TouchableOpacity onPress={handleClick} style={[styles.primaryButton, clickPulse && styles.primaryButtonPulse]}>
          <Text style={styles.primaryButtonText}>Para Kazan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Maça Çık</Text>
        <Text style={styles.actionSubtitle}>İlk 11 hazır olmalı.</Text>
        <TouchableOpacity onPress={playMatch} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Maçı Oynat</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={resultOpen && !!state.lastMatchDetails} transparent animationType="fade" onRequestClose={() => setResultOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Maç Sonucu</Text>
            {state.lastMatchDetails ? (
              <>
                <Text style={styles.modalText}>{state.lastMatchDetails.result === 'WIN' ? 'Galibiyet' : state.lastMatchDetails.result === 'DRAW' ? 'Beraberlik' : 'Mağlubiyet'}</Text>
                <Text style={styles.modalText}>
                  Skor: {state.lastMatchDetails.scoreHome} - {state.lastMatchDetails.scoreAway}
                </Text>
                <Text style={styles.modalText}>Gelir: {formatCurrency(state.lastMatchDetails.reward.totalNet)}</Text>
              </>
            ) : null}
            <TouchableOpacity onPress={() => setResultOpen(false)} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.card}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  pageContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  tagText: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
  cardValue: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
  },
  actionCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#0b1222',
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 8,
  },
  actionTitle: {
    fontSize: 18,
    color: '#e2e8f0',
    fontWeight: '800',
  },
  actionSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonPulse: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 6,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#0b1222',
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 8,
  },
  modalTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '800',
  },
  modalText: {
    color: '#cbd5e1',
    fontSize: 15,
  },
  setupContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  setupTitle: {
    color: '#e2e8f0',
    fontSize: 24,
    fontWeight: '800',
  },
  setupSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#0b1222',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#e2e8f0',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
