import React, {useCallback, useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import GradientBackground from './src/components/GradientBackground';
import BottomNav from './src/components/BottomNav';
import GlowScreen from './src/screens/GlowScreen';
import FeelScreen from './src/screens/FeelScreen';
import ThemesScreen from './src/screens/ThemesScreen';
import HueScreen from './src/screens/HueScreen';
import SoundScreen from './src/screens/SoundScreen';
import {AnswerRecord} from './src/services/moodEngine';
import {
  disconnectMp3,
  isMp3Connected,
  sendMp3Command,
} from './src/services/mp3Service';
import {AppScreen, DisplayMode, MoodPalette} from './src/types';

// Map palette intensity to an ambiance folder number
const INTENSITY_FOLDER: Record<string, number> = {
  calm:    2, // Forest
  cool:    3, // Ocean
  warm:    4, // Fire
  muted:   5, // Night
  vibrant: 6, // Music
};

export type SoundPlayState = 'stopped' | 'playing' | 'paused';

export interface SoundState {
  connected:  boolean;
  playState:  SoundPlayState;
  folder:     number;
  file:       number;
  volume:     number;
}

export interface SoundHandlers {
  onConnect:      () => Promise<void>;
  onDisconnect:   () => Promise<void>;
  onPlayFolder:   (folder: number, file: number) => Promise<void>;
  onPlayPause:    () => Promise<void>;
  onStop:         () => Promise<void>;
  onNext:         () => Promise<void>;
  onPrev:         () => Promise<void>;
  onVolumeChange: (v: number) => Promise<void>;
}

const FILES_PER_FOLDER = 5;

export default function App() {
  const [screen, setScreen]         = useState<AppScreen>('glow');
  const [palette, setPalette]       = useState<MoodPalette | null>(null);
  const [mode, setMode]             = useState<DisplayMode>('immersive');
  const [speed, setSpeed]           = useState(1.0);
  const [brightness, setBrightness] = useState(0.8);

  // ── shared sound state ───────────────────────────────────────────────────────
  const [sound, setSound] = useState<SoundState>({
    connected: isMp3Connected(),
    playState: 'stopped',
    folder:    1,
    file:      1,
    volume:    20,
  });

  // ── internal helper — send + sync state ─────────────────────────────────────
  const send = useCallback(async (cmd: Parameters<typeof sendMp3Command>[0]) => {
    const result = await sendMp3Command(cmd);
    setSound(s => ({...s, connected: result === 'ok'}));
    return result;
  }, []);

  // ── sound handlers (passed to both GlowScreen and SoundScreen) ───────────────
  const soundHandlers: SoundHandlers = {
    async onConnect() {
      const result = await send({cmd: 'volume', level: sound.volume});
      setSound(s => ({...s, connected: result === 'ok'}));
    },
    async onDisconnect() {
      await disconnectMp3();
      setSound(s => ({...s, connected: false, playState: 'stopped'}));
    },
    async onPlayFolder(folder, file) {
      const result = await send({cmd: 'playFolder', folder, file});
      if (result === 'ok') {
        setSound(s => ({...s, folder, file, playState: 'playing'}));
      }
    },
    async onPlayPause() {
      if (sound.playState === 'playing') {
        const result = await send({cmd: 'pause'});
        if (result === 'ok') { setSound(s => ({...s, playState: 'paused'})); }
      } else if (sound.playState === 'paused') {
        const result = await send({cmd: 'resume'});
        if (result === 'ok') { setSound(s => ({...s, playState: 'playing'})); }
      } else {
        const result = await send({cmd: 'playFolder', folder: sound.folder, file: sound.file});
        if (result === 'ok') { setSound(s => ({...s, playState: 'playing'})); }
      }
    },
    async onStop() {
      await send({cmd: 'stop'});
      setSound(s => ({...s, playState: 'stopped'}));
    },
    async onNext() {
      const nextFile = sound.file < FILES_PER_FOLDER ? sound.file + 1 : 1;
      const result = await send({cmd: 'playFolder', folder: sound.folder, file: nextFile});
      if (result === 'ok') { setSound(s => ({...s, file: nextFile, playState: 'playing'})); }
    },
    async onPrev() {
      const prevFile = sound.file > 1 ? sound.file - 1 : FILES_PER_FOLDER;
      const result = await send({cmd: 'playFolder', folder: sound.folder, file: prevFile});
      if (result === 'ok') { setSound(s => ({...s, file: prevFile, playState: 'playing'})); }
    },
    async onVolumeChange(v) {
      await send({cmd: 'volume', level: v});
      setSound(s => ({...s, volume: v}));
    },
  };

  // ── palette selection — auto-play matching ambiance ──────────────────────────
  async function triggerAmbiance(p: MoodPalette) {
    const folder = INTENSITY_FOLDER[p.intensity] ?? 1;
    const result = await send({cmd: 'playFolder', folder, file: 1});
    if (result === 'ok') {
      setSound(s => ({...s, folder, file: 1, playState: 'playing'}));
    }
  }

  function handlePaletteChange(p: MoodPalette, _answers: AnswerRecord[]) {
    setPalette(p);
    setScreen('glow');
    triggerAmbiance(p);
  }

  function handleManualSelect(p: MoodPalette) {
    const merged = {...p, isInferred: false};
    setPalette(merged);
    setScreen('glow');
    triggerAmbiance(merged);
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <View style={[styles.screen, screen !== 'glow'   && styles.hidden]}>
            <GlowScreen
              palette={palette}
              mode={mode}
              speed={speed}
              brightness={brightness}
              onModeChange={setMode}
              onSpeedChange={setSpeed}
              onBrightnessChange={setBrightness}
              sound={sound}
              soundHandlers={soundHandlers}
            />
          </View>
          <View style={[styles.screen, screen !== 'feel'   && styles.hidden]}>
            <FeelScreen onMoodInferred={handlePaletteChange} />
          </View>
          <View style={[styles.screen, screen !== 'themes' && styles.hidden]}>
            <ThemesScreen onSelect={handleManualSelect} />
          </View>
          <View style={[styles.screen, screen !== 'hue'    && styles.hidden]}>
            <HueScreen onSelect={handleManualSelect} />
          </View>
          <View style={[styles.screen, screen !== 'sound'  && styles.hidden]}>
            <SoundScreen
              sound={sound}
              soundHandlers={soundHandlers}
              onSoundStateChange={setSound}
            />
          </View>

          <BottomNav active={screen} onSelect={setScreen} />
        </SafeAreaView>
      </GradientBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe:   {flex: 1},
  screen: {flex: 1},
  hidden: {display: 'none'},
});
