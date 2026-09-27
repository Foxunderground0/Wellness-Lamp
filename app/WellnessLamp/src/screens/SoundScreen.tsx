import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {UI} from '../theme/colors';
import {SoundState, SoundHandlers} from '../../App';
import FrostedTexture from '../components/FrostedTexture';

const FOLDERS: {id: number; label: string; description: string}[] = [
  {id: 1, label: 'Rain',   description: 'Gentle rain & showers'},
  {id: 2, label: 'Forest', description: 'Birds, wind & leaves'},
  {id: 3, label: 'Ocean',  description: 'Waves & sea breeze'},
  {id: 4, label: 'Fire',   description: 'Crackling campfire'},
  {id: 5, label: 'Night',  description: 'Crickets & night air'},
  {id: 6, label: 'Music',  description: 'Ambient & lo-fi tracks'},
];

const FILES_PER_FOLDER = 5;

interface Props {
  sound:              SoundState;
  soundHandlers:      SoundHandlers;
  onSoundStateChange: React.Dispatch<React.SetStateAction<SoundState>>;
}

type ConnectPhase = 'idle' | 'scanning' | 'error';

export default function SoundScreen({sound, soundHandlers}: Props) {
  const [connectPhase, setConnectPhase] = useState<ConnectPhase>('idle');
  const [status, setStatus]             = useState('');
  const pendingRef = useRef(false);

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(''), 2400);
  };

  async function handleConnect() {
    if (sound.connected) {
      await soundHandlers.onDisconnect();
      return;
    }
    setConnectPhase('scanning');
    await soundHandlers.onConnect();
    if (sound.connected) {
      setConnectPhase('idle');
    } else {
      setConnectPhase('error');
      flash('MP3Controller not found');
    }
  }

  async function guard<T extends unknown[]>(fn: (...a: T) => Promise<void>, ...args: T) {
    if (pendingRef.current) {return;}
    pendingRef.current = true;
    try { await fn(...args); } finally { pendingRef.current = false; }
  }

  const isConnected = sound.connected;
  const isScanning  = connectPhase === 'scanning';

  const connectLabel =
    isScanning              ? 'Scanning...' :
    isConnected             ? 'Disconnect'  :
    connectPhase === 'error'? 'Retry'       : 'Connect';

  const connectColor =
    isConnected              ? '#e57373' :
    connectPhase === 'error' ? '#ff8a65' : UI.accent;

  const activeFolderObj = FOLDERS.find(f => f.id === sound.folder) ?? FOLDERS[0];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Sound</Text>
          <Text style={styles.sub}>Ambiance for your space</Text>
        </View>
        <TouchableOpacity
          style={[styles.connectBtn, {backgroundColor: connectColor}]}
          onPress={handleConnect}
          disabled={isScanning}
          activeOpacity={0.8}>
          {isScanning
            ? <ActivityIndicator color={UI.accentText} size="small" />
            : <Text style={styles.connectBtnText}>{connectLabel}</Text>}
        </TouchableOpacity>
      </View>

      {/* Status toast */}
      {status !== '' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{status}</Text>
        </View>
      )}

      {/* Now playing */}
      <View style={styles.nowPlayingCard}>
        <FrostedTexture />
        <View style={styles.nowPlayingIconBox}>
          <Text style={styles.nowPlayingIconText}>
            {isConnected ? activeFolderObj.label.slice(0, 2).toUpperCase() : '--'}
          </Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.nowPlayingLabel}>
            {isConnected ? activeFolderObj.label : 'Not connected'}
          </Text>
          <Text style={styles.nowPlayingMeta}>
            {isConnected
              ? `Track ${sound.file} of ${FILES_PER_FOLDER} · ${
                  sound.playState === 'playing' ? 'Playing' :
                  sound.playState === 'paused'  ? 'Paused'  : 'Stopped'}`
              : 'Connect to MP3Controller to begin'}
          </Text>
        </View>
        {isConnected && (
          <View style={[styles.dot, {
            backgroundColor:
              sound.playState === 'playing' ? '#66bb6a' :
              sound.playState === 'paused'  ? '#ffa726' : '#bdbdbd',
          }]} />
        )}
      </View>

      {/* Transport */}
      <View style={styles.transport}>
        <TouchableOpacity
          style={[styles.transportBtn, !isConnected && styles.transportBtnDisabled]}
          onPress={() => guard(soundHandlers.onPrev)}
          disabled={!isConnected}
          activeOpacity={0.7}>
          <Text style={styles.transportLabel}>PREV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, !isConnected && styles.playBtnDisabled]}
          onPress={() => guard(soundHandlers.onPlayPause)}
          disabled={!isConnected}
          activeOpacity={0.8}>
          <Text style={[styles.playLabel, !isConnected && styles.playLabelDisabled]}>
            {sound.playState === 'playing' ? 'PAUSE' : 'PLAY'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.transportBtn, !isConnected && styles.transportBtnDisabled]}
          onPress={() => guard(soundHandlers.onNext)}
          disabled={!isConnected}
          activeOpacity={0.7}>
          <Text style={styles.transportLabel}>NEXT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.transportBtn, !isConnected && styles.transportBtnDisabled]}
          onPress={() => guard(soundHandlers.onStop)}
          disabled={!isConnected}
          activeOpacity={0.7}>
          <Text style={styles.transportLabel}>STOP</Text>
        </TouchableOpacity>
      </View>

      {/* Volume */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Volume</Text>
          <Text style={styles.sectionValue}>{sound.volume} / 30</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={30}
          step={1}
          value={sound.volume}
          onSlidingComplete={v => guard(soundHandlers.onVolumeChange, Math.round(v))}
          minimumTrackTintColor={UI.accent}
          maximumTrackTintColor={UI.accentLight}
          thumbTintColor={UI.accent}
          disabled={!isConnected}
        />
      </View>

      {/* Ambiance folders */}
      <Text style={styles.sectionTitle}>Ambiance</Text>
      <View style={styles.folderGrid}>
        {FOLDERS.map(folder => {
          const isActive = isConnected && sound.folder === folder.id && sound.playState === 'playing';
          return (
            <TouchableOpacity
              key={folder.id}
              style={[styles.folderCard, isActive && styles.folderCardActive]}
              onPress={() => guard(soundHandlers.onPlayFolder, folder.id, 1)}
              disabled={!isConnected}
              activeOpacity={0.75}>
              <Text style={[styles.folderLabel, isActive && styles.folderLabelActive]}>
                {folder.label}
              </Text>
              <Text style={styles.folderDesc}>{folder.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Track picker */}
      {isConnected && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track</Text>
          <View style={styles.trackRow}>
            {Array.from({length: FILES_PER_FOLDER}, (_, i) => i + 1).map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.trackBtn, sound.file === n && styles.trackBtnActive]}
                onPress={() => guard(soundHandlers.onPlayFolder, sound.folder, n)}
                activeOpacity={0.8}>
                <Text style={[styles.trackBtnText, sound.file === n && styles.trackBtnTextActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {fontFamily: 'serif', fontSize: 26, fontWeight: '800', color: UI.text},
  sub:    {fontFamily: 'serif', fontSize: 13, color: UI.subtext, marginTop: 2},

  connectBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  connectBtnText: {fontFamily: 'serif', color: UI.accentText, fontWeight: '700', fontSize: 14},

  toast: {
    backgroundColor: UI.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignSelf: 'center',
    marginBottom: 12,
  },
  toastText: {fontFamily: 'serif', color: UI.text, fontSize: 13, fontWeight: '500'},

  nowPlayingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    gap: 14,
    borderWidth: 1.5,
    borderColor: UI.cardBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  nowPlayingIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: UI.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowPlayingIconText: {fontFamily: 'serif', fontSize: 13, fontWeight: '800', color: UI.accent, letterSpacing: 1},
  nowPlayingLabel:    {fontFamily: 'serif', fontSize: 16, fontWeight: '700', color: UI.text},
  nowPlayingMeta:     {fontFamily: 'serif', fontSize: 12, color: UI.subtext, marginTop: 2},
  dot: {width: 10, height: 10, borderRadius: 5},

  transport: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  transportBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: UI.cardSolid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportBtnDisabled: {opacity: 0.35},
  transportLabel: {fontFamily: 'serif', fontSize: 12, fontWeight: '800', color: UI.text, letterSpacing: 1},

  playBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: UI.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: UI.accent,
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 90,
  },
  playBtnDisabled: {backgroundColor: 'rgba(88,68,55,0.10)', borderWidth: 1, borderColor: UI.cardBorder, shadowOpacity: 0},
  playLabel: {fontFamily: 'serif', fontSize: 13, fontWeight: '800', color: UI.accentText, letterSpacing: 1.5},
  playLabelDisabled: {color: UI.subtext},

  section:       {marginBottom: 24},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  sectionTitle:  {fontFamily: 'serif', fontSize: 15, fontWeight: '700', color: UI.text, marginBottom: 12},
  sectionValue:  {fontFamily: 'serif', fontSize: 13, color: UI.subtext, fontWeight: '600'},
  slider:        {width: '100%', height: 36},

  folderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  folderCard: {
    width: '47%',
    backgroundColor: UI.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: UI.cardBorder,
  },
  folderCardActive: {
    borderColor: UI.accent,
    backgroundColor: 'rgba(244,232,210,0.14)',
  },
  folderLabel:       {fontFamily: 'serif', fontSize: 15, fontWeight: '700', color: UI.text, marginBottom: 2},
  folderLabelActive: {color: UI.accent},
  folderDesc:        {fontFamily: 'serif', fontSize: 11, color: UI.subtext, lineHeight: 15},

  trackRow: {flexDirection: 'row', gap: 10},
  trackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: UI.cardSolid,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: UI.cardBorder,
  },
  trackBtnActive:     {backgroundColor: UI.accent, borderColor: UI.accent},
  trackBtnText:       {fontFamily: 'serif', fontSize: 15, fontWeight: '600', color: UI.subtext},
  trackBtnTextActive: {color: UI.accentText},
});
