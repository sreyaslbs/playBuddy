import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme/Styles';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    className?: string; // For Next.js/Web support
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    className,
    icon,
    ...props
}) => {
    // Cast View to any for className support via react-native-web
    const StyledView: any = View;

    return (
        <StyledView style={[styles.container, containerStyle]} className={className}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        error ? styles.inputError : null,
                        props.multiline ? styles.multiline : null,
                        icon ? styles.inputWithIcon : null,
                    ]}
                    placeholderTextColor={Colors.muted}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </StyledView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
        width: '100%',
    },
    label: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.medium,
        color: Colors.text,
        marginBottom: Spacing.xs,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    iconContainer: {
        position: 'absolute',
        left: Spacing.md,
        zIndex: 1,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        fontSize: Typography.size.md,
        color: Colors.text,
        minHeight: 52,
        flex: 1,
    },
    inputWithIcon: {
        paddingLeft: Spacing.md * 2.5,
    },
    inputError: {
        borderColor: Colors.error,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.size.xs,
        marginTop: Spacing.xs,
        marginLeft: 4,
    },
});
