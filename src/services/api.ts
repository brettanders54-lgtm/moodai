// API utilities and helpers
import { format, subDays } from "date-fns";
import { az } from "date-fns/locale";

// Date utilities
export function getDefaultDateRange() {
  return {
    from: subDays(new Date(), 7),
    to: new Date(),
  };
}

export function formatDateForSupabase(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDateDisplay(date: Date | string, formatStr: string = "d MMMM yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, formatStr, { locale: az });
}

// Branch utilities
export const BRANCH_CODES = [
  "baku", "ganja", "sumgait", "mingachevir",
  "shirvan", "lankaran", "shaki", "quba", "nakhchivan"
] as const;

export type BranchCode = typeof BRANCH_CODES[number];

export const BRANCH_NAMES: Record<BranchCode, string> = {
  baku: "Bakı Mərkəz",
  ganja: "Gəncə",
  sumgait: "Sumqayıt",
  mingachevir: "Mingəçevir",
  shirvan: "Şirvan",
  lankaran: "Lənkəran",
  shaki: "Şəki",
  quba: "Quba",
  nakhchivan: "Naxçıvan",
};

export function getBranchName(code: string): string {
  return BRANCH_NAMES[code as BranchCode] || code;
}

// Mood utilities
export const MOOD_SCORES: Record<string, number> = {
  "Əla": 100,
  "Yaxşı": 75,
  "Normal": 50,
  "Pis": 25,
  "Çox pis": 0,
};

export const MOOD_LABELS = {
  high: "Yaxşı",
  medium: "Normal",
  low: "Pis",
};

export type MoodLevel = keyof typeof MOOD_LABELS;

export function getMoodLevel(mood: string): MoodLevel {
  const score = MOOD_SCORES[mood] || 50;
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export function getMoodColor(mood: string): string {
  const score = MOOD_SCORES[mood] || 50;
  if (score >= 75) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

// Risk utilities
export const RISK_THRESHOLDS = {
  critical: 70,
  high: 50,
  medium: 30,
};

export function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= RISK_THRESHOLDS.critical) return "critical";
  if (score >= RISK_THRESHOLDS.high) return "high";
  if (score >= RISK_THRESHOLDS.medium) return "medium";
  return "low";
}

// Chart color palette
export const CHART_COLORS = {
  primary: ["#10b981", "#f59e0b", "#ef4444"],
  secondary: ["#3b82f6", "#8b5cf6", "#ec4899"],
  neutral: ["#6b7280", "#9ca3af", "#d1d5db"],
};

// Percentage utilities
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Local storage helpers
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Error message formatter
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("Invalid login credentials")) {
      return "Email və ya şifrə yanlışdır";
    }
    if (error.message.includes("User already registered")) {
      return "Bu email artıq qeydiyyatdan keçib";
    }
    return error.message;
  }
  return "Naməlum xəta baş verdi";
}