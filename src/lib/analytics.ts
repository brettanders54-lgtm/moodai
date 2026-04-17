import { MOOD_SCORES, BRANCH_NAMES } from './constants';

// Response type from database
export interface EmployeeResponse {
  id: string;
  employee_code: string;
  branch: string;
  department: string;
  mood: string;
  reason: string | null;
  reason_category: string | null;
  response_date: string;
  created_at: string;
}

// Mood distribution calculation result
export interface MoodDistribution {
  mood: string;
  count: number;
  percentage: number;
  color: 'status-good' | 'status-normal' | 'status-bad';
}

// Top reason calculation result
export interface TopReason {
  reason: string;
  count: number;
  percentage: number;
}

// Calculate mood distribution from responses
export function calculateMoodDistribution(responses: EmployeeResponse[]): MoodDistribution[] {
  const totalResponses = responses.length;

  const moodCounts = {
    'Yaxşı': responses.filter(r => r.mood === 'Yaxşı').length,
    'Normal': responses.filter(r => r.mood === 'Normal').length,
    'Pis': responses.filter(r => r.mood === 'Pis').length,
  };

  return [
    {
      mood: 'Yaxşı',
      count: moodCounts['Yaxşı'],
      percentage: totalResponses > 0 ? Math.round((moodCounts['Yaxşı'] / totalResponses) * 100) : 0,
      color: 'status-good',
    },
    {
      mood: 'Normal',
      count: moodCounts['Normal'],
      percentage: totalResponses > 0 ? Math.round((moodCounts['Normal'] / totalResponses) * 100) : 0,
      color: 'status-normal',
    },
    {
      mood: 'Pis',
      count: moodCounts['Pis'],
      percentage: totalResponses > 0 ? Math.round((moodCounts['Pis'] / totalResponses) * 100) : 0,
      color: 'status-bad',
    },
  ];
}

// Calculate top reasons from responses
export function calculateTopReasons(responses: EmployeeResponse[], limit: number = 5): TopReason[] {
  const reasonCounts: Record<string, number> = {};

  responses.forEach(r => {
    if (r.reason_category) {
      reasonCounts[r.reason_category] = (reasonCounts[r.reason_category] || 0) + 1;
    }
  });

  const totalReasons = Object.values(reasonCounts).reduce((a, b) => a + b, 0);

  return Object.entries(reasonCounts)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: totalReasons > 0 ? Math.round((count / totalReasons) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Calculate overall satisfaction index
export function calculateSatisfactionIndex(responses: EmployeeResponse[]): number {
  const totalResponses = responses.length;
  if (totalResponses === 0) return 0;

  const moodCounts = {
    'Yaxşı': responses.filter(r => r.mood === 'Yaxşı').length,
    'Normal': responses.filter(r => r.mood === 'Normal').length,
    'Pis': responses.filter(r => r.mood === 'Pis').length,
  };

  return Math.round(
    ((moodCounts['Yaxşı'] * 100 + moodCounts['Normal'] * 50 + moodCounts['Pis'] * 0) / totalResponses)
  );
}

// Calculate branch comparison data
export function calculateBranchComparison(responses: EmployeeResponse[]): Record<string, { satisfaction: number; count: number }> {
  const branchData: Record<string, { totalScore: number; count: number }> = {};

  responses.forEach(r => {
    if (!branchData[r.branch]) {
      branchData[r.branch] = { totalScore: 0, count: 0 };
    }
    branchData[r.branch].totalScore += MOOD_SCORES[r.mood] || 50;
    branchData[r.branch].count++;
  });

  const result: Record<string, { satisfaction: number; count: number }> = {};
  Object.entries(branchData).forEach(([branch, data]) => {
    result[branch] = {
      satisfaction: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      count: data.count,
    };
  });

  return result;
}

// Get risk level from mood score
export function getRiskLevelFromMood(mood: string): 'low' | 'medium' | 'high' | 'critical' {
  const score = MOOD_SCORES[mood] || 50;
  if (score >= 75) return 'low';
  if (score >= 50) return 'medium';
  if (score >= 25) return 'high';
  return 'critical';
}

// Format branch name
export function formatBranchName(branchCode: string): string {
  return BRANCH_NAMES[branchCode] || branchCode;
}
