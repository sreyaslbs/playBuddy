import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/Styles';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'elevated',
}) => {
    return (
        <View
            style={[
                styles.base,
                variant === 'elevated' && styles.elevated,
                variant === 'outlined' && styles.outlined,
                variant === 'flat' && styles.flat,
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        overflow: 'hidden',
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    outlined: {
        borderWidth: 1,
        borderColor: Colors.border,
    },
    flat: {
        backgroundColor: Colors.background,
    },
});
