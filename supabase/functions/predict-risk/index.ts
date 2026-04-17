import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { branch } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch last 7 days of employee mood data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: responses, error: responsesError } = await supabase
      .from("employee_responses")
      .select("*")
      .eq("branch", branch)
      .gte("response_date", sevenDaysAgo.toISOString().split("T")[0]);

    if (responsesError) {
      console.error("Error fetching responses:", responsesError);
      throw responsesError;
    }

    // Fetch last 7 days of external metrics
    const { data: metrics, error: metricsError } = await supabase
      .from("external_metrics")
      .select("*")
      .eq("branch", branch)
      .gte("metric_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("metric_date", { ascending: true });

    if (metricsError) {
      console.error("Error fetching metrics:", metricsError);
      throw metricsError;
    }

    // Calculate stress metrics
    const moodScores: Record<string, number> = {
      "Əla": 100,
      "Yaxşı": 75,
      "Normal": 50,
      "Pis": 25,
      "Çox pis": 0
    };

    const totalResponses = responses?.length || 0;
    const avgMoodScore = totalResponses > 0 
      ? responses.reduce((sum, r) => sum + (moodScores[r.mood] || 50), 0) / totalResponses
      : 50;

    // Calculate stress change (compare first half to second half of week)
    const midPoint = Math.floor((responses?.length || 0) / 2);
    const firstHalf = responses?.slice(0, midPoint) || [];
    const secondHalf = responses?.slice(midPoint) || [];
    
    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, r) => sum + (moodScores[r.mood] || 50), 0) / firstHalf.length
      : 50;
    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, r) => sum + (moodScores[r.mood] || 50), 0) / secondHalf.length
      : 50;
    
    const stressChange = firstHalfAvg - secondHalfAvg; // Positive = increasing stress

    // Calculate sales trend
    const salesTrend = metrics && metrics.length >= 2
      ? ((metrics[metrics.length - 1].daily_sales - metrics[0].daily_sales) / metrics[0].daily_sales) * 100
      : 0;

    // Calculate complaint trend
    const totalComplaints = metrics?.reduce((sum, m) => sum + (m.customer_complaints || 0), 0) || 0;
    const avgComplaints = metrics && metrics.length > 0 ? totalComplaints / metrics.length : 0;

    // Helper function for fallback prediction
    const createFallbackPrediction = () => ({
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

    // Prepare data for AI analysis
    const MINIMAX_API_KEY = Deno.env.get("MINIMAX_API_KEY");
    if (!MINIMAX_API_KEY) {
      throw new Error("MINIMAX_API_KEY is not configured");
    }

    const analysisPrompt = `Sən HR və satış analitika ekspertisən. Aşağıdakı məlumatlara əsasən risk proqnozu ver.

FİLİAL: ${branch}

İŞÇİ ƏHVAL MƏLUMATlari (son 7 gün):
- Ümumi cavab sayı: ${totalResponses}
- Orta əhval balı: ${avgMoodScore.toFixed(1)}/100
- Stress dəyişimi: ${stressChange > 0 ? `+${stressChange.toFixed(1)}%` : `${stressChange.toFixed(1)}%`} (müsbət = artan stress)

SATIŞ MƏLUMATlari (son 7 gün):
${metrics?.map(m => `- ${m.metric_date}: Satış: ${m.daily_sales}₼, Şikayət: ${m.customer_complaints}, Müştəri: ${m.customer_count}`).join('\n') || 'Məlumat yoxdur'}

Satış trendi: ${salesTrend.toFixed(1)}%
Orta gündəlik şikayət: ${avgComplaints.toFixed(1)}

STRES-SATIŞ ƏLAQƏSİ ANALİZİ:
- İşçi stresinin satışa birbaşa təsirini analiz et
- Yüksək stress = aşağı müştəri xidməti = aşağı satış
- Şikayət artımı stress artımı ilə əlaqələndirilsin

JSON formatında cavab ver:
{
  "stressChangePercent": <stress dəyişimi faizi>,
  "complaintRiskPercent": <növbəti 3 gündə şikayət riski 0-100>,
  "salesImpactPercent": <gözlənilən satış təsiri -100 ilə +100>,
  "predictionText": "<1-2 cümlə qısa proqnoz - stres və satış əlaqəsini vurğula>",
  "confidenceScore": <etibarlılıq balı 0-100>,
  "factors": {
    "stressTrend": "<artan|sabit|azalan>",
    "salesTrend": "<artan|sabit|azalan>",
    "complaintTrend": "<artan|sabit|azalan>",
    "keyRisks": ["<risk 1>", "<risk 2>"],
    "recommendations": ["<tövsiyyə 1>", "<tövsiyyə 2>"]
  }
}

Konkret rəqəmlər və əlaqələr göstər. Azərbaycan dilində yaz.`;

    console.log("Calling MiniMax AI API for prediction...");
    console.log("Branch:", branch, "Total responses:", totalResponses, "Stress change:", stressChange);

    const response = await fetch("https://api.minimax.io/v1/text/chatcompletion_v2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMax-Text-01",
        messages: [
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("AI gateway error:", response.status, JSON.stringify(errorData));
      
      // Return fallback prediction for any error
      const fallbackPrediction = createFallbackPrediction();
      
      // Save fallback prediction
      await supabase.from("risk_predictions").upsert({
        branch,
        prediction_date: new Date().toISOString().split("T")[0],
        stress_change_percent: fallbackPrediction.stressChangePercent,
        complaint_risk_percent: fallbackPrediction.complaintRiskPercent,
        sales_impact_percent: fallbackPrediction.salesImpactPercent,
        prediction_text: fallbackPrediction.predictionText,
        confidence_score: fallbackPrediction.confidenceScore,
        factors: fallbackPrediction.factors
      }, { onConflict: 'branch,prediction_date' });

      return new Response(JSON.stringify({ 
        prediction: fallbackPrediction,
        source: "fallback",
        metrics: { totalResponses, avgMoodScore, stressChange, salesTrend, avgComplaints }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response received, length:", content.length);
    
    // Parse JSON from response
    let prediction;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      prediction = createFallbackPrediction();
    }

    // Save prediction to database
    const { error: saveError } = await supabase
      .from("risk_predictions")
      .upsert({
        branch,
        prediction_date: new Date().toISOString().split("T")[0],
        stress_change_percent: prediction.stressChangePercent,
        complaint_risk_percent: prediction.complaintRiskPercent,
        sales_impact_percent: prediction.salesImpactPercent,
        prediction_text: prediction.predictionText,
        confidence_score: prediction.confidenceScore,
        factors: prediction.factors
      }, { onConflict: 'branch,prediction_date' });

    if (saveError) {
      console.error("Error saving prediction:", saveError);
    }

    return new Response(JSON.stringify({
      prediction,
      source: "minimax-ai",
      metrics: { totalResponses, avgMoodScore, stressChange, salesTrend, avgComplaints }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("predict-risk error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Naməlum xəta" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
