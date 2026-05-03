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
        bottom: 20,
        height: 250,
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 100,
      }}
      pointerEvents="box-none"
    >
      {open && (
        <>
          <Pressable
            onPress={() => setOpen(false)}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: -900,
              bottom: -40,
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
          />

          <View
            style={{
              position: 'absolute',
              bottom: 88,
              left: 0,
              right: 0,
              height: 150,
            }}
            pointerEvents="box-none"
          >
            <ActionBubble
              label="Misurazione"
              icon="📏"
              position={{ left: 20, bottom: 34 }}
              onPress={() => goTo('/add-measurement')}
            />

            <ActionBubble
              label="Allenamento"
              icon="🏋️"
              position={{ alignSelf: 'center', bottom: 92 }}
              onPress={() => goTo('/add-workout')}
              highlighted
            />

            <ActionBubble
              label="Pasto"
              icon="🥗"
              position={{ right: 20, bottom: 34 }}
              onPress={() => goTo('/add-meal')}
            />
          </View>
        </>
      )}

      <Pressable
        onPress={() => setOpen(!open)}
        style={{
          width: 68,
          height: 68,
          borderRadius: 34,
          backgroundColor: open ? theme.colors.primary : 'rgba(8, 13, 16, 0.96)',
          borderWidth: 2,
          borderColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: theme.colors.primaryGlow,
          shadowOpacity: 1,
          shadowRadius: 18,
          elevation: 18,
        }}
      >
        <Text
          style={{
            color: open ? '#020405' : theme.colors.primaryGlow,
            fontSize: 42,
            lineHeight: 46,
            fontFamily: 'Orbitron_700Bold',
            textShadowColor: open ? 'transparent' : theme.colors.primaryGlow,
            textShadowRadius: 14,
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
  highlighted = false,
}: {
  label: string
  icon: string
  position: any
  onPress: () => void
  highlighted?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: 'absolute',
        width: highlighted ? 120 : 108,
        height: highlighted ? 120 : 108,
        borderRadius: 30,
        backgroundColor: highlighted
          ? 'rgba(0, 174, 234, 0.18)'
          : 'rgba(8, 13, 16, 0.96)',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primaryGlow,
        shadowOpacity: highlighted ? 0.9 : 0.55,
        shadowRadius: highlighted ? 18 : 12,
        elevation: highlighted ? 16 : 12,
        ...position,
      }}
    >
      <Text style={{ fontSize: highlighted ? 34 : 30, marginBottom: 8 }}>
        {icon}
      </Text>

      <Text
        style={{
          color: theme.colors.white,
          fontSize: 10,
          textAlign: 'center',
          letterSpacing: 1.2,
          fontFamily: 'Orbitron_700Bold',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}