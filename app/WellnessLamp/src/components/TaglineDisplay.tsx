import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet} from 'react-native';
import {UI} from '../theme/colors';

export default function TaglineDisplay({taglines}: {taglines: string[]}) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(taglines[0] ?? '');
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (taglines.length === 0) {
      return;
    }
    setText(taglines[0]);
    setIdx(0);
    fade.setValue(1);
  }, [taglines, fade]);

  useEffect(() => {
    if (taglines.length <= 1) {
      return;
    }
    const timer = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }).start(() => {
        const next = (idx + 1) % taglines.length;
        setIdx(next);
        setText(taglines[next]);
        Animated.timing(fade, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }).start();
      });
    }, 4200);
    return () => clearTimeout(timer);
  }, [idx, taglines, fade]);

  return (
    <Animated.Text style={[styles.tagline, {opacity: fade}]}>
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  tagline: {
    fontFamily: 'serif',
    fontSize: 15,
    color: UI.subtext,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 36,
    lineHeight: 23,
  },
});
