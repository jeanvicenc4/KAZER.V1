/**
 * Screen — the shell every route uses: background, safe areas, optional header
 * with the history trigger on the left. Scrolling is owned by each screen.
 */

import React from 'react';
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../hooks/useTheme';
import { KazerMark } from './KazerMark';
import { touchTarget } from '../constants/tokens';

export interface ScreenProps {
  children: React.ReactNode;
  /** Compact header: history trigger, title, right-side actions. */
  header?: boolean;
  title?: string;
  subtitle?: string;
  onOpenHistory?: () => void;
  right?: React.ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  header = false,
  title,
  subtitle,
  onOpenHistory,
  right,
  padded = true,
  style,
}: ScreenProps): React.JSX.Element {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[{ flex: 1, backgroundColor: colors.base }, style]}>
      {header ? (
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingBottom: 12,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            borderBottomWidth: 1,
            borderBottomColor: colors.line,
          }}
        >
          {onOpenHistory ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir histórico"
              onPress={onOpenHistory}
              hitSlop={8}
              style={({ pressed }) => ({
                width: touchTarget,
                height: touchTarget,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                backgroundColor: pressed ? colors.elevated : 'transparent',
              })}
            >
              <Feather name="menu" size={20} color={colors.text2} />
            </Pressable>
          ) : (
            <View style={{ width: 8 }} />
          )}

          <View className="flex-1 ml-1">
            {title ? (
              <Text className="type-body" numberOfLines={1} style={{ color: colors.text }}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text className="type-micro" numberOfLines={1} style={{ color: colors.text3 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {right}
        </View>
      ) : null}

      <View className={padded ? 'flex-1 px-4' : 'flex-1'}>{children}</View>
    </View>
  );
}

/** Floating circular action used above lists (new chat, new mission). */
export function HeaderAction({
  icon,
  label,
  onPress,
  active = false,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  active?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: touchTarget,
        height: touchTarget,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: active
          ? colors.goldWash
          : pressed
            ? colors.elevated
            : 'transparent',
      })}
    >
      <Feather name={icon} size={20} color={active ? colors.goldText : colors.text2} />
    </Pressable>
  );
}