/**
 * EmptyState — short icon + title + one action. Never decorative.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../hooks/useTheme';
import { Button } from './Button';
import { KazerMark } from './KazerMark';
import type { IconName } from '../constants/icons';

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  withMark = false,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  withMark?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      className="items-center px-6 py-10"
      accessible
      accessibilityLabel={`${title}${description ? `. ${description}` : ''}`}
    >
      {withMark ? (
        <KazerMark size={40} muted />
      ) : icon ? (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.surface,
          }}
        >
          <Feather name={icon} size={20} color={colors.text3} />
        </View>
      ) : null}

      <Text
        className="type-h3 mt-4 text-center"
        style={{ color: colors.text }}
      >
        {title}
      </Text>

      {description ? (
        <Text
          className="type-bodySm mt-2 text-center"
          style={{ color: colors.text3, maxWidth: 320, lineHeight: 20 }}
        >
          {description}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={{ marginTop: 20 }}
        />
      ) : null}
    </View>
  );
}