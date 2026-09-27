import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {PRESET_THEMES} from '../theme/presetThemes';
import {MoodPalette} from '../types';
import {UI} from '../theme/colors';
import FrostedTexture from '../components/FrostedTexture';

interface Props {
  onSelect: (p: MoodPalette) => void;
}

export default function ThemesScreen({onSelect}: Props) {
  function applyTheme(theme: (typeof PRESET_THEMES)[0]) {
    onSelect({
      colors: theme.colors,
      staticColor: theme.staticColor,
      mood: theme.name,
      taglines: [theme.tagline, theme.description, theme.tagline],
      intensity: 'calm',
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mood Themes</Text>
      <Text style={styles.sub}>Choose a feeling, set the light</Text>
      <FlatList
        data={PRESET_THEMES}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => applyTheme(item)}
            activeOpacity={0.85}>
            <LinearGradient
              colors={[
                item.colors[0],
                item.colors[1] ?? item.colors[0],
                '#eee2d2',
                UI.cardSolid,
              ]}
              locations={[0, .30, .64, 1]}
              start={{x: 0, y: 0}}
              end={{x: .9, y: 1}}
              style={StyleSheet.absoluteFill}
            />
            <View pointerEvents="none" style={styles.cardWash} />
            <FrostedTexture />
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '800',
    color: UI.text,
    marginBottom: 4,
  },
  sub: {
    fontFamily: 'serif',
    fontSize: 14,
    color: UI.subtext,
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
    gap: 12,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: UI.card,
    shadowColor: '#8e7561',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 6,
    minHeight: 190,
    borderWidth: 1,
    borderColor: UI.cardBorder,
  },
  cardWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,252,246,0.18)',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  cardName: {
    fontFamily: 'serif',
    fontSize: 14,
    fontWeight: '700',
    color: UI.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: 'serif',
    fontSize: 11,
    color: UI.subtext,
    lineHeight: 16,
  },
});
