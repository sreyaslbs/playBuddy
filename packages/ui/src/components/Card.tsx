import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme/Styles';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    className?: string; // For Next.js/Web support
    variant?: 'elevated' | 'outlined' | 'flat';
    onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    className,
    variant = 'elevated',
    onPress,
}) => {
    // Cast View to any for className support via react-native-web
    const StyledView: any = View;

    const content = (
        <StyledView
            className={className}
            style={[
                styles.base,
                variant === 'elevated' && styles.elevated,
                variant === 'outlined' && styles.outlined,
                variant === 'flat' && styles.flat,
                style,
            ]}
        >
            {children}
        </StyledView>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
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
