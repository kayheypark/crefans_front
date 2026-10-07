import type { ThemeConfig } from 'antd';
import { designTokens as t } from './tokens';

export const redesignTheme: ThemeConfig = {
  token: {
    colorPrimary: t.color.accent, colorPrimaryHover: t.color.accentHover, colorPrimaryActive: t.color.accentActive,
    colorPrimaryBg: t.color.accentSoft, colorPrimaryBorder: t.color.accentBorder,
    colorLink: t.color.accent, colorLinkHover: t.color.accentHover,
    colorText: t.color.text, colorTextSecondary: t.color.textSecondary, colorTextTertiary: t.color.textMuted,
    colorTextDisabled: t.color.disabledText, colorBgContainerDisabled: t.color.disabledBg,
    colorBgContainer: t.color.surface, colorBgLayout: t.color.canvas, colorBgElevated: t.color.surface,
    colorBorder: t.color.borderStrong, colorBorderSecondary: t.color.border,
    colorSuccess: t.color.success, colorWarning: t.color.warning, colorError: t.color.danger, colorInfo: t.color.info,
    colorBgMask: t.color.overlay, colorTextLightSolid: t.color.onAccent,
    fontFamily: t.typography.fontFamily, fontSize: t.typography.body.size, lineHeight: t.typography.body.lineHeight,
    fontWeightStrong: t.typography.h1.weight,
    lineHeightHeading1: t.typography.h1.lineHeight, lineHeightHeading2: t.typography.h2.lineHeight, lineHeightHeading3: t.typography.h3.lineHeight,
    fontSizeHeading1: t.typography.h1.size, fontSizeHeading2: t.typography.h2.size, fontSizeHeading3: t.typography.h3.size,
    borderRadius: t.radius.control, borderRadiusLG: t.radius.card, borderRadiusSM: t.radius.small,
    controlHeight: t.size.control, controlHeightSM: t.size.controlSmall, controlHeightLG: t.size.controlLarge,
    controlOutline: t.color.accentBorder, lineWidth: t.border.width,
    boxShadow: t.shadow.popover, boxShadowSecondary: t.shadow.card,
    motionDurationFast: `${t.motion.fast}ms`, motionDurationMid: `${t.motion.normal}ms`, motionDurationSlow: `${t.motion.slow}ms`,
  },
  components: {
    Button: { fontWeight: t.typography.label.weight, primaryShadow: 'none', defaultShadow: 'none' },
    Input: { activeShadow: t.shadow.focus },
    Select: { optionSelectedBg: t.color.accentSoft },
    Card: { paddingLG: t.space[6] },
    Tabs: { inkBarColor: t.color.accent, itemSelectedColor: t.color.accent },
    Modal: { borderRadiusLG: t.radius.modal },
    Menu: { itemSelectedBg: t.color.accentSoft, itemSelectedColor: t.color.accent },
  },
};
