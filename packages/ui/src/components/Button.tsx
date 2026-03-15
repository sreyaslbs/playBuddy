import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme/Styles';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    className?: string; // For Next.js/Web support
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    className,
    textStyle,
    icon,
}) => {
    const isOutline = variant === 'outline';
    const isSecondary = variant === 'secondary';
    const isGhost = variant === 'ghost';

    // Cast to any to support className on web via react-native-web
    const Touchable: any = TouchableOpacity;

    return (
        <Touchable
            onPress={onPress}
            disabled={disabled || loading}
            className={className}
            style={[
                styles.base,
                isOutline && styles.outline,
                isSecondary && styles.secondary,
                isGhost && styles.ghost,
                disabled && styles.disabled,
                style,
            ]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={isOutline || isGhost ? Colors.primary : Colors.surface} />
            ) : (
                <>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text
                        style={[
                            styles.text,
                            isOutline && styles.outlineText,
                            isGhost && styles.ghostText,
                            disabled && styles.disabledText,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </Touchable>
    );
};

const styles = StyleSheet.create({
    base: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    secondary: {
        backgroundColor: Colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        backgroundColor: Colors.border,
        borderColor: Colors.border,
    },
    text: {
        color: Colors.surface,
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.semiBold,
    },
    outlineText: {
        color: Colors.primary,
    },
    ghostText: {
        color: Colors.primary,
    },
    disabledText: {
        color: Colors.muted,
    },
    iconContainer: {
        marginRight: Spacing.sm,
    },
});
