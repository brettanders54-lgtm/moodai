# Personal Məmnuniyyət Redaktoru

## 📋 Layihə Haqqında

Personal Məmnuniyyət Redaktoru - işçilərin gündəlik əhvalını real vaxtda izləyən, AI ilə analiz edən və burnout risklərini əvvəlcədən müəyyənləşdirən tam funksional mobil-first tətbiqdir.

### 🎯 Əsas Məqsəd
Personalın əhvalı düşəndə müştəri təcrübəsi düşmədən müdaxilə etmək və rəhbərliyə actionable tövsiyələr təqdim etmək.

## ✨ V1 Xüsusiyyətləri

### 🎭 İşçi İnterfeysi
- **Gündəlik Mikro-Sorğu**: Yaxşı / Normal / Pis seçimləri ilə sadə və sürətli əhval yoxlaması
- **Səbəb Seçimi**: Pis əhval seçildikdə 6 əsas kateqoriyadan səbəb seçimi
  - Menecer
  - İş yükü
  - Qrafik
  - Komanda
  - Şərtlər
  - Digər (sərbəst mətn)
- **Anonim Cavablar**: Tam məxfilik və konfidensiallik
- **Uğur Ekranı**: Pozitiv geri bildirim və məxfilik xəbərdarlığı

### 📊 Dashboard
- **Real-time Statistika**:
  - Ümumi məmnuniyyət indeksi
  - Cavab sayı və dərəcəsi
  - Burnout risk sayı
  - Aktivlik statistikası
- **Əhval Bölgüsü**: Vizual progress bar-lar ilə cavab paylanması
- **Top Səbəblər**: Ən çox qarşılaşılan problemlər və kateqoriyalar
- **Risk Alertləri**: Diqqət tələb edən halllar üçün xəbərdarlıq kartları

## 🎨 Dizayn Sistemi

### Rəng Paleti
- **Primary**: Sakitləşdirici mavi-yaşıl ton (hsl(195 85% 45%))
- **Status Colors**:
  - Yaxşı: Soft green
  - Normal: Warm amber
  - Pis: Gentle red
- **Gradientlər**: Yumşaq keçidli gradient-lər atmosfer yaratmaq üçün
- **Shadows**: Multi-layer kölgələr dərinlik üçün

### Animasiyalar
- Fade-in və slide-in keçidləri
- Hover və focus effektləri
- Smooth state dəyişiklikləri
- Framer Motion ilə fon animasiyaları

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700, 800
- **Features**: Ligatures və contextual alternates

## 🏗️ Texniki Strukturu

### Frontend Stack
- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animasiyalar
- **Shadcn/ui** - UI komponentləri
- **React Router** - Navigation

### Komponentlər
```
src/
├── components/
│   ├── MoodSelector.tsx      # Əhval seçimi interfeysi
│   ├── ReasonSelector.tsx    # Səbəb seçimi interfeysi
│   ├── SuccessScreen.tsx     # Uğur ekranı
│   ├── AnimatedBackground.tsx # Fon animasiyaları
│   └── ui/                   # Shadcn komponentləri
├── pages/
│   ├── Index.tsx             # Ana səhifə (işçi interfeysi)
│   ├── Dashboard.tsx         # Statistika dashboardu
│   └── NotFound.tsx          # 404 səhifəsi
```

## 🚀 Növbəti Addımlar (Backend)

### Backend Hazırlığı
1. **Lovable Cloud** aktivləşdirmək
2. **Database**:
   - `responses` cədvəli (mood, reason, timestamp, store_id)
   - `alerts` cədvəli (risk skorları, recommendations)
3. **Edge Functions**:
   - `/api/submit-response` - Cavab qəbul etmək
   - `/api/get-dashboard-data` - Dashboard üçün data
   - `/api/ai-analysis` (gələcək) - AI analizi

### AI İnteqrasiyası (Roadmap)
1. **Lovable AI Gateway** ilə inteqrasiya
2. Sentiment analizi implementasiyası
3. Burnout risk skorlaması
4. Actionable tövsiyələr generasiyası

## 📱 Mobil Dəstək

Tətbiq tam responsive və mobil-first prinsiplərlə hazırlanıb:
- Touch-friendly böyük düymələr
- Mobile navigation
- PWA dəstəyi üçün hazırdır

## 🔐 Məxfilik və Təhlükəsizlik

- ✅ Tam anonim cavablar
- ✅ PII məlumatları backend-ə ötürülmür
- ✅ HTTPS mandatory olacaq
- ✅ Role-based access (gələcək)

## 📖 İstifadə

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## 👥 Əlaqə

**Hazırlayan**: PATCO Group
**Müştəri**: Şahin
**Tarix**: 23/11/2025

---

🌟 **Not**: Bu V1 versiyasıdır və əsas funksionallıq təmin edilib. AI analizi, backend inteqrasiyası və HR panelinə aid xüsusiyyətlər növbəti iterasiyalarda əlavə ediləcək.
