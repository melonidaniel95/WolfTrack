// components/HumanMuscleMap.tsx
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { theme } from '../constants/theme'

type Section = 'upper' | 'lower'

type Props = {
  selectedMuscle: string
  onSelectMuscle: (muscle: string) => void
}

const UPPER_MUSCLES = [
  'Petto',
  'Schiena',
  'Spalle',
  'Bicipiti',
  'Tricipiti',
  'Avambracci',
  'Addome',
]

const LOWER_MUSCLES = [
  'Gambe',
  'Glutei',
  'Quadricipiti',
  'Femorali',
  'Polpacci',
]

const EXTRA = ['Cardio']

export default function HumanMuscleMap({
  selectedMuscle,
  onSelectMuscle,
}: Props) {
  const [section, setSection] = useState<Section>('upper')

  const muscles = section === 'upper' ? UPPER_MUSCLES : LOWER_MUSCLES
  const extras = section === 'lower' ? EXTRA : []

  return (
    <View style={{ marginVertical: 8 }}>
      <View style={toggleWrap}>
        <Pressable
          onPress={() => setSection('upper')}
          style={[toggleButton, section === 'upper' && toggleActive]}
        >
          <Text style={[toggleText, section === 'upper' && toggleTextActive]}>
            Parte alta
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSection('lower')}
          style={[toggleButton, section === 'lower' && toggleActive]}
        >
          <Text style={[toggleText, section === 'lower' && toggleTextActive]}>
            Parte bassa
          </Text>
        </Pressable>
      </View>

      <Text style={sectionTitle}>Fasce muscolari</Text>

      <View style={muscleGrid}>
        {muscles.map((muscle) => {
          const active = selectedMuscle === muscle

          return (
            <Pressable
              key={muscle}
              onPress={() => onSelectMuscle(muscle)}
              style={[muscleCard, active && muscleCardActive]}
            >
              <Text style={[muscleText, active && muscleTextActive]}>
                {muscle}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {extras.length > 0 && (
        <>
          <Text style={sectionTitle}>Attività</Text>

          <View style={muscleGrid}>
            {extras.map((item) => {
              const active = selectedMuscle === item

              return (
                <Pressable
                  key={item}
                  onPress={() => onSelectMuscle(item)}
                  style={[muscleCard, active && muscleCardActive]}
                >
                  <Text style={[muscleText, active && muscleTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </>
      )}
    </View>
  )
}

const toggleWrap = {
  flexDirection: 'row' as const,
  borderWidth: 1,
  borderColor: theme.colors.primary,
  borderRadius: 18,
  padding: 4,
  marginBottom: 18,
  backgroundColor: 'rgba(8, 13, 16, 0.96)',
}

const toggleButton = {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 14,
  alignItems: 'center' as const,
}

const toggleActive = {
  backgroundColor: theme.colors.primary,
}

const toggleText = {
  color: theme.colors.white,
  fontSize: 11,
  fontFamily: 'Orbitron_700Bold',
  textTransform: 'uppercase' as const,
}

const toggleTextActive = {
  color: '#020405',
}

const sectionTitle = {
  color: theme.colors.white,
  fontSize: 12,
  marginTop: 12,
  marginBottom: 10,
  letterSpacing: 1,
  fontFamily: 'Orbitron_700Bold',
  textTransform: 'uppercase' as const,
}

const muscleGrid = {
  flexDirection: 'row' as const,
  flexWrap: 'wrap' as const,
  gap: 10,
}

const muscleCard = {
  width: '47%' as const,
  minHeight: 66,
  borderWidth: 1,
  borderColor: theme.colors.primary,
  borderRadius: 18,
  padding: 14,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  backgroundColor: 'rgba(8, 13, 16, 0.96)',
}

const muscleCardActive = {
  backgroundColor: theme.colors.primary,
}

const muscleText = {
  color: theme.colors.white,
  fontSize: 12,
  fontFamily: 'Orbitron_700Bold',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
}

const muscleTextActive = {
  color: '#020405',
}