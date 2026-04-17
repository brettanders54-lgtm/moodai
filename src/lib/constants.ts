// Branch name mappings (code -> Azerbaijani name)
export const BRANCH_NAMES: Record<string, string> = {
  'baku': 'Bakı Mərkəz',
  'ganja': 'Gəncə',
  'sumgait': 'Sumqayıt',
  'mingachevir': 'Mingəçevir',
  'shirvan': 'Şirvan',
  'lankaran': 'Lənkəran',
  'shaki': 'Şəki',
  'quba': 'Quba',
  'nakhchivan': 'Naxçıvan',
};

export const BRANCH_CODES = Object.keys(BRANCH_NAMES);

// Mood type mappings
export const MOOD_SCORES: Record<string, number> = {
  'Əla': 100,
  'Yaxşı': 75,
  'Normal': 50,
  'Pis': 25,
  'Çox pis': 0,
};

// Mood display configuration
export const MOOD_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  'Əla': { emoji: '😄', color: 'text-emerald-500', label: 'Əla' },
  'Yaxşı': { emoji: '🙂', color: 'text-green-500', label: 'Yaxşı' },
  'Normal': { emoji: '😐', color: 'text-amber-500', label: 'Normal' },
  'Pis': { emoji: '😟', color: 'text-orange-500', label: 'Pis' },
  'Çox pis': { emoji: '😢', color: 'text-red-500', label: 'Çox pis' },
};

// Reason category mappings (code -> Azerbaijani)
export const REASON_CATEGORIES: Record<string, string> = {
  workload: 'İş yükü',
  schedule: 'Qrafik',
  manager: 'Menecer',
  team: 'Komanda',
  conditions: 'Şərtlər',
  other: 'Digər',
};

export const REASON_CODES = Object.keys(REASON_CATEGORIES);

// Risk level thresholds
export const RISK_THRESHOLDS = {
  critical: 70,
  high: 50,
  medium: 30,
};

// Application metadata
export const APP_METADATA = {
  name: 'OBA Mood AI',
  version: '1.0.0',
  description: 'İşçi əhvalı izləmə və burnout riski monitorinqi sistemi',
};
