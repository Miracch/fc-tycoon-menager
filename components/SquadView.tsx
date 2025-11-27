import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGame } from '../GameContext';
import { Player, Position } from '../types';
import { formatCurrency } from '../utils/format';

export const SquadView: React.FC = () => {
  const { state, dispatch } = useGame();
  const starters = state.players.filter((p) => p.isStarting);
  const bench = state.players.filter((p) => !p.isStarting);

  const handleSwap = (player: Player) => {
    if (player.isStarting) {
      const reserve = bench.find((p) => p.position === player.position) || bench[0];
      if (reserve) {
        dispatch({ type: 'SWAP_LINEUP', player1Id: player.id, player2Id: reserve.id });
      }
    } else {
      const starter = starters.find((p) => p.position === player.position) || starters[0];
      if (starter) {
        dispatch({ type: 'SWAP_LINEUP', player1Id: player.id, player2Id: starter.id });
      }
    }
  };

  const renderPlayer = (player: Player) => (
    <TouchableOpacity key={player.id} style={[styles.playerCard, player.isStarting ? styles.playerStarting : styles.playerBench]} onPress={() => handleSwap(player)}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerBadge}>{positionShort(player.position)}</Text>
      </View>
      <Text style={styles.playerMeta}>Rating {player.rating} · Moral {player.morale}%</Text>
      <Text style={styles.playerMeta}>Kondisyon {player.condition}%</Text>
      <Text style={styles.playerValue}>{formatCurrency(player.value)}</Text>
      <Text style={styles.swapHint}>{player.isStarting ? 'Yedeğe al' : 'İlk 11e çek'}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Kadro</Text>
      <Text style={styles.subtitle}>Oyuncuya dokunarak ilk 11 / yedek değişimi yap.</Text>

      <Text style={styles.sectionTitle}>İlk 11</Text>
      <View style={styles.grid}>{starters.map(renderPlayer)}</View>

      <Text style={styles.sectionTitle}>Yedekler</Text>
      <View style={styles.grid}>{bench.map(renderPlayer)}</View>
    </ScrollView>
  );
};

const positionShort = (pos: Position) => {
  switch (pos) {
    case Position.GK:
      return 'KK';
    case Position.DEF:
      return 'DEF';
    case Position.MID:
      return 'ORT';
    case Position.FWD:
      return 'FWD';
    default:
      return '';
  }
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
  subtitle: {
    color: '#94a3b8',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  playerCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  playerStarting: {
    borderColor: '#22c55e',
  },
  playerBench: {
    borderColor: '#334155',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  playerName: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  playerBadge: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 12,
  },
  playerMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  playerValue: {
    color: '#fbbf24',
    fontWeight: '800',
    marginTop: 6,
  },
  swapHint: {
    color: '#22c55e',
    fontSize: 12,
    marginTop: 4,
  },
});
