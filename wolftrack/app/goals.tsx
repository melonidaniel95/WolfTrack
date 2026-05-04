import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { theme } from '../constants/theme'
import { supabase } from '../lib/supabase'

type Goal = {
  id: string
  title: string
  category: string | null
  target_value: number | null
  current_value: number | null
  unit: string | null
  deadline: string | null
  completed: boolean
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGoals()
  }, [])

  async function loadGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setGoals(data)
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
      <Text style={styles.title}>Obiettivi</Text>

      {goals.map((goal) => {
        const progress =
          goal.target_value && goal.current_value
            ? Math.min((goal.current_value / goal.target_value) * 100, 100)
            : 0

        return (
          <View key={goal.id} style={styles.card}>
            <Text style={styles.cardTitle}>{goal.title}</Text>
            <Text style={styles.meta}>{goal.category || 'Generale'}</Text>

            <Text style={styles.value}>
              {goal.current_value || 0} / {goal.target_value || 0} {goal.unit || ''}
            </Text>

            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            {goal.deadline ? (
              <Text style={styles.meta}>Scadenza: {goal.deadline}</Text>
            ) : null}
          </View>
        )
      })}
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
    color: theme.colors.white,
    fontSize: 15,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 5,
  },
  value: {
    color: theme.colors.primary,
    fontSize: 18,
    fontFamily: 'Orbitron_700Bold',
    marginVertical: 12,
  },
  progressBg: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    overflow: 'hidden' as const,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
}