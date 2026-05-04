// app/add-meal.tsx
import { useState } from 'react'
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
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

const MEAL_TYPES: MealType[] = ['Colazione', 'Pranzo', 'Cena', 'Spuntino']

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

  const [, requestCameraPermission] = useCameraPermissions()
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanningItemId, setScanningItemId] = useState<string | null>(null)
  const [scanned, setScanned] = useState(false)
  const [scannerMessage, setScannerMessage] = useState(
    'Inquadra il codice a barre'
  )
  const [scannerLoading, setScannerLoading] = useState(false)

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

    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  async function findOrCreateFoodByBarcode(barcode: string) {
    const { data: existingFood } = await supabase
      .from('foods')
      .select('*')
      .eq('barcode', barcode)
      .maybeSingle()

    if (existingFood) return existingFood

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    )

    const result = await response.json()

    if (!result.product) {
      throw new Error('Prodotto non trovato')
    }

    const product = result.product
    const nutriments = product.nutriments || {}

    const foodToInsert = {
      barcode,
      name: product.product_name || 'Prodotto senza nome',
      brand: product.brands || null,
      calories: nutriments['energy-kcal_100g'] || 0,
      protein: nutriments.proteins_100g || 0,
      carbs: nutriments.carbohydrates_100g || 0,
      fat: nutriments.fat_100g || 0,
      source: 'open_food_facts',
    }

    const { data: newFood, error } = await supabase
      .from('foods')
      .insert(foodToInsert)
      .select()
      .single()

    if (error) throw error

    return newFood
  }

  async function handleBarcodeScan(itemId: string) {
  const permission = await requestCameraPermission()

  if (!permission.granted) {
    Alert.alert('Permesso negato', 'Devi autorizzare la fotocamera.')
    return
  }

  setScanningItemId(itemId)
  setScanned(false)
  setScannerLoading(false)
  setScannerMessage('Inquadra il codice a barre')
  setScannerOpen(true)
}

  async function handleBarcodeDetected(barcode: string) {
  if (scanned || !scanningItemId || scannerLoading) return

  setScanned(true)
  setScannerLoading(true)
  setScannerMessage(`Barcode riconosciuto: ${barcode}`)

  try {
    const food = await findOrCreateFoodByBarcode(barcode)

    updateItem(scanningItemId, 'foodName', food.name || '')
    updateItem(scanningItemId, 'quantity', '100 g')
    updateItem(scanningItemId, 'calories', String(food.calories || 0))
    updateItem(scanningItemId, 'protein', String(food.protein || 0))
    updateItem(scanningItemId, 'carbs', String(food.carbs || 0))
    updateItem(scanningItemId, 'fat', String(food.fat || 0))

    setScannerOpen(false)
    setScanningItemId(null)
    setScannerLoading(false)
    setScanned(false)

    Alert.alert('Prodotto trovato', food.name || 'Alimento importato')
  } catch (error) {
    setScannerMessage('Prodotto non trovato')
    setScannerLoading(false)

    Alert.alert(
      'Prodotto non trovato',
      error instanceof Error ? error.message : 'Barcode non trovato.'
    )

    setTimeout(() => {
      setScanned(false)
      setScannerMessage('Riprova con un altro codice a barre')
    }, 1000)
  }
}

 async function handleImageUpload(itemId: string) {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Devi autorizzare l’accesso alle foto.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    })

    if (result.canceled) return

    const imageBase64 = result.assets?.[0]?.base64

    if (!imageBase64) {
      Alert.alert('Errore', 'Base64 immagine mancante.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.functions.invoke(
      'analyze-food-image',
      {
        body: {
          imageBase64,
        },
      }
    )

    setLoading(false)

    if (error) {
      Alert.alert('Errore AI', error.message)
      return
    }

    updateItem(itemId, 'foodName', data.foodName || '')
    updateItem(itemId, 'quantity', data.quantity || '')
    updateItem(itemId, 'calories', String(data.calories || 0))
    updateItem(itemId, 'protein', String(data.protein || 0))
    updateItem(itemId, 'carbs', String(data.carbs || 0))
    updateItem(itemId, 'fat', String(data.fat || 0))

    Alert.alert('Analisi completata', 'I dati sono stati compilati.')
  } catch (error) {
    setLoading(false)

    Alert.alert(
      'Errore',
      error instanceof Error ? error.message : 'Errore sconosciuto'
    )
  }
}

  async function saveFoodIfMissing(item: MealItem) {
    const name = item.foodName.trim()

    if (!name) return

    const { data: existingFood } = await supabase
      .from('foods')
      .select('id')
      .ilike('name', name)
      .maybeSingle()

    if (existingFood) return

    await supabase.from('foods').insert({
      name,
      barcode: null,
      brand: null,
      calories: toNumber(item.calories),
      protein: toNumber(item.protein),
      carbs: toNumber(item.carbs),
      fat: toNumber(item.fat),
      source: 'manual',
    })
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
        notes: notes.trim() || null,
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

    if (itemsError) {
      setLoading(false)
      Alert.alert('Errore', itemsError.message)
      return
    }

    await Promise.all(validItems.map(saveFoodIfMissing))

    setLoading(false)

    Alert.alert('Pasto salvato', 'Il pasto è stato registrato correttamente.')
    router.back()
  }

  return (
    <>
      <Modal visible={scannerOpen} animationType="slide">
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
            }}
            onBarcodeScanned={
              scanned || scannerLoading
                ? undefined
                : ({ data }) => handleBarcodeDetected(data)
            }
          />

          <View style={styles.scanFrame} />

          <View style={styles.scannerOverlay}>
            <Text style={styles.scannerTitle}>Scansiona barcode</Text>

            <Text style={styles.scannerMessage}>
              {scannerLoading ? 'Ricerca prodotto...' : scannerMessage}
            </Text>

            <Pressable
              onPress={() => {
                setScannerOpen(false)
                setScanningItemId(null)
                setScannerLoading(false)
                setScanned(false)
              }}
              style={styles.cancelScanButton}
            >
              <Text style={styles.cancelScanText}>Chiudi scanner</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Aggiungi pasto</Text>
          <Text style={styles.subtitle}>
            Registra gli alimenti o usa barcode/foto per riconoscerli
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
                <Text
                  style={[styles.mealChipText, active && styles.activeText]}
                >
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

            <View style={styles.aiActions}>
              <Pressable
                onPress={() => handleBarcodeScan(item.id)}
                style={styles.aiButton}
              >
                <Text style={styles.aiIcon}>📷</Text>
                <Text style={styles.aiButtonText}>Barcode</Text>
              </Pressable>

              <Pressable
                onPress={() => handleImageUpload(item.id)}
                style={styles.aiButton}
              >
                <Text style={styles.aiIcon}>🖼️</Text>
                <Text style={styles.aiButtonText}>Foto cibo</Text>
              </Pressable>
            </View>

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
                  onChangeText={(value) =>
                    updateItem(item.id, 'calories', value)
                  }
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
                  onChangeText={(value) =>
                    updateItem(item.id, 'protein', value)
                  }
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
    </>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },

  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },

  camera: {
    flex: 1,
  },

  scanFrame: {
    position: 'absolute' as const,
    top: '34%' as const,
    left: 32,
    right: 32,
    height: 150,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 174, 234, 0.08)',
  },

  scannerOverlay: {
    position: 'absolute' as const,
    left: 20,
    right: 20,
    bottom: 40,
    alignItems: 'center' as const,
  },

  scannerTitle: {
    color: theme.colors.white,
    fontSize: 18,
    fontFamily: 'Orbitron_700Bold',
    marginBottom: 10,
  },

  scannerMessage: {
    color: theme.colors.white,
    fontSize: 13,
    textAlign: 'center' as const,
    marginBottom: 18,
    opacity: 0.85,
  },

  cancelScanButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(8, 13, 16, 0.96)',
  },

  cancelScanText: {
    color: theme.colors.white,
    fontSize: 12,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
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

  aiActions: {
    flexDirection: 'row' as const,
    gap: 10,
    marginTop: 12,
  },

  aiButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(0, 174, 234, 0.10)',
  },

  aiIcon: {
    fontSize: 20,
    marginBottom: 6,
  },

  aiButtonText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase' as const,
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