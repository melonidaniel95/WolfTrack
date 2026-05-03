import { useState } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { theme } from '../constants/theme'
import { supabase } from '../lib/supabase'

type MealType = 'Colazione' | 'Pranzo' | 'Cena' | 'Spuntino'

type MealItem = {
  id: string
  foodName: string
  quantity: string
  calories: string
  protein: string
  carbs: string
  fat: string
}

const MEAL_TYPES: MealType[] = [
  'Colazione',
  'Pranzo',
  'Cena',
  'Spuntino',
]

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

function createEmptyItem(): MealItem {
  return {
    id: `${Date.now()}-${Math.random()}`,
    foodName: '',
    quantity: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  }
}

export default function AddMealScreen() {
  const [mealDate, setMealDate] = useState(getTodayDate())
  const [mealType, setMealType] = useState<MealType>('Pranzo')
  const [items, setItems] = useState<MealItem[]>([createEmptyItem()])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  function toNumber(value: string) {
    const number = Number(value.replace(',', '.'))
    return Number.isNaN(number) ? 0 : number
  }

  function updateItem(id: string, field: keyof MealItem, value: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  function addItem() {
    setItems((currentItems) => [...currentItems, createEmptyItem()])
  }

  function removeItem(id: string) {
    if (items.length === 1) {
      Alert.alert('Attenzione', 'Devi inserire almeno un alimento.')
      return
    }

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    )
  }

  async function handleSaveMeal() {
    const validItems = items.filter((item) => item.foodName.trim())

    if (!mealDate.trim()) {
      Alert.alert('Attenzione', 'Inserisci la data del pasto.')
      return
    }

    if (validItems.length === 0) {
      Alert.alert('Attenzione', 'Inserisci almeno un alimento.')
      return
    }

    setLoading(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setLoading(false)
      Alert.alert('Errore', 'Devi essere loggato per salvare un pasto.')
      return
    }

    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        meal_date: mealDate,
        meal_type: mealType,
        notes: notes.trim(),
      })
      .select()
      .single()

    if (mealError || !meal) {
      setLoading(false)
      Alert.alert('Errore', mealError?.message || 'Errore nel salvataggio.')
      return
    }

    const mealItemsToInsert = validItems.map((item) => ({
      meal_id: meal.id,
      food_name: item.foodName.trim(),
      quantity: item.quantity.trim(),
      calories: toNumber(item.calories),
      protein: toNumber(item.protein),
      carbs: toNumber(item.carbs),
      fat: toNumber(item.fat),
    }))

    const { error: itemsError } = await supabase
      .from('meal_items')
      .insert(mealItemsToInsert)

    setLoading(false)

    if (itemsError) {
      Alert.alert('Errore', itemsError.message)
      return
    }

    Alert.alert('Pasto salvato', 'Il pasto è stato registrato correttamente.')
    router.back()
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Aggiungi pasto</Text>
        <Text style={styles.subtitle}>
          Registra tutti gli alimenti mangiati in un pasto
        </Text>
      </View>

      <Text style={styles.label}>Data</Text>
      <TextInput
        value={mealDate}
        onChangeText={setMealDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
      />

      <Text style={styles.label}>Tipo pasto</Text>

      <View style={styles.mealGrid}>
        {MEAL_TYPES.map((type) => {
          const active = mealType === type

          return (
            <Pressable
              key={type}
              onPress={() => setMealType(type)}
              style={[styles.mealChip, active && styles.activeChip]}
            >
              <Text style={[styles.mealChipText, active && styles.activeText]}>
                {type}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <Text style={styles.sectionTitle}>Alimenti</Text>

      {items.map((item, index) => (
        <View key={item.id} style={styles.foodCard}>
          <View style={styles.foodCardHeader}>
            <Text style={styles.foodTitle}>Alimento {index + 1}</Text>

            <Pressable onPress={() => removeItem(item.id)}>
              <Text style={styles.removeText}>Rimuovi</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Nome alimento</Text>
          <TextInput
            value={item.foodName}
            onChangeText={(value) => updateItem(item.id, 'foodName', value)}
            placeholder="Es. Riso basmati"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />

          <Text style={styles.label}>Quantità</Text>
          <TextInput
            value={item.quantity}
            onChangeText={(value) => updateItem(item.id, 'quantity', value)}
            placeholder="Es. 100 g"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Calorie</Text>
              <TextInput
                value={item.calories}
                onChangeText={(value) => updateItem(item.id, 'calories', value)}
                placeholder="kcal"
                placeholderTextColor={theme.colors.muted}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.half}>
              <Text style={styles.label}>Proteine</Text>
              <TextInput
                value={item.protein}
                onChangeText={(value) => updateItem(item.id, 'protein', value)}
                placeholder="g"
                placeholderTextColor={theme.colors.muted}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Carboidrati</Text>
              <TextInput
                value={item.carbs}
                onChangeText={(value) => updateItem(item.id, 'carbs', value)}
                placeholder="g"
                placeholderTextColor={theme.colors.muted}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.half}>
              <Text style={styles.label}>Grassi</Text>
              <TextInput
                value={item.fat}
                onChangeText={(value) => updateItem(item.id, 'fat', value)}
                placeholder="g"
                placeholderTextColor={theme.colors.muted}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>
        </View>
      ))}

      <Pressable onPress={addItem} style={styles.addFoodButton}>
        <Text style={styles.addFoodButtonText}>+ Aggiungi alimento</Text>
      </Pressable>

      <Text style={styles.label}>Note pasto</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Es. dopo allenamento, pasto libero..."
        placeholderTextColor={theme.colors.muted}
        multiline
        style={[styles.input, styles.textArea]}
      />

      <Pressable
        onPress={handleSaveMeal}
        disabled={loading}
        style={[styles.saveButton, loading && styles.disabledButton]}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Salvataggio...' : 'Salva pasto'}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Annulla</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    color: theme.colors.white,
    fontSize: 24,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },

  subtitle: {
    color: theme.colors.muted,
    fontSize: 13,
  },

  sectionTitle: {
    color: theme.colors.white,
    fontSize: 14,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
    marginTop: 22,
    marginBottom: 12,
  },

  label: {
    color: theme.colors.white,
    fontSize: 12,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
    marginTop: 14,
  },

  mealGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
    marginBottom: 8,
  },

  mealChip: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(8, 13, 16, 0.96)',
  },

  activeChip: {
    backgroundColor: theme.colors.primary,
  },

  mealChipText: {
    color: theme.colors.white,
    fontSize: 11,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
  },

  activeText: {
    color: '#020405',
  },

  foodCard: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(8, 13, 16, 0.96)',
  },

  foodCardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },

  foodTitle: {
    color: theme.colors.white,
    fontSize: 13,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
  },

  removeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
  },

  input: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.white,
    backgroundColor: 'rgba(8, 13, 16, 0.96)',
    fontSize: 14,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top' as const,
  },

  row: {
    flexDirection: 'row' as const,
    gap: 12,
  },

  half: {
    flex: 1,
  },

  addFoodButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center' as const,
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: 'rgba(8, 13, 16, 0.96)',
  },

  addFoodButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
  },

  saveButton: {
    marginTop: 28,
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center' as const,
  },

  disabledButton: {
    opacity: 0.5,
  },

  saveButtonText: {
    color: '#020405',
    fontSize: 13,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
  },

  cancelButton: {
    marginTop: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center' as const,
  },

  cancelButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
  },
}