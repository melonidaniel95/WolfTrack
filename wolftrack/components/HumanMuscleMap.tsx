// components/HumanMuscleMap.tsx
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { theme } from '../constants/theme'

type Section = 'upper' | 'lower' | 'cardio'

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

const CARDIO_ACTIVITIES = [
  'Corsa',
  'Camminata',
  'Bici',
  'Salto corda',
  'HIIT',
  'Circuito',
]

const WORK_TYPES = [
  'Forza',
  'Resistenza',
  'Fiato',
  'Agilità',
  'Coordinazione',
  'Velocità',
  'Mobilità',
]

export default function HumanMuscleMap({
  selectedMuscle,
  onSelectMuscle,
}: Props) {
  const [section, setSection] = useState<Section>('upper')
  const [selectedWorkType, setSelectedWorkType] = useState('')

  const items =
    section === 'upper'
      ? UPPER_MUSCLES
      : section === 'lower'
        ? LOWER_MUSCLES
        : CARDIO_ACTIVITIES

  return (
    <View style={{ marginVertical: 8 }}>

      {/* TOGGLE CON 3 SCELTE */}
      <View style={toggleWrap}>
        <Pressable
          onPress={() => setSection('upper')}
          style={[toggleButton, section === 'upper' && toggleActive]}
        >
          <Text style={icon}>💪</Text>
          <Text style={[toggleText, section === 'upper' && toggleTextActive]}>
            Alta
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSection('lower')}
          style={[toggleButton, section === 'lower' && toggleActive]}
        >
          <Text style={icon}>🦵</Text>
          <Text style={[toggleText, section === 'lower' && toggleTextActive]}>
            Bassa
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSection('cardio')}
          style={[toggleButton, section === 'cardio' && toggleActive]}
        >
          <Text style={icon}>❤️</Text>
          <Text style={[toggleText, section === 'cardio' && toggleTextActive]}>
            Cardio
          </Text>
        </Pressable>
      </View>

      {/* LISTA MUSCOLI O ATTIVITÀ CARDIO */}
      <View style={muscleGrid}>
        {items.map((item) => {
          const active = selectedMuscle === item

          return (
            <Pressable
              key={item}
              onPress={() => onSelectMuscle(item)}
              style={[muscleCard, active && muscleCardActive]}
            >
              <Text style={muscleIcon}>
                {section === 'cardio' ? '⚡' : '🔥'}
              </Text>

              <Text style={[muscleText, active && muscleTextActive]}>
                {item}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* TIPO DI LAVORO */}
      <Text style={sectionTitle}>Tipo di lavoro</Text>

      <View style={workTypeGrid}>
        {WORK_TYPES.map((type) => {
          const active = selectedWorkType === type

          return (
            <Pressable
              key={type}
              onPress={() => setSelectedWorkType(type)}
              style={[workTypeChip, active && muscleCardActive]}
            >
              <Text style={[workTypeText, active && muscleTextActive]}>
                {type}
              </Text>
            </Pressable>
          )
        })}
      </View>
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

const icon = {
  fontSize: 16,
  marginBottom: 4,
}

const muscleGrid = {
  flexDirection: 'row' as const,
  flexWrap: 'wrap' as const,
  gap: 10,
}

const muscleCard = {
  width: '47%' as const,
  minHeight: 70,
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

const muscleIcon = {
  fontSize: 18,
  marginBottom: 6,
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

const sectionTitle = {
  color: theme.colors.white,
  fontSize: 12,
  fontFamily: 'Orbitron_700Bold',
  textTransform: 'uppercase' as const,
  marginTop: 18,
  marginBottom: 10,
}

const workTypeGrid = {
  flexDirection: 'row' as const,
  flexWrap: 'wrap' as const,
  gap: 8,
}

const workTypeChip = {
  borderWidth: 1,
  borderColor: theme.colors.primary,
  borderRadius: 999,
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: 'rgba(8, 13, 16, 0.96)',
}

const workTypeText = {
  color: theme.colors.white,
  fontSize: 10,
  fontFamily: 'Orbitron_700Bold',
  textTransform: 'uppercase' as const,
}