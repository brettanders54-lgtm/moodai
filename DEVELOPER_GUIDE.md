# OBA Əhval Sistemi — Developer Guide

## 📋 Layihə Haqqında

**OBA Əhval Sistemi** işçilərin gündəlik əhval-ruhiyyəsini real vaxtda izləyən, AI ilə analiz edən və burnout risklərini əvvəlcədən müəyyən edən web tətbiqdir.

**Canlı URL:** https://oba-mood-ai.lovable.app

---

## 🏗️ Texnologiya Steki

| Texnologiya | Versiya | Təyinat |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.x | Tip təhlükəsizliyi |
| Vite | 5.x | Build tool, dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| Shadcn/UI | Latest | UI komponent kitabxanası |
| Framer Motion | 12.x | Animasiyalar |
| React Router | 6.30 | Client-side routing |
| TanStack React Query | 5.83 | Server state management |
| Recharts | 2.15 | Qrafiklər |
| Supabase JS | 2.84 | Backend SDK |
| Zod | 3.25 | Validasiya |

**Backend:** Lovable Cloud (PostgreSQL + Edge Functions + Auth + Realtime)
**AI:** Google Gemini 2.5 Flash (Lovable AI Gateway vasitəsilə, API key lazım deyil)

---

## 📁 Folder Strukturu

```
├── public/                    # Statik fayllar (favicon, PWA ikonları)
├── src/
│   ├── assets/                # Şəkillər (logo və s.)
│   ├── components/
│   │   ├── ui/                # Shadcn/UI bazis komponentlər (button, card, dialog...)
│   │   ├── charts/            # Recharts qrafik komponentləri
│   │   │   ├── MoodPieChart.tsx
│   │   │   ├── ReasonsBarChart.tsx
│   │   │   ├── TrendLineChart.tsx
│   │   │   └── BranchComparisonChart.tsx
│   │   ├── MoodSelector.tsx          # Əhval seçimi (Yaxşı/Normal/Pis)
│   │   ├── ReasonSelector.tsx        # Səbəb seçimi (iş yükü, menecer...)
│   │   ├── SuccessScreen.tsx         # Cavab göndərildikdən sonra uğur ekranı
│   │   ├── BranchSelector.tsx        # Filial seçimi dropdown
│   │   ├── AnimatedBackground.tsx    # Fon animasiyaları
│   │   ├── AIAnalysisCard.tsx        # AI analiz nəticələri kartı
│   │   ├── AITasksCard.tsx           # AI tapşırıqları kartı
│   │   ├── PredictiveAnalytics.tsx   # Proqnozlaşdırıcı analitika
│   │   ├── ProtectedRoute.tsx        # Auth qorunan route wrapper
│   │   ├── ManagerBranchAssignment.tsx # Menecer-filial təyinatı
│   │   ├── MobileNavMenu.tsx         # Mobil naviqasiya menyusu
│   │   ├── NavLink.tsx               # Naviqasiya linki
│   │   ├── NotificationButton.tsx    # Bildiriş düyməsi
│   │   └── ThemeToggle.tsx           # Açıq/Qaranlıq tema keçidi
│   ├── hooks/
│   │   ├── use-mobile.tsx            # Mobil ekran aşkarlama
│   │   ├── useNotifications.ts       # Bildiriş hook-u
│   │   └── useTheme.ts              # Tema idarəetmə
│   ├── integrations/supabase/
│   │   ├── client.ts                 # ⚠️ AVTOMATİK — redaktə etmə!
│   │   └── types.ts                  # ⚠️ AVTOMATİK — redaktə etmə!
│   ├── lib/
│   │   ├── utils.ts                  # cn() və ümumi utility-lər
│   │   └── exportUtils.ts            # CSV/Excel export funksiyaları
│   ├── pages/                        # Səhifə komponentləri (aşağıda routing bölməsinə bax)
│   ├── index.css                     # Tailwind konfiqurasiya + design tokens
│   ├── main.tsx                      # Tətbiq giriş nöqtəsi
│   └── App.tsx                       # Router və provider-lər
├── supabase/
│   ├── config.toml                   # ⚠️ AVTOMATİK — redaktə etmə!
│   └── functions/
│       ├── analyze-responses/        # AI əhval analizi endpoint
│       └── predict-risk/             # AI risk proqnozu endpoint
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

> ⚠️ `src/integrations/supabase/` folderindəki fayllar avtomatik generasiya olunur. Manual dəyişiklik etməyin.

---

## 🔀 Routing

| Route | Auth | Komponent | Təsvir |
|---|---|---|---|
| `/` | ❌ | `Index.tsx` | İşçi sorğu interfeysi (anonim) |
| `/auth` | ❌ | `Auth.tsx` | Giriş/Qeydiyyat |
| `/dashboard` | ✅ | `Dashboard.tsx` | Menecer idarəetmə paneli |
| `/hr-panel` | ✅ | `HRPanel.tsx` | HR tam nəzarət paneli |
| `/analytics` | ✅ | `Analytics.tsx` | Proqnozlaşdırıcı analitika |
| `/reports` | ✅ | `Reports.tsx` | Hesabatlar + export |
| `/employee-responses` | ✅ | `EmployeeResponses.tsx` | İşçi cavabları detallı |
| `/manager-actions` | ✅ | `ManagerActions.tsx` | Menecer tapşırıqları |
| `/manager-assignments` | ✅ | `ManagerAssignments.tsx` | Menecer-filial təyinatları |
| `/targets` | ✅ | `Targets.tsx` | Məmnuniyyət hədəfləri |
| `/suggestions-management` | ✅ | `SuggestionsManagement.tsx` | Təkliflərin idarəsi |
| `/suggestion-box` | ❌ | `SuggestionBox.tsx` | Anonim təklif qutusu |
| `/install` | ❌ | `Install.tsx` | PWA quraşdırma |

**Auth mexanizmi:** `ProtectedRoute` komponenti istifadəçinin autentifikasiya statusunu yoxlayır.

---

## 🗄️ Database Sxemi (11 Cədvəl)

### Əsas cədvəllər

#### `employee_responses`
İşçilərin gündəlik əhval cavabları. Tam anonimdir.

| Sütun | Tip | Təsvir |
|---|---|---|
| id | UUID (PK) | Unikal ID |
| employee_code | TEXT | Anonim kod (EMP + 4 rəqəm) |
| branch | TEXT | Filial |
| department | TEXT | Şöbə |
| mood | TEXT | Əhval: Əla, Yaxşı, Normal, Pis, Çox pis |
| reason | TEXT? | Sərbəst mətn səbəb |
| reason_category | TEXT? | Kateqoriya (İş yükü, Menecer, Qrafik...) |
| response_date | DATE | Cavab tarixi |

#### `burnout_alerts`
Avtomatik yaradılan risk alertləri.

| Sütun | Tip | Təsvir |
|---|---|---|
| id | UUID (PK) | |
| employee_code | TEXT | İşçi kodu |
| branch / department | TEXT | Filial / Şöbə |
| risk_score | INTEGER | Risk balı (0-100) |
| is_resolved | BOOLEAN | Həll statusu |
| reason_category | TEXT | Risk səbəbi |

#### `user_roles`
İstifadəçi rolları.

| Sütun | Tip | Təsvir |
|---|---|---|
| user_id | UUID | Auth user ID |
| role | ENUM | `hr`, `manager`, `employee` |

### Digər cədvəllər

| Cədvəl | Təsvir |
|---|---|
| `ai_tasks` | AI tərəfindən yaradılan tapşırıqlar (status: pending → in_progress → completed) |
| `manager_actions` | Menecer fəaliyyətləri (burnout_alerts ilə əlaqəli) |
| `manager_branches` | Menecer-filial təyinatları |
| `manager_notifications` | Real-time bildirişlər |
| `anonymous_suggestions` | Anonim təkliflər (status, prioritet, admin qeydləri) |
| `satisfaction_targets` | Məmnuniyyət hədəfləri (filial/şöbə üzrə) |
| `external_metrics` | Xarici ERP dataları (satış, şikayət, müştəri) |
| `risk_predictions` | AI risk proqnozları |

### Database funksiyaları

| Funksiya | Təsvir |
|---|---|
| `has_role(user_id, role)` | İstifadəçinin rolunu yoxlayır |
| `get_user_branch(user_id)` | Menecerin filialını qaytarır |
| `assign_user_role(user_id, role)` | Rol təyin edir |

### RLS (Row Level Security)
Bütün cədvəllərdə RLS aktivdir. `employee_responses` və `anonymous_suggestions` anonim INSERT icazəsi var. Digər cədvəllər rol əsaslı giriş tələb edir.

---

## 🤖 Edge Functions (Serverless API)

### `analyze-responses`
**POST** `/functions/v1/analyze-responses`

Əhval datalarını AI ilə analiz edir.

**Giriş:** əhval paylanması, top səbəblər, risk sayı, kritik şikayətlər
**Çıxış:** skor, xülasə, müşahidələr, tövsiyələr, risk səviyyəsi, tapşırıqlar
**Fallback:** AI xətası zamanı metrik əsaslı avtomatik analiz

### `predict-risk`
**POST** `/functions/v1/predict-risk`

Gələcək risk proqnozu.

**Giriş:** stress, satış, şikayət dataları
**Çıxış:** risk proqnozu, etibarlılıq skoru, təsiredici amillər

> AI model: Google Gemini 2.5 Flash — Lovable AI Gateway vasitəsilə, API key lazım deyil.

---

## 👥 İstifadəçi Rolları

| Rol | Giriş | İmkanlar |
|---|---|---|
| **İşçi** | Anonim (auth yoxdur) | Sorğu doldurma, təklif göndərmə |
| **Menecer** | Email/şifrə | Öz filialının dashboardu, AI analiz, tapşırıqlar |
| **HR** | Email/şifrə | Bütün filiallar, hesabatlar, menecer təyinatları, hədəflər |

---

## 🎨 Dizayn Sistemi

- **Rənglər:** `index.css`-dəki CSS dəyişənləri (`--primary`, `--background`, və s.)
- **Font:** Inter (400-800)
- **UI Kit:** Shadcn/UI (`src/components/ui/`)
- **Animasiyalar:** Framer Motion
- **Tema:** Açıq/Qaranlıq dəstəyi (`ThemeToggle` komponenti)
- **Responsive:** Mobile-first (320px — 1920px)

### Rəng qaydası
Komponentlərdə **birbaşa rəng istifadə etməyin**. Həmişə Tailwind semantic token-ları istifadə edin:
```tsx
// ✅ Doğru
<div className="bg-primary text-primary-foreground" />

// ❌ Yanlış
<div className="bg-blue-500 text-white" />
```

---

## 🚀 Development

### Quraşdırma
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

### Mühüm qeydlər
- `src/integrations/supabase/client.ts` və `types.ts` **redaktə etməyin** — avtomatik generasiya olunur
- `supabase/config.toml` **redaktə etməyin** — avtomatik idarə olunur
- `.env` faylı avtomatik konfiqurasiya olunur (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
- Edge functions avtomatik deploy olunur

### Əhval balı şkalası
| Əhval | Bal | Rəng |
|---|---|---|
| Əla | 100 | 🟢 |
| Yaxşı | 75 | 🟢 |
| Normal | 50 | 🟡 |
| Pis | 25 | 🔴 |
| Çox pis | 0 | 🔴 |

### Test filialları (9 ədəd)
Bakı Mərkəz, Gəncə, Sumqayıt, Mingəçevir, Şirvan, Lənkəran, Şəki, Quba, Naxçıvan

---

## 📞 Əlaqə

**Sifarişçi:** Şahin
**İcraçı:** PATCO Group
**Tarix:** Fevral 2026
