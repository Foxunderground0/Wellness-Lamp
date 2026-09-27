import React, {useRef, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Slider from '@react-native-community/slider';
import MoodSwatch, {MoodSwatchHandle} from '../components/MoodSwatch';
import TaglineDisplay from '../components/TaglineDisplay';
import {sendToLamp, LampResult} from '../services/lampService';
import {DisplayMode, MoodPalette} from '../types';
import {UI} from '../theme/colors';
import {SoundState, SoundHandlers} from '../../App';
import FrostedTexture from '../components/FrostedTexture';

const FOLDER_NAMES: Record<number, string> = {
  1: 'Rain', 2: 'Forest', 3: 'Ocean', 4: 'Fire', 5: 'Night', 6: 'Music',
};

interface Props {
  palette: MoodPalette | null;
  mode: DisplayMode;
  speed: number;
  brightness: number;
  onModeChange: (m: DisplayMode) => void;
  onSpeedChange: (s: number) => void;
  onBrightnessChange: (b: number) => void;
  sound: SoundState;
  soundHandlers: SoundHandlers;
}

const DEFAULT_TAGLINES = [
  'Set your colour, set your mood',
  'Let the light do the talking',
  'Colour is how your space breathes',
];

const SPEED_LABELS = ['Glacial', 'Slow', 'Drift', 'Flow', 'Pulse'];
function speedLabel(s: number): string {
  const idx = Math.round(((s - 0.2) / 2.8) * (SPEED_LABELS.length - 1));
  return SPEED_LABELS[Math.max(0, Math.min(SPEED_LABELS.length - 1, idx))];
}

const STATUS_LABEL: Record<LampResult, string> = {
  ok:            '✓ Sent to lamp',
  timeout:       '⚠ Lamp not found — make sure it is powered on',
  error:         '✕ Send failed — try again',
  no_bluetooth:  '⚠ Bluetooth is off — enable it and try again',
  no_permission: '⚠ Bluetooth permission denied',
};
const STATUS_COLOR: Record<LampResult, string> = {
  ok:            '#5a9b6a',
  timeout:       '#b07a30',
  error:         '#b04040',
  no_bluetooth:  '#b07a30',
  no_permission: '#b04040',
};

export default function GlowScreen({
  palette, mode, speed, brightness,
  onModeChange, onSpeedChange, onBrightnessChange,
  sound, soundHandlers,
}: Props) {
  const [sending, setSending]   = useState(false);
  const [lastResult, setResult] = useState<LampResult | null>(null);
  // Ref to MoodSwatch so we can read the current animation position for sync
  const swatchRef = useRef<MoodSwatchHandle>(null);

  const taglines  = palette?.taglines ?? DEFAULT_TAGLINES;
  const moodLabel = palette?.mood ?? null;

  async function handleSendToLamp() {
    if (sending) { return; }
    setSending(true);
    setResult(null);
    // Pass the orb's current animation position so the lamp starts in sync
    const startT = swatchRef.current?.getCurrentT() ?? 0;
    const cmd = mode === 'immersive' && palette
      ? {mode: 'immersive' as const, colors: palette.colors, speed, brightness, startT}
      : {mode: 'static'    as const, color: palette?.staticColor ?? '#c9b8e8', brightness, startT};
    const result = await sendToLamp(cmd);
    setSending(false);
    setResult(result);
    setTimeout(() => setResult(null), 5000);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Wellness Lamp</Text>
        {moodLabel
          ? <Text style={styles.moodBadge}>{moodLabel}</Text>
          : <Text style={styles.moodHint}>Go to Feel to discover your mood</Text>}
      </View>

      <View style={styles.swatchWrap}>
        <MoodSwatch palette={palette} mode={mode} speed={speed} size={262} swatchRef={swatchRef} />
      </View>

      <TaglineDisplay taglines={taglines} />

      {/* Mode toggle */}
          <View style={styles.modeRow}>
        <FrostedTexture />
        {(['static', 'immersive'] as DisplayMode[]).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
            onPress={() => onModeChange(m)}
            activeOpacity={0.8}>
            <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Speed slider — immersive only */}
      {mode === 'immersive' && (
        <View style={styles.sliderBox}>
          <FrostedTexture />
          <View style={styles.sliderLabelRow}>
            <Text style={styles.sliderTitle}>Speed</Text>
            <Text style={styles.sliderValue}>{speedLabel(speed)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.2} maximumValue={3.0}
            value={speed} onValueChange={onSpeedChange}
            minimumTrackTintColor={UI.accent}
            maximumTrackTintColor={UI.accentLight}
            thumbTintColor={UI.accent}
          />
          <View style={styles.sliderEnds}>
            <Text style={styles.sliderEnd}>Slow</Text>
            <Text style={styles.sliderEnd}>Fast</Text>
          </View>
        </View>
      )}

      {/* Brightness — always visible */}
      <View style={styles.sliderBox}>
        <FrostedTexture />
        <View style={styles.sliderLabelRow}>
          <Text style={styles.sliderTitle}>Brightness</Text>
          <Text style={styles.sliderValue}>{Math.round(brightness * 100)}%</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0.05} maximumValue={1.0}
          value={brightness} onValueChange={onBrightnessChange}
          minimumTrackTintColor={UI.accent}
          maximumTrackTintColor={UI.accentLight}
          thumbTintColor={UI.accent}
        />
        <View style={styles.sliderEnds}>
          <Text style={styles.sliderEnd}>Dim</Text>
          <Text style={styles.sliderEnd}>Full</Text>
        </View>
      </View>

      {/* Palette dots */}
      {palette && (
        <View style={styles.dotsRow}>
          {palette.colors.map((color, i) => (
            <View
              key={i}
              style={[styles.dot, {
                backgroundColor: color,
                width: i === 0 ? 32 : 24,
                height: i === 0 ? 32 : 24,
                borderRadius: 16,
              }]}
            />
          ))}
        </View>
      )}

      {/* Intensity chip */}
      <View style={styles.intensityRow}>
        {palette && (
          <View style={[styles.intensityChip, {backgroundColor: UI.accentLight}]}>
            <Text style={styles.intensityText}>{palette.intensity}</Text>
          </View>
        )}
      </View>

      {/* ── Ambiance mini-player ─────────────────────────────────────────── */}
      <View style={styles.playerCard}>
        <FrostedTexture />
        <View style={styles.playerHeader}>
          <Text style={styles.playerTitle}>Ambiance</Text>
          {sound.connected
            ? <View style={styles.playerDotRow}>
                <View style={[styles.playerDot, {
                  backgroundColor:
                    sound.playState === 'playing' ? '#66bb6a' :
                    sound.playState === 'paused'  ? '#ffa726' : '#bdbdbd',
                }]} />
                <Text style={styles.playerMeta}>
                  {FOLDER_NAMES[sound.folder] ?? `Folder ${sound.folder}`}
                  {' · Track '}{sound.file}
                  {' · '}{sound.playState === 'playing' ? 'Playing' :
                           sound.playState === 'paused'  ? 'Paused'  : 'Stopped'}
                </Text>
              </View>
            : <TouchableOpacity
                style={styles.playerConnectBtn}
                onPress={soundHandlers.onConnect}
                activeOpacity={0.8}>
                <Text style={styles.playerConnectText}>Connect</Text>
              </TouchableOpacity>
          }
        </View>

        {sound.connected && (
          <View style={styles.playerControls}>
            <TouchableOpacity style={styles.playerBtn} onPress={soundHandlers.onPrev} activeOpacity={0.7}>
              <Text style={styles.playerBtnText}>PREV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playerPlayBtn} onPress={soundHandlers.onPlayPause} activeOpacity={0.8}>
              <Text style={styles.playerPlayText}>
                {sound.playState === 'playing' ? 'PAUSE' : 'PLAY'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playerBtn} onPress={soundHandlers.onNext} activeOpacity={0.7}>
              <Text style={styles.playerBtnText}>NEXT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playerBtn} onPress={soundHandlers.onStop} activeOpacity={0.7}>
              <Text style={styles.playerBtnText}>STOP</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Send to Lamp */}
      <TouchableOpacity
        style={[styles.sendBtn, sending && {opacity: 0.6}]}
        onPress={handleSendToLamp}
        activeOpacity={0.8}
        disabled={sending}>
        {sending
          ? <ActivityIndicator color={UI.accentText} size="small" />
          : <Text style={styles.sendBtnText}>Send to Lamp</Text>}
      </TouchableOpacity>

      {/* Status feedback */}
      {lastResult && (
        <Text style={[styles.statusText, {color: STATUS_COLOR[lastResult]}]}>
          {STATUS_LABEL[lastResult]}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {alignItems: 'center', paddingTop: 12, paddingBottom: 32},
  header: {alignItems: 'center', marginBottom: 28, gap: 6},
  title: {fontFamily: 'serif', fontSize: 28, fontWeight: '800', color: UI.text, letterSpacing: 0.4},
  moodBadge: {fontFamily: 'serif', fontSize: 14, color: UI.accent, fontStyle: 'italic', fontWeight: '600'},
  moodHint:  {fontFamily: 'serif', fontSize: 13, color: UI.subtext},
  swatchWrap: {marginBottom: 32},

  modeRow: {
    flexDirection: 'row', marginTop: 28,
    backgroundColor: 'rgba(244,239,229,0.09)', borderWidth: 1, borderColor: UI.cardBorder, borderRadius: 22, padding: 4, gap: 4, position: 'relative', overflow: 'hidden',
  },
  modeBtn: {paddingHorizontal: 26, paddingVertical: 11, borderRadius: 18},
  modeBtnActive: {
    backgroundColor: UI.accent,
    shadowColor: UI.accent, shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  modeBtnText: {fontFamily: 'serif', color: UI.subtext, fontWeight: '600', fontSize: 14},
  modeBtnTextActive: {color: UI.accentText},

  sliderBox: {
    marginTop: 18, width: '82%',
    backgroundColor: UI.card,
    borderWidth: 1, borderColor: UI.cardBorder,
    position: 'relative', overflow: 'hidden',
    borderRadius: 18, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10,
  },
  sliderLabelRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2},
  sliderTitle: {fontFamily: 'serif', fontSize: 13, fontWeight: '700', color: UI.text, textTransform: 'uppercase', letterSpacing: 0.8},
  sliderValue: {fontFamily: 'serif', fontSize: 13, fontWeight: '700', color: UI.accent},
  slider: {width: '100%', height: 36},
  sliderEnds: {flexDirection: 'row', justifyContent: 'space-between', marginTop: -4},
  sliderEnd: {fontFamily: 'serif', fontSize: 11, color: UI.subtext},

  dotsRow: {
    flexDirection: 'row', marginTop: 22, gap: 8,
    alignItems: 'center', flexWrap: 'wrap',
    justifyContent: 'center', paddingHorizontal: 24,
  },
  dot: {
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12, shadowRadius: 5, elevation: 3,
  },
  intensityRow: {marginTop: 16, height: 28, alignItems: 'center'},
  intensityChip: {paddingHorizontal: 16, paddingVertical: 5, borderRadius: 12},
  intensityText: {
    fontFamily: 'serif', fontSize: 12, color: UI.accent, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
  },

  // Mini player
  playerCard: {
    marginTop: 22,
    width: '82%',
    backgroundColor: UI.card,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: UI.cardBorder,
    gap: 12, position: 'relative', overflow: 'hidden',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerTitle: {
    fontFamily: 'serif', fontSize: 13, fontWeight: '800', color: UI.text,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  playerDotRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  playerDot:   {width: 7, height: 7, borderRadius: 4},
  playerMeta:  {fontFamily: 'serif', fontSize: 11, color: UI.subtext, fontWeight: '500'},
  playerConnectBtn: {
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14,
    backgroundColor: UI.accent,
  },
  playerConnectText: {fontFamily: 'serif', color: UI.accentText, fontSize: 12, fontWeight: '700'},
  playerControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  playerBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: 'rgba(244,232,210,0.14)',
  },
  playerBtnText: {fontFamily: 'serif', fontSize: 11, fontWeight: '800', color: UI.text, letterSpacing: 0.8},
  playerPlayBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
    backgroundColor: UI.accent,
    shadowColor: UI.accent, shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  playerPlayText: {fontFamily: 'serif', fontSize: 12, fontWeight: '800', color: UI.accentText, letterSpacing: 1},

  sendBtn: {
    marginTop: 24,
    backgroundColor: UI.accent,
    paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    minWidth: 200, minHeight: 52,
    shadowColor: UI.accent, shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.38, shadowRadius: 14, elevation: 7,
  },
  sendBtnText: {fontFamily: 'serif', color: UI.accentText, fontWeight: '700', fontSize: 16},
  statusText: {fontFamily: 'serif', marginTop: 12, fontSize: 13, textAlign: 'center', paddingHorizontal: 24},
});
