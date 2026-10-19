/**
 * UltimateHealth Admin — Health & Clinical Tech Design Tokens
 */

// Core Brand & Clinical Tokens
export const PRIMARY_COLOR = '#0891B2'; // Clinical Teal/Cyan 600
export const PRIMARY_DARK = '#0E7490';  // Deep Medical Teal 700
export const PRIMARY_LIGHT = '#E0F2FE'; // Light Medical Cyan 100
export const BUTTON_COLOR = '#0284C7';  // High-Trust Medical Blue 600
export const ON_PRIMARY_COLOR = '#F0F9FF'; // Soft Clinical White/Ice 50
export const SECONDARY_COLOR = '#0891B2';

// Typography & Neutrals
export const TEXT_PRIMARY = '#0F172A';   // Slate 900 (High contrast heading)
export const TEXT_SECONDARY = '#475569'; // Slate 600 (Balanced readability)
export const TEXT_MUTED = '#94A3B8';     // Slate 400 (Subtle metadata)
export const BORDER_COLOR = '#E2E8F0';   // Slate 200 (Clean hairline dividers)
export const BORDER_LIGHT = '#F1F5F9';   // Slate 100
export const CARD_BG = '#FFFFFF';        // Crisp Clinical White
export const SCREEN_BG = '#F8FAFC';      // Soft Clinical Background

// Clinical Status Chips & Action Colors
export const STATUS_COLORS = {
  // Published / Approved / Completed
  approved: {
    bg: '#ECFDF5',
    text: '#059669',
    border: '#A7F3D0',
    icon: '#10B981',
  },
  // In Review / In Progress / Assigned
  in_progress: {
    bg: '#ECFEFF',
    text: '#0891B2',
    border: '#A5F3FC',
    icon: '#06B6D4',
  },
  // Pending / Unassigned / Waiting
  pending: {
    bg: '#FFFBEB',
    text: '#D97706',
    border: '#FDE68A',
    icon: '#F59E0B',
  },
  // Unassigned / Open Queue
  unassigned: {
    bg: '#F1F5F9',
    text: '#475569',
    border: '#CBD5E1',
    icon: '#64748B',
  },
  // Rejected / Discarded / Violation
  discarded: {
    bg: '#FEF2F2',
    text: '#DC2626',
    border: '#FECACA',
    icon: '#EF4444',
  },
};

// Elevations & Borders
export const CLINICAL_SHADOW = {
  shadowColor: '#0F172A',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
};

export const CLINICAL_SHADOW_SUBTLE = {
  shadowColor: '#0F172A',
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.03,
  shadowRadius: 4,
  elevation: 1,
};

// Dark Mode Semantic Palette
export const DARK_THEME = {
  screenBg: '#090D16',
  surfaceBg: '#131B2E',
  cardBg: '#1A233A',
  borderColor: '#263352',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#38BDF8',
  primaryBg: '#0C2B4E',
};