import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Bildirişlər dəstəklənmir",
        description: "Bu brauzer push bildirişlərini dəstəkləmir",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast({
          title: "Bildirişlər aktivdir",
          description: "Kritik hallar barədə məlumatlandırılacaqsınız",
        });
        return true;
      } else {
        toast({
          title: "Bildirişlər rədd edildi",
          description: "Brauzer ayarlarından bildirişlərə icazə verin",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      return false;
    }
  }, [isSupported, toast]);

  const sendNotification = useCallback(async (payload: NotificationPayload) => {
    if (!isSupported || permission !== "granted") {
      console.log("Notifications not available");
      return;
    }

    try {
      // Try to use service worker for better reliability
      const registration = await navigator.serviceWorker?.ready;
      
      if (registration) {
        await registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/pwa-192x192.png",
          tag: payload.tag,
          badge: "/pwa-192x192.png",
          data: payload.data,
          requireInteraction: true,
        });
      } else {
        // Fallback to basic notification
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/pwa-192x192.png",
          tag: payload.tag,
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }, [isSupported, permission]);

  // Subscribe to real-time critical alerts
  const subscribeToAlerts = useCallback((branchFilter?: string) => {
    const channel = supabase
      .channel('critical-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'burnout_alerts',
          filter: branchFilter ? `branch=eq.${branchFilter}` : undefined,
        },
        async (payload) => {
          const alert = payload.new as {
            employee_code: string;
            risk_score: number;
            reason_category: string;
            branch: string;
          };
          
          // Only notify for high-risk alerts
          if (alert.risk_score >= 75) {
            await sendNotification({
              title: "⚠️ Kritik Risk Aşkarlandı!",
              body: `${alert.employee_code} işçisi üçün ${alert.risk_score}% risk (${alert.reason_category})`,
              tag: `alert-${alert.employee_code}`,
              data: { type: "burnout_alert", ...alert },
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'manager_notifications',
        },
        async (payload) => {
          const notification = payload.new as {
            title: string;
            message: string;
            urgency: string;
          };
          
          if (notification.urgency === "critical" || notification.urgency === "high") {
            await sendNotification({
              title: notification.title,
              body: notification.message,
              tag: `manager-notification`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sendNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    subscribeToAlerts,
  };
};
