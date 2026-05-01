import { useState } from 'react'
import { useEffect } from 'react'
import { router } from 'expo-router'
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
import { supabase } from '../lib/supabase'
import { theme } from '../constants/theme'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
    useEffect(() => {
    const checkUser = async () => {
        const { data } = await supabase.auth.getSession()

        if (data.session) {
        router.replace('/(tabs)')
        }
    }

    checkUser()
    }, [])
  const signIn = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) Alert.alert('Errore login', error.message)
    else  {
        Alert.alert('Login riuscito')
         router.replace('/(tabs)') // 👈 vai alla home
}
  }

  const signUp = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) Alert.alert('Errore registrazione', error.message)
    else Alert.alert('Registrazione completata')
  }

  return (
    <ImageBackground
        
        style={{
            flex: 1,
            backgroundColor: '#000', // fallback elegante
        }}
        resizeMode="cover" 
        imageStyle={{
    width: undefined,
    height: '100%',
    aspectRatio: 1, // ⚠️ da adattare (vedi sotto)
  }}
        >
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
                width: 210,
                height: 210,
                resizeMode: 'contain',
                marginBottom: 4,
              }}
            />

            <Text
              style={{
                color: theme.colors.white,
                fontSize: 42,
                fontWeight: '900',
                letterSpacing: 3,
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
              }}
            >
              ALLENA. MONITORA. MIGLIORA.
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
                marginBottom: 24,fontFamily: 'Orbitron_700Bold',
              }}
            >
              ACCEDI AL TUO ACCOUNT
            </Text>

            <Text style={{ color: theme.colors.silver, marginBottom: 8, letterSpacing: 2, fontWeight: '700',fontFamily: 'Orbitron_700Bold' }}>
              EMAIL
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="la-tua-email@email.com"
              placeholderTextColor={theme.colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                backgroundColor: 'rgba(3, 5, 6, 0.7)',
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
                borderRadius: theme.radius.md,
                padding: 16,
                marginBottom: 18,
                fontSize: 16,fontFamily: 'Orbitron_700Bold',
              }}
            />

            <Text style={{ color: theme.colors.silver, marginBottom: 8, letterSpacing: 2, fontWeight: '700',fontFamily: 'Orbitron_700Bold' }}>
              PASSWORD
            </Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              placeholderTextColor={theme.colors.muted}
              secureTextEntry
              style={{
                backgroundColor: 'rgba(3, 5, 6, 0.7)',
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
                borderRadius: theme.radius.md,
                padding: 16,
                marginBottom: 24,
                fontSize: 16,fontFamily: 'Orbitron_700Bold',
              }}
            />

            <Pressable
              onPress={signIn}
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
              <Text style={{ color: '#020405', fontWeight: '900', fontSize: 18, letterSpacing: 3,fontFamily: 'Orbitron_700Bold' }}>
                {loading ? 'CARICAMENTO...' : 'ACCEDI'}
              </Text>
            </Pressable>

            <Text style={{ color: theme.colors.muted, textAlign: 'center', marginBottom: 14, letterSpacing: 4,fontFamily: 'Orbitron_700Bold' }}>
              OPPURE
            </Text>

            <Pressable
              onPress={() => router.push('/register')}
              disabled={loading}
              
              style={{
                borderWidth: 1.5,
                borderColor: theme.colors.primary,
                padding: 18,
                borderRadius: theme.radius.md,
                alignItems: 'center',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: theme.colors.primary, fontWeight: '900', fontSize: 16, letterSpacing: 3 ,fontFamily: 'Orbitron_700Bold'}}>
                CREA ACCOUNT
              </Text>
            </Pressable>
          </View>

          <Text
            style={{
              color: theme.colors.silverDark,
              textAlign: 'center',
              marginTop: 24,
              letterSpacing: 1.5,
              fontSize: 12,
            }}
          >
            DIVENTA LA MIGLIORE VERSIONE DI TE STESSO.
          </Text>
        </ScrollView>
      </View>
    </ImageBackground>
  )
}