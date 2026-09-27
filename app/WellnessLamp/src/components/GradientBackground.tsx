import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, Image, StyleSheet, View, useWindowDimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Canvas, Fill, Shader, Skia} from '@shopify/react-native-skia';
import {APP_BG_GRADIENTS} from '../theme/colors';
import {splineColor} from '../utils/colorMath';

const glassFoilTexture = require('../assets/glass-foil-texture.jpg');
const AnimatedImage = Animated.createAnimatedComponent(Image);

// Pre-extract each stop's palette for independent spline traversal
const STOP_PALETTES = [0, 1, 2].map(stopIdx =>
  APP_BG_GRADIENTS.map(g => g[stopIdx]),
);

const atmosphere = Skia.RuntimeEffect.Make(`
uniform float time; uniform float width; uniform float height;
float bloom(vec2 p, vec2 o, float r) { vec2 d = p - o; return exp(-dot(d,d) / r); }
half4 main(float2 p) {
  vec2 q = p / vec2(width, height);
  // Broad, luminous colour fields. Their movement is deliberately slow enough
  // to feel like light travelling through frosted glass, not a looping effect.
  float t = time * 1.75;
  float a = bloom(q, vec2(.08 + sin(t*.11)*.16, .27 + cos(t*.09)*.13), .25);
  float b = bloom(q, vec2(.88 + cos(t*.08)*.18, .19 + sin(t*.07)*.12), .29);
  float c = bloom(q, vec2(.61 + sin(t*.06)*.22, .82 + cos(t*.05)*.14), .33);
  float d = bloom(q, vec2(.36 + cos(t*.05+1.8)*.18, .54 + sin(t*.07+2.1)*.16), .30);
  float sum = a + b + c + d;
  vec3 col = (
    vec3(.95,.53,.43)*a +
    vec3(.49,.64,.94)*b +
    vec3(.78,.52,.84)*c +
    vec3(.91,.72,.44)*d
  ) / max(sum, .001);
  // Let the moving light sources remain distinct through the photographic
  // foil overlay while keeping their broad, frosted falloff.
  float colLuma = dot(col, vec3(.299, .587, .114));
  col = mix(vec3(colLuma), col, 1.18);
  float grain = fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453) - .5;
  col += grain * .018;
  float alpha = .075 + min(.48, sum * .36);
  return half4(vec4(col * alpha, alpha));
}`)!;

// A seamless, moving glass surface for the whole app. This deliberately avoids
// a raster tile: its pearlescent micro-grain and caustic light bands scale to
// every device without seams or a repeated photograph-like pattern.
const glassTexture = Skia.RuntimeEffect.Make(`
uniform float time; uniform float width; uniform float height;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
half4 main(float2 p) {
  vec2 q = p / vec2(width, height);
  float t = time * .09;
  vec2 warp = vec2(
    sin(q.y * 13.0 + t * 1.2),
    cos(q.x * 11.0 - t * .9)
  ) * .026;
  float bandsA = .5 + .5 * sin((q.x * .74 + q.y * 1.08 + warp.x) * 16.0 + t);
  float bandsB = .5 + .5 * sin((q.x * 1.16 - q.y * .54 + warp.y) * 12.0 - t * .7);
  float caustic = pow(bandsA, 13.0) * .72 + pow(bandsB, 17.0) * .42;
  float micro = hash(floor(p * .72)) - .5;
  float fleck = step(.9986, hash(floor(p / 14.0) + floor(t * .7)));
  float alpha = .022 + caustic * .038 + micro * .012 + fleck * .07;
  vec3 pearl = mix(vec3(.78, .68, .63), vec3(1.0, .985, .955), clamp(caustic * .72 + .16, 0.0, 1.0));
  return half4(vec4(pearl * alpha, alpha));
}`)!;

export default function GradientBackground({children}: {children: React.ReactNode}) {
  const [colors, setColors] = useState<string[]>(APP_BG_GRADIENTS[0]);
  const [time, setTime] = useState(0);
  const gradientTRef = useRef(0);
  const ambientTRef = useRef(0);
  const {width, height} = useWindowDimensions();
  const textureX = useRef(new Animated.Value(0)).current;
  const textureY = useRef(new Animated.Value(0)).current;

  // The source is intentionally oversized so the image can drift like a
  // slow bouncing light field without ever exposing an empty edge.
  const textureScale = 1.32;
  const sourceAspect = 1600 / 1100;
  const viewportAspect = width / Math.max(height, 1);
  const coverWidth = viewportAspect > sourceAspect ? width : height * sourceAspect;
  const coverHeight = viewportAspect > sourceAspect ? width / sourceAspect : height;
  // Keep a viewport-sized safety margin away from the source perimeter. The
  // downloaded image has a dark photographic edge, so using all mathematical
  // cover overflow would technically avoid blank space but still reveal that
  // edge. The remaining travel is deliberately capped to preserve a safe zone.
  const overflowX = Math.max(0, (coverWidth * textureScale - width) / 2);
  const overflowY = Math.max(0, (coverHeight * textureScale - height) / 2);
  const edgeGuardX = Math.max(32, width * .16);
  const edgeGuardY = Math.max(32, height * .12);
  const textureTravelX = Math.min(Math.max(0, overflowX - edgeGuardX) * .24, width * .12);
  const textureTravelY = Math.min(Math.max(0, overflowY - edgeGuardY) * .22, height * .04);

  useEffect(() => {
    // Continuous smooth interpolation through all gradient presets — no cuts, no fades
    // The base gradient takes minutes to traverse; the visible light fields
    // glide independently in a roughly one-minute breathing cycle.
    const id = setInterval(() => {
      gradientTRef.current += 0.0009;
      ambientTRef.current += 0.06;
      setColors(STOP_PALETTES.map(stops => splineColor(stops, gradientTRef.current)));
      setTime(ambientTRef.current);
    }, 120); // low-rate, deliberate ambient drift
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const driftX = Animated.loop(Animated.sequence([
      Animated.timing(textureX, {toValue: -1, duration: 44000, easing: Easing.inOut(Easing.cubic), useNativeDriver: true}),
      Animated.timing(textureX, {toValue: 1, duration: 72000, easing: Easing.inOut(Easing.cubic), useNativeDriver: true}),
      Animated.timing(textureX, {toValue: 0, duration: 36000, easing: Easing.inOut(Easing.cubic), useNativeDriver: true}),
    ]));
    const driftY = Animated.loop(Animated.sequence([
      Animated.timing(textureY, {toValue: 1, duration: 58000, easing: Easing.inOut(Easing.cubic), useNativeDriver: true}),
      Animated.timing(textureY, {toValue: -1, duration: 82000, easing: Easing.inOut(Easing.cubic), useNativeDriver: true}),
      Animated.timing(textureY, {toValue: 0, duration: 42000, easing: Easing.inOut(Easing.cubic), useNativeDriver: true}),
    ]));
    driftX.start();
    driftY.start();
    return () => {
      driftX.stop();
      driftY.stop();
    };
  }, [textureX, textureY]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <Canvas pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Fill><Shader source={atmosphere} uniforms={{time, width, height}} /></Fill>
      </Canvas>
      <AnimatedImage
        pointerEvents="none"
        source={glassFoilTexture}
        resizeMode="cover"
        style={[styles.glassFoil, {
          opacity: .10,
          transform: [
            {scale: textureScale},
            {translateX: textureX.interpolate({inputRange: [-1, 1], outputRange: [-textureTravelX, textureTravelX]})},
            {translateY: textureY.interpolate({inputRange: [-1, 1], outputRange: [-textureTravelY, textureTravelY]})},
          ],
        }]}
      />
      <Canvas pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Fill><Shader source={glassTexture} uniforms={{time, width, height}} /></Fill>
      </Canvas>
      <View pointerEvents="none" style={styles.vignette} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  glassFoil: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0},
  vignette: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(93,72,57,0.045)'},
});
