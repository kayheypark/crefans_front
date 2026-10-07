/** Shared service palette: familiar blue actions, pale blue surfaces and neutral text. */
export const palette = {
  white: '#FFFFFF',
  blue: { 50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF' },
  gray: { 50: '#FAFBFD', 100: '#F2F4F8', 200: '#E5E8EF', 300: '#CDD2DF', 400: '#9BA3B5', 500: '#6C7283', 600: '#545B70', 800: '#323849', 900: '#202333' },
  green: '#15803D', amber: '#A16207', red: '#DC2626',
} as const;

export const designTokens = {
  service: {brand: palette.blue[600], 'brand-soft': palette.blue[50]},
  landing: {
    ink: palette.gray[900], inkHover: palette.gray[800], accent: palette.blue[600], icon: palette.blue[600],
    accentSoft: palette.blue[50], soft: palette.gray[50], muted: palette.gray[500], line: palette.gray[200],
    banner: '#20293E', bannerGlow: '#354F72', signature: palette.blue[200], onBanner: '#E2E8F3', buttonRadius: 8, cardRadius: 10,
  },
  color: {
    accent: palette.blue[600], accentHover: palette.blue[700], accentActive: palette.blue[800],
    accentSoft: palette.blue[50], accentBorder: palette.blue[200],
    complementary: palette.blue[800], complementarySoft: palette.blue[50], complementaryBorder: palette.blue[200],
    avatarInk: palette.blue[600], avatarBg: palette.blue[100],
    canvas: palette.gray[50], surface: palette.white, surfaceSubtle: palette.gray[100],
    text: palette.gray[900], textSecondary: palette.gray[600], textMuted: palette.gray[500],
    onAccent: palette.white, border: palette.gray[200], borderStrong: palette.gray[300],
    disabledBg: palette.gray[100], disabledText: palette.gray[400],
    success: palette.green, successSoft: '#F0FDF4', warning: palette.amber, warningSoft: '#FFFBEB',
    danger: palette.red, dangerSoft: '#FEF2F2', info: palette.blue[600], infoSoft: '#EFF6FF',
    focus: palette.blue[600], overlay: 'rgba(32, 35, 51, 0.45)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: { size: 40, lineHeight: 1.25, weight: 700 },
    h1: { size: 32, lineHeight: 1.3, weight: 700 },
    h2: { size: 24, lineHeight: 1.4, weight: 700 },
    h3: { size: 20, lineHeight: 1.4, weight: 700 },
    body: { size: 14, lineHeight: 1.6, weight: 400 },
    label: { size: 13, lineHeight: 1.5, weight: 600 },
    caption: { size: 12, lineHeight: 1.5, weight: 400 },
  },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 },
  radius: { small: 6, control: 12, card: 20, modal: 24, pill: 999 },
  size: { controlSmall: 32, control: 40, controlLarge: 48, touchTarget: 44, contentMax: 1200, sidebar: 224 },
  border: { width: 1 },
  shadow: { card: '0 2px 12px rgba(32,35,51,0.04)', popover: '0 8px 32px rgba(32,35,51,0.12)', focus: '0 0 0 3px rgba(37,99,235,0.18)' },
  motion: { fast: 120, normal: 200, slow: 320, chart: 600, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  breakpoint: { mobile: 480, tablet: 768, desktop: 1024, wide: 1280 },
} as const;

export function flattenTokens(value: object, prefix = ''): Record<string, string | number> {
  return Object.fromEntries(Object.entries(value).flatMap(([key, entry]) => {
    const name = prefix ? `${prefix}-${key}` : key;
    return typeof entry === 'object' && entry !== null
      ? Object.entries(flattenTokens(entry, name)) : [[name, entry]];
  }));
}

/** CSS and TypeScript consumers share the same source; dimension values receive CSS units. */
export const designVariables = Object.fromEntries(
  Object.entries(flattenTokens(designTokens)).map(([key, value]) => [
    `--cf-${key}`,
    typeof value === 'number'
      ? `${value}${key.startsWith('motion-') ? 'ms' : /weight|lineHeight/.test(key) ? '' : 'px'}`
      : value,
  ]),
);
