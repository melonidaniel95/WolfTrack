import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { theme } from '../constants/theme'
import { supabase } from '../lib/supabase'

type Measurement = {
  id: string
  measurement_date: string
  weight: number | null
  waist: number | null
  chest: number | null
  arm: number | null
  leg: number | null
  notes: string | null
}

export default function MeasurementsScreen() {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMeasurements()
  }, [])

  async function loadMeasurements() {
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .order('measurement_date', { ascending: false })

    if (!error && data) {
      setMeasurements(data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Misurazioni</Text>

      {measurements.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.measurement_date}</Text>

          <Text style={styles.value}>Peso: {item.weight ?? '-'} kg</Text>
          <Text style={styles.value}>Vita: {item.waist ?? '-'} cm</Text>
          <Text style={styles.value}>Petto: {item.chest ?? '-'} cm</Text>
          <Text style={styles.value}>Braccio: {item.arm ?? '-'} cm</Text>
          <Text style={styles.value}>Gamba: {item.leg ?? '-'} cm</Text>

          {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  center: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  title: {
    color: theme.colors.white,
    fontSize: 24,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    backgroundColor: 'rgba(8, 13, 16, 0.96)',
  },
  cardTitle: {
    color: theme.colors.primary,
    fontSize: 15,
    fontFamily: 'Orbitron_700Bold',
    marginBottom: 10,
  },
  value: {
    color: theme.colors.white,
    fontSize: 13,
    marginBottom: 5,
  },
  notes: {
    color: theme.colors.muted,
    marginTop: 10,
    fontSize: 12,
  },
}