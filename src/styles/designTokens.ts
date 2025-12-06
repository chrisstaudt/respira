/**
 * Design Tokens - Semantic Color System
 *
 * These tokens provide meaningful names for colors used throughout the app.
 * Instead of using arbitrary colors like "blue-600", use semantic names that
 * describe the purpose: "primary", "success", "warning", etc.
 */

export const colors = {
  // Primary - Main brand color for primary actions
  primary: {
    DEFAULT: '#2563eb', // blue-600
    hover: '#1d4ed8',   // blue-700
    active: '#1e40af',  // blue-800
    light: '#dbeafe',   // blue-50
    border: '#93c5fd',  // blue-300
  },

  // Success - Positive states, completion
  success: {
    DEFAULT: '#16a34a', // green-600
    hover: '#15803d',   // green-700
    active: '#166534',  // green-800
    light: '#dcfce7',   // green-50
    border: '#86efac',  // green-300
  },

  // Warning - Caution, waiting states
  warning: {
    DEFAULT: '#f59e0b', // amber-500
    hover: '#d97706',   // amber-600
    active: '#b45309',  // amber-700
    light: '#fef3c7',   // amber-50
    border: '#fcd34d',  // amber-300
  },

  // Danger - Errors, destructive actions
  danger: {
    DEFAULT: '#dc2626', // red-600
    hover: '#b91c1c',   // red-700
    active: '#991b1b',  // red-800
    light: '#fee2e2',   // red-50
    border: '#fca5a5',  // red-300
  },

  // Info - Informational states
  info: {
    DEFAULT: '#0891b2', // cyan-600
    hover: '#0e7490',   // cyan-700
    active: '#155e75',  // cyan-800
    light: '#cffafe',   // cyan-50
    border: '#67e8f9',  // cyan-300
  },

  // Neutral - Secondary actions, borders, backgrounds
  neutral: {
    DEFAULT: '#4b5563', // gray-600
    hover: '#374151',   // gray-700
    active: '#1f2937',  // gray-800
    light: '#f9fafb',   // gray-50
    border: '#d1d5db',  // gray-300
    text: '#6b7280',    // gray-500
  },
};

/**
 * Button Classes - Reusable button styles
 */
export const buttonClasses = {
  // Base styles for all buttons
  base: 'px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',

  // Primary button
  primary: `bg-[${colors.primary.DEFAULT}] text-white hover:bg-[${colors.primary.hover}] active:bg-[${colors.primary.active}] hover:shadow-lg active:scale-[0.98] focus:ring-[${colors.primary.border}]`,

  // Success button
  success: `bg-[${colors.success.DEFAULT}] text-white hover:bg-[${colors.success.hover}] active:bg-[${colors.success.active}] hover:shadow-lg active:scale-[0.98] focus:ring-[${colors.success.border}]`,

  // Warning button
  warning: `bg-[${colors.warning.DEFAULT}] text-white hover:bg-[${colors.warning.hover}] active:bg-[${colors.warning.active}] hover:shadow-lg active:scale-[0.98] focus:ring-[${colors.warning.border}]`,

  // Danger button
  danger: `bg-[${colors.danger.DEFAULT}] text-white hover:bg-[${colors.danger.hover}] active:bg-[${colors.danger.active}] hover:shadow-lg active:scale-[0.98] focus:ring-[${colors.danger.border}]`,

  // Secondary/Neutral button
  secondary: `bg-[${colors.neutral.DEFAULT}] text-white hover:bg-[${colors.neutral.hover}] active:bg-[${colors.neutral.active}] hover:shadow-lg active:scale-[0.98] focus:ring-[${colors.neutral.border}]`,
};

/**
 * Typography Scale
 */
export const typography = {
  // Headings
  h1: 'text-2xl font-bold',
  h2: 'text-xl font-semibold',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-semibold',

  // Body text
  body: 'text-sm',      // 14px - standard body
  bodyLarge: 'text-base', // 16px
  bodySmall: 'text-xs',   // 12px - minimum size

  // Labels
  label: 'text-xs font-medium text-gray-600',

  // Values
  value: 'text-sm font-semibold text-gray-900',
};

/**
 * Spacing Scale
 */
export const spacing = {
  xs: 'gap-2',   // 8px
  sm: 'gap-3',   // 12px
  md: 'gap-4',   // 16px
  lg: 'gap-6',   // 24px

  // Padding
  paddingXs: 'p-2',  // 8px
  paddingSm: 'p-3',  // 12px
  paddingMd: 'p-4',  // 16px
  paddingLg: 'p-6',  // 24px
};

/**
 * Alert/Status Box Classes
 */
export const alertClasses = {
  success: `bg-[${colors.success.light}] text-green-800 border border-[${colors.success.border}] px-3 py-2 rounded-lg text-sm`,
  warning: `bg-[${colors.warning.light}] text-amber-800 border border-[${colors.warning.border}] px-3 py-2 rounded-lg text-sm`,
  danger: `bg-[${colors.danger.light}] text-red-800 border border-[${colors.danger.border}] px-3 py-2 rounded-lg text-sm`,
  info: `bg-[${colors.info.light}] text-cyan-800 border border-[${colors.info.border}] px-3 py-2 rounded-lg text-sm`,
};
