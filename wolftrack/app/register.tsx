import { useState } from 'react'
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../lib/supabase'
import { theme } from '../constants/theme'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
    const [displayName, setDisplayName] = useState('')
  const signUp = async () => {
    if (!displayName || !email || !password || !confirmPassword) {
  Alert.alert('Errore', 'Compila tutti i campi')
  return
}

    if (password !== confirmPassword) {
      Alert.alert('Errore', 'Le password non coincidono')
      return
    }

    if (password.length < 6) {
      Alert.alert('Errore', 'La password deve avere almeno 6 caratteri')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
            display_name: displayName,
            full_name: displayName,
            },
        },
        })

    setLoading(false)

    if (error) {
      Alert.alert('Errore registrazione', error.message)
      return
    }

    Alert.alert(
      'Account creato',
      'Controlla la tua email per confermare la registrazione.'
    )

    router.replace('/login')
  }

  return (
    
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.25)',
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingTop: 54,
            justifyContent: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center', marginBottom: 22 }}>
            <Image
              source={require('../assets/images/Wolftracking-wolf.png')}
              style={{
                width: 180,
                height: 180,
                resizeMode: 'contain',
                marginBottom: 4,
              }}
            />

            <Text
              style={{
                color: theme.colors.white,
                fontSize: 38,
                fontWeight: '900',
                letterSpacing: 3,
                fontFamily: 'Orbitron_700Bold',
              }}
            >
              WOLF
              <Text style={{ color: theme.colors.primary }}>TRACK</Text>
            </Text>

            <Text
              style={{
                color: theme.colors.silverDark,
                fontSize: 12,
                letterSpacing: 4,
                marginTop: 6,
                fontFamily: 'Orbitron_700Bold',
              }}
            >
              CREA IL TUO ACCOUNT
            </Text>
          </View>

          <View
            style={{
              backgroundColor: 'rgba(8, 13, 16, 0.82)',
              borderRadius: 10,
              padding: 22,
              borderWidth: 1,
              borderColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
              shadowOpacity: 0.45,
              shadowRadius: 18,
              elevation: 12,
            }}
          >
            <Text
              style={{
                color: theme.colors.silver,
                textAlign: 'center',
                letterSpacing: 4,
                fontSize: 10,
                marginBottom: 24,
                fontFamily: 'Orbitron_700Bold',
              }}
            >
              REGISTRATI
            </Text>
              <Text style={labelStyle}>NOME</Text>

                <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Il tuo nome"
                placeholderTextColor={theme.colors.muted}
                autoCapitalize="words"
                style={inputStyle}
                />
            <Text style={labelStyle}>EMAIL</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="la-tua-email@email.com"
              placeholderTextColor={theme.colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={inputStyle}
            />

            <Text style={labelStyle}>PASSWORD</Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Minimo 6 caratteri"
              placeholderTextColor={theme.colors.muted}
              secureTextEntry
              style={inputStyle}
            />

            <Text style={labelStyle}>CONFERMA PASSWORD</Text>

            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Ripeti password"
              placeholderTextColor={theme.colors.muted}
              secureTextEntry
              style={{
                ...inputStyle,
                marginBottom: 24,
              }}
            />

            <Pressable
              onPress={signUp}
              disabled={loading}
              style={{
                backgroundColor: theme.colors.primary,
                padding: 18,
                borderRadius: theme.radius.md,
                alignItems: 'center',
                marginBottom: 14,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  color: '#020405',
                  fontWeight: '900',
                  fontSize: 16,
                  letterSpacing: 3,
                  fontFamily: 'Orbitron_700Bold',
                }}
              >
                {loading ? 'CREAZIONE...' : 'CREA ACCOUNT'}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.replace('/login')}>
              <Text
                style={{
                  color: theme.colors.primary,
                  textAlign: 'center',
                  letterSpacing: 2,
                  fontFamily: 'Orbitron_700Bold',
                }}
              >
                HAI GIÀ UN ACCOUNT? ACCEDI
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

  )
}

const labelStyle = {
  color: theme.colors.silver,
  marginBottom: 8,
  letterSpacing: 2,
  fontWeight: '700' as const,
  fontFamily: 'Orbitron_700Bold',
}

const inputStyle = {
  backgroundColor: 'rgba(3, 5, 6, 0.7)',
  color: theme.colors.text,
  borderWidth: 1,
  borderColor: theme.colors.borderLight,
  borderRadius: theme.radius.md,
  padding: 16,
  marginBottom: 18,
  fontSize: 16,
  fontFamily: 'Orbitron_700Bold',
}