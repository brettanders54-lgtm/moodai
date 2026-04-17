import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Send, Lightbulb, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "general", label: "Ümumi" },
  { value: "workload", label: "İş yükü" },
  { value: "schedule", label: "Qrafik" },
  { value: "manager", label: "Menecer" },
  { value: "team", label: "Komanda" },
  { value: "conditions", label: "Şərtlər" },
];

const BRANCHES = [
  { value: "baku", label: "Bakı" },
  { value: "ganja", label: "Gəncə" },
  { value: "sumgait", label: "Sumqayıt" },
  { value: "mingachevir", label: "Mingəçevir" },
  { value: "shirvan", label: "Şirvan" },
  { value: "lankaran", label: "Lənkəran" },
  { value: "shaki", label: "Şəki" },
  { value: "quba", label: "Quba" },
  { value: "nakhchivan", label: "Naxçıvan" },
];

export default function SuggestionBoxNew() {
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("general");
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!branch || !department || !suggestion.trim()) {
      toast({
        title: "Xəta",
        description: "Bütün sahələri doldurun",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("anonymous_suggestions").insert({
        branch,
        department,
        category,
        suggestion_text: suggestion,
        status: "new",
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to submit:", error);
      toast({
        title: "Xəta baş verdi",
        description: "Təklifiniz göndərilə bilmədi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Təşəkkürlər!</h2>
              <p className="text-muted-foreground mb-8">
                Təklifiniz uğurla qəbul edildi. Komandamız onu nəzərdən keçirəcək.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSuccess(false);
                  setBranch("");
                  setDepartment("");
                  setCategory("general");
                  setSuggestion("");
                }}
              >
                Yeni Təklif Göndər
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg mb-4">
            <Lightbulb className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Təklif Qutusu</h1>
          <p className="text-muted-foreground mt-2">
            Fikirləriniz bizim üçün önəmlidir. Şikayət və ya təklifinizi yazın.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Yeni Təklif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="branch">Filial</Label>
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filial seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kateqoriya</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departament</Label>
              <Textarea
                id="department"
                placeholder="Departament adını daxil edin..."
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestion">Təklif və ya Şikayət</Label>
              <Textarea
                id="suggestion"
                placeholder="Fikirlərinizi buraya yazın..."
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <Button
              className="w-full gradient-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Göndərilir..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Göndər
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Şəxsi məlumatlarınız məxfi saxlanılır
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}