/**
 * Design tokens — single source of truth for the Uburiza Learn design system.
 */

// ─── Buttons ─────────────────────────────────────────────────────────────────
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 bg-[#1e4c31] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#163824] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150';

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 bg-white text-[#1e4c31] text-sm font-semibold px-5 py-2.5 rounded-lg border border-emerald-300 hover:bg-emerald-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150';

export const btnDanger =
  'inline-flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150';

export const btnGhost =
  'inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 transition-colors duration-150';

// ─── Cards ───────────────────────────────────────────────────────────────────
export const card = 'bg-white border border-gray-200 rounded-xl shadow-sm';

// ─── Form elements ───────────────────────────────────────────────────────────
export const input =
  'w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e4c31] focus:border-transparent transition duration-150';

export const inputWithIcon =
  'w-full bg-white border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e4c31] focus:border-transparent transition duration-150';

export const label = 'block text-sm font-medium text-gray-700 mb-1.5';

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const alertError =
  'flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3';

export const alertSuccess =
  'flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3';

// ─── Badges ──────────────────────────────────────────────────────────────────
export const badgeGreen =
  'inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full';

export const badgeAmber =
  'inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-full';

export const badgeGray =
  'inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold px-2.5 py-0.5 rounded-full';

export const badgeRed =
  'inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-2.5 py-0.5 rounded-full';

// ─── Typography ──────────────────────────────────────────────────────────────
export const pageTitle = 'text-2xl font-bold text-gray-900 tracking-tight';
export const sectionTitle = 'text-lg font-semibold text-gray-900';
export const textMuted = 'text-sm text-gray-500';

// ─── Layout ──────────────────────────────────────────────────────────────────
export const pagePadding = 'p-6 md:p-8';
export const divider = 'border-t border-gray-200';
