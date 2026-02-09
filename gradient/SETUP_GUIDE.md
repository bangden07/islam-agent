# Setup DigitalOcean Gradient™ AI Platform — Islam Agent
# ============================================================
# Panduan langkah-langkah dari nol hingga agent berjalan.
# Terakhir diperbarui: Februari 2026

## Gambaran Arsitektur (Baru — Fully Managed)
#
#  ┌──────────────────┐       HTTPS        ┌──────────────────────────────┐
#  │  Android App     │ ──────────────────▶ │  Thin Proxy (opsional)       │
#  │  React+Capacitor │ ◀──────────────── │  atau langsung ke:           │
#  └──────────────────┘                    │                              │
#                                          │  Gradient™ AI Platform       │
#                                          │  ┌────────────────────────┐  │
#                                          │  │  Agent (managed)       │  │
#                                          │  │  + Knowledge Base(RAG) │  │
#                                          │  │  + Guardrails          │  │
#                                          │  │  + Foundation Model    │  │
#                                          │  └────────────────────────┘  │
#                                          └──────────────────────────────┘
#
# Keuntungan:
#   - Tidak perlu manage Docker, Qdrant, atau server backend sendiri
#   - Knowledge Base + embedding + OpenSearch di-manage DO
#   - Built-in guardrails
#   - Chatbot embed siap pakai (bonus, selain app React)
#   - Tracing + observability otomatis

# ============================================================
# STEP 0: Prasyarat
# ============================================================
# 1. Akun DigitalOcean (https://cloud.digitalocean.com/registrations/new)
# 2. (Opsional) API key Anthropic jika ingin pakai model Claude
#    → Model open-source (Llama) tersedia tanpa API key tambahan
# 3. (Opsional) doctl CLI terinstall untuk otomasi
#    → https://docs.digitalocean.com/reference/doctl/how-to/install/

# ============================================================
# STEP 1: Siapkan Dokumen Knowledge Base
# ============================================================
# Kumpulkan dokumen Anda dalam format yang didukung:
#   .md, .txt, .pdf, .doc, .docx, .csv, .json, .html, .epub, .xml
#
# Untuk Islam Agent, siapkan minimal:
#   - Terjemah Al-Qur'an (per-surat, format .md/.txt)
#   - Kumpulan hadis pilihan (Bukhari, Muslim, dll)
#   - Ringkasan tafsir populer
#   - Panduan fikih per topik
#   - Materi akhlak & konseling ringan
#
# Simpan di folder: backend/data/docs/
# ATAU upload langsung dari laptop, Spaces bucket, URL, Dropbox, S3
#
# Tips: Gunakan heading yang jelas di setiap dokumen, karena
#       Gradient akan chunk berdasarkan struktur (heading, paragraf).

# ============================================================
# STEP 2: Buat Knowledge Base di Gradient AI Platform
# ============================================================
# Via Control Panel:
#   1. Login ke https://cloud.digitalocean.com
#   2. Klik "Agent Platform" di menu kiri
#   3. Klik tab "Knowledge Bases" → "Create Knowledge Base"
#
#   4. Pilih Embedding Model:
#      → Disarankan: text-embedding-3-small (hemat) atau text-embedding-3-large (lebih akurat)
#      ⚠️  Tidak bisa diubah setelah dibuat!
#
#   5. Tambah Data Sources:
#      → "File Upload" untuk upload langsung dari laptop
#      → Atau "Spaces Bucket" jika sudah upload ke DO Spaces
#      → Atau "URL" untuk crawl website (mis. situs tafsir online)
#
#   6. (Opsional) Atur Chunking Strategy:
#      → "Section-based" (default, cocok untuk dokumen terstruktur)
#      → "Semantic" (lebih mahal, tapi lebih akurat untuk teks naratif)
#      → "Hierarchical" (parent+child chunks, bagus untuk tafsir panjang)
#
#   7. Pilih/buat OpenSearch Database:
#      → "Create New" untuk pertama kali
#      → Perkirakan ukuran: ~2x ukuran total dokumen Anda
#
#   8. Beri nama, pilih project, review harga → "Create Knowledge Base"
#
#   9. Tunggu indexing selesai (biasanya ~5 menit, tergantung ukuran data)
#      → Cek status di tab "Activity"
#
# Via CLI (doctl):
#   doctl genai knowledge-base create \
#     --name "islam-kb" \
#     --embedding-model-id <model-id> \
#     --project-id <project-id> \
#     --region <region>

# ============================================================
# STEP 3: Buat Agent
# ============================================================
# Via Control Panel:
#   1. Klik "Agent Platform" → tab "Workspaces"
#   2. Klik workspace (atau buat baru) → "Create Agent"
#
#   3. Nama Agent: "Islam Agent - Tanya Jawab Islami"
#
#   4. Agent Instructions:
#      → Copy-paste isi dari file: gradient/agent-instructions.md
#      → Panduan lengkap ada di file tersebut
#
#   5. Pilih Model:
#      → Disarankan:
#         • Claude Sonnet 4 (balance kualitas/harga)
#         • Claude Opus 4.6 (tertinggi, lebih mahal)
#         • Llama 3.3 70B (open-source, tanpa API key tambahan, lebih murah)
#      → Jika pilih model Anthropic/OpenAI: masukkan API key provider
#
#   6. Pilih Workspace (grouping agent)
#
#   7. Attach Knowledge Base:
#      → Pilih knowledge base "islam-kb" yang baru dibuat
#
#   8. Pilih Project, tambah tags jika perlu
#
#   9. Review → "Create Agent"
#
# Via CLI:
#   doctl genai agent create \
#     --name "Islam Agent" \
#     --model-id <model-id> \
#     --instruction "$(cat gradient/agent-instructions.md)" \
#     --knowledge-base-ids <kb-id> \
#     --project-id <project-id> \
#     --region <region>

# ============================================================
# STEP 4: Test di Agent Playground
# ============================================================
# 1. Setelah agent dibuat, buka halaman agent
# 2. Klik "Playground" tab
# 3. Coba pertanyaan:
#    - "Bagaimana cara menjaga istiqomah?"
#    - "Apa hukum sholat jamak saat safar?"
#    - "Saya merasa sangat sedih dan putus asa, bagaimana Islam memandang ini?"
# 4. Periksa:
#    - Apakah jawaban menyertakan rujukan dari knowledge base?
#    - Apakah format jawaban sesuai instruksi?
#    - Apakah pertanyaan krisis ditangani dengan aman?
# 5. Adjust instruksi/model jika perlu

# ============================================================
# STEP 5: Setup Guardrails
# ============================================================
# 1. Di halaman agent → tab "Settings" atau "Guardrails"
# 2. Tambahkan guardrail rules:
#    - Blokir konten kekerasan/ekstremisme
#    - Blokir permintaan data sensitif
#    - Deteksi dan handle self-harm / krisis
# 3. Test kembali di Playground

# ============================================================
# STEP 6: Buat Access Key
# ============================================================
# Untuk menghubungkan app React ke agent endpoint:
#
# Via Control Panel:
#   1. Di halaman agent → tab "Settings"
#   2. Di "Endpoint Access Keys" → "Create Key"
#   3. Beri nama (mis. "react-app-key")
#   4. Copy key dan simpan aman! (tidak ditampilkan lagi)
#
# Via CLI:
#   doctl genai agent api-key create <agent-id> --name "react-app-key"

# ============================================================
# STEP 7: Dapatkan Agent Endpoint URL
# ============================================================
# Via Control Panel:
#   1. Di halaman agent → tab "Overview"
#   2. Salin URL dari section "ENDPOINT"
#      Contoh: https://xxxxxxxx.agents.do-ai.run
#
# Via CLI / API:
#   doctl genai agent get <agent-id>
#   → Lihat field "deployment.url"
#
# Endpoint API: $AGENT_ENDPOINT/api/v1/chat/completions

# ============================================================
# STEP 8: Hubungkan App React (Frontend)
# ============================================================
# Opsi A: Langsung dari frontend (lebih simple, tapi access key exposed)
#   → Set VITE_AGENT_ENDPOINT dan VITE_AGENT_ACCESS_KEY di .env
#   → Hanya cocok untuk testing / app internal
#
# Opsi B: Lewat thin proxy backend (DISARANKAN untuk production)
#   → Frontend → proxy backend → Gradient agent
#   → Access key aman di server, tidak di client
#   → Bisa tambah rate limiting, logging, user tracking
#   → Lihat folder: backend/ (proxy server sudah disiapkan)

# ============================================================
# STEP 9: (Opsional) Set Endpoint Public + Embed Chatbot
# ============================================================
# Jika ingin embed chatbot langsung di website (tanpa app React):
#   1. Di "Overview" agent → "ENDPOINT" → "Edit"
#   2. Pilih "Public" → "Save"
#   3. Copy HTML <script> snippet dari section "CHATBOT"
#   4. Paste ke website Anda
#
# Contoh snippet:
#   <script async
#     src="https://xxxxx.ondigitalocean.app/static/chatbot/widget.js"
#     data-agent-id="..."
#     data-chatbot-id="..."
#     data-name="Islam Agent"
#     data-primary-color="#0b7a3e"
#     data-starting-message="Assalamu'alaikum! Ada yang bisa saya bantu?"
#   ></script>

# ============================================================
# STEP 10: Test End-to-End
# ============================================================
# 1. curl test:
#
#   curl -X POST $AGENT_ENDPOINT/api/v1/chat/completions \
#     -H "Content-Type: application/json" \
#     -H "Authorization: Bearer $AGENT_ACCESS_KEY" \
#     -d '{
#       "messages": [{"role":"user","content":"Bagaimana cara menjaga istiqomah?"}],
#       "stream": false,
#       "include_retrieval_info": true
#     }'
#
# 2. Jalankan frontend:
#   cd frontend && npm run dev
#
# 3. Build Android:
#   cd frontend && npm run build && npx cap sync android && npx cap open android
#
# 4. Monitor observability:
#   → Agent Platform → agent → Observability tab → View log stream

# ============================================================
# RINGKASAN BIAYA
# ============================================================
# Komponen biaya Gradient AI Platform:
#   1. Knowledge Base:
#      - Indexing (embedding): per token sesuai model
#      - OpenSearch database: berdasarkan ukuran cluster
#   2. Agent:
#      - Model usage (per token inference): tergantung model
#      - Retrieval (per query ke knowledge base)
#   3. Tidak ada biaya infra server aplikasi
#      (kecuali thin proxy di App Platform/Droplet, jika dipakai)
#
# Detail: https://docs.digitalocean.com/products/gradient-ai-platform/details/pricing/
