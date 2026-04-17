import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to create fallback analysis
function createFallbackAnalysis(overallIndex: number, riskCount: number, topReasons: any[], criticalComplaints: any[]) {
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
      `Risk halları: ${riskCount}`,
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { moodDistribution, topReasons, riskCount, responseRate, overallIndex, criticalComplaints } = await req.json();
    
    const MINIMAX_API_KEY = Deno.env.get("MINIMAX_API_KEY");
    if (!MINIMAX_API_KEY) {
      throw new Error("MINIMAX_API_KEY is not configured");
    }

    const systemPrompt = `Sən HR analitika ekspertisən. Sənə işçilərin əhval sorğularının nəticələri veriləcək. 

XÜSUSI DİQQƏT: Kritik şikayətlər bölməsinə xüsusi diqqət yetir! Bu bölmədə işçilərin sərbəst mətn şikayətləri var. Əgər orada zorakılıq, təhqir, döyülmə, söyülmə, mobbing və ya digər ciddi problemlər haqqında şikayət varsa, bunu MÜTLƏƏQİ qeyd et və risk səviyyəsini "kritik" olaraq təyin et!

Cavabını aşağıdakı JSON formatında ver:
{
  "score": <0-100 arası ümumi qiymət balı>,
  "summary": "<1-2 cümlə qısa xülasə>",
  "observations": ["<müşahidə 1>", "<müşahidə 2>", "<müşahidə 3>"],
  "recommendations": ["<tövsiyyə 1>", "<tövsiyyə 2>", "<tövsiyyə 3>"],
  "riskLevel": "<aşağı|orta|yüksək|kritik>",
  "criticalAlerts": ["<kritik xəbərdarlıq 1>", "<kritik xəbərdarlıq 2>"],
  "tasks": [
    {
      "id": "<unikal_id>",
      "title": "<tapşırıq başlığı>",
      "description": "<ətraflı təsvir>",
      "priority": "<kritik|yüksək|orta>",
      "targetEmployee": "<işçi kodu əgər varsa>",
      "department": "<şöbə adı>",
      "category": "<kateqoriya: Görüş|Müdaxilə|Araşdırma|Dəyişiklik>"
    }
  ]
}

Tapşırıqlar yaratma qaydaları:
- Hər kritik hal üçün konkret tapşırıq yarat
- Prioritet: kritik (dərhal müdaxilə), yüksək (bu həftə), orta (planlaşdırılmış)
- Kateqoriyalar: "Görüş" (1-1 söhbət), "Müdaxilə" (dərhal tədbir), "Araşdırma" (problem analizi), "Dəyişiklik" (proses dəyişikliyi)
- Ən az 3, ən çox 7 tapşırıq yarat
- Zorakılıq/mobbing halları varsa "kritik" prioritetli tapşırıq MÜTLƏQ olmalıdır!

PİS ƏHVAL SƏBƏBLƏRİNƏ XÜSUSİ DİQQƏT:
- "İş yükü" səbəbi varsa - iş bölgüsünü analiz et
- "Əmək haqqı" səbəbi varsa - motivasiya problemləri qeyd et
- "Rəhbərlik" səbəbi varsa - idarəetmə tərzini araşdır
- "İş mühiti" səbəbi varsa - komanda dinamikasını yoxla
- "Şəxsi" səbəbi varsa - fərdi dəstək tövsiyə et

Score hesablama meyarları:
- Yaxşı əhval % yüksəkdirsə +
- Risk halları azdırsa +
- Cavab dərəcəsi yüksəkdirsə +
- Pis əhval % aşağıdırsa +
- KRİTİK: Zorakılıq, söyülmə, döyülmə şikayətləri varsa score çox aşağı olmalı və riskLevel "kritik" olmalıdır!

Azərbaycan dilində yaz. Qısa və konkret ol.`;

    // Handle both array and object formats for moodDistribution
    let moodDistributionText = "";
    if (Array.isArray(moodDistribution)) {
      moodDistributionText = moodDistribution.map((m: any) => `- ${m.mood}: ${m.count} nəfər (${m.percentage}%)`).join('\n');
    } else if (typeof moodDistribution === 'object' && moodDistribution !== null) {
      moodDistributionText = Object.entries(moodDistribution).map(([mood, percentage]) => `- ${mood}: ${percentage}%`).join('\n');
    }

    // Handle both array formats for topReasons
    let topReasonsText = "";
    if (Array.isArray(topReasons)) {
      topReasonsText = topReasons.map((r: any, i: number) => `${i + 1}. ${r.reason}: ${r.count || ''} nəfər (${r.percentage}%)`).join('\n');
    }

    // Handle critical complaints (free text reasons from bad moods)
    let criticalComplaintsText = "";
    if (Array.isArray(criticalComplaints) && criticalComplaints.length > 0) {
      criticalComplaintsText = criticalComplaints.map((c: any, i: number) => 
        `${i + 1}. "${c.reason}" (Kateqoriya: ${c.category || "Qeyd olunmayıb"}, Filial: ${c.branch}, Şöbə: ${c.department})`
      ).join('\n');
    }

    const userPrompt = `İşçi sorğusu nəticələri:

Ümumi məmnuniyyət indeksi: ${overallIndex}%
Cavab dərəcəsi: ${responseRate}%
Risk halları sayı: ${riskCount}

Əhval bölgüsü:
${moodDistributionText}

PİS ƏHVALIN KÖK SƏBƏBLƏRİ (ən çox qeyd edilənlər):
${topReasonsText || "Qeyd olunmayıb"}

⚠️ KRİTİK ŞİKAYƏTLƏR (işçilərin sərbəst mətn cavabları):
${criticalComplaintsText || "Kritik şikayət yoxdur"}

Bu məlumatlara əsasən JSON formatında ətraflı analiz ver. Xüsusilə pis əhvalın kök səbəblərini analiz et və hər səbəb üçün konkret tövsiyyələr ver!`;

    console.log("Calling MiniMax AI API...");
    console.log("Top reasons being sent:", JSON.stringify(topReasons));
    console.log("Critical complaints count:", criticalComplaints?.length || 0);

    const response = await fetch("https://api.minimax.io/v1/text/chatcompletion_v2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMax-Text-01",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    // Handle errors - return fallback analysis instead of error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("MiniMax API error:", response.status, JSON.stringify(errorData));

      // Return fallback for any error
      console.log("API error, returning fallback");
      const analysis = createFallbackAnalysis(overallIndex, riskCount, topReasons, criticalComplaints);
      return new Response(JSON.stringify({ analysis, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response received, length:", content.length);
    
    // Parse JSON from response
    let analysis;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      analysis = createFallbackAnalysis(overallIndex, riskCount, topReasons, criticalComplaints);
    }

    return new Response(JSON.stringify({ analysis, source: "minimax-ai" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-responses error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Naməlum xəta" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
