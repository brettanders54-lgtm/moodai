// Supabase service - Database queries
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type EmployeeResponse = Database["public"]["Tables"]["employee_responses"]["Row"];
type BurnoutAlert = Database["public"]["Tables"]["burnout_alerts"]["Row"];
type RiskPrediction = Database["public"]["Tables"]["risk_predictions"]["Row"];
type ExternalMetric = Database["public"]["Tables"]["external_metrics"]["Row"];

// Employee Responses
export async function fetchEmployeeResponses(params: {
  branch?: string;
  dateFrom?: string;
  dateTo?: string;
  department?: string;
}): Promise<EmployeeResponse[]> {
  let query = supabase.from("employee_responses").select("*");

  if (params.branch) {
    query = query.eq("branch", params.branch);
  }
  if (params.dateFrom) {
    query = query.gte("response_date", params.dateFrom);
  }
  if (params.dateTo) {
    query = query.lte("response_date", params.dateTo);
  }
  if (params.department) {
    query = query.eq("department", params.department);
  }

  const { data, error } = await query.order("response_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Burnout Alerts
export async function fetchBurnoutAlerts(branch?: string): Promise<BurnoutAlert[]> {
  let query = supabase.from("burnout_alerts").select("*");

  if (branch) {
    query = query.eq("branch", branch);
  }

  const { data, error } = await query.order("detected_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createBurnoutAlert(alert: Omit<BurnoutAlert, "id" | "created_at">): Promise<BurnoutAlert> {
  const { data, error } = await supabase
    .from("burnout_alerts")
    .insert(alert)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Risk Predictions
export async function fetchRiskPredictions(params: {
  branch?: string;
  dateFrom?: string;
}): Promise<RiskPrediction[]> {
  let query = supabase.from("risk_predictions").select("*");

  if (params.branch) {
    query = query.eq("branch", params.branch);
  }
  if (params.dateFrom) {
    query = query.gte("prediction_date", params.dateFrom);
  }

  const { data, error } = await query.order("prediction_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

// External Metrics
export async function fetchExternalMetrics(params: {
  branch?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ExternalMetric[]> {
  let query = supabase.from("external_metrics").select("*");

  if (params.branch) {
    query = query.eq("branch", params.branch);
  }
  if (params.dateFrom) {
    query = query.gte("metric_date", params.dateFrom);
  }
  if (params.dateTo) {
    query = query.lte("metric_date", params.dateTo);
  }

  const { data, error } = await query.order("metric_date", { ascending: true });

  if (error) throw error;
  return data || [];
}

// Anonymous Suggestions
export async function fetchSuggestions(params?: {
  branch?: string;
  status?: string;
}) {
  let query = supabase.from("anonymous_suggestions").select("*");

  if (params?.branch) {
    query = query.eq("branch", params.branch);
  }
  if (params?.status) {
    query = query.eq("status", params.status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Manager Actions
export async function fetchManagerActions(alertId?: string) {
  let query = supabase.from("manager_actions").select("*");

  if (alertId) {
    query = query.eq("alert_id", alertId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}