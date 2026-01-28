/**
 * Color Constants for HyperBuds App
 * 
 * This file provides consistent color classes and utilities across the application.
 * All components should use these constants instead of hardcoded color values.
 */

// Brand Colors (Primary Purple Theme)
export const brandColors = {
  primary: {
    light: "purple-500",
    dark: "purple-400",
    bg: "bg-purple-500",
    text: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-200 dark:border-purple-700",
    hover: "hover:bg-purple-600 dark:hover:bg-purple-500",
  },
  secondary: {
    light: "blue-500",
    dark: "blue-400",
    bg: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-700",
    hover: "hover:bg-blue-600 dark:hover:bg-blue-500",
  },
  gradient: {
    from: "from-purple-500",
    to: "to-pink-500",
    via: "via-blue-500",
    full: "bg-linear-to-r from-purple-500 to-pink-500",
    hover: "hover:from-purple-600 hover:to-pink-600",
  },
} as const;

// Status Colors
export const statusColors = {
  success: {
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-800 dark:text-green-300",
    border: "border-green-300 dark:border-green-700",
    icon: "text-green-600 dark:text-green-400",
  },
  warning: {
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    text: "text-yellow-800 dark:text-yellow-300",
    border: "border-yellow-300 dark:border-yellow-700",
    icon: "text-yellow-600 dark:text-yellow-400",
  },
  error: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-800 dark:text-red-300",
    border: "border-red-300 dark:border-red-700",
    icon: "text-red-600 dark:text-red-400",
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
    icon: "text-blue-600 dark:text-blue-400",
  },
  pending: {
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    text: "text-yellow-800 dark:text-yellow-300",
    border: "border-yellow-300 dark:border-yellow-700",
  },
} as const;

// Background Colors
export const backgroundColors = {
  white: "bg-white dark:bg-gray-900",
  gray: {
    light: "bg-gray-50 dark:bg-gray-800",
    medium: "bg-gray-100 dark:bg-gray-700/50",
    dark: "bg-gray-800 dark:bg-gray-900",
  },
  card: "bg-white dark:bg-gray-800",
  surface: "bg-white dark:bg-gray-950",
} as const;

// Border Colors
export const borderColors = {
  default: "border-gray-200 dark:border-gray-700",
  light: "border-gray-100 dark:border-gray-800",
  medium: "border-gray-300 dark:border-gray-600",
  accent: "border-purple-400 dark:border-purple-500",
  hover: "hover:border-purple-400 dark:hover:border-purple-500",
} as const;

// Text Colors
export const textColors = {
  primary: "text-gray-900 dark:text-white",
  secondary: "text-gray-600 dark:text-gray-400",
  muted: "text-gray-500 dark:text-gray-500",
  inverse: "text-white dark:text-gray-900",
} as const;

// Notification Type Colors
export const notificationColors = {
  match: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
  message: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  collaboration: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  collaboration_invite: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  collaboration_accepted: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  collaboration_rejected: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  collaboration_scheduled: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  marketplace_order: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
  marketplace_review: "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30",
  streaming_invite: "text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30",
  payment_received: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  payment_failed: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  system: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30",
  new_follower: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
  achievement: "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30",
} as const;

// Booking Status Colors
export const bookingStatusColors = {
  pending: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
  accepted: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700",
  in_progress: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700",
  delivered: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700",
  completed: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
  cancelled: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700",
  refunded: "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600",
} as const;

// Helper function to combine color classes
export const combineColors = (...classes: string[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Common color combinations
export const colorCombinations = {
  card: combineColors(
    backgroundColors.card,
    borderColors.default,
    textColors.primary
  ),
  cardHover: combineColors(
    backgroundColors.card,
    borderColors.hover,
    "hover:shadow-lg transition-all"
  ),
  buttonPrimary: combineColors(
    brandColors.gradient.full,
    "text-white",
    brandColors.gradient.hover
  ),
  input: combineColors(
    backgroundColors.gray.light,
    borderColors.default,
    textColors.primary
  ),
} as const;
