import { View } from 'react-native'
import { theme } from '../constants/theme'

type CardProps = {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'outlined'
  padding?: number
}

export default function Card({
  children,
  variant = 'default',
  padding = 16,
}: CardProps) {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.primary,
          shadowColor: theme.colors.primary,
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 10,
        }

      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.borderLight,
        }

      default:
        return {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        }
    }
  }

  return (
    <View
      style={{
        padding,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 12,
        ...getStyles(),
      }}
    >
      {children}
    </View>
  )
}