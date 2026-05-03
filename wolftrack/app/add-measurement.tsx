import { Text, View } from 'react-native'
import { theme } from '../constants/theme'

export default function AddMeal() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 24 }}>
      <Text style={{ color: theme.colors.white, fontSize: 24, fontFamily: 'Orbitron_700Bold' }}>
        Nuovo Pasto
      </Text>

      <Text style={{ color: theme.colors.white, marginTop: 16 }}>
        Qui potrai registrare alimenti, calorie, proteine, carboidrati e grassi.
      </Text>
    </View>
  )
}