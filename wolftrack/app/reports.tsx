import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { BarChart, LineChart } from 'react-native-chart-kit'
import { theme } from '../constants/theme'
import { supabase } from '../lib/supabase'

type MealItem = {
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

type Meal = {
  id: string
  meal_date: string
  meal_items: MealItem[]
}

type PhysicalProgress = {
  id: string
  progress_date: string
  weight: number | null
  strength_score: number | null
  cardio_score: number | null
  speed_score: number | null
}

const screenWidth = Dimensions.get('window').width - 40

const chartConfig = {
  backgroundGradientFrom: '#080D10',
  backgroundGradientTo: '#080D10',
  decimalPlaces: 0,
  color: () => theme.colors.primary,
  labelColor: () => theme.colors.white,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: theme.colors.primary,
  },
  propsForBackgroundLines: {
    stroke: theme.colors.border,
  },
}

export default function ReportsScreen() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [physicalProgress, setPhysicalProgress] = useState<PhysicalProgress[]>(
    []
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    const { data: mealsData } = await supabase
      .from('meals')
      .select(`
        id,
        meal_date,
        meal_items (
          calories,
          protein,
          carbs,
          fat
        )
      `)
      .order('meal_date', { ascending: true })

    const { data: progressData } = await supabase
      .from('physical_progress')
      .select(`
        id,
        progress_date,
        weight,
        strength_score,
        cardio_score,
        speed_score
      `)
      .order('progress_date', { ascending: true })

    if (mealsData) {
      setMeals(mealsData as Meal[])
    }

    if (progressData) {
      setPhysicalProgress(progressData as PhysicalProgress[])
    }

    setLoading(false)
  }

  const totals = meals.reduce(
    (acc, meal) => {
      meal.meal_items.forEach((item) => {
        acc.calories += Number(item.calories || 0)
        acc.protein += Number(item.protein || 0)
        acc.carbs += Number(item.carbs || 0)
        acc.fat += Number(item.fat || 0)
      })

      return acc
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  )

  const days = new Set(meals.map((meal) => meal.meal_date)).size || 1

  const dailyNutrition = meals.reduce<Record<string, typeof totals>>(
    (acc, meal) => {
      if (!acc[meal.meal_date]) {
        acc[meal.meal_date] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        }
      }

      meal.meal_items.forEach((item) => {
        acc[meal.meal_date].calories += Number(item.calories || 0)
        acc[meal.meal_date].protein += Number(item.protein || 0)
        acc[meal.meal_date].carbs += Number(item.carbs || 0)
        acc[meal.meal_date].fat += Number(item.fat || 0)
      })

      return acc
    },
    {}
  )

  const nutritionDates = Object.keys(dailyNutrition).slice(-7)

  const caloriesChartData = {
    labels: nutritionDates.map(formatShortDate),
    datasets: [
      {
        data: nutritionDates.map((date) =>
          Math.round(dailyNutrition[date].calories)
        ),
      },
    ],
  }

  const macroChartData = {
    labels: ['Proteine', 'Carbo', 'Grassi'],
    datasets: [
      {
        data: [
          Math.round(totals.protein),
          Math.round(totals.carbs),
          Math.round(totals.fat),
        ],
      },
    ],
  }

  const progressDates = physicalProgress.slice(-7)

  const strengthChartData = {
    labels: progressDates.map((item) => formatShortDate(item.progress_date)),
    datasets: [
      {
        data: progressDates.map((item) => Number(item.strength_score || 0)),
      },
    ],
  }

  const cardioChartData = {
    labels: progressDates.map((item) => formatShortDate(item.progress_date)),
    datasets: [
      {
        data: progressDates.map((item) => Number(item.cardio_score || 0)),
      },
    ],
  }

  const speedChartData = {
    labels: progressDates.map((item) => formatShortDate(item.progress_date)),
    datasets: [
      {
        data: progressDates.map((item) => Number(item.speed_score || 0)),
      },
    ],
  }

  const weightChartData = {
    labels: progressDates.map((item) => formatShortDate(item.progress_date)),
    datasets: [
      {
        data: progressDates.map((item) => Number(item.weight || 0)),
      },
    ],
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Report</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Totali registrati</Text>

        <ReportRow label="Calorie" value={`${Math.round(totals.calories)} kcal`} />
        <ReportRow label="Proteine" value={`${Math.round(totals.protein)} g`} />
        <ReportRow label="Carboidrati" value={`${Math.round(totals.carbs)} g`} />
        <ReportRow label="Grassi" value={`${Math.round(totals.fat)} g`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Media giornaliera</Text>

        <ReportRow
          label="Calorie"
          value={`${Math.round(totals.calories / days)} kcal`}
        />
        <ReportRow
          label="Proteine"
          value={`${Math.round(totals.protein / days)} g`}
        />
        <ReportRow
          label="Carboidrati"
          value={`${Math.round(totals.carbs / days)} g`}
        />
        <ReportRow
          label="Grassi"
          value={`${Math.round(totals.fat / days)} g`}
        />
      </View>

      {nutritionDates.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Andamento calorie</Text>

          <LineChart
            data={caloriesChartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Macronutrienti totali</Text>

        <BarChart
          data={macroChartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          yAxisLabel=""
          yAxisSuffix="g"
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Capacità fisiche</Text>

        {physicalProgress.length === 0 ? (
          <Text style={styles.emptyText}>
            Nessun dato fisico registrato. Quando aggiungerai peso, forza,
            cardio e velocità, qui vedrai i grafici temporali.
          </Text>
        ) : (
          <>
            <Text style={styles.chartLabel}>Peso corporeo</Text>
            <LineChart
              data={weightChartData}
              width={screenWidth - 32}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />

            <Text style={styles.chartLabel}>Forza</Text>
            <LineChart
              data={strengthChartData}
              width={screenWidth - 32}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />

            <Text style={styles.chartLabel}>Cardio</Text>
            <LineChart
              data={cardioChartData}
              width={screenWidth - 32}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />

            <Text style={styles.chartLabel}>Velocità</Text>
            <LineChart
              data={speedChartData}
              width={screenWidth - 32}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </>
        )}
      </View>
    </ScrollView>
  )
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

function formatShortDate(date: string) {
  const [, month, day] = date.split('-')
  return `${day}/${month}`
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
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 10,
  },
  rowLabel: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  rowValue: {
    color: theme.colors.primary,
    fontSize: 13,
    fontFamily: 'Orbitron_700Bold',
  },
  chart: {
    borderRadius: 16,
    marginTop: 8,
  },
  chartLabel: {
    color: theme.colors.white,
    fontSize: 12,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
    marginTop: 18,
    marginBottom: 8,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
}