// ColourOrb.tsx: the Light screen's colour picker orb (screen R-4 in FINAL_screens.html). Not an animation:
// the wheel is drawn once; dragging only moves the knob and reports the colour.
// "Round for the colour, toward the centre for whiter." 290 dp box, wheel radius 0.62 of the half-box.
// Status: production-ready once checked on a phone.

import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';
import { labHex, type Hex, type Lab } from '../colour';
import { COLOUR_ORB_SKSL, WHEEL_R, wheelLab } from './colourOrbShader';

const effect = Skia.RuntimeEffect.Make(COLOUR_ORB_SKSL);

export type ColourOrbProps = {
  /** Box size in dp. FINAL: 290. */
  size?: number;
  /** Where the knob starts, in wheel units (-1..1, y down). FINAL's Remote starts at (0.62, -0.45), the Light screen at (-0.8, -0.56). */
  start?: [number, number];
  /** Called on every move. `hex` is the picked colour; `lab` is the same in OKLab. A palette is built from it (lab/palettes.ts). */
  onChange?: (hex: Hex, lab: Lab) => void;
};

export function ColourOrb({ size = 290, start = [-0.8, -0.56], onChange }: ColourOrbProps) {
  const R = (WHEEL_R * size) / 2;
  const [pos, setPos] = useState({ x: start[0] * R, y: start[1] * R });
  const [hex, setHex] = useState<Hex>(() => labHex(wheelLab(start[0], start[1])));
  const origin = useRef({ x: 0, y: 0 });

  const set = (x: number, y: number) => {
    const d = Math.hypot(x, y);
    if (d > R) { x *= R / d; y *= R / d; }
    const lab = wheelLab(x / R, y / R);
    const h = labHex(lab);
    setPos({ x, y });
    setHex(h);
    onChange?.(h, lab);
  };

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: e => {
      origin.current = { x: e.nativeEvent.locationX - size / 2, y: e.nativeEvent.locationY - size / 2 };
      set(origin.current.x, origin.current.y);
    },
    onPanResponderMove: (_e, g) => set(origin.current.x + g.dx, origin.current.y + g.dy),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [size, R]);

  if (!effect) return null;
  return (
    <View style={{ width: size, height: size }} {...pan.panHandlers}>
      <Canvas style={{ width: size, height: size }} pointerEvents="none">
        <Rect x={0} y={0} width={size} height={size}>
          <Shader source={effect} uniforms={{ uRes: [size, size] }} />
        </Rect>
      </Canvas>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', width: 26, height: 26, borderRadius: 13, left: size / 2 + pos.x - 13, top: size / 2 + pos.y - 13,
          backgroundColor: hex, borderWidth: 3, borderColor: '#fff',
          shadowColor: '#211c17', elevation: 3,
        }}
      />
    </View>
  );
}
