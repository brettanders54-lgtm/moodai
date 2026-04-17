import { FileText, Download, BookOpen, Code, Settings, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateProjectAboutPDF, generateDeveloperGuidePDF, generateProjectOverviewPDF, generateTechnicalSpecPDF } from "@/lib/pdfDocuments";

const documents = [
  {
    id: "project-about",
    title: "Layihə Haqqında",
    description: "Sistemin ümumi məlumatı, funksionallıqlar, istifadəçi rolları və iş axını",
    icon: BookOpen,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    generate: generateProjectAboutPDF,
  },
  {
    id: "developer-guide",
    title: "Developer Guide",
    description: "Texnologiya steki, folder strukturu, routing, database sxemi və dizayn sistemi",
    icon: Code,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    generate: generateDeveloperGuidePDF,
  },
  {
    id: "project-overview",
    title: "Layihə İcmalı (V1)",
    description: "İlkin versiya xüsusiyyətləri, dizayn sistemi, texniki struktur və roadmap",
    icon: ClipboardList,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    generate: generateProjectOverviewPDF,
  },
  {
    id: "technical-spec",
    title: "Texniki Tapşırıq",
    description: "Tam texniki spesifikasiya: arxitektura, database, API, təhlükəsizlik, deployment",
    icon: Settings,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    generate: generateTechnicalSpecPDF,
  },
];

const ExportSpec = () => {
  const handleExport = (doc: typeof documents[0]) => {
    const html = doc.generate();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => printWindow.print(), 500);
      };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Sənədlər
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">MoodAI — Sənədlər</h1>
          <p className="text-muted-foreground">Layihə sənədlərini PDF formatında yükləyin</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {documents.map((doc) => (
            <Card key={doc.id} className="group hover:shadow-lg transition-all duration-200 border-border/60">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${doc.bg}`}>
                    <doc.icon className={`w-6 h-6 ${doc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{doc.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport(doc)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      PDF Yüklə
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          Sifarişçi: Şahin | İcraçı: PATCO Group | Fevral 2026
        </div>
      </div>
    </div>
  );
};

export default ExportSpec;
