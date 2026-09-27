import React, {useEffect, useRef, useState} from 'react';
import {Animated, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppScreen} from '../types';
import {UI} from '../theme/colors';
import FrostedTexture from './FrostedTexture';

interface Props {
  active: AppScreen;
  onSelect: (s: AppScreen) => void;
}

const TABS: {id: AppScreen; label: string; icon: string}[] = [
  {id: 'glow',   label: 'Glow',   icon: '◉'},
  {id: 'feel',   label: 'Feel',   icon: '◎'},
  {id: 'themes', label: 'Themes', icon: '⬡'},
  {id: 'hue',    label: 'Hue',    icon: '◌'},
  {id: 'sound',  label: 'Sound',  icon: '♪'},
];

export default function BottomNav({active, onSelect}: Props) {
  const activeIndex = TABS.findIndex(tab => tab.id === active);
  const insets = useSafeAreaInsets();
  const [navWidth, setNavWidth] = useState(0);
  const indicator = useRef(new Animated.Value(0)).current;
  const tabWidth = navWidth ? (navWidth - 16) / TABS.length : 0;
  const onLayout = (event: LayoutChangeEvent) => setNavWidth(event.nativeEvent.layout.width);
  useEffect(() => {
    if (!tabWidth) { return; }
    Animated.spring(indicator, {toValue: activeIndex * tabWidth + 8, damping: 18, stiffness: 180, mass: .7, useNativeDriver: true}).start();
  }, [activeIndex, indicator, tabWidth]);
  return (
    // Gradient runs top→bottom: semi-transparent at top blending into solid at bottom
    <LinearGradient
      colors={['rgba(255,252,246,0.48)', 'rgba(255,250,244,0.94)']}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={[styles.nav, {paddingBottom: insets.bottom + 10, marginBottom: -insets.bottom}]}
      onLayout={onLayout}>
      <FrostedTexture />
      <Animated.View pointerEvents="none" style={[styles.indicator, {width: tabWidth || 64, transform: [{translateX: indicator}]}]} />
      {TABS.map(tab => {
        const isActive = tab.id === active;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onSelect(tab.id)}
            activeOpacity={0.7}>
            <Text style={[styles.icon,  isActive && styles.activeIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(86,70,57,0.12)',
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    transform: [{translateY: 4}],
    gap: 3,
  },
  icon:        {fontFamily: 'serif', fontSize: 22, color: UI.subtext},
  activeIcon:  {color: '#322f29'},
  label:       {fontFamily: 'serif', fontSize: 11, color: UI.subtext, fontWeight: '500'},
  activeLabel: {color: '#322f29', fontWeight: '700'},
  // Covers the icon and its label together, rather than only the icon row.
  indicator: {position: 'absolute', top: 18, left: 0, height: 58, borderRadius: 22, backgroundColor: 'rgba(255,249,238,0.94)'},
});
