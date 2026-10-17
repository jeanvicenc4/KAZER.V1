/**
 * HistoryDrawer — slide-in from the left (web sidebar becomes a drawer below
 * the `lg` breakpoint). Groups: Hoje / Ontem / Últimos 7 dias / Anteriores,
 * with a search field on top.
 */

import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { formatRelativeDate } from '@kazer/core';
import type { Conversation } from '@kazer/core';

import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useConversations } from '../hooks/useConversations';
import { KazerLockup } from './KazerMark';
import { IconButton } from './Button';
import { Input } from './Input';
import { EmptyState } from './EmptyState';
import { SkeletonList } from './Skeleton';
import { modeMeta } from '../constants/icons';
import { zIndex } from '../constants/tokens';
import { tapFeedback } from '../src/services/native';

const DRAWER_WIDTH = 312;
const SPRING = { damping: 26, stiffness: 260, mass: 0.7 } as const;

export interface HistoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onOpenSkills?: () => void;
  onOpenSettings?: () => void;
}

export function HistoryDrawer({
  visible,
  onClose,
  onSelect,
  onNewConversation,
  onOpenSkills,
  onOpenSettings,
}: HistoryDrawerProps): React.JSX.Element | null {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();

  const progress = useSharedValue(0);
  const {
    groups,
    query,
    setQuery,
    loading,
    togglePin,
    toggleArchive,
    remove,
  } = useConversations();

  const drawerWidth = Math.min(DRAWER_WIDTH, width * 0.86);

  useEffect(() => {
    if (visible) {
      progress.value = reducedMotion
        ? withTiming(1, { duration: 100 })
        : withSpring(1, SPRING);
    }
  }, [progress, reducedMotion, visible]);

  const close = (): void => {
    progress.value = reducedMotion
      ? withTiming(0, { duration: 100 }, (finished) => {
          if (finished) runOnJS(onClose)();
        })
      : withSpring(0, SPRING, (finished) => {
          if (finished) runOnJS(onClose)();
        });
  };

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -drawerWidth + progress.value * drawerWidth }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.72,
  }));

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      progress.value = Math.max(0, Math.min(1, progress.value + event.translationX / drawerWidth));
    })
    .onEnd((event) => {
      if (event.translationX < -60 || event.velocityX < -600) {
        progress.value = withSpring(0, SPRING, (finished) => {
          if (finished) runOnJS(close)();
        });
      } else {
        progress.value = withSpring(1, SPRING);
      }
    });

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: zIndex.drawer }}>
      <Animated.View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000' },
          backdropStyle,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar histórico"
          onPress={close}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View
          accessibilityViewIsModal
          accessibilityLabel="Histórico de conversas"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: drawerWidth,
              backgroundColor: colors.surface,
              borderRightWidth: 1,
              borderRightColor: colors.line,
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 12,
            },
            drawerStyle,
          ]}
        >
          <View className="flex-row items-center justify-between px-4">
            <KazerLockup size={22} />
            <IconButton icon="x" label="Fechar" onPress={close} />
          </View>

          <View className="px-4 mt-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nova conversa"
              onPress={() => {
                tapFeedback();
                onNewConversation();
              }}
              style={({ pressed }) => ({
                minHeight: 44,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.goldBorder,
                backgroundColor: pressed ? colors.gold : colors.goldWash,
              })}
            >
              <Feather name="plus" size={16} color={colors.goldText} />
              <Text className="type-bodySm" style={{ color: colors.goldText, fontWeight: '500' }}>
                Nova conversa
              </Text>
            </Pressable>
          </View>

          <View className="px-4 mt-3">
            <Input
              placeholder="Buscar conversa"
              value={query}
              onChangeText={setQuery}
              icon="search"
              autoCorrect={false}
              onClear={() => setQuery('')}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? <SkeletonList count={6} /> : null}

            {!loading && groups.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="Nada por aqui"
                description="Nenhuma conversa encontrada para esta busca."
              />
            ) : null}

            {groups.map((group) => (
              <View key={group.group} className="mb-4">
                <Text className="eyebrow px-2 mb-2" style={{ color: colors.text3 }}>
                  {group.group}
                </Text>

                {group.items.map((conversation) => (
                  <DrawerItem
                    key={conversation.id}
                    conversation={conversation}
                    onPress={() => onSelect(conversation)}
                    onTogglePin={() => void togglePin(conversation.id)}
                    onToggleArchive={() => void toggleArchive(conversation.id)}
                    onRemove={() => void remove(conversation.id)}
                  />
                ))}
              </View>
            ))}
          </ScrollView>

          <View
            style={{
              paddingHorizontal: 12,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: colors.line,
            }}
          >
            <FooterLink icon="layers" label="Skills" onPress={() => onOpenSkills?.()} />
            <FooterLink icon="settings" label="Configurações" onPress={() => onOpenSettings?.()} />
            <View className="flex-row items-center gap-2 px-2 py-3">
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text3 }} />
              <Text className="type-micro" style={{ color: colors.text3 }}>
                Dados de demonstração
              </Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function DrawerItem({
  conversation,
  onPress,
  onTogglePin,
  onToggleArchive,
  onRemove,
}: {
  conversation: Conversation;
  onPress: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onRemove: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  const [revealed, setRevealed] = React.useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${conversation.title}. ${formatRelativeDate(
        conversation.updatedAt,
      )}${conversation.pinned ? '. Fixada' : ''}`}
      onPress={onPress}
      onLongPress={() => setRevealed(true)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        backgroundColor: pressed ? colors.elevated : 'transparent',
      })}
    >
      <Feather
        name={modeMeta[conversation.mode].icon}
        size={14}
        color={conversation.mode === 'mission' ? colors.violetSoft : colors.text3}
      />

      <View className="flex-1">
        <Text className="type-bodySm" numberOfLines={1} style={{ color: colors.text }}>
          {conversation.title}
        </Text>
        <Text className="type-micro mt-0.5" style={{ color: colors.text3 }}>
          {modeMeta[conversation.mode].label} · {formatRelativeDate(conversation.updatedAt)}
        </Text>
      </View>

      {conversation.sourceCount > 0 ? (
        <Text className="type-micro" style={{ color: colors.text3, fontFamily: 'monospace' }}>
          {conversation.sourceCount}
        </Text>
      ) : null}

      {revealed ? (
        <View className="flex-row" style={{ gap: 2 }}>
          <IconButton
            icon={conversation.pinned ? 'x' : 'map-pin'}
            label={conversation.pinned ? 'Desafixar' : 'Fixar conversa'}
            size={32}
            onPress={onTogglePin}
          />
          <IconButton
            icon="archive"
            label="Arquivar"
            size={32}
            onPress={onToggleArchive}
          />
          <IconButton icon="trash-2" label="Excluir" size={32} onPress={onRemove} />
        </View>
      ) : conversation.pinned ? (
        <Feather name="map-pin" size={13} color={colors.goldText} />
      ) : null}
    </Pressable>
  );
}

function FooterLink({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 8,
        borderRadius: 10,
        backgroundColor: pressed ? colors.elevated : 'transparent',
      })}
    >
      <Feather name={icon} size={15} color={colors.text3} />
      <Text className="type-bodySm" style={{ color: colors.text2 }}>
        {label}
      </Text>
    </Pressable>
  );
}