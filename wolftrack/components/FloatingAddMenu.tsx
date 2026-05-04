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
    <>
      {/* MENU FLOATING + */}
      {open && (
        <>
          {/* Overlay */}
          <Pressable
            onPress={() => setOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 90,
            }}
          />

          {/* Azioni sopra il + */}
          <View
            style={{
              position: 'absolute',
              bottom: 110,
              left: 0,
              right: 0,
              alignItems: 'center',
              zIndex: 100,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <ActionBubble
                label="Misura"
                icon="📏"
                onPress={() => goTo('/add-measurement')}
              />

              <ActionBubble
                label="Allenamento"
                icon="🏋️"
                onPress={() => goTo('/add-workout')}
                highlighted
              />

              <ActionBubble
                label="Pasto"
                icon="🥗"
                onPress={() => goTo('/add-meal')}
              />
            </View>
          </View>
        </>
      )}

      {/* BOTTOM BAR */}
      <View
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 20,
          height: 76,
          borderRadius: 28,
          backgroundColor: 'rgba(8, 13, 16, 0.96)',
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          zIndex: 100,
        }}
      >
        <MenuItem
          label="Misure"
          icon="📏"
          onPress={() => goTo('/measurements')}
        />

        <MenuItem
          label="Pasti"
          icon="🥗"
          onPress={() => goTo('/meals')}
        />

        {/* + CENTRALE */}
        <Pressable
          onPress={() => setOpen(!open)}
          style={{
            width: 68,
            height: 68,
            borderRadius: 34,
            backgroundColor: open
              ? theme.colors.primary
              : 'rgba(8, 13, 16, 0.96)',
            borderWidth: 2,
            borderColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -34,
          }}
        >
          <Text
            style={{
              color: open ? '#020405' : theme.colors.primary,
              fontSize: 42,
              fontFamily: 'Orbitron_700Bold',
            }}
          >
            {open ? '×' : '+'}
          </Text>
        </Pressable>

        <MenuItem
          label="Report"
          icon="📊"
          onPress={() => goTo('/reports')}
        />

        <MenuItem
          label="Obiettivi"
          icon="🎯"
          onPress={() => goTo('/goals')}
        />
      </View>
    </>
  )
}

function MenuItem({
  label,
  icon,
  onPress,
}: {
  label: string
  icon: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 20 }}>{icon}</Text>

      <Text
        style={{
          color: theme.colors.white,
          fontSize: 8,
          fontFamily: 'Orbitron_700Bold',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

function ActionBubble({
  label,
  icon,
  onPress,
  highlighted = false,
}: {
  label: string
  icon: string
  onPress: () => void
  highlighted?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: highlighted ? 110 : 100,
        height: highlighted ? 110 : 100,
        borderRadius: 24,
        backgroundColor: highlighted
          ? 'rgba(0, 174, 234, 0.18)'
          : 'rgba(8, 13, 16, 0.96)',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: highlighted ? 32 : 28 }}>{icon}</Text>

      <Text
        style={{
          color: theme.colors.white,
          fontSize: 9,
          marginTop: 6,
          fontFamily: 'Orbitron_700Bold',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}