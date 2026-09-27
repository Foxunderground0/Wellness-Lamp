import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// A warm, almost imperceptible glass grain. It keeps eggshell surfaces from
// reading as flat grey blocks without turning them into a patterned UI.
export default function FrostedTexture() {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,.34)', 'rgba(255,255,255,0)']}
        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
        style={styles.sheen}
      />
      <View style={[styles.spec, {top: '22%', left: '16%'}]} />
      <View style={[styles.spec, {top: '66%', left: '72%', opacity: .55}]} />
      <View style={[styles.spec, {top: '44%', left: '48%', opacity: .35}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden'},
  sheen: {position: 'absolute', width: '140%', height: '180%', left: '-25%', top: '-42%', opacity: .65, transform: [{rotate: '-18deg'}]},
  spec: {position: 'absolute', width: 2, height: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.55)'},
});
