// AI Service - MiniMax API integration
import { supabase } from "@/integrations/supabase/client";

const MINIMAX_API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const MINIMAX_MODEL = "MiniMax-Text-01";

export interface AnalyzeResponsesParams {
  moodDistribution: Array<{ mood: string; count: number; percentage: number }>;
  topReasons: Array<{ reason: string; count: number; percentage: number }>;
  riskCount: number;
  responseRate: number;
  overallIndex: number;
  criticalComplaints: Array<{ reason: string; category?: string; branch?: string; department?: string }>;
}

export interface PredictRiskParams {
  branch: string;
}

export interface AIAnalysisResult {
  score: number;
  summary: string;
  observations: string[];
  recommendations: string[];
  riskLevel: string;
  criticalAlerts?: string[];
  tasks?: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    targetEmployee?: string;
    department?: string;
    category?: string;
  }>;
}

export interface RiskPredictionResult {
  stressChangePercent: number;
  complaintRiskPercent: number;
  salesImpactPercent: number;
  predictionText: string;
  confidenceScore: number;
  factors: {
    stressTrend: string;
    salesTrend: string;
    complaintTrend: string;
    keyRisks: string[];
    recommendations: string[];
  };
}

// Fallback analysis when AI fails
function createFallbackAnalysis(
  overallIndex: number,
  riskCount: number,
  topReasons: any[],
  criticalComplaints: any[]
): AIAnalysisResult {
  const keywordList = [
    "zorakılıq", "döy", "doy", "döyül", "söy", "söyüş",
    "təhqir", "mobbing", "təzyiq", "hədə", "hədəl",
    "qorxu", "vur", "şiddət", "şikayət"
  ];

  const complaintReasons = Array.isArray(criticalComplaints)
    ? criticalComplaints.map((c: any) => String(c?.reason ?? "").trim()).filter(Boolean)
    : [];

  const flaggedComplaints = complaintReasons.filter((txt) => {
    const lower = txt.toLowerCase();
    return keywordList.some((k) => lower.includes(k));
  });

  const hasCritical = flaggedComplaints.length > 0;
  const riskLevel = hasCritical ? "kritik" : riskCount > 5 ? "yüksək" : riskCount > 0 ? "orta" : "aşağı";
  const scoreBase = typeof overallIndex === "number" ? overallIndex : 0;
  const score = hasCritical ? Math.min(scoreBase, 20) : scoreBase;

  const topReasonLine = Array.isArray(topReasons) && topReasons.length > 0
    ? `Əsas səbəb: ${topReasons[0]?.reason ?? ""} (${topReasons[0]?.percentage ?? 0}%)`
    : "Əsas səbəb: Qeyd olunmayıb";

  return {
    score,
    summary: "AI analizi hazırlanır...",
    observations: [
      `Ümumi indeks: ${scoreBase}%`,
      `Risk halusı: ${riskCount}`,
      topReasonLine,
    ],
    recommendations: hasCritical
      ? [
          "Kritik şikayətləri dərhal araşdırın və müdaxilə edin.",
          "Şikayət edən işçi(lər) üçün 1-1 görüş planlayın.",
          "Filial rəhbərliyi ilə təcili tədbir planı hazırlayın.",
        ]
      : [
          "Əsas şikayət səbəbləri üzrə qısa fəaliyyət planı hazırlayın.",
          "Komanda yüklənməsini və qrafiki yenidən qiymətləndirin.",
          "Növbəti həftə üçün izləmə indikatorları təyin edin.",
        ],
    riskLevel,
    criticalAlerts: hasCritical
      ? flaggedComplaints.slice(0, 3).map((t) => `Kritik şikayət: "${t.slice(0, 140)}"`)
      : [],
    tasks: [],
  };
}

// Analyze employee responses
export async function analyzeResponses(params: AnalyzeResponsesParams): Promise<{
  analysis: AIAnalysisResult;
  source: string;
}> {
  const { moodDistribution, topReasons, riskCount, responseRate, overallIndex, criticalComplaints } = params;

  const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY;

  // If no API key, return fallback
  if (!MINIMAX_API_KEY) {
    return {
      analysis: createFallbackAnalysis(overallIndex, riskCount, topReasons, criticalComplaints),
      source: "fallback"
    };
  }

  // Handle both array and object formats for moodDistribution
  let moodDistributionText = "";
  if (Array.isArray(moodDistribution)) {
    moodDistributionText = moodDistribution.map((m) => `- ${m.mood}: ${m.count} nəfər (${m.percentage}%)`).join('\n');
  } else if (typeof moodDistribution === 'object' && moodDistribution !== null) {
    moodDistributionText = Object.entries(moodDistribution).map(([mood, percentage]) => `- ${mood}: ${percentage}%`).join('\n');
  }

  // Handle both array formats for topReasons
  let topReasonsText = "";
  if (Array.isArray(topReasons)) {
    topReasonsText = topReasons.map((r: any, i: number) => `${i + 1}. ${r.reason}: ${r.count || ''} nəfər (${r.percentage}%)`).join('\n');
  }

  // Handle critical complaints
  let criticalComplaintsText = "";
  if (Array.isArray(criticalComplaints) && criticalComplaints.length > 0) {
    criticalComplaintsText = criticalComplaints.map((c: any, i: number) =>
      `${i + 1}. "${c.reason}" (Kateqoriya: ${c.category || "Qeyd olunmayıb"}, Filial: ${c.branch}, Şöbə: ${c.department})`
    ).join('\n');
  }

  const systemPrompt = `Sən HR analitika ekspertisən. Sənə işçilərin əhval sorğularının nəticələri veriləcək.

XÜSUSI DİQQƏT: Kritik şikayətlər bölməsinə xüsusi diqqət yetir! Bu bölmədə işçilərin sərbəst mətn şikayətləri var. Əgər orada zorakılıq, təhqir, döyülmə, söyülmə, mobbing və ya digər ciddi problemlər haqqında şikayət varsa, bunu MÜTLƏQİ qeyd et və risk səviyyəsini "kritik" olaraq təyin et!

Cavabını aşağıdakı JSON formatında ver...`;

  const userPrompt = `İşçi sorğusu nəticələri:

Ümumi məmnuniyyət indeksi: ${overallIndex}%
Cavab dərəcəsi: ${responseRate}%
Risk halusı sayı: ${riskCount}

Əhval bölgüsü:
${moodDistributionText}

PİS ƏHVALIN KÖK SƏBƏBLƏRİ (ən çox qeyd edilənlər):
${topReasonsText || "Qeyd olunmayıb"}

⚠️ KRİTİK ŞİKAYƏTLƏR (işçilərin sərbəst mətn cavabları):
${criticalComplaintsText || "Kritik şikayət yoxdur"}

Bu məlumatlara əsasən JSON formatında ətraflı analiz ver...`;

  try {
    const response = await fetch(MINIMAX_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("MiniMax API error:", response.status);
      return {
        analysis: createFallbackAnalysis(overallIndex, riskCount, topReasons, criticalComplaints),
        source: "fallback"
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return { analysis, source: "minimax-ai" };
    }

    return {
      analysis: createFallbackAnalysis(overallIndex, riskCount, topReasons, criticalComplaints),
      source: "fallback"
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return {
      analysis: createFallbackAnalysis(overallIndex, riskCount, topReasons, criticalComplaints),
      source: "fallback"
    };
  }
}

// Predict risk for branch
export async function predictRisk(branch: string): Promise<{
  prediction: RiskPredictionResult;
  source: string;
}> {
  const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY;

  // Fetch last 7 days of data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: responses } = await supabase
    .from("employee_responses")
    .select("*")
    .eq("branch", branch)
    .gte("response_date", sevenDaysAgo.toISOString().split("T")[0]);

  const { data: metrics } = await supabase
    .from("external_metrics")
    .select("*")
    .eq("branch", branch)
    .gte("metric_date", sevenDaysAgo.toISOString().split("T")[0])
    .order("metric_date", { ascending: true });

  // Calculate metrics
  const moodScores: Record<string, number> = {
    "Əla": 100, "Yaxşı": 75, "Normal": 50, "Pis": 25, "Çox pis": 0
  };

  const totalResponses = responses?.length || 0;
  const avgMoodScore = totalResponses > 0
    ? responses.reduce((sum, r) => sum + (moodScores[r.mood] || 50), 0) / totalResponses
    : 50;

  // Calculate stress change
  const midPoint = Math.floor((responses?.length || 0) / 2);
  const firstHalf = responses?.slice(0, midPoint) || [];
  const secondHalf = responses?.slice(midPoint) || [];

  const firstHalfAvg = firstHalf.length > 0
    ? firstHalf.reduce((sum, r) => sum + (moodScores[r.mood] || 50), 0) / firstHalf.length
    : 50;
  const secondHalfAvg = secondHalf.length > 0
    ? secondHalf.reduce((sum, r) => sum + (moodScores[r.mood] || 50), 0) / secondHalf.length
    : 50;

  const stressChange = firstHalfAvg - secondHalfAvg;

  // Calculate sales trend
  const salesTrend = metrics && metrics.length >= 2
    ? ((metrics[metrics.length - 1].daily_sales - metrics[0].daily_sales) / metrics[0].daily_sales) * 100
    : 0;

  // Calculate complaints
  const totalComplaints = metrics?.reduce((sum, m) => sum + (m.customer_complaints || 0), 0) || 0;
  const avgComplaints = metrics && metrics.length > 0 ? totalComplaints / metrics.length : 0;

  // Create fallback prediction
  const createFallbackPrediction = (): RiskPredictionResult => ({
    stressChangePercent: stressChange,
    complaintRiskPercent: Math.min(100, Math.max(0, 50 + stressChange * 2)),
    salesImpactPercent: salesTrend,
    predictionText: `Stress ${stressChange > 0 ? 'artıb' : 'azalıb'}. Satış trendi: ${salesTrend.toFixed(1)}%`,
    confidenceScore: 60,
    factors: {
      stressTrend: stressChange > 5 ? "artan" : stressChange < -5 ? "azalan" : "sabit",
      salesTrend: salesTrend > 5 ? "artan" : salesTrend < -5 ? "azalan" : "sabit",
      complaintTrend: avgComplaints > 5 ? "artan" : "sabit",
      keyRisks: stressChange > 10 ? ["Yüksək stress səviyyəsi"] : [],
      recommendations: ["İşçilərlə görüşlər keçirin"]
    }
  });

  if (!MINIMAX_API_KEY) {
    return { prediction: createFallbackPrediction(), source: "fallback" };
  }

  // Call MiniMax API
  try {
    const response = await fetch(MINIMAX_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages: [{ role: "user", content: `Branch: ${branch}, Stress: ${stressChange}%, Sales: ${salesTrend}%` }],
      }),
    });

    if (!response.ok) {
      return { prediction: createFallbackPrediction(), source: "fallback" };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { prediction: JSON.parse(jsonMatch[0]), source: "minimax-ai" };
    }

    return { prediction: createFallbackPrediction(), source: "fallback" };
  } catch {
    return { prediction: createFallbackPrediction(), source: "fallback" };
  }
}