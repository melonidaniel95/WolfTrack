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
import { router } from 'expo-router'
import HumanMuscleMap from '../components/HumanMuscleMap'
import { supabase } from '../lib/supabase'
import { theme } from '../constants/theme'

const EXERCISES: Record<string, string[]> = {
  Petto: ['Panca piana', 'Panca inclinata', 'Croci manubri', 'Push up'],
  Schiena: ['Lat machine', 'Rematore', 'Pulley', 'Trazioni'],
  Spalle: ['Military press', 'Alzate laterali', 'Arnold press'],
  Bicipiti: ['Curl bilanciere', 'Curl manubri', 'Curl martello'],
  Tricipiti: ['Push down', 'French press', 'Dip'],
  Avambracci: ['Curl inverso', 'Wrist curl', 'Farmer walk'],
  Addome: ['Crunch', 'Plank', 'Leg raise'],

  Gambe: ['Squat', 'Leg press', 'Affondi', 'Leg extension'],
  Glutei: ['Hip thrust', 'Squat sumo', 'Stacco rumeno'],
  Quadricipiti: ['Leg extension', 'Leg press', 'Squat'],
  Femorali: ['Leg curl', 'Stacco rumeno', 'Good morning'],
  Polpacci: ['Calf raise', 'Standing calf raise'],

  Cardio: ['Corsa', 'Camminata', 'Camminata veloce', 'Cyclette', 'Ellittica', 'HIIT'],
}

type ExerciseRow = {
  id: string
  muscle: string
  exercise: string
  sets: string
  reps: string
  weight: string
}

export default function AddWorkout() {
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [duration, setDuration] = useState('')
  const [muscle, setMuscle] = useState('Petto')
  const [exercise, setExercise] = useState(EXERCISES.Petto[0])
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [items, setItems] = useState<ExerciseRow[]>([])
  const [loading, setLoading] = useState(false)

  const changeMuscle = (value: string) => {
    setMuscle(value)
    setExercise(EXERCISES[value]?.[0] ?? '')
  }

  const addExercise = () => {
    if (!exercise) {
      Alert.alert('Errore', 'Seleziona un esercizio')
      return
    }

    if (muscle !== 'Cardio' && (!sets || !reps)) {
      Alert.alert('Errore', 'Inserisci serie e ripetizioni')
      return
    }

    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        muscle,
        exercise,
        sets: muscle === 'Cardio' ? '0' : sets,
        reps: muscle === 'Cardio' ? '0' : reps,
        weight: muscle === 'Cardio' ? '0' : weight || '0',
      },
    ])

    setSets('')
    setReps('')
    setWeight('')
  }

  const removeExercise = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const saveSession = async () => {
    if (!date) {
      Alert.alert('Errore', 'Inserisci una data')
      return
    }

    if (!duration) {
      Alert.alert('Errore', 'Inserisci la durata della sessione')
      return
    }

    if (items.length === 0) {
      Alert.alert('Errore', 'Aggiungi almeno un esercizio')
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
        type: 'Sessione allenamento',
        duration_minutes: Number(duration),
        created_at: `${date} 12:00:00`,
      })
      .select()
      .single()

    if (workoutError) {
      setLoading(false)
      Alert.alert('Errore', workoutError.message)
      return
    }

    const exercisesToInsert = items.map((item) => ({
      workout_id: workout.id,
      muscle_group: item.muscle,
      exercise_name: item.exercise,
      sets: Number(item.sets || 0),
      reps: Number(item.reps || 0),
      weight_kg: Number(item.weight || 0),
    }))

    const { error: exercisesError } = await supabase
      .from('workout_exercises')
      .insert(exercisesToInsert)

    setLoading(false)

    if (exercisesError) {
      Alert.alert('Errore', exercisesError.message)
      return
    }

    Alert.alert('Salvato', 'Sessione di allenamento salvata correttamente')
    router.back()
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Text style={title}>Nuova Sessione</Text>
        <Text style={subtitle}>Crea una sessione e aggiungi tutti gli esercizi che vuoi.</Text>

        <Text style={label}>Data sessione</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={input}
        />

        <Text style={label}>Durata totale minuti</Text>
        <TextInput
          value={duration}
          onChangeText={setDuration}
          placeholder="Es. 60"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="numeric"
          style={input}
        />

        <Text style={label}>Seleziona categoria</Text>
        <View style={mapCard}>
          <HumanMuscleMap
            selectedMuscle={muscle}
            onSelectMuscle={changeMuscle}
          />
        </View>

        <Text style={label}>Esercizio</Text>
        <View style={grid}>
          {EXERCISES[muscle]?.map((item) => (
            <Pressable
              key={item}
              onPress={() => setExercise(item)}
              style={[exerciseCard, exercise === item && activeCard]}
            >
              <Text style={[cardText, exercise === item && activeText]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {muscle !== 'Cardio' && (
          <>
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
          </>
        )}

        <Pressable onPress={addExercise} style={secondaryButton}>
          <Text style={secondaryButtonText}>Aggiungi esercizio</Text>
        </Pressable>

        <Text style={label}>Esercizi nella sessione</Text>

        {items.length === 0 ? (
          <Text style={emptyText}>Nessun esercizio aggiunto.</Text>
        ) : (
          items.map((item, index) => (
            <View key={item.id} style={sessionItem}>
              <View style={{ flex: 1 }}>
                <Text style={sessionTitle}>
                  {index + 1}. {item.exercise}
                </Text>
                <Text style={sessionMeta}>
                  {item.muscle}
                  {item.muscle !== 'Cardio'
                    ? ` · ${item.sets} serie · ${item.reps} reps · ${item.weight} kg`
                    : ''}
                </Text>
              </View>

              <Pressable onPress={() => removeExercise(item.id)}>
                <Text style={removeText}>Rimuovi</Text>
              </Pressable>
            </View>
          ))
        )}

        <Pressable
          onPress={saveSession}
          disabled={loading}
          style={[button, loading && { opacity: 0.5 }]}
        >
          <Text style={buttonText}>
            {loading ? 'Salvataggio...' : 'Salva sessione'}
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

const mapCard = {
  borderWidth: 1,
  borderColor: theme.colors.primary,
  borderRadius: 24,
  backgroundColor: 'rgba(8, 13, 16, 0.96)',
  padding: 14,
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

const activeCard = {
  backgroundColor: theme.colors.primary,
}

const cardText = {
  color: theme.colors.white,
  fontSize: 12,
  fontFamily: 'Orbitron_700Bold',
}

const activeText = {
  color: '#020405',
}

const secondaryButton = {
  marginTop: 24,
  height: 54,
  borderRadius: 18,
  borderWidth: 1.5,
  borderColor: theme.colors.primary,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
}

const secondaryButtonText = {
  color: theme.colors.primaryGlow,
  fontSize: 13,
  fontFamily: 'Orbitron_700Bold',
  textTransform: 'uppercase' as const,
}

const emptyText = {
  color: theme.colors.white,
  opacity: 0.6,
}

const sessionItem = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 12,
  borderWidth: 1,
  borderColor: theme.colors.primary,
  borderRadius: 18,
  padding: 14,
  marginBottom: 10,
  backgroundColor: 'rgba(8, 13, 16, 0.96)',
}

const sessionTitle = {
  color: theme.colors.white,
  fontSize: 13,
  fontFamily: 'Orbitron_700Bold',
}

const sessionMeta = {
  color: theme.colors.white,
  opacity: 0.7,
  marginTop: 6,
  fontSize: 12,
}

const removeText = {
  color: '#ff6b6b',
  fontSize: 11,
  fontFamily: 'Orbitron_700Bold',
}

const button = {
  marginTop: 32,
  height: 58,
  borderRadius: 18,
  backgroundColor: theme.colors.primary,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
}

const buttonText = {
  color: '#020405',
  fontSize: 14,
  letterSpacing: 1.2,
  fontFamily: 'Orbitron_700Bold',
  textTransform: 'uppercase' as const,
}