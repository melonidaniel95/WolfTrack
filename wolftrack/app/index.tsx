import { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import Card from '../components/Card'
import { theme } from '../constants/theme'
import { supabase } from '../lib/supabase'
import FloatingAddMenu from '../components/FloatingAddMenu'

type Profile = {
  username: string | null
  avatar_url: string | null
  weight: number | null
}

type TodayData = {
  calories: number
  proteins: number
  carbs: number
  fats: number
  workout: string
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [today, setToday] = useState<TodayData>({
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0,
    workout: 'Nessun allenamento',
  })

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user

    if (!user) return

    setEmail(user.email ?? '')

    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, avatar_url, weight')
      .eq('user_id', user.id)
      .single()

    setProfile(profileData)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: meals } = await supabase
      .from('meal_items')
      .select('calories, proteins, carbs, fats')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())

    const totals = meals?.reduce(
      (acc, item) => ({
        calories: acc.calories + Number(item.calories ?? 0),
        proteins: acc.proteins + Number(item.proteins ?? 0),
        carbs: acc.carbs + Number(item.carbs ?? 0),
        fats: acc.fats + Number(item.fats ?? 0),
      }),
      { calories: 0, proteins: 0, carbs: 0, fats: 0 }
    ) ?? { calories: 0, proteins: 0, carbs: 0, fats: 0 }

    const { data: workoutData } = await supabase
      .from('workouts')
      .select('type')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .limit(1)
      .single()

    setToday({
      ...totals,
      workout: workoutData?.type ?? 'Nessun allenamento',
    })
  }

  const username = profile?.username || email.split('@')[0] || 'Wolf'

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Image
        source={require('../assets/images/wolf-background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.overlay} />
      <View style={styles.leftBorder} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 60,
        }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>BENTORNATO</Text>
            <Text style={styles.username}>{username}</Text>
          </View>

          <View style={styles.avatar}>
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {username.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.title}>
          WOLF<Text style={{ color: theme.colors.primary }}>TRACK</Text>
        </Text>

        <Text style={styles.subtitle}>ALLENA. MONITORA. MIGLIORA.</Text>

        <Card variant="primary" padding={20}>
          <Text style={sectionTitle}>OGGI</Text>
          <Text style={mainValue}>{today.calories} kcal</Text>
          <Text style={desc}>Calorie registrate oggi</Text>
        </Card>

        <View style={styles.grid}>
          <View style={{ flex: 1 }}>
            <Card>
              <Text style={label}>PROTEINE</Text>
              <Text style={value}>{today.proteins}g</Text>
            </Card>
          </View>

          <View style={{ flex: 1 }}>
            <Card>
              <Text style={label}>CARBO</Text>
              <Text style={value}>{today.carbs}g</Text>
            </Card>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={{ flex: 1 }}>
            <Card>
              <Text style={label}>GRASSI</Text>
              <Text style={value}>{today.fats}g</Text>
            </Card>
          </View>

          <View style={{ flex: 1 }}>
            <Card>
              <Text style={label}>PESO</Text>
              <Text style={value}>
                {profile?.weight ? `${profile.weight} kg` : '-- kg'}
              </Text>
            </Card>
          </View>
        </View>

        <Card variant="outlined">
          <Text style={sectionTitle}>ALLENAMENTO</Text>
          <Text style={desc}>{today.workout}</Text>
        </Card>

        <Card variant="outlined">
          <Text style={sectionTitle}>OBIETTIVO</Text>
          <Text style={desc}>Imposta il tuo obiettivo giornaliero</Text>
        </Card>
      </ScrollView>
      <FloatingAddMenu />
    </View>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  welcome: {
    color: theme.colors.silverDark,
    fontSize: 11,
    letterSpacing: 3,
    fontFamily: 'Orbitron_700Bold',
  },
  username: {
    color: theme.colors.white,
    fontSize: 24,
    marginTop: 6,
    fontFamily: 'Orbitron_700Bold',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0,174,234,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 22,
    fontFamily: 'Orbitron_700Bold',
  },
  title: {
    color: theme.colors.white,
    fontSize: 34,
    letterSpacing: 3,
    fontFamily: 'Orbitron_700Bold',
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.silverDark,
    fontSize: 12,
    letterSpacing: 4,
    fontFamily: 'Orbitron_700Bold',
    marginBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
})

const sectionTitle = {
  color: theme.colors.silver,
  fontSize: 12,
  letterSpacing: 3,
  fontFamily: 'Orbitron_700Bold',
  marginBottom: 8,
}

const mainValue = {
  color: theme.colors.white,
  fontSize: 30,
  fontFamily: 'Orbitron_700Bold',
}

const desc = {
  color: theme.colors.muted,
  fontSize: 14,
  fontFamily: 'Rajdhani_600SemiBold',
}

const label = {
  color: theme.colors.silverDark,
  fontSize: 11,
  letterSpacing: 2,
  fontFamily: 'Orbitron_700Bold',
}

const value = {
  color: theme.colors.primary,
  fontSize: 22,
  marginTop: 6,
  fontFamily: 'Orbitron_700Bold',
}