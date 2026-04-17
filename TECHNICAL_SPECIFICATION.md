# TEXNİKİ TAPŞIRıQ (Technical Specification)
## OBA Personal Məmnuniyyət İdarəetmə Sistemi
### Versiya: 2.0 | Tarix: 12 Fevral 2026

---

## 1. ÜMUMİ MƏLUMAT

### 1.1 Layihənin Adı
**OBA Əhval Sistemi** — Personal Məmnuniyyət İdarəetmə Platforması

### 1.2 Layihənin Məqsədi
İşçilərin gündəlik əhval-ruhiyyəsini real vaxtda izləyən, süni intellekt vasitəsilə analiz edən, burnout risklərini əvvəlcədən müəyyən edən və rəhbərliyə actionable tövsiyələr təqdim edən tam funksional web tətbiqdir.

### 1.3 Hədəf İstifadəçilər
| Rol | Təsvir | Giriş Səviyyəsi |
|-----|--------|-----------------|
| **İşçi (Employee)** | Gündəlik əhval sorğusunu dolduran şəxslər | Anonim, autentifikasiya tələb olunmur |
| **Menecer (Manager)** | Filial/bölgə səviyyəsində idarəetmə | Email/şifrə ilə giriş, yalnız öz filialının datası |
| **HR (İnsan Resursları)** | Bütün sistem üzrə tam nəzarət | Email/şifrə ilə giriş, bütün datalara tam giriş |

### 1.4 Layihənin Sahibi
- **Sifarişçi**: Şahin
- **İcraçı**: PATCO Group
- **Canlı URL**: https://oba-mood-ai.lovable.app

---

## 2. TEXNOLOGİYA STEKİ

### 2.1 Frontend
| Texnologiya | Versiya | Təyinat |
|-------------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | 5.x | Tip təhlükəsizliyi |
| Vite | 5.x | Build tool və dev server |
| Tailwind CSS | 3.x | Utility-first CSS |
| Framer Motion | 12.x | Animasiyalar |
| Shadcn/UI | Latest | UI komponent kitabxanası |
| React Router | 6.30 | Client-side routing |
| TanStack React Query | 5.83 | Server state management |
| Recharts | 2.15 | Qrafiklər və diaqramlar |
| Zod | 3.25 | Form validasiyası |

### 2.2 Backend (Lovable Cloud / Supabase)
| Xidmət | Təyinat |
|--------|---------|
| PostgreSQL Database | Əsas verilənlər bazası |
| Row Level Security (RLS) | Rol əsaslı data təhlükəsizliyi |
| Edge Functions (Deno) | Serverless API endpointləri |
| Realtime Subscriptions | Real vaxt bildirişlər |
| Auth (Email/Password) | İstifadəçi autentifikasiyası |

### 2.3 AI İnteqrasiyası
| Model | Təyinat |
|-------|---------|
| Google Gemini 2.5 Flash | Əhval analizi, risk proqnozu, tövsiyələr |
| Lovable AI Gateway | API key-siz AI çağırışları |

### 2.4 Əlavə Kitabxanalar
- `date-fns` — Tarix əməliyyatları
- `lucide-react` — İkon kitabxanası
- `sonner` — Toast bildirişləri
- `vite-plugin-pwa` — PWA dəstəyi

---

## 3. SİSTEM ARXİTEKTURASI

### 3.1 Yüksək Səviyyəli Arxitektura

```
┌─────────────────────────────────────────────────────────────┐
│                    İSTİFADƏÇİLƏR                            │
│   İşçi (Anonim)    Menecer (Auth)    HR (Auth)              │
└──────┬──────────────────┬──────────────────┬────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  REACT FRONTEND (SPA)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Ana Səhifə│ │Dashboard │ │HR Panel  │ │Analytics │       │
│  │(Sorğu)   │ │(Menecer) │ │(HR)      │ │(Proqnoz) │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Hesabatlar│ │Təkliflər │ │Hədəflər  │ │Tapşırıqlar│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└──────────────────────┬──────────────────────────────────────┘
                       │ Supabase JS SDK
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              LOVABLE CLOUD BACKEND                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL   │  │Edge Functions│  │  Realtime     │      │
│  │  (11 cədvəl)  │  │(AI Analiz)   │  │(Bildirişlər) │      │
│  │  + RLS        │  │(Risk Proqnoz)│  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              AI GATEWAY (Lovable)                             │
│  Google Gemini 2.5 Flash — Analiz & Proqnoz                 │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Routing Strukturu

| Route | Komponent | Autentifikasiya | Təsvir |
|-------|-----------|-----------------|--------|
| `/` | Index | ❌ Yox | İşçi sorğu interfeysi (anonim) |
| `/auth` | Auth | ❌ Yox | Giriş/Qeydiyyat səhifəsi |
| `/dashboard` | Dashboard | ✅ Bəli | Menecer idarəetmə paneli |
| `/hr-panel` | HRPanel | ✅ Bəli | HR idarəetmə paneli |
| `/analytics` | Analytics | ✅ Bəli | Proqnozlaşdırıcı analitika |
| `/reports` | Reports | ✅ Bəli | Hesabatlar və export |
| `/employee-responses` | EmployeeResponses | ✅ Bəli | İşçi cavabları detallı |
| `/manager-actions` | ManagerActions | ✅ Bəli | Menecer tapşırıqları |
| `/manager-assignments` | ManagerAssignments | ✅ Bəli | Menecer-filial təyinatları |
| `/targets` | Targets | ✅ Bəli | Məmnuniyyət hədəfləri |
| `/suggestion-box` | SuggestionBox | ❌ Yox | Anonim təklif qutusu |
| `/suggestions-management` | SuggestionsManagement | ✅ Bəli | Təkliflərin idarə edilməsi |
| `/install` | Install | ❌ Yox | PWA quraşdırma təlimatları |

---

## 4. VERİLƏNLƏR BAZASI

### 4.1 Cədvəllər (11 ədəd)

#### 4.1.1 `employee_responses` — İşçi Əhval Cavabları
| Sütun | Tip | Məcburi | Default | Təsvir |
|-------|-----|---------|---------|--------|
| id | UUID | ✅ | gen_random_uuid() | Unikal identifikator |
| employee_code | TEXT | ✅ | — | Anonim işçi kodu (EMP+4 rəqəm) |
| branch | TEXT | ✅ | — | Filial kodu |
| department | TEXT | ✅ | — | Şöbə/bölgə adı |
| mood | TEXT | ✅ | — | Əhval: "Əla", "Yaxşı", "Normal", "Pis", "Çox pis" |
| reason | TEXT | ❌ | NULL | Sərbəst mətn səbəb |
| reason_category | TEXT | ❌ | NULL | Kateqoriya: İş yükü, Qrafik, Menecer, Komanda, Digər |
| response_date | DATE | ✅ | CURRENT_DATE | Cavab tarixi |
| created_at | TIMESTAMPTZ | ✅ | now() | Yaradılma vaxtı |

**RLS Siyasətləri:**
- INSERT: Hər kəs (anonim) cavab göndərə bilər
- SELECT: HR bütün cavabları, Menecer yalnız öz filialını görür
- UPDATE/DELETE: Qadağandır

#### 4.1.2 `burnout_alerts` — Burnout Risk Xəbərdarlıqları
| Sütun | Tip | Məcburi | Default | Təsvir |
|-------|-----|---------|---------|--------|
| id | UUID | ✅ | gen_random_uuid() | Unikal identifikator |
| employee_code | TEXT | ✅ | — | İşçi kodu |
| branch | TEXT | ✅ | — | Filial |
| department | TEXT | ✅ | — | Şöbə |
| reason_category | TEXT | ✅ | — | Risk səbəbi |
| risk_score | INTEGER | ✅ | — | Risk balı (0-100) |
| is_resolved | BOOLEAN | ✅ | false | Həll statusu |
| detected_at | TIMESTAMPTZ | ✅ | now() | Aşkarlama vaxtı |
| created_at | TIMESTAMPTZ | ✅ | now() | Yaradılma vaxtı |

**RLS Siyasətləri:**
- INSERT: Hər kəs (sorğudan avtomatik)
- SELECT: HR hamısını, Menecer öz filialını görür
- UPDATE: Yalnız HR
- DELETE: Qadağandır

#### 4.1.3 `external_metrics` — Xarici ERP Metriklər (1C/SAP)
| Sütun | Tip | Məcburi | Default | Təsvir |
|-------|-----|---------|---------|--------|
| id | UUID | ✅ | gen_random_uuid() | Unikal identifikator |
| branch | TEXT | ✅ | — | Filial |
| metric_date | DATE | ✅ | CURRENT_DATE | Metrik tarixi |
| daily_sales | NUMERIC | ❌ | 0 | Gündəlik satış (₼) |
| customer_complaints | INTEGER | ❌ | 0 | Müştəri şikayətləri |
| customer_count | INTEGER | ❌ | 0 | Müştəri sayı |
| returns_count | INTEGER | ❌ | 0 | Qaytarma sayı |
| source_system | TEXT | ❌ | 'manual' | Mənbə sistem |
| created_at | TIMESTAMPTZ | ✅ | now() | Yaradılma vaxtı |
| updated_at | TIMESTAMPTZ | ✅ | now() | Yenilənmə vaxtı |

#### 4.1.4 `risk_predictions` — AI Risk Proqnozları
| Sütun | Tip | Təsvir |
|-------|-----|--------|
| id | UUID | Unikal identifikator |
| branch | TEXT | Filial |
| prediction_date | DATE | Proqnoz tarixi |
| prediction_text | TEXT | AI proqnoz mətni |
| stress_change_percent | NUMERIC | Stress dəyişikliyi (%) |
| sales_impact_percent | NUMERIC | Satışa təsir (%) |
| complaint_risk_percent | NUMERIC | Şikayət riski (%) |
| confidence_score | NUMERIC | Etibarlılıq balı |
| factors | JSONB | Təsiredici amillər |
| expires_at | TIMESTAMPTZ | Keçərlilik müddəti |

#### 4.1.5 `ai_tasks` — AI Tapşırıqları
| Sütun | Tip | Təsvir |
|-------|-----|--------|
| id | UUID | Unikal identifikator |
| title | TEXT | Tapşırıq başlığı |
| description | TEXT | Təsvir |
| priority | TEXT | Prioritet: kritik, yüksək, orta |
| category | TEXT | Kateqoriya |
| branch | TEXT | Filial |
| department | TEXT | Şöbə |
| target_employee | TEXT | Hədəf işçi |
| status | TEXT | Status: pending, in_progress, completed |
| assigned_to | UUID | Təyin edilən şəxs |
| created_by | UUID | Yaradan şəxs |
| completed_at | TIMESTAMPTZ | Tamamlanma vaxtı |
| completed_by | UUID | Tamamlayan şəxs |
| notes | TEXT | Qeydlər |
| source_analysis_date | DATE | Analiz tarixi |

#### 4.1.6 `manager_actions` — Menecer Fəaliyyətləri
| Sütun | Tip | Təsvir |
|-------|-----|--------|
| id | UUID | Unikal identifikator |
| alert_id | UUID | Əlaqəli burnout alert (FK → burnout_alerts) |
| manager_name | TEXT | Menecer adı |
| action_type | ENUM | one_on_one, workload_adjustment, schedule_change, team_meeting, training, other |
| action_description | TEXT | Fəaliyyət təsviri |
| status | ENUM | pending, in_progress, completed, cancelled |
| effectiveness_score | INTEGER | Effektivlik balı |
| notes | TEXT | Qeydlər |
| started_at | TIMESTAMPTZ | Başlama vaxtı |
| completed_at | TIMESTAMPTZ | Tamamlanma vaxtı |

#### 4.1.7 `manager_branches` — Menecer-Filial Təyinatları
| Sütun | Tip | Təsvir |
|-------|-----|--------|
| id | UUID | Unikal identifikator |
| user_id | UUID | Menecer istifadəçi ID |
| branch | TEXT | Filial |
| assigned_by | UUID | Təyin edən şəxs |
| assigned_at | TIMESTAMPTZ | Təyin tarixi |

#### 4.1.8 `manager_notifications` — Menecer Bildirişləri
| Sütun | Tip | Təsvir |
|-------|-----|--------|
| id | UUID | Unikal identifikator |
| manager_user_id | UUID | Menecer ID |
| branch | TEXT | Filial |
| title | TEXT | Bildiriş başlığı |
| message | TEXT | Bildiriş mətni |
| notification_type | TEXT | Tip: critical_complaint, burnout_alert... |
| urgency | TEXT | Təcililik: normal, high, critical |
| is_read | BOOLEAN | Oxunub/oxunmayıb |
| related_alert_id | UUID | Əlaqəli alert (FK → burnout_alerts) |
| sent_via_push | BOOLEAN | Push bildiriş göndərilib |

#### 4.1.9 `anonymous_suggestions` — Anonim Təkliflər
| Sütun | Tip | Təsvir |
|-------|-----|--------|
| id | UUID | Unikal identifikator |
| branch | TEXT | Filial |
| department | TEXT | Şöbə |
| category | TEXT | Kateqoriya: general, suggestion, complaint, improvement |
| suggestion_text | TEXT | Təklif mətni |
| status | TEXT | Status: new, reviewed, in_progress, resolved |
| priority | TEXT | Prioritet: normal, high, urgent |
| admin_notes | TEXT | Admin qeydləri |
| reviewed_by | UUID | Baxan şəxs |
| reviewed_at | TIMESTAMPTZ | Baxılma vaxtı |

#### 4.1.10 `satisfaction_targets` — Məmnuniyyət Hədəfləri
| Sütun | Tip | Təsvir |
|-------|-----|--------|
| id | UUID | Unikal identifikator |
| target_type | TEXT | Hədəf tipi: satisfaction_rate |
| target_value | NUMERIC | Hədəf dəyər |
| current_value | NUMERIC | Cari dəyər |
| branch | TEXT | Filial (NULL = bütün) |
| department | TEXT | Şöbə (NULL = bütün) |
| period_start | DATE | Dövr başlanğıcı |
| period_end | DATE | Dövr sonu |
| status | TEXT | Status: active, completed, expired |
| created_by | UUID | Yaradan şəxs |

#### 4.1.11 `user_roles` — İstifadəçi Rolları
| Sütun | Tip | Təsvir |
|-------|-----|--------|
| id | UUID | Unikal identifikator |
| user_id | UUID | Auth istifadəçi ID |
| role | ENUM | hr, manager, employee |
| created_at | TIMESTAMPTZ | Yaradılma vaxtı |

### 4.2 Database Funksiyaları
| Funksiya | Təsvir |
|----------|--------|
| `has_role(user_id, role)` | İstifadəçinin rolunu yoxlayır (SECURITY DEFINER) |
| `get_user_branch(user_id)` | Menecerin filialını qaytarır |
| `assign_user_role(user_id, role)` | Yeni istifadəçiyə rol təyin edir (HR özünü təyin edə bilməz) |
| `update_updated_at_column()` | Trigger: updated_at avtomatik yeniləmə |

---

## 5. FUNKSİONAL TƏLƏBLƏR

### 5.1 İşçi Modulu (Anonim)

#### 5.1.1 Gündəlik Əhval Sorğusu
- **Axın**: Bölgə seçimi → Əhval seçimi → (Pis isə) Səbəb seçimi → Uğur ekranı
- **Əhval Seçimləri**: Yaxşı 😊 | Normal 😐 | Pis 😔
- **Səbəb Kateqoriyaları** (yalnız Pis əhval zamanı):
  - İş yükü, Qrafik, Menecer, Komanda, Digər (sərbəst mətn)
- **Anonimlik**: Hər cavab üçün təsadüfi EMP kodu generasiya olunur
- **Avtomatik Risk Alert**: Pis əhval zamanı 70-95 arası risk skorlu burnout alert yaradılır

#### 5.1.2 Anonim Təklif Qutusu
- Kateqoriya seçimi: Təklif, Şikayət, Təkmilləşdirmə, Digər
- Filial və şöbə seçimi
- Sərbəst mətn təklif
- Autentifikasiya tələb olunmur

#### 5.1.3 PWA Quraşdırma
- Mobil cihazlara PWA olaraq quraşdırma təlimatları
- iOS və Android dəstəyi

### 5.2 Menecer Modulu (Autentifikasiyalı)

#### 5.2.1 İdarəetmə Paneli (Dashboard)
- **Statistika Kartları**:
  - Ümumi məmnuniyyət indeksi (0-100 bal)
  - Cavab sayı
  - Burnout risk sayı
  - Cavab dərəcəsi (%)
- **Qrafiklər**:
  - Əhval paylanması (Pie Chart)
  - Səbəblər (Bar Chart)
  - Trend xətti (Line Chart)
  - Filial müqayisəsi (Bar Chart)
- **AI Analiz**:
  - Avtomatik yüklənən AI analiz kartı
  - Müşahidələr, tövsiyələr, risk səviyyəsi
  - AI tapşırıqları (statusla idarə olunan)
- **Tarix filtri**: Son 7, 30, 90 gün + xüsusi tarix aralığı
- **Real-time Bildirişlər**: Yeni risk alertləri üçün push notification

#### 5.2.2 Menecer Tapşırıqları
- AI tərəfindən yaradılan tapşırıqları görüntüləmə
- Status dəyişdirmə: pending → in_progress → completed
- Qeyd əlavə etmə
- Yeni tapşırıq yaratma

### 5.3 HR Modulu (Tam Giriş)

#### 5.3.1 HR Paneli
- **Bütün filiallar üzrə statistika**
- **Region-Rayon iyerarxik filtri**: 10 region, 60+ rayon
- **Burnout halları cədvəli**: Risk skoru, işçi kodu, filial, səbəb
- **AI Analiz**: HR səviyyəsində dərin analiz
- **Qrafiklər**: Əhval paylanması, trend, səbəblər, filial müqayisəsi

#### 5.3.2 Hesabatlar
- **Dövr filtri**: Həftəlik, Aylıq, Rüblük, İllik
- **Filial filtri**: Bütün filiallar və ya tək filial
- **Export formatları**:
  - CSV — məlumatların yüklənməsi
  - Excel (XLSX) — UTF-8 dəstəkli
  - PDF — çap üçün hazır format
  - Çap — brauzerdən birbaşa çap
- **Cədvəllər**: Filial statistikası, şöbə statistikası, top səbəblər

#### 5.3.3 Proqnozlaşdırıcı Analitika
- **Stress-Satış Korrelyasiyası**: İşçi əhvalı ilə 1C/SAP satış datalarının əlaqəsi
- **Filial Statusları**:
  - 🔴 Kritik (Əhval < 40 və ya Şikayət > 6/gün)
  - 🟡 Diqqət (Əhval < 60 və ya Şikayət > 3/gün)
  - 🟢 Uğurlu (Qalanlar)
- **Vizuallar**:
  - Xülasə kartları (Kritik/Diqqət/Uğurlu sayları)
  - Detallı cədvəl (əhval, stress, satış, şikayət, trendlər)
  - Scatter Chart: Stress vs Şikayət korrelyasiyası
  - Bar Chart: Filiallar müqayisəsi
- **Əhval Balı Hesablama**: Əla=100, Yaxşı=75, Normal=50, Pis=25, Çox pis=0

#### 5.3.4 Menecer-Filial Təyinatları
- Menecerləri fillallara təyin etmə
- Mövcud təyinatları idarə etmə

#### 5.3.5 Məmnuniyyət Hədəfləri
- Filial/şöbə üzrə hədəf təyin etmə
- Hədəf izləmə və proqres göstərmə
- Aktiv/tamamlanmış/keçmiş statuslar

#### 5.3.6 Təkliflərin İdarə Edilməsi
- Anonim təklifləri görüntüləmə
- Status dəyişdirmə, prioritet təyin etmə
- Admin qeydləri əlavə etmə

### 5.4 AI Funksionallığı

#### 5.4.1 Analiz Edge Function (`analyze-responses`)
- **Giriş**: Əhval paylanması, top səbəblər, risk sayı, kritik şikayətlər
- **Çıxış**: Ümumi skor, xülasə, müşahidələr, tövsiyələr, risk səviyyəsi, tapşırıqlar
- **Fallback**: AI xətası zamanı əsas metriklərdən avtomatik analiz
- **Model**: Google Gemini 2.5 Flash (Lovable AI Gateway)

#### 5.4.2 Risk Proqnozu Edge Function (`predict-risk`)
- **Giriş**: Stress dəyişikliyi, satış təsiri, şikayət riski
- **Çıxış**: Risk proqnozu, tövsiyələr, etibarlılıq skoru
- **Fallback**: Metrik əsaslı sadə proqnoz

---

## 6. QEYRİ-FUNKSİONAL TƏLƏBLƏR

### 6.1 Performans
- İlk yüklənmə vaxtı: < 3 saniyə
- API cavab vaxtı: < 500ms (standart sorğular)
- AI analiz vaxtı: < 10 saniyə
- Eyni vaxtda 100+ istifadəçi dəstəyi

### 6.2 Təhlükəsizlik
- ✅ Row Level Security (RLS) bütün cədvəllərdə aktivdir
- ✅ SECURITY DEFINER funksiyalar ilə rol yoxlaması
- ✅ İşçi cavabları tam anonimd
- ✅ PII (şəxsi məlumat) backend-ə ötürülmür
- ✅ Email/şifrə autentifikasiyası (Menecer və HR üçün)
- ✅ HR rolunu yalnız mövcud HR təyin edə bilər
- ✅ DELETE əməliyyatları əksər cədvəllərdə qadağandır

### 6.3 Responsive Dizayn
- **Mobile-first** yanaşma
- Bütün səhifələr 320px-dən 1920px-ə qədər adaptiv
- Touch-friendly interaktiv elementlər
- Mobil hamburger menyu
- PWA dəstəyi

### 6.4 Tema Dəstəyi
- Açıq (Light) və Qaranlıq (Dark) rejim
- Sistem temasına avtomatik uyğunlaşma
- LocalStorage-da istifadəçi seçiminin saxlanması

### 6.5 Lokalizasiya
- Bütün interfeys Azərbaycan dilində
- Tarix formatları: `az-AZ` locale
- Valyuta: ₼ (Azərbaycan Manatı)

---

## 7. EDGE FUNKSİYALARI

### 7.1 `analyze-responses`
```
POST /functions/v1/analyze-responses
Authorization: Bearer <access_token>

Body: {
  moodDistribution: { Yaxşı: %, Normal: %, Pis: % },
  topReasons: [{ reason, percentage }],
  riskCount: number,
  responseRate: number,
  overallIndex: number,
  criticalComplaints: [{ reason, category, branch, department }]
}

Response: {
  analysis: {
    score: number,
    summary: string,
    observations: string[],
    recommendations: string[],
    riskLevel: "low" | "medium" | "high" | "critical",
    criticalAlerts: string[],
    tasks: [{ title, description, priority, category }]
  }
}
```

### 7.2 `predict-risk`
```
POST /functions/v1/predict-risk
Authorization: Bearer <access_token>

Body: {
  branch: string,
  stressData: { current, previous, change },
  salesData: { current, previous, change },
  complaintData: { current, previous, change }
}

Response: {
  prediction: {
    stressChange: number,
    salesImpact: number,
    complaintRisk: number,
    confidence: number,
    text: string,
    factors: object
  }
}
```

---

## 8. DİZAYN SİSTEMİ

### 8.1 Rəng Paleti
| Token | Dəyər | İstifadə |
|-------|-------|----------|
| `--primary` | hsl(195, 85%, 45%) | Əsas brand rəngi |
| `--background` | hsl(0, 0%, 100%) | Arxa fon (açıq) |
| `--foreground` | hsl(222, 47%, 11%) | Əsas mətn |
| `--muted` | hsl(210, 40%, 96.1%) | Solğun fon |
| `--destructive` | hsl(0, 84.2%, 60.2%) | Xəta/təhlükə |
| Status Good | Emerald/Green | Yaxşı əhval |
| Status Normal | Amber/Yellow | Normal əhval |
| Status Bad | Rose/Red | Pis əhval |

### 8.2 Tipografiya
- **Font**: Inter (Google Fonts)
- **Çəkilər**: 400 (Normal), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extrabold)
- **Başlıqlar**: text-xl → text-6xl gradient text
- **Mətn**: text-sm → text-base, text-muted-foreground

### 8.3 Animasiyalar
- Framer Motion ilə səhifə keçidləri
- Fade-in, slide-in, scale effektləri
- Hover və focus interaktiv effektlər
- Fon gradient orb animasiyaları
- Progress bar animasiyaları

### 8.4 Komponent Standartları
- Shadcn/UI əsaslı bütün UI komponentləri
- `rounded-xl` / `rounded-2xl` küncləri
- `backdrop-blur-xl` şəffaf fon effektləri
- `shadow-xl` / `shadow-lg` kölgələr
- Gradient düymələr və kartlar

---

## 9. FAYL STRUKTURU

```
├── public/
│   ├── favicon.ico
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── robots.txt
├── src/
│   ├── assets/
│   │   └── oba-logo.jpg
│   ├── components/
│   │   ├── ui/                          # Shadcn/UI komponentləri (50+ fayl)
│   │   ├── charts/                      # Qrafik komponentləri
│   │   │   ├── BranchComparisonChart.tsx
│   │   │   ├── MoodPieChart.tsx
│   │   │   ├── ReasonsBarChart.tsx
│   │   │   └── TrendLineChart.tsx
│   │   ├── AIAnalysisCard.tsx           # AI analiz kartı
│   │   ├── AITasksCard.tsx              # AI tapşırıqları kartı
│   │   ├── AnimatedBackground.tsx       # Fon animasiyaları
│   │   ├── BranchSelector.tsx           # Filial seçimi
│   │   ├── ManagerBranchAssignment.tsx  # Menecer təyinatı
│   │   ├── MobileNavMenu.tsx            # Mobil naviqasiya
│   │   ├── MoodSelector.tsx             # Əhval seçimi
│   │   ├── NavLink.tsx                  # Naviqasiya linki
│   │   ├── NotificationButton.tsx       # Bildiriş düyməsi
│   │   ├── PredictiveAnalytics.tsx      # Proqnoz analitikası
│   │   ├── ProtectedRoute.tsx           # Autentifikasiya guard
│   │   ├── ReasonSelector.tsx           # Səbəb seçimi
│   │   ├── SuccessScreen.tsx            # Uğur ekranı
│   │   └── ThemeToggle.tsx              # Tema dəyişdirici
│   ├── hooks/
│   │   ├── use-mobile.tsx               # Mobil deteksiya
│   │   ├── use-toast.ts                 # Toast hook
│   │   ├── useNotifications.ts          # Push bildirişlər
│   │   └── useTheme.ts                  # Tema idarəetməsi
│   ├── integrations/supabase/
│   │   ├── client.ts                    # Supabase SDK client (auto-generated)
│   │   └── types.ts                     # DB tipləri (auto-generated)
│   ├── lib/
│   │   ├── exportUtils.ts               # CSV/Excel/PDF export
│   │   └── utils.ts                     # Ümumi utility funksiyalar
│   ├── pages/
│   │   ├── Analytics.tsx                # Proqnoz analitikası
│   │   ├── Auth.tsx                     # Giriş/Qeydiyyat
│   │   ├── Dashboard.tsx                # Menecer paneli
│   │   ├── EmployeeResponses.tsx        # İşçi cavabları
│   │   ├── HRPanel.tsx                  # HR paneli
│   │   ├── Index.tsx                    # Ana səhifə (sorğu)
│   │   ├── Install.tsx                  # PWA quraşdırma
│   │   ├── ManagerActions.tsx           # Tapşırıqlar
│   │   ├── ManagerAssignments.tsx       # Təyinatlar
│   │   ├── NotFound.tsx                 # 404
│   │   ├── Reports.tsx                  # Hesabatlar
│   │   ├── SuggestionBox.tsx            # Təklif qutusu
│   │   ├── SuggestionsManagement.tsx    # Təkliflərin idarəsi
│   │   └── Targets.tsx                  # Hədəflər
│   ├── App.tsx                          # Root komponent + routing
│   ├── index.css                        # Global stillər + design tokens
│   └── main.tsx                         # Entry point
├── supabase/
│   ├── config.toml                      # Supabase konfiqurasiyası
│   ├── migrations/                      # DB miqrasiyaları
│   └── functions/
│       ├── analyze-responses/index.ts   # AI analiz endpoint
│       └── predict-risk/index.ts        # Risk proqnozu endpoint
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 10. TEST DATASı VƏ DEMO

### 10.1 Test Filialları (9 ədəd)
Bakı Mərkəz, Gəncə, Sumqayıt, Mingəçevir, Şirvan, Lənkəran, Şəki, Quba, Naxçıvan

### 10.2 Test Ssenariləri
- **Bakı Mərkəz**: Yüksək stress, düşən satış (15,200₼ → 6,800₼) — **Kritik**
- **Lənkəran**: Yüksək stress, çox şikayət — **Kritik**
- **Gəncə, Şəki**: Orta stress — **Diqqət**
- **Sumqayıt, Quba, Mingəçevir**: Aşağı stress, yaxşı satış — **Uğurlu**

### 10.3 Əhval Balı Şkalası
| Əhval | Bal | Rəng |
|-------|-----|------|
| Əla | 100 | 🟢 |
| Yaxşı | 75 | 🟢 |
| Normal | 50 | 🟡 |
| Pis | 25 | 🔴 |
| Çox pis | 0 | 🔴 |

---

## 11. DEPLOYMENT VƏ İNFRASTRUKTUR

### 11.1 Hosting
- **Frontend**: Lovable Cloud CDN (avtomatik deploy)
- **Backend**: Lovable Cloud (Supabase-based)
- **Domain**: oba-mood-ai.lovable.app

### 11.2 CI/CD
- Git push → Avtomatik build və deploy
- Edge functions avtomatik deploy olunur
- Database miqrasiyaları manual approve tələb edir

### 11.3 Monitoring
- Console log-lar
- Edge function log-lar
- Supabase analytics (DB, Auth, Edge logs)

---

## 12. MƏHDUDIYYƏTLƏR VƏ GƏLƏCƏk PLANLAR

### 12.1 Cari Məhdudiyyətlər
- Backend yalnız Lovable Cloud vasitəsilə (xarici server yoxdur)
- 1C/SAP inteqrasiyası manual test datası ilə simulyasiya olunur
- Supabase sorğu limiti: 1000 sətir/sorğu
- PWA offline funksionallıq məhduddur

### 12.2 Gələcək İnkişaf Planları
- [ ] 1C/SAP API real inteqrasiyası
- [ ] Mobil native tətbiq (React Native)
- [ ] Email bildirişləri
- [ ] Təkmilləşdirilmiş AI modelləri
- [ ] Çoxdilli dəstək (RU, EN)
- [ ] İşçi self-service portal
- [ ] Detallı audit log

---

*Bu texniki tapşırıq OBA Personal Məmnuniyyət İdarəetmə Sisteminin cari vəziyyətini əks etdirir.*
*Sənəd Tarixi: 12 Fevral 2026*
