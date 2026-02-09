# Islam Knowledge Base Agent 🕌

Wrapper agent AI untuk membantu menjawab pertanyaan dan keluh-kesah umat Islam
mengenai aspek kehidupan dan alam semesta — dengan rujukan yang jelas dan adab
yang lembut.

> **Didukung oleh [DigitalOcean Gradient™ AI Platform](https://docs.digitalocean.com/products/gradient-ai-agentic-cloud/)** — fully managed agent + knowledge base + RAG + guardrails.

**Stack**: React + TypeScript + Capacitor (Android) → Thin Proxy (FastAPI) → Gradient™ Agent

---

## Arsitektur

```
┌─────────────────────┐         HTTPS         ┌──────────────────────┐
│   Android App       │ ─────────────────────▶ │  Thin Proxy (FastAPI)│
│   React + Capacitor │ ◀───────────────────── │   on DO App Platform │
└─────────────────────┘                        └──────────┬───────────┘
                                                          │
                                                          ▼
                                               ┌──────────────────────┐
                                               │  DO Gradient™ Agent  │
                                               │  ┌────────────────┐  │
                                               │  │  Instructions  │  │
                                               │  │  + Guardrails  │  │
                                               │  └───────┬────────┘  │
                                               │          │           │
                                               │  ┌───────▼────────┐  │
                                               │  │ Knowledge Base │  │
                                               │  │ (OpenSearch    │  │
                                               │  │  + Embeddings) │  │
                                               │  └───────┬────────┘  │
                                               │          │           │
                                               │  ┌───────▼────────┐  │
                                               │  │  LLM (Claude/  │  │
                                               │  │  GPT/Llama)    │  │
                                               │  └────────────────┘  │
                                               └──────────────────────┘
```

---

## Prasyarat

- **Node.js** 18+
- **Python** 3.11+
- **Akun DigitalOcean** (Gradient™ AI Platform)
- **Android Studio** (untuk build APK via Capacitor)

---

## Quick Start

> Panduan lengkap setup Gradient™: lihat [`gradient/SETUP_GUIDE.md`](gradient/SETUP_GUIDE.md)

### 1. Setup Agent di DigitalOcean

1. Buka [DigitalOcean Control Panel](https://cloud.digitalocean.com) → **Gradient AI**
2. Buat **Knowledge Base** → upload file dari `backend/data/docs/`
3. Buat **Agent** → pilih model (Claude Sonnet 4 / GPT-5.2)
4. Paste instruksi dari [`gradient/agent-instructions.md`](gradient/agent-instructions.md)
5. Hubungkan Knowledge Base → aktifkan Guardrails
6. Buat **Access Key** → simpan endpoint & key

### 2. Jalankan proxy backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
AGENT_ENDPOINT=https://xxxxxxxx.agents.do-ai.run
AGENT_ACCESS_KEY=your-access-key-here
```

```bash
pip install -r requirements.txt
uvicorn app.main:app --port 8080
```

Cek: http://localhost:8080/health

### 3. Jalankan frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Buka http://localhost:5173

### 4. Test chat

```bash
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bagaimana cara menjaga istiqomah dalam beribadah?"}'
```

### 5. Build untuk Android

```bash
cd frontend
npm run build
npx cap sync android
npx cap open android
```

Lalu Run dari Android Studio ke emulator/device.

---

## Deploy ke DigitalOcean

1. **Agent**: sudah berjalan di Gradient™
2. **Proxy Backend**: deploy ke [DO App Platform](https://docs.digitalocean.com/products/app-platform/)
   ```bash
   doctl apps create --spec .do/app.yaml
   ```
3. **Environment Variables** di App Platform:
   - `AGENT_ENDPOINT=https://xxxxxxxx.agents.do-ai.run`
   - `AGENT_ACCESS_KEY=your-access-key-here`
4. **Frontend**: build static → host di App Platform static site / CDN

---

## Struktur Folder

```
knowladgebase-islam/
├── gradient/
│   ├── SETUP_GUIDE.md        # Panduan setup Gradient™ AI Platform
│   └── agent-instructions.md # Instruksi agent (copy-paste)
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── gradient_proxy.py  # Proxy ke Gradient™ endpoint
│   │   ├── schemas.py         # Request/Response models
│   │   └── settings.py        # Environment config
│   ├── data/
│   │   └── docs/              # Dokumen KB (upload ke Gradient)
│   │       ├── 01-quran-pilihan.md
│   │       ├── 02-hadis-pilihan.md
│   │       ├── 03-panduan-kehidupan.md
│   │       ├── 04-musthalah-hadis-klasifikasi.md
│   │       ├── 05-fiqh-syafii-peta-bab.md
│   │       ├── 06-kaidah-fiqh-maqashid.md
│   │       ├── 07-fiqh-hewan-tumbuhan-lingkungan.md
│   │       ├── 08-tafsir-rujukan.md
│   │       ├── 09-kehidupan-rumah-tangga.md
│   │       ├── 10-berhubungan-suami-istri-muasyarah.md
│   │       ├── 11-berniaga-muamalah.md
│   │       ├── 12-ahli-waris-faraidh.md
│   │       ├── 13-sirah-rasul-sahabat.md
│   │       ├── 14-peristiwa-mukjizat.md
│   │       ├── 15-hari-besar-perayaan.md
│   │       ├── 16-ruqyah-dan-pengobatan.md
│   │       ├── 17-mendidik-anak-tarbiyah.md
│   │       ├── 18-birrul-walidayn-adab-guru.md
│   │       └── 19-silaturahim-kerabat-keluarga.md
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # ChatWindow, ChatBubble, dll
│   │   ├── hooks/             # useChat
│   │   ├── services/          # API client
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── capacitor.config.ts
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

---

## Knowledge Base (19 dokumen referensi)

| File | Isi |
|------|-----|
| `01-quran-pilihan.md` | Ayat Al-Qur'an pilihan + terjemah |
| `02-hadis-pilihan.md` | 8 hadis shahih pilihan |
| `03-panduan-kehidupan.md` | Istiqomah, kecemasan, FAQ fikih |
| `04-musthalah-hadis-klasifikasi.md` | Klasifikasi hadis (derajat/kuantitas/bentuk/sanad) |
| `05-fiqh-syafii-peta-bab.md` | Peta fikih Syafi'i + perbandingan madzhab |
| `06-kaidah-fiqh-maqashid.md` | 5 kaidah besar + maqashid syariah |
| `07-fiqh-hewan-tumbuhan-lingkungan.md` | Fikih hewan, tumbuhan, alam |
| `08-tafsir-rujukan.md` | Daftar rujukan tafsir Arab + Indonesia |
| `09-kehidupan-rumah-tangga.md` | Kehidupan rumah tangga (hak/kewajiban, konflik, nafkah) |
| `10-berhubungan-suami-istri-muasyarah.md` | Mu'asyarah suami-istri (adab & fiqh ringkas, non-eksplisit) |
| `11-berniaga-muamalah.md` | Berniaga & muamalah (akad, riba, gharar, etika) |
| `12-ahli-waris-faraidh.md` | Ahli waris (faraidh) — peta dasar & langkah hitung |
| `13-sirah-rasul-sahabat.md` | Kisah Rasul & sahabat — ringkasan rujukan |
| `14-peristiwa-mukjizat.md` | Peristiwa & mukjizat — adab & verifikasi sumber |
| `15-hari-besar-perayaan.md` | Hari besar & tradisi perayaan — panduan fiqh ringkas |
| `16-ruqyah-dan-pengobatan.md` | Ruqyah & pengobatan — panduan aman (syar'i + medis) |
| `17-mendidik-anak-tarbiyah.md` | Mendidik anak (tarbiyah) — iman, akhlak, disiplin tanpa kekerasan |
| `18-birrul-walidayn-adab-guru.md` | Berbakti kepada orang tua & adab kepada guru |
| `19-silaturahim-kerabat-keluarga.md` | Silaturahim, hubungan keluarga & kerabat, batasan sehat |

---

## Keamanan & Guardrails

- ✅ Agent bukan mufti — jawaban informatif, bukan fatwa
- ✅ Wajib rujukan — tidak mengarang dalil
- ✅ Deteksi krisis — self-harm/bunuh diri → respons aman + nomor bantuan Indonesia
- ✅ Anti prompt-injection
- ✅ Privasi — tidak meminta data sensitif
- ✅ Guardrails bawaan Gradient™ (DPO / Hallucination / Toxicity filters)

---

## Model yang Tersedia (Gradient™)

| Model | Kelebihan |
|-------|-----------|
| Claude Sonnet 4 | Keseimbangan kualitas & kecepatan |
| Claude Opus 4.6 | Kualitas tertinggi, penalaran kompleks |
| GPT-5.2 | Multimodal, fast |
| Llama 3.3 70B | Open-source, hemat biaya |

---

## Biaya Estimasi (Gradient™)

| Komponen | Biaya |
|----------|-------|
| Agent | Bayar per token (harga model) |
| Knowledge Base | ~$0.023/jam selama aktif |
| Embedding | Per token saat ingest |
| App Platform (proxy) | Mulai $5/bulan |

---

## Lisensi

[Tentukan lisensi proyek Anda di sini]
