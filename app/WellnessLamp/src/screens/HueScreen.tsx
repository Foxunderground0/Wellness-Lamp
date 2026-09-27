import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';
import LinearGradient from 'react-native-linear-gradient';
import {MoodPalette} from '../types';
import {UI} from '../theme/colors';
import {hexToHsl, hslToHex} from '../utils/colorMath';
import FrostedTexture from '../components/FrostedTexture';

interface Props {
  onSelect: (p: MoodPalette) => void;
}

// Derive a harmonious 8-colour palette from a single picked hex colour
function buildPalette(hex: string): string[] {
  const [h, s, l] = hexToHsl(hex);
  return [
    hslToHex(h, s, l),
    hslToHex((h + 15) % 360, s, Math.min(l + 6, 90)),
    hslToHex((h - 15 + 360) % 360, s, Math.min(l + 10, 90)),
    hslToHex((h + 30) % 360, Math.max(s - 8, 20), l),
    hslToHex((h + 180) % 360, Math.max(s - 18, 20), Math.min(l + 8, 88)),
    hslToHex((h + 150) % 360, s, l),
    hslToHex((h - 30 + 360) % 360, s, Math.min(l + 5, 90)),
    hslToHex(h, Math.max(s - 28, 15), Math.min(l + 18, 94)),
  ];
}

export default function HueScreen({onSelect}: Props) {
  const [picked, setPicked] = useState('#a78bd4');
  const palette = buildPalette(picked);

  function handleApply() {
    onSelect({
      colors: palette,
      staticColor: picked,
      mood: 'Custom Hue',
      taglines: [
        'Your colour, your way',
        'Chosen with intention',
        'The light as you imagine it',
        'Picked by hand, felt in the room',
        'Every colour holds a feeling',
      ],
      intensity: 'calm',
      isInferred: false,
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Pick a Hue</Text>
      <Text style={styles.sub}>Touch the wheel to choose your colour</Text>

      {/* Color wheel */}
      <View style={styles.pickerCard}>
        <FrostedTexture />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>COLOUR FIELD</Text>
          <Text style={styles.sectionValue}>{picked.toUpperCase()}</Text>
        </View>
        <View style={styles.wheelWrap}>
          <ColorPicker
            color={picked}
            onColorChange={setPicked}
            thumbSize={32}
            sliderSize={28}
            shadeWheelThumb
            shadeSliderThumb
            noSnap
            row={false}
            swatches={false}
            discrete={false}
          />
        </View>
        <View style={styles.controlLegend}>
          <Text style={styles.legendText}>Hue</Text>
          <Text style={styles.legendText}>Lightness</Text>
        </View>
      </View>

      {/* Preview swatch */}
      <LinearGradient
        colors={[picked, '#eee4d6', UI.cardSolid]}
        locations={[0, .48, 1]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.preview}>
        <FrostedTexture />
        <View style={[styles.selectedSwatch, {backgroundColor: picked}]} />
        <View style={styles.previewCopy}>
          <Text style={styles.previewLabel}>Selected colour</Text>
          <Text style={styles.previewHex}>{picked.toUpperCase()}</Text>
        </View>
      </LinearGradient>

      {/* Derived palette dots */}
      <View style={styles.paletteCard}>
        <FrostedTexture />
        <View style={styles.paletteHeader}>
          <Text style={styles.sectionLabel}>GENERATED PALETTE</Text>
          <Text style={styles.paletteCount}>8 tones</Text>
        </View>
        <View style={styles.paletteRow}>
          {palette.map((c, i) => (
            <View key={i} style={[styles.dot, {backgroundColor: c}, i === 0 && styles.selectedDot]} />
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
        <Text style={styles.applyBtnText}>Apply to Lamp</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    alignItems: 'center',
  },
  header: {fontFamily: 'serif', fontSize: 26, fontWeight: '800', color: UI.text, marginBottom: 4, alignSelf: 'flex-start'},
  sub: {fontFamily: 'serif', fontSize: 14, color: UI.subtext, marginBottom: 24, alignSelf: 'flex-start'},
  wheelWrap: {
    width: '100%',
    height: 304,
  },
  pickerCard: {
    width: '100%',
    backgroundColor: UI.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: UI.cardBorder,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 10,
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4},
  sectionLabel: {fontFamily: 'serif', fontSize: 11, color: UI.text, fontWeight: '800', letterSpacing: 1.1},
  sectionValue: {fontFamily: 'serif', fontSize: 12, color: UI.accent, fontWeight: '800', letterSpacing: 1.2},
  controlLegend: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: -2},
  legendText: {fontFamily: 'serif', fontSize: 11, color: UI.subtext},
  paletteHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13},
  paletteCount: {fontFamily: 'serif', fontSize: 11, color: UI.subtext},
  paletteCard: {
    width: '100%',
    backgroundColor: UI.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: UI.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 76,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: UI.cardBorder,
  },
  previewHex: {
    fontFamily: 'serif',
    color: UI.text,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 2,
  },
  previewCopy: {gap: 3},
  previewLabel: {fontFamily: 'serif', fontSize: 11, color: UI.text, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1},
  selectedSwatch: {width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: UI.text, marginRight: 13},
  paletteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: UI.cardBorder,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  selectedDot: {width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: UI.text},
  applyBtn: {
    width: '100%',
    backgroundColor: UI.accent,
    paddingVertical: 17,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: UI.accent,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 7,
  },
  applyBtnText: {fontFamily: 'serif', color: UI.accentText, fontWeight: '700', fontSize: 16},
});
