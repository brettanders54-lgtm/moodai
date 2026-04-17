const baseStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; color: #1a1a2e; padding: 48px 56px; max-width: 900px; margin: 0 auto; line-height: 1.7; }
.cover { text-align: center; padding: 80px 0 60px; border-bottom: 4px solid #0891b2; margin-bottom: 40px; }
.cover h1 { font-size: 32px; font-weight: 800; color: #0891b2; margin-bottom: 8px; }
.cover h2 { font-size: 20px; font-weight: 600; color: #334155; margin-bottom: 4px; }
.cover p { color: #64748b; font-size: 14px; margin-top: 12px; }
h2 { font-size: 22px; font-weight: 700; color: #0891b2; margin: 36px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
h3 { font-size: 17px; font-weight: 600; color: #1e293b; margin: 24px 0 10px; }
h4 { font-size: 15px; font-weight: 600; color: #334155; margin: 18px 0 8px; }
p, li { font-size: 13.5px; color: #334155; }
ul, ol { margin-left: 20px; margin-bottom: 12px; }
li { margin-bottom: 6px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; font-size: 12.5px; }
th { background: #f1f5f9; font-weight: 600; text-transform: uppercase; font-size: 11px; color: #64748b; letter-spacing: 0.5px; }
th, td { padding: 8px 12px; text-align: left; border: 1px solid #e2e8f0; }
tr:nth-child(even) { background: #f8fafc; }
.flow-box { background: #f0fdfa; border: 2px solid #99f6e4; border-radius: 12px; padding: 24px; margin: 16px 0; font-family: monospace; font-size: 12px; white-space: pre; line-height: 2; text-align: center; }
.feature-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 12px 0; }
.feature-card h4 { margin: 0 0 8px; color: #0891b2; }
.feature-card p { margin: 0; font-size: 13px; }
.feature-card ul { margin-top: 8px; margin-bottom: 0; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-right: 6px; }
.badge-green { background: #dcfce7; color: #166534; }
.badge-blue { background: #dbeafe; color: #1e40af; }
.badge-yellow { background: #fef9c3; color: #854d0e; }
.badge-red { background: #fee2e2; color: #991b1b; }
.check { color: #16a34a; margin-right: 6px; }
.section { page-break-inside: avoid; }
.footer { margin-top: 60px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
pre.code-block { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; font-size: 11px; overflow-x: auto; margin: 12px 0; }
@media print { body { padding: 20px 30px; } .cover { padding: 40px 0 30px; } .section { page-break-inside: avoid; } }
`;

const wrapHtml = (title: string, body: string) => `<!DOCTYPE html>
<html lang="az">
<head><meta charset="UTF-8"><title>${title}</title><style>${baseStyles}</style></head>
<body>${body}
<div class="footer">
  <p><strong>MoodAI Personal Məmnuniyyət İdarəetmə Sistemi</strong></p>
  <p>Sifarişçi: Şahin | İcraçı: PATCO Group</p>
  <p>Fevral 2026 | Versiya 2.0</p>
</div>
</body></html>`;

export const generateProjectAboutPDF = () => wrapHtml("MoodAI — Layihə Haqqında", `
<div class="cover">
  <h1>MoodAI ƏHVAL SİSTEMİ</h1>
  <h2>Personal Məmnuniyyət İdarəetmə Sistemi</h2>
  <p>Layihə Haqqında Sənəd</p>
  <p>Versiya: 2.0 | Fevral 2026</p>
  <p>Canlı URL: https://oba-mood-ai.lovable.app</p>
</div>

<div class="section">
<h2>1. ÜMUMİ MƏLUMAT</h2>
<p><strong>MoodAI</strong> — işçilərin gündəlik əhval-ruhiyyəsini real vaxtda izləyən, süni intellekt (AI) ilə analiz edən və burnout (tükənmə) risklərini əvvəlcədən aşkarlayan web tətbiqdir.</p>
<h3>🎯 Məqsəd</h3>
<p>Personalın əhvalı düşəndə müştəri təcrübəsi zərər görməzdən <strong>əvvəl</strong> müdaxilə etmək. Rəhbərliyə vaxtında, dəqiq və hərəkətə keçməyə imkan verən tövsiyələr təqdim etmək.</p>
</div>

<div class="section">
<h2>2. İSTİFADƏÇİ ROLLARI</h2>
<table>
  <tr><th>Rol</th><th>Giriş üsulu</th><th>İmkanları</th></tr>
  <tr><td><strong>İşçi</strong></td><td>Anonim (giriş tələb olunmur)</td><td>Gündəlik əhval sorğusu doldurma, anonim təklif göndərmə</td></tr>
  <tr><td><strong>Menecer</strong></td><td>Email + şifrə</td><td>Öz filialının dashboardu, AI analiz, tapşırıqlar, bildirişlər</td></tr>
  <tr><td><strong>HR</strong></td><td>Email + şifrə</td><td>Bütün filiallar, hesabatlar, menecer təyinatları, hədəflər, təkliflərin idarəsi</td></tr>
</table>
</div>

<div class="section">
<h2>3. FUNKSİONALLIQLAR</h2>
<div class="feature-card"><h4>🎭 3.1 İşçi Sorğu Sistemi (Anonim)</h4><ul>
  <li>Hər gün sadə bir sual: "Bu gün özünüzü necə hiss edirsiniz?"</li>
  <li><strong>5 əhval seçimi:</strong> Əla, Yaxşı, Normal, Pis, Çox pis</li>
  <li>Mənfi əhval seçildikdə <strong>səbəb kateqoriyası</strong> soruşulur</li>
  <li>Tam anonimlik — şəxsi məlumat saxlanmır</li>
</ul></div>

<div class="feature-card"><h4>📊 3.2 Menecer Dashboard</h4><ul>
  <li><strong>Ümumi məmnuniyyət indeksi</strong> — filialın orta əhval balı (0–100)</li>
  <li><strong>Cavab sayı və cavab dərəcəsi</strong></li>
  <li><strong>Burnout risk sayı</strong></li>
  <li><strong>Əhval bölgüsü</strong> — vizual nisbətlər</li>
  <li><strong>Top səbəblər</strong> və <strong>Risk alertləri</strong></li>
</ul></div>

<div class="feature-card"><h4>🤖 3.3 AI Analiz (Süni İntellekt)</h4><ul>
  <li>Toplanmış əhval datalarını <strong>avtomatik analiz</strong> edir</li>
  <li>Xülasə, Müşahidələr, Tövsiyələr, Risk səviyyəsi</li>
  <li><strong>Kritik tapşırıqlar</strong> — AI-ın müəyyən etdiyi təcili addımlar</li>
</ul></div>

<div class="feature-card"><h4>🔮 3.4 Proqnozlaşdırıcı Analitika</h4><ul>
  <li>Gələcək <strong>risk proqnozu</strong></li>
  <li><strong>Etibarlılıq skoru</strong> və <strong>Təsiredici amillər</strong></li>
</ul></div>

<div class="feature-card"><h4>📈 3.5 Qrafiklər və Vizualizasiya</h4><ul>
  <li>Əhval Pie Chart, Səbəblər Bar Chart, Trend Line Chart, Filial müqayisəsi</li>
</ul></div>

<div class="feature-card"><h4>📋 3.6 Hesabatlar və Export</h4><ul>
  <li>CSV və Excel formatında yükləmə</li>
  <li>Tarix, filial, şöbə üzrə filtrasiya</li>
</ul></div>

<div class="feature-card"><h4>🎯 3.7 Məmnuniyyət Hədəfləri</h4><ul>
  <li>Filial və şöbə üzrə hədəf dəyərlər</li>
  <li>Cari dəyər vs hədəf — progress izləmə</li>
</ul></div>

<div class="feature-card"><h4>💡 3.8 Anonim Təklif Qutusu</h4><ul>
  <li>İşçilər anonim təkliflər göndərə bilər</li>
  <li>HR təklifləri nəzərdən keçirə, prioritet təyin edə bilər</li>
</ul></div>

<div class="feature-card"><h4>👔 3.9 Menecer Tapşırıqları</h4><ul>
  <li>Burnout alertlərinə əsasən fəaliyyət planı</li>
  <li>Tapşırıq növləri: Fərdi görüş, İş yükü, Qrafik, Komanda, Təlim</li>
</ul></div>

<div class="feature-card"><h4>🔔 3.10 Bildiriş Sistemi</h4><ul>
  <li>Real-time bildirişlər</li>
  <li>Oxunmuş/oxunmamış status</li>
</ul></div>

<div class="feature-card"><h4>👥 3.11 Menecer-Filial Təyinatları</h4><ul>
  <li>HR hər meneceri müəyyən filiala təyin edə bilər</li>
</ul></div>

<div class="feature-card"><h4>🌓 3.12 Tema və Mobil Dəstək</h4><ul>
  <li>Açıq/Qaranlıq tema, Responsive dizayn, PWA quraşdırma</li>
</ul></div>
</div>

<div class="section">
<h2>4. ƏHVAL BALI ŞKALASI</h2>
<table>
  <tr><th>Əhval</th><th>Bal</th><th>İşarə</th></tr>
  <tr><td>Əla</td><td>100</td><td><span class="badge badge-green">🟢 Əla</span></td></tr>
  <tr><td>Yaxşı</td><td>75</td><td><span class="badge badge-green">🟢 Yaxşı</span></td></tr>
  <tr><td>Normal</td><td>50</td><td><span class="badge badge-yellow">🟡 Normal</span></td></tr>
  <tr><td>Pis</td><td>25</td><td><span class="badge badge-red">🔴 Pis</span></td></tr>
  <tr><td>Çox pis</td><td>0</td><td><span class="badge badge-red">🔴 Çox pis</span></td></tr>
</table>
</div>

<div class="section">
<h2>5. İŞ AXINI</h2>
<div class="flow-box">İşçi sorğu doldurur (anonim)
        ↓
Data bazaya yazılır
        ↓
Menecer dashboardda görür
        ↓
AI avtomatik analiz edir
        ↓
Kritik tapşırıqlar yaradılır
        ↓
Menecer hərəkətə keçir
        ↓
Nəticə izlənir</div>
</div>

<div class="section">
<h2>6. FİLİALLAR</h2>
<p>Sistem 9 filialı əhatə edir:</p>
<p><span class="badge badge-blue">Bakı Mərkəz</span> <span class="badge badge-blue">Gəncə</span> <span class="badge badge-blue">Sumqayıt</span> <span class="badge badge-blue">Mingəçevir</span> <span class="badge badge-blue">Şirvan</span> <span class="badge badge-blue">Lənkəran</span> <span class="badge badge-blue">Şəki</span> <span class="badge badge-blue">Quba</span> <span class="badge badge-blue">Naxçıvan</span></p>
</div>

<div class="section">
<h2>7. TƏHLÜKƏSİZLİK VƏ MƏXFİLİK</h2>
<ul>
  <li><span class="check">✅</span> İşçi cavabları <strong>tam anonim</strong></li>
  <li><span class="check">✅</span> Rol əsaslı giriş (RLS)</li>
  <li><span class="check">✅</span> HTTPS ilə şifrələnmiş bağlantı</li>
</ul>
</div>
`);

export const generateDeveloperGuidePDF = () => wrapHtml("MoodAI — Developer Guide", `
<div class="cover">
  <h1>MoodAI ƏHVAL SİSTEMİ</h1>
  <h2>Developer Guide</h2>
  <p>Texnologiya steki, folder strukturu, database sxemi</p>
  <p>Versiya: 2.0 | Fevral 2026</p>
</div>

<div class="section">
<h2>1. TEXNOLOGİYA STEKİ</h2>
<table>
  <tr><th>Texnologiya</th><th>Versiya</th><th>Təyinat</th></tr>
  <tr><td>React</td><td>18.3</td><td>UI framework</td></tr>
  <tr><td>TypeScript</td><td>5.x</td><td>Tip təhlükəsizliyi</td></tr>
  <tr><td>Vite</td><td>5.x</td><td>Build tool, dev server</td></tr>
  <tr><td>Tailwind CSS</td><td>3.x</td><td>Utility-first styling</td></tr>
  <tr><td>Shadcn/UI</td><td>Latest</td><td>UI komponent kitabxanası</td></tr>
  <tr><td>Framer Motion</td><td>12.x</td><td>Animasiyalar</td></tr>
  <tr><td>React Router</td><td>6.30</td><td>Client-side routing</td></tr>
  <tr><td>TanStack React Query</td><td>5.83</td><td>Server state management</td></tr>
  <tr><td>Recharts</td><td>2.15</td><td>Qrafiklər</td></tr>
  <tr><td>Zod</td><td>3.25</td><td>Validasiya</td></tr>
</table>
<p><strong>Backend:</strong> Lovable Cloud (PostgreSQL + Edge Functions + Auth + Realtime)</p>
<p><strong>AI:</strong> Google Gemini 2.5 Flash (Lovable AI Gateway)</p>
</div>

<div class="section">
<h2>2. ROUTING</h2>
<table>
  <tr><th>Route</th><th>Auth</th><th>Komponent</th><th>Təsvir</th></tr>
  <tr><td>/</td><td>❌</td><td>Index</td><td>İşçi sorğu interfeysi</td></tr>
  <tr><td>/auth</td><td>❌</td><td>Auth</td><td>Giriş/Qeydiyyat</td></tr>
  <tr><td>/dashboard</td><td>✅</td><td>Dashboard</td><td>Menecer paneli</td></tr>
  <tr><td>/hr-panel</td><td>✅</td><td>HRPanel</td><td>HR paneli</td></tr>
  <tr><td>/analytics</td><td>✅</td><td>Analytics</td><td>Proqnozlaşdırıcı analitika</td></tr>
  <tr><td>/reports</td><td>✅</td><td>Reports</td><td>Hesabatlar + export</td></tr>
  <tr><td>/employee-responses</td><td>✅</td><td>EmployeeResponses</td><td>İşçi cavabları</td></tr>
  <tr><td>/manager-actions</td><td>✅</td><td>ManagerActions</td><td>Menecer tapşırıqları</td></tr>
  <tr><td>/manager-assignments</td><td>✅</td><td>ManagerAssignments</td><td>Menecer təyinatları</td></tr>
  <tr><td>/targets</td><td>✅</td><td>Targets</td><td>Hədəflər</td></tr>
  <tr><td>/suggestion-box</td><td>❌</td><td>SuggestionBox</td><td>Anonim təklif</td></tr>
  <tr><td>/suggestions-management</td><td>✅</td><td>SuggestionsManagement</td><td>Təkliflərin idarəsi</td></tr>
</table>
</div>

<div class="section">
<h2>3. DATABASE SXEMİ (11 Cədvəl)</h2>
<h3>employee_responses</h3>
<table>
  <tr><th>Sütun</th><th>Tip</th><th>Təsvir</th></tr>
  <tr><td>id</td><td>UUID (PK)</td><td>Unikal ID</td></tr>
  <tr><td>employee_code</td><td>TEXT</td><td>Anonim kod</td></tr>
  <tr><td>branch</td><td>TEXT</td><td>Filial</td></tr>
  <tr><td>department</td><td>TEXT</td><td>Şöbə</td></tr>
  <tr><td>mood</td><td>TEXT</td><td>Əhval</td></tr>
  <tr><td>reason</td><td>TEXT?</td><td>Sərbəst mətn səbəb</td></tr>
  <tr><td>reason_category</td><td>TEXT?</td><td>Kateqoriya</td></tr>
  <tr><td>response_date</td><td>DATE</td><td>Cavab tarixi</td></tr>
</table>

<h3>Digər cədvəllər</h3>
<table>
  <tr><th>Cədvəl</th><th>Təsvir</th></tr>
  <tr><td>burnout_alerts</td><td>Burnout risk xəbərdarlıqları</td></tr>
  <tr><td>ai_tasks</td><td>AI tapşırıqları</td></tr>
  <tr><td>manager_actions</td><td>Menecer fəaliyyətləri</td></tr>
  <tr><td>manager_branches</td><td>Menecer-filial təyinatları</td></tr>
  <tr><td>manager_notifications</td><td>Bildirişlər</td></tr>
  <tr><td>anonymous_suggestions</td><td>Anonim təkliflər</td></tr>
  <tr><td>satisfaction_targets</td><td>Məmnuniyyət hədəfləri</td></tr>
  <tr><td>external_metrics</td><td>Xarici ERP dataları</td></tr>
  <tr><td>risk_predictions</td><td>AI risk proqnozları</td></tr>
  <tr><td>user_roles</td><td>İstifadəçi rolları</td></tr>
</table>

<h3>Database funksiyaları</h3>
<table>
  <tr><th>Funksiya</th><th>Təsvir</th></tr>
  <tr><td>has_role(user_id, role)</td><td>Rolunu yoxlayır</td></tr>
  <tr><td>get_user_branch(user_id)</td><td>Filialını qaytarır</td></tr>
  <tr><td>assign_user_role(user_id, role)</td><td>Rol təyin edir</td></tr>
</table>
</div>

<div class="section">
<h2>4. EDGE FUNCTIONS</h2>
<div class="feature-card"><h4>analyze-responses</h4><p>POST — Əhval datalarını AI ilə analiz edir. Fallback: metrik əsaslı avtomatik analiz.</p></div>
<div class="feature-card"><h4>predict-risk</h4><p>POST — Gələcək risk proqnozu. Stress, satış, şikayət dataları əsasında.</p></div>
</div>

<div class="section">
<h2>5. DİZAYN SİSTEMİ</h2>
<ul>
  <li><strong>Rənglər:</strong> CSS dəyişənləri (--primary, --background...)</li>
  <li><strong>Font:</strong> Inter (400-800)</li>
  <li><strong>UI Kit:</strong> Shadcn/UI</li>
  <li><strong>Animasiyalar:</strong> Framer Motion</li>
  <li><strong>Tema:</strong> Açıq/Qaranlıq dəstəyi</li>
</ul>
</div>
`);

export const generateProjectOverviewPDF = () => wrapHtml("MoodAI — Layihə İcmalı", `
<div class="cover">
  <h1>MoodAI ƏHVAL SİSTEMİ</h1>
  <h2>Layihə İcmalı (V1)</h2>
  <p>İlkin versiya xüsusiyyətləri və roadmap</p>
  <p>Versiya: 1.0 | Noyabr 2025</p>
</div>

<div class="section">
<h2>1. LAYİHƏ HAQQINDA</h2>
<p><strong>Personal Məmnuniyyət Redaktoru</strong> — işçilərin gündəlik əhvalını real vaxtda izləyən, AI ilə analiz edən və burnout risklərini əvvəlcədən müəyyənləşdirən tam funksional mobil-first tətbiqdir.</p>
<h3>Əsas Məqsəd</h3>
<p>Personalın əhvalı düşəndə müştəri təcrübəsi düşmədən müdaxilə etmək və rəhbərliyə actionable tövsiyələr təqdim etmək.</p>
</div>

<div class="section">
<h2>2. V1 XÜSUSİYYƏTLƏRİ</h2>
<div class="feature-card"><h4>🎭 İşçi İnterfeysi</h4><ul>
  <li>Gündəlik Mikro-Sorğu: Yaxşı / Normal / Pis seçimləri</li>
  <li>Səbəb Seçimi: 6 kateqoriya</li>
  <li>Anonim Cavablar: Tam məxfilik</li>
  <li>Uğur Ekranı: Pozitiv geri bildirim</li>
</ul></div>
<div class="feature-card"><h4>📊 Dashboard</h4><ul>
  <li>Ümumi məmnuniyyət indeksi</li>
  <li>Cavab sayı və dərəcəsi</li>
  <li>Burnout risk sayı</li>
  <li>Əhval bölgüsü vizual progress bar-lar</li>
  <li>Top səbəblər və Risk alertləri</li>
</ul></div>
</div>

<div class="section">
<h2>3. DİZAYN SİSTEMİ</h2>
<table>
  <tr><th>Element</th><th>Dəyər</th></tr>
  <tr><td>Primary rəng</td><td>Sakitləşdirici mavi-yaşıl (hsl 195 85% 45%)</td></tr>
  <tr><td>Font</td><td>Inter (400-800)</td></tr>
  <tr><td>Animasiyalar</td><td>Framer Motion</td></tr>
  <tr><td>UI Kit</td><td>Shadcn/UI + Tailwind CSS</td></tr>
</table>
</div>

<div class="section">
<h2>4. TEXNİKİ STRUKTUR</h2>
<table>
  <tr><th>Texnologiya</th><th>Təyinat</th></tr>
  <tr><td>React 18 + TypeScript</td><td>Frontend</td></tr>
  <tr><td>Vite</td><td>Build tool</td></tr>
  <tr><td>Tailwind CSS</td><td>Styling</td></tr>
  <tr><td>Framer Motion</td><td>Animasiyalar</td></tr>
  <tr><td>React Router</td><td>Navigation</td></tr>
</table>
</div>

<div class="section">
<h2>5. GƏLƏCƏKDƏKİ ADDIMLAR</h2>
<ul>
  <li>Lovable Cloud aktivləşdirmə ✅</li>
  <li>Database cədvəlləri ✅</li>
  <li>Edge Functions (AI analiz) ✅</li>
  <li>HR Panel ✅</li>
  <li>Proqnozlaşdırıcı analitika ✅</li>
</ul>
</div>
`);

export const generateTechnicalSpecPDF = () => wrapHtml("MoodAI — Texniki Tapşırıq", `
<div class="cover">
  <h1>MoodAI ƏHVAL SİSTEMİ</h1>
  <h2>Texniki Tapşırıq (Technical Specification)</h2>
  <p>Tam texniki spesifikasiya sənədi</p>
  <p>Versiya: 2.0 | Fevral 2026</p>
  <p>Canlı URL: https://oba-mood-ai.lovable.app</p>
</div>

<div class="section">
<h2>1. ÜMUMİ MƏLUMAT</h2>
<p><strong>MoodAI</strong> — Personal Məmnuniyyət İdarəetmə Platforması</p>
<table>
  <tr><th>Rol</th><th>Təsvir</th><th>Giriş</th></tr>
  <tr><td>İşçi</td><td>Gündəlik əhval sorğusu</td><td>Anonim</td></tr>
  <tr><td>Menecer</td><td>Filial idarəetmə</td><td>Email/şifrə</td></tr>
  <tr><td>HR</td><td>Tam nəzarət</td><td>Email/şifrə</td></tr>
</table>
</div>

<div class="section">
<h2>2. TEXNOLOGİYA STEKİ</h2>
<h3>Frontend</h3>
<table>
  <tr><th>Texnologiya</th><th>Versiya</th><th>Təyinat</th></tr>
  <tr><td>React</td><td>18.3</td><td>UI framework</td></tr>
  <tr><td>TypeScript</td><td>5.x</td><td>Tip təhlükəsizliyi</td></tr>
  <tr><td>Vite</td><td>5.x</td><td>Build tool</td></tr>
  <tr><td>Tailwind CSS</td><td>3.x</td><td>CSS</td></tr>
  <tr><td>Shadcn/UI</td><td>Latest</td><td>UI Kit</td></tr>
  <tr><td>React Router</td><td>6.30</td><td>Routing</td></tr>
  <tr><td>Recharts</td><td>2.15</td><td>Qrafiklər</td></tr>
</table>
<h3>Backend (Lovable Cloud)</h3>
<table>
  <tr><th>Xidmət</th><th>Təyinat</th></tr>
  <tr><td>PostgreSQL</td><td>Verilənlər bazası</td></tr>
  <tr><td>RLS</td><td>Rol əsaslı təhlükəsizlik</td></tr>
  <tr><td>Edge Functions (Deno)</td><td>Serverless API</td></tr>
  <tr><td>Realtime</td><td>Bildirişlər</td></tr>
  <tr><td>Auth</td><td>Autentifikasiya</td></tr>
</table>
<h3>AI</h3>
<p>Google Gemini 2.5 Flash — Lovable AI Gateway vasitəsilə (API key lazım deyil)</p>
</div>

<div class="section">
<h2>3. VERİLƏNLƏR BAZASI (11 Cədvəl)</h2>
<h3>employee_responses</h3>
<table>
  <tr><th>Sütun</th><th>Tip</th><th>Təsvir</th></tr>
  <tr><td>id</td><td>UUID</td><td>PK</td></tr>
  <tr><td>employee_code</td><td>TEXT</td><td>Anonim kod (EMP+4 rəqəm)</td></tr>
  <tr><td>branch</td><td>TEXT</td><td>Filial</td></tr>
  <tr><td>department</td><td>TEXT</td><td>Şöbə</td></tr>
  <tr><td>mood</td><td>TEXT</td><td>Əhval</td></tr>
  <tr><td>reason_category</td><td>TEXT?</td><td>Kateqoriya</td></tr>
  <tr><td>response_date</td><td>DATE</td><td>Tarix</td></tr>
</table>
<p><strong>RLS:</strong> INSERT hər kəs, SELECT HR/Menecer</p>

<h3>burnout_alerts</h3>
<p>Risk skoru, işçi kodu, filial, şöbə, həll statusu</p>

<h3>Digər cədvəllər</h3>
<table>
  <tr><th>Cədvəl</th><th>Təsvir</th></tr>
  <tr><td>ai_tasks</td><td>AI tapşırıqları</td></tr>
  <tr><td>manager_actions</td><td>Menecer fəaliyyətləri</td></tr>
  <tr><td>manager_branches</td><td>Menecer-filial</td></tr>
  <tr><td>manager_notifications</td><td>Bildirişlər</td></tr>
  <tr><td>anonymous_suggestions</td><td>Anonim təkliflər</td></tr>
  <tr><td>satisfaction_targets</td><td>Hədəflər</td></tr>
  <tr><td>external_metrics</td><td>ERP dataları</td></tr>
  <tr><td>risk_predictions</td><td>AI proqnozları</td></tr>
  <tr><td>user_roles</td><td>Rollar (hr/manager/employee)</td></tr>
</table>
</div>

<div class="section">
<h2>4. API ENDPOINTS (Edge Functions)</h2>
<div class="feature-card"><h4>POST /analyze-responses</h4>
<p>Əhval datalarını AI ilə analiz edir. Xülasə, müşahidələr, tövsiyələr, risk səviyyəsi, tapşırıqlar qaytarır.</p></div>
<div class="feature-card"><h4>POST /predict-risk</h4>
<p>Stress, satış, şikayət dataları əsasında gələcək risk proqnozu.</p></div>
</div>

<div class="section">
<h2>5. TƏHLÜKƏSİZLİK</h2>
<ul>
  <li><span class="check">✅</span> Row Level Security (RLS) bütün cədvəllərdə</li>
  <li><span class="check">✅</span> Anonim INSERT (employee_responses, anonymous_suggestions)</li>
  <li><span class="check">✅</span> Rol əsaslı SELECT (HR: hamısı, Menecer: öz filialı)</li>
  <li><span class="check">✅</span> HTTPS, CORS, Input validasiyası</li>
  <li><span class="check">✅</span> SECURITY DEFINER funksiyalar</li>
</ul>
</div>

<div class="section">
<h2>6. FİLİALLAR (9 ədəd)</h2>
<p><span class="badge badge-blue">Bakı Mərkəz</span> <span class="badge badge-blue">Gəncə</span> <span class="badge badge-blue">Sumqayıt</span> <span class="badge badge-blue">Mingəçevir</span> <span class="badge badge-blue">Şirvan</span> <span class="badge badge-blue">Lənkəran</span> <span class="badge badge-blue">Şəki</span> <span class="badge badge-blue">Quba</span> <span class="badge badge-blue">Naxçıvan</span></p>
</div>
`);
