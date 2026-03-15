export const Colors = {
    primary: '#2DD4BF', // Teal-400 (Vibrant & Modern)
    secondary: '#0F172A', // Slate-900 (Deep/Premium Dark)
    accent: '#F59E0B', // Amber-500 (For booking/status)
    background: '#F8FAFC', // Slate-50
    surface: '#FFFFFF',
    text: '#1E293B',
    muted: '#64748B',
    border: '#E2E8F0',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#FBBF24',
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const Typography = {
    size: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
    weight: {
        regular: '400' as const,
        medium: '500' as const,
        semiBold: '600' as const,
        bold: '700' as const,
    },
};
