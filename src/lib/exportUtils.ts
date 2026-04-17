import { format } from "date-fns";
import { az } from "date-fns/locale";

// Types for export data
interface ExportRow {
  [key: string]: string | number | boolean | null | undefined;
}

// Generate CSV content
export const generateCSV = (data: ExportRow[], headers?: Record<string, string>): string => {
  if (data.length === 0) return "";

  const keys = Object.keys(data[0]);
  const headerRow = headers 
    ? keys.map(k => headers[k] || k) 
    : keys;

  const csvRows = [
    headerRow.join(","),
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        // Escape quotes and wrap in quotes if contains comma or newline
        if (typeof value === "string") {
          const escaped = value.replace(/"/g, '""');
          return `"${escaped}"`;
        }
        return value ?? "";
      }).join(",")
    )
  ];

  return csvRows.join("\n");
};

// Download file utility
export const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export to CSV
export const exportToCSV = (data: ExportRow[], filename: string, headers?: Record<string, string>) => {
  const csv = generateCSV(data, headers);
  downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
};

// Export to Excel (XLSX format using CSV as base)
export const exportToExcel = async (data: ExportRow[], filename: string, headers?: Record<string, string>) => {
  // For now, export as CSV with .xlsx extension - browsers will open it in Excel
  // For proper XLSX, would need xlsx library which is heavy
  const csv = generateCSV(data, headers);
  // Add BOM for proper UTF-8 encoding in Excel
  const bom = "\uFEFF";
  downloadFile(bom + csv, `${filename}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
};

// Generate HTML for PDF printing
export const generatePrintableHTML = (
  title: string,
  subtitle: string,
  sections: Array<{
    title: string;
    content: string;
  }>,
  stats?: Array<{ label: string; value: string | number }>
): string => {
  return `
    <!DOCTYPE html>
    <html lang="az">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1a1a2e;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #16a34a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #16a34a;
          margin-bottom: 8px;
        }
        
        .header p {
          color: #666;
          font-size: 14px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: #f0fdf4;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          border: 1px solid #bbf7d0;
        }
        
        .stat-card .label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        
        .stat-card .value {
          font-size: 24px;
          font-weight: 700;
          color: #16a34a;
        }
        
        .section {
          margin-bottom: 24px;
        }
        
        .section h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .section-content {
          line-height: 1.6;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        
        th, td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        th {
          background: #f9fafb;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          color: #666;
        }
        
        tr:hover {
          background: #f9fafb;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      
      ${stats ? `
        <div class="stats-grid">
          ${stats.map(stat => `
            <div class="stat-card">
              <div class="label">${stat.label}</div>
              <div class="value">${stat.value}</div>
            </div>
          `).join("")}
        </div>
      ` : ""}
      
      ${sections.map(section => `
        <div class="section">
          <h2>${section.title}</h2>
          <div class="section-content">${section.content}</div>
        </div>
      `).join("")}
      
      <div class="footer">
        <p>MoodAI Personal Məmnuniyyət Sistemi © ${new Date().getFullYear()}</p>
        <p>Hesabat tarixi: ${format(new Date(), "d MMMM yyyy, HH:mm", { locale: az })}</p>
      </div>
    </body>
    </html>
  `;
};

// Export to PDF (using print dialog)
export const exportToPDF = (
  title: string,
  subtitle: string,
  sections: Array<{ title: string; content: string }>,
  stats?: Array<{ label: string; value: string | number }>
) => {
  const html = generatePrintableHTML(title, subtitle, sections, stats);
  
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

// Format data for reports
export const formatReportData = (responses: any[], burnoutAlerts: any[], managerActions: any[]) => {
  return {
    responses: responses.map(r => ({
      Tarix: r.response_date,
      Əhval: r.mood,
      Filial: r.branch,
      Şöbə: r.department,
      Kateqoriya: r.reason_category || "",
      Səbəb: r.reason || ""
    })),
    alerts: burnoutAlerts.map(a => ({
      Tarix: format(new Date(a.detected_at), "yyyy-MM-dd"),
      "İşçi Kodu": a.employee_code,
      Filial: a.branch,
      Şöbə: a.department,
      "Risk Faizi": a.risk_score,
      Səbəb: a.reason_category,
      "Həll Olunub": a.is_resolved ? "Bəli" : "Xeyr"
    })),
    actions: managerActions.map(a => ({
      Tarix: format(new Date(a.created_at), "yyyy-MM-dd"),
      Menecer: a.manager_name,
      Tədbir: a.action_description,
      Növ: a.action_type,
      Status: a.status
    }))
  };
};
