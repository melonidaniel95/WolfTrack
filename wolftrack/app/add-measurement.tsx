import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../lib/supabase'
import { theme } from '../constants/theme'

export default function AddMeasurement() {
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [weight, setWeight] = useState('')
  const [chest, setChest] = useState('')
  const [waist, setWaist] = useState('')
  const [hips, setHips] = useState('')
  const [arm, setArm] = useState('')
  const [thigh, setThigh] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const saveMeasurement = async () => {
    if (!date) {
      Alert.alert('Errore', 'Inserisci una data')
      return
    }

    if (!weight) {
      Alert.alert('Errore', 'Inserisci almeno il peso')
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

    const { error } = await supabase.from('measurements').insert({
      user_id: user.id,
      measured_at: `${date} 12:00:00`,
      weight_kg: Number(weight.replace(',', '.')),
      chest_cm: Number(chest.replace(',', '.') || 0),
      waist_cm: Number(waist.replace(',', '.') || 0),
      hips_cm: Number(hips.replace(',', '.') || 0),
      arm_cm: Number(arm.replace(',', '.') || 0),
      thigh_cm: Number(thigh.replace(',', '.') || 0),
      notes: notes.trim() || null,
    })

    setLoading(false)

    if (error) {
      Alert.alert('Errore salvataggio', error.message)
      return
    }

    Alert.alert('Salvato', 'Misurazione registrata correttamente')
    router.back()
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Text style={title}>Nuova Misurazione</Text>

        <Text style={subtitle}>
          Registra peso e circonferenze per monitorare i progressi.
        </Text>

        <Text style={label}>Data</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={input}
        />

        <Text style={label}>Peso kg</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          placeholder="Es. 130"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="numeric"
          style={input}
        />

        <Text style={label}>Petto cm</Text>
        <TextInput
          value={chest}
          onChangeText={setChest}
          placeholder="Es. 115"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="numeric"
          style={input}
        />

        <Text style={label}>Vita cm</Text>
        <TextInput
          value={waist}
          onChangeText={setWaist}
          placeholder="Es. 120"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="numeric"
          style={input}
        />

        <Text style={label}>Fianchi cm</Text>
        <TextInput
          value={hips}
          onChangeText={setHips}
          placeholder="Es. 110"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="numeric"
          style={input}
        />

        <Text style={label}>Braccio cm</Text>
        <TextInput
          value={arm}
          onChangeText={setArm}
          placeholder="Es. 38"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="numeric"
          style={input}
        />

        <Text style={label}>Coscia cm</Text>
        <TextInput
          value={thigh}
          onChangeText={setThigh}
          placeholder="Es. 65"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="numeric"
          style={input}
        />

        <Text style={label}>Note</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Es. Misurazione mattutina a digiuno"
          placeholderTextColor="rgba(255,255,255,0.35)"
          multiline
          style={[input, textarea]}
        />

        <Pressable
          onPress={saveMeasurement}
          disabled={loading}
          style={[button, loading && { opacity: 0.5 }]}
        >
          <Text style={buttonText}>
            {loading ? 'Salvataggio...' : 'Salva misurazione'}
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
  marginTop: 18,
  marginBottom: 8,
  letterSpacing: 1,
  fontFamily: 'Orbitron_700Bold',
  textTransform: 'uppercase' as const,
}

const input = {
  minHeight: 56,
  borderRadius: 16,
  borderWidth: 1.5,
  borderColor: theme.colors.primary,
  backgroundColor: 'rgba(8, 13, 16, 0.96)',
  color: theme.colors.white,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 15,
}

const textarea = {
  minHeight: 110,
  textAlignVertical: 'top' as const,
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