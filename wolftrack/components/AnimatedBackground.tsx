import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

export default function AnimatedBackground() {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.25, { duration: 5000 }), -1, true)
    opacity.value = withRepeat(withTiming(0.8, { duration: 3000 }), -1, true)
  }, [])

  const circleAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const pulseAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Glow circolare */}
      <Animated.View style={[styles.circle, circleAnim]} />
      <Animated.View style={[styles.circle2, circleAnim]} />

      {/* Pattern Maori */}
      <View style={styles.maoriContainer}>
        <View style={styles.maoriLine} />
        <View style={styles.maoriLine2} />
      </View>

      {/* Battito cardiaco */}
      <Animated.Text style={[styles.heartbeat, pulseAnim]}>
        ──╱╲─╱╲╱╲──╱╲──
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 174, 234, 0.15)',
    top: -120,
    right: -90,
  },
  circle2: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
    bottom: -140,
    left: -110,
  },

  maoriContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },

  maoriLine: {
    height: 2,
    marginHorizontal: 40,
    backgroundColor: 'rgba(0, 174, 234, 0.15)',
    borderRadius: 2,
  },

  maoriLine2: {
    height: 2,
    marginHorizontal: 80,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    borderRadius: 2,
  },

  heartbeat: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    color: '#00E0FF',
    fontSize: 42,
    letterSpacing: -4,
    textShadowColor: '#00E0FF',
    textShadowRadius: 20,
  },
})