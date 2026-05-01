import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { theme } from '../constants/theme'

export default function FloatingAddMenu() {
  const [open, setOpen] = useState(false)

  const goTo = (path: string) => {
    setOpen(false)
    router.push(path as any)
  }

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 28,
        height: 270,
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 100,
      }}
      pointerEvents="box-none"
    >
      {open && (
        <View
          style={{
            position: 'absolute',
            bottom: 92,
            left: 0,
            right: 0,
            height: 170,
          }}
          pointerEvents="box-none"
        >
          <Connector style={{ left: '30%', bottom: 28, transform: [{ rotate: '-42deg' }] }} />
          <Connector style={{ alignSelf: 'center', bottom: 18 }} />
          <Connector style={{ right: '30%', bottom: 28, transform: [{ rotate: '42deg' }] }} />

          <ActionBubble
            label="AGGIUNGI\nMISURAZIONE"
            icon="📏"
            position={{ left: 24, bottom: 52 }}
            onPress={() => goTo('/add-measurement')}
          />

          <ActionBubble
            label="AGGIUNGI\nALLENAMENTO"
            icon="🏋️"
            position={{ alignSelf: 'center', bottom: 100 }}
            onPress={() => goTo('/add-workout')}
          />

          <ActionBubble
            label="AGGIUNGI\nPASTO"
            icon="🥗"
            position={{ right: 24, bottom: 52 }}
            onPress={() => goTo('/add-meal')}
          />
        </View>
      )}

      <Pressable
        onPress={() => setOpen(!open)}
        style={{
          width: 74,
          height: 74,
          borderRadius: 37,
          backgroundColor: 'rgba(8, 13, 16, 0.95)',
          borderWidth: 3,
          borderColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: theme.colors.primaryGlow,
          shadowOpacity: 1,
          shadowRadius: 22,
          elevation: 18,
        }}
      >
        <Text
          style={{
            color: theme.colors.primaryGlow,
            fontSize: 46,
            lineHeight: 50,
            fontFamily: 'Orbitron_700Bold',
            textShadowColor: theme.colors.primaryGlow,
            textShadowRadius: 18,
          }}
        >
          {open ? '×' : '+'}
        </Text>
      </Pressable>
    </View>
  )
}

function ActionBubble({
  label,
  icon,
  position,
  onPress,
}: {
  label: string
  icon: string
  position: any
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: 'absolute',
        width: 126,
        height: 126,
        borderRadius: 28,
        backgroundColor: 'rgba(8, 13, 16, 0.94)',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primaryGlow,
        shadowOpacity: 0.8,
        shadowRadius: 18,
        elevation: 16,
        ...position,
      }}
    >
      <Text
        style={{
          fontSize: 32,
          marginBottom: 10,
        }}
      >
        {icon}
      </Text>

      <Text
        style={{
          color: theme.colors.white,
          fontSize: 11,
          lineHeight: 17,
          textAlign: 'center',
          letterSpacing: 1.2,
          fontFamily: 'Orbitron_700Bold',
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

function Connector({ style }: { style: any }) {
  return (
    <View
      style={{
        position: 'absolute',
        width: 2,
        height: 90,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: theme.colors.primary,
        opacity: 0.9,
        ...style,
      }}
    />
  )
}