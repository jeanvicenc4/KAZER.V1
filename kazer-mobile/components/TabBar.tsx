/**
 * TabBar — custom bottom navigation (Início · Skills · Artefatos · Perfil).
 *
 * Deliberately not the Expo tab bar: the KAZER bar is a hairline-separated
 * surface with a gold indicator on the active item, gold icon on the inactive
 * brand item, and a plan-aware badge on Artifacts. Every target is ≥ 44px and
 * respects the bottom safe area.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { useTheme } from '../hooks/useTheme';
import { touchTarget } from '../constants/tokens';

export type TabKey = 'index' | 'skills' | 'artifacts' | 'settings';

type FeatherName = ComponentProps<typeof Feather>['name'];

interface TabDefinition {
  key: TabKey;
  route: string;
  label: string;
  icon: FeatherName;
}

const TABS: TabDefinition[] = [
  { key: 'index', route: '/', label: 'Início', icon: 'home' },
  { key: 'skills', route: '/skills', label: 'Skills', icon: 'layers' },
  { key: 'artifacts', route: '/artifacts', label: 'Artefatos', icon: 'folder' },
  { key: 'settings', route: '/settings', label: 'Perfil', icon: 'user' },
];

export function TabBar({
  active,
  onNavigate,
  badge,
}: {
  active: TabKey;
  onNavigate: (tab: TabDefinition) => void;
  badge?: Partial<Record<TabKey, number>>;
}): React.JSX.Element {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: colors.line,
        backgroundColor: colors.base,
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const color = isActive ? colors.gold : colors.text3;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => onNavigate(tab)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: touchTarget,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View>
              <Feather name={tab.icon} size={20} color={color} />
              {badge?.[tab.key] ? (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    paddingHorizontal: 4,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.gold,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textInverse,
                      fontSize: 10,
                      lineHeight: 14,
                      fontWeight: '500',
                    }}
                  >
                    {badge[tab.key]}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              className="type-micro"
              style={{ color, fontWeight: isActive ? '500' : '400' }}
            >
              {tab.label}
            </Text>

            {isActive ? (
              <View
                style={{
                  position: 'absolute',
                  bottom: 2,
                  width: 16,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: colors.gold,
                }}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export type { TabDefinition };
export { TABS };