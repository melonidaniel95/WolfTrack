import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { theme } from '../constants/theme'
import { supabase } from '../lib/supabase'

type Meal = {
  id: string
  meal_date: string
  meal_type: string
  notes: string | null
  meal_items: {
    id: string
    food_name: string
    quantity: string | null
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
  }[]
}

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMeals()
  }, [])

  async function loadMeals() {
    const { data, error } = await supabase
      .from('meals')
      .select(`
        id,
        meal_date,
        meal_type,
        notes,
        meal_items (
          id,
          food_name,
          quantity,
          calories,
          protein,
          carbs,
          fat
        )
      `)
      .order('meal_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMeals(data as Meal[])
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
      <Text style={styles.title}>Tutti i pasti</Text>

      {meals.map((meal) => {
        const totalCalories = meal.meal_items.reduce(
          (sum, item) => sum + Number(item.calories || 0),
          0
        )

        return (
          <View key={meal.id} style={styles.card}>
            <Text style={styles.cardTitle}>{meal.meal_type}</Text>
            <Text style={styles.meta}>{meal.meal_date}</Text>
            <Text style={styles.kcal}>{totalCalories} kcal</Text>

            {meal.meal_items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.food_name}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity || '-'} · {item.calories || 0} kcal
                </Text>
              </View>
            ))}

            {meal.notes ? <Text style={styles.notes}>{meal.notes}</Text> : null}
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
    fontSize: 16,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
  },
  meta: {
    color: theme.colors.muted,
    marginTop: 4,
  },
  kcal: {
    color: theme.colors.primary,
    fontSize: 18,
    fontFamily: 'Orbitron_700Bold',
    marginVertical: 10,
  },
  itemRow: {
    marginTop: 8,
  },
  itemName: {
    color: theme.colors.white,
    fontSize: 13,
  },
  itemMeta: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  notes: {
    color: theme.colors.muted,
    marginTop: 12,
    fontSize: 12,
  },
}