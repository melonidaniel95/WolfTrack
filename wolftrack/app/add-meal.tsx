import { Text, View } from 'react-native'
import { theme } from '../constants/theme'

export default function AddMeasurement() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 24 }}>
      <Text style={{ color: theme.colors.white, fontSize: 24, fontFamily: 'Orbitron_700Bold' }}>
        Nuova Misurazione
      </Text>

      <Text style={{ color: theme.colors.white, marginTop: 16 }}>
        Qui potrai inserire peso, circonferenze, foto progressi e altre misurazioni.
      </Text>
    </View>
  )
}