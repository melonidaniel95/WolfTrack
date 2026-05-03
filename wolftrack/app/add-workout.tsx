import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import HumanMuscleMap from '../components/HumanMuscleMap'
import { router } from 'expo-router'
import { supabase } from '../lib/supabase'
import { theme } from '../constants/theme'

const EXERCISES: Record<string, string[]> = {
  Petto: ['Panca piana', 'Panca inclinata', 'Croci manubri', 'Push up'],
  Schiena: ['Lat machine', 'Rematore', 'Pulley', 'Trazioni'],
  Spalle: ['Military press', 'Alzate laterali', 'Arnold press'],
  Bicipiti: ['Curl bilanciere', 'Curl manubri', 'Curl martello'],
  Tricipiti: ['Push down', 'French press', 'Dip'],
  Avambracci: ['Curl inverso', 'Wrist curl', 'Farmer walk', 'Dead hang'],
  Addome: ['Crunch', 'Plank', 'Leg raise'],

  Gambe: ['Squat', 'Leg press', 'Affondi', 'Leg extension'],
  Glutei: ['Hip thrust', 'Squat sumo', 'Affondi', 'Stacco rumeno'],
  Quadricipiti: ['Squat', 'Leg extension', 'Leg press', 'Affondi'],
  Femorali: ['Leg curl', 'Stacco rumeno', 'Good morning'],
  Polpacci: ['Calf raise', 'Standing calf raise', 'Seated calf raise'],
  Cardio: [
  'Corsa',
  'Camminata',
  'Camminata veloce',
  'Cyclette',
  'Ellittica',
  'Salto corda',
  'HIIT',
],
}

export default function AddWorkout() {
  const [muscle, setMuscle] = useState('Petto')
  const [exercise, setExercise] = useState(EXERCISES.Petto[0])
  const [duration, setDuration] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [loading, setLoading] = useState(false)

  const changeMuscle = (value: string) => {
    setMuscle(value)
    setExercise(EXERCISES[value]?.[0] ?? '')
  }

  const saveWorkout = async () => {
    if (!duration || !sets || !reps || !exercise) {
      Alert.alert('Errore', 'Compila durata, esercizio, serie e ripetizioni')
      return
    }

    setLoading(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setLoading(false)
      Alert.alert('Errore', 'Utente non autenticato')
      return
    }

    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        type: muscle,
        duration_minutes: Number(duration),
      })
      .select()
      .single()

    if (workoutError) {
      setLoading(false)
      Alert.alert('Errore', workoutError.message)
      return
    }

    const { error: exerciseError } = await supabase
      .from('workout_exercises')
      .insert({
        workout_id: workout.id,
        muscle_group: muscle,
        exercise_name: exercise,
        sets: Number(sets),
        reps: Number(reps),
        weight_kg: Number(weight || 0),
      })

    setLoading(false)

    if (exerciseError) {
      Alert.alert('Errore', exerciseError.message)
      return
    }

    Alert.alert('Salvato', 'Allenamento registrato correttamente')
    router.back()
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
        <Text style={title}>Nuovo Allenamento</Text>
        <Text style={subtitle}>Tocca un muscolo, scegli l’esercizio e salva i dettagli.</Text>

        <Text style={label}>Corpo umano</Text>

        <View style={mapCard}>
          <HumanMuscleMap
            selectedMuscle={muscle}
            onSelectMuscle={changeMuscle}
          />
        </View>

        <View style={selectedBox}>
          <Text style={selectedLabel}>Muscolo selezionato</Text>
          <Text style={selectedValue}>{muscle}</Text>
        </View>

        <Text style={label}>Esercizio</Text>

        <View style={grid}>
          {EXERCISES[muscle].map((item) => (
            <Pressable
              key={item}
              onPress={() => setExercise(item)}
              style={[exerciseCard, exercise === item && chipActive]}
            >
              <Text style={[chipText, exercise === item && chipTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={label}>Durata allenamento</Text>
        <TextInput
          value={duration}
          onChangeText={setDuration}
          placeholder="Es. 45"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="numeric"
          style={input}
        />

        <Text style={label}>Serie</Text>
        <TextInput
          value={sets}
          onChangeText={setSets}
          placeholder="Es. 4"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="numeric"
          style={input}
        />

        <Text style={label}>Ripetizioni</Text>
        <TextInput
          value={reps}
          onChangeText={setReps}
          placeholder="Es. 10"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="numeric"
          style={input}
        />

        <Text style={label}>Peso kg</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          placeholder="Es. 60"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="numeric"
          style={input}
        />

        <Pressable onPress={saveWorkout} disabled={loading} style={button}>
          <Text style={buttonText}>
            {loading ? 'Salvataggio...' : 'Salva Allenamento'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const title = {
  color: theme.colors.white,
  fontSize: 24,
  fontFamily: 'Orbitron_700Bold',
}

const subtitle = {
  color: theme.colors.white,
  opacity: 0.7,
  marginTop: 8,
  marginBottom: 24,
}

const label = {
  color: theme.colors.white,
  fontSize: 12,
  marginTop: 20,
  marginBottom: 10,
  letterSpacing: 1,
  fontFamily: 'Orbitron_700Bold',
  textTransform: 'uppercase' as const,
}

const mapCard = {
  borderWidth: 1,
  borderColor: theme.colors.primary,
  borderRadius: 24,
  backgroundColor: 'rgba(8, 13, 16, 0.96)',
  paddingVertical: 12,
  overflow: 'hidden' as const,
}

const selectedBox = {
  marginTop: 14,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: theme.colors.primary,
  backgroundColor: 'rgba(0, 174, 234, 0.12)',
  padding: 16,
}

const selectedLabel = {
  color: theme.colors.white,
  opacity: 0.65,
  fontSize: 11,
  marginBottom: 6,
  letterSpacing: 1,
  fontFamily: 'Orbitron_700Bold',
  textTransform: 'uppercase' as const,
}

const selectedValue = {
  color: theme.colors.primaryGlow,
  fontSize: 20,
  fontFamily: 'Orbitron_700Bold',
}

const grid = {
  flexDirection: 'row' as const,
  flexWrap: 'wrap' as const,
  gap: 10,
}

const exerciseCard = {
  width: '47%' as const,
  minHeight: 70,
  borderWidth: 1,
  borderColor: theme.colors.primary,
  borderRadius: 18,
  padding: 14,
  justifyContent: 'center' as const,
  backgroundColor: 'rgba(8, 13, 16, 0.96)',
}

const chipActive = {
  backgroundColor: theme.colors.primary,
}

const chipText = {
  color: theme.colors.white,
  fontSize: 12,
  fontFamily: 'Orbitron_700Bold',
}

const chipTextActive = {
  color: '#020405',
}

const input = {
  height: 56,
  borderRadius: 16,
  borderWidth: 1.5,
  borderColor: theme.colors.primary,
  backgroundColor: 'rgba(8, 13, 16, 0.96)',
  color: theme.colors.white,
  paddingHorizontal: 16,
  fontSize: 15,
}

const button = {
  marginTop: 32,
  height: 58,
  borderRadius: 18,
  backgroundColor: theme.colors.primary,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  shadowColor: theme.colors.primaryGlow,
  shadowOpacity: 0.8,
  shadowRadius: 16,
  elevation: 12,
}

const buttonText = {
  color: '#020405',
  fontSize: 14,
  letterSpacing: 1.2,
  fontFamily: 'Orbitron_700Bold',
  textTransform: 'uppercase' as const,
}