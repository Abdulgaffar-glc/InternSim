# InternSim - Integrated Intern Simulation System

## 🎯 Proje Hakkında

InternSim, stajyer yönetimi ve AI destekli değerlendirme sistemidir. Bu proje 4 kişi tarafından ayrı ayrı geliştirilmiş modüllerin entegrasyonundan oluşmuştur.
Projeye [internsim.com.tr](https://internsim.com.tr/)'den ulaşabilirsiniz(Not: Proje backend'i Render free tier ile hostlandığı için ilk sorguda yaklaşık 40 saniye beklemeniz gerekebilir).

### Özellikler
- 🔐 Kullanıcı kimlik doğrulama (JWT)
- 👥 Stajyer yönetimi
- 📋 Görev atama ve takip
- 📝 Görev gönderimi
- ⭐ AI destekli görev değerlendirme
- 💬 AI Code Review & Chat sistemi
- 📊 Dashboard ve raporlama

## 🏗️ Mimari

```
TumProje/
├── backend/              # Ana Backend (FastAPI + PostgreSQL)
│   ├── backend/
│   │   └── app/
│   │       ├── routes/   # API endpoints
│   │       ├── models/   # Database models
│   │       ├── services/ # AI services
│   │       └── ai/       # AI prompts & configs
│   └── requirements.txt
├── frontend/            # React Frontend
│   └── frontend/
│       ├── src/
│       └── package.json
├── _archive/            # Arşivlenmiş eski modüller
├── .env                 # Global Environment variables (Backend & Frontend)
└── start-system.ps1     # Sistem başlatma scripti
```

## 📋 Gereksinimler

Başlamadan önce aşağıdaki yazılımların bilgisayarınızda kurulu olması gerekmektedir:

| Yazılım | Minimum Versiyon | İndirme Linki |
|---------|------------------|---------------|
| Python | 3.10+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| PostgreSQL | 14+ | https://www.postgresql.org/download/ |
| Git | 2.30+ | https://git-scm.com/downloads |

---

## 🗄️ Adım 1: PostgreSQL Veritabanı Kurulumu

### 1.1 PostgreSQL Kurulumu
1. [PostgreSQL](https://www.postgresql.org/download/) sitesinden indirin
2. Kurulum sırasında şifre belirleyin (örn: `1234`)
3. Port'u varsayılan (`5432`) bırakın

### 1.2 Veritabanı Oluşturma
PostgreSQL kurulduktan sonra, **pgAdmin** veya **psql** kullanarak veritabanı oluşturun:

```sql
-- psql ile:
psql -U postgres
CREATE DATABASE internsim;
\q
```

Veya **pgAdmin** üzerinden:
1. pgAdmin'i açın
2. Databases > Sağ tık > Create > Database
3. Database name: `internsim`
4. Save

---

## 📁 Adım 2: Proje Dosyalarını İndirme

```bash
# Projeyi klonlayın (veya ZIP olarak indirin)
git clone <proje-url>
cd TumProje
```

Proje yapısı şöyle olmalı:
```
TumProje/
├── backend/
│   └── backend/
│       └── app/
├── frontend/
│   └── frontend/
│       └── src/
├── .env
```

---

## 🔧 Adım 3: Backend Kurulumu

### 3.1 Sanal Ortam Oluşturma

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

> ⚠️ PowerShell'de hata alırsanız: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

### 3.2 Bağımlılıkları Yükleme

```bash
pip install -r requirements.txt
```

`requirements.txt` yoksa, aşağıdaki komutu çalıştırın:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib bcrypt httpx python-dotenv pydantic email-validator
```

### 3.3 Global Environment Dosyası (.env)

Ana dizinde (`TumProje/.env`) bir dosya oluşturun. Bu dosya hem Backend hem de Frontend tarafından kullanılacaktır:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=internsim
DB_USER=postgres
DB_PASSWORD=1234

# JWT Secret (Güvenli bir key oluşturun)
SECRET_KEY=sizin-gizli-anahtariniz-buraya
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# io.net API Configuration (AI Servisleri için)
IO_NET_API_KEY=sizin-api-keyiniz
IO_NET_MODEL_ID=meta-llama/Llama-3.3-70B-Instruct
IO_NET_API_URL=https://api.intelligence.io.solutions/api/v1/chat/completions

# CORS Configuration
BACKEND_CORS_ORIGINS=http://localhost:8080,http://localhost:5173,http://localhost:3000

# Frontend Configuration
VITE_API_URL=http://localhost:8000
```

**SECRET_KEY oluşturmak için:**
```python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3.4 Veritabanı Tablolarını Oluşturma

```bash
python update_schema.py
```

### 3.5 Backend'i Başlatma

```bash
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

✅ Başarılı olduğunda göreceğiniz çıktı:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

API Dokümanı: http://127.0.0.1:8000/docs

---

## 🎨 Adım 4: Frontend Kurulumu

### 4.1 Node.js Bağımlılıklarını Yükleme

```bash
cd ../frontend/frontend
npm install
```

### 4.2 Environment Dosyası

Frontend uygulaması ana dizindeki `.env` dosyasını otomatik olarak kullandığı için **ekstra bir işlem yapmanıza gerek yoktur.**

### 4.3 Frontend'i Başlatma

```bash
npm run dev
```

✅ Başarılı olduğunda göreceğiniz çıktı:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
```

---

## 🚀 Adım 5: Uygulamayı Kullanma

1. Tarayıcınızda açın: **http://localhost:8080**
2. "Kayıt Ol" butonuna tıklayın
3. Email ve şifre ile kayıt olun
4. Staj alanı ve seviye seçin
5. Dashboard'a erişin!

---

## ⚙️ Sık Kullanılan Komutlar

| Görev | Komut |
|-------|-------|
| Backend başlat | `python -m uvicorn backend.app.main:app --reload` |
| Frontend başlat | `npm run dev` |
| DB şema güncelle | `python update_schema.py` |
| Yeni bağımlılık ekle | `pip install <paket>` |
| requirements.txt güncelle | `pip freeze > requirements.txt` |

---

## ❓ Sık Karşılaşılan Sorunlar

### 1. "Module not found" hatası
```bash
# venv aktif mi kontrol edin
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Linux/Mac
```

### 2. PostgreSQL bağlantı hatası
- PostgreSQL servisi çalışıyor mu?
- `.env` dosyasındaki bilgiler doğru mu?
- Veritabanı oluşturuldu mu?

### 3. Port kullanımda hatası
```bash
# Başka bir port kullanın
python -m uvicorn backend.app.main:app --reload --port 8001
```

### 4. CORS hatası
Backend ve frontend farklı portlarda çalışıyorsa, backend `main.py`'de CORS ayarı var. Kontrol edin.

### 5. npm install hatası
```bash
# Node modüllerini temizleyip tekrar deneyin
rm -rf node_modules package-lock.json
npm install
```

---

## 🔐 API Endpoints

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/auth/register` | POST | Kayıt ol |
| `/auth/login` | POST | Giriş yap |
| `/users/me` | GET | Profil bilgisi |
| `/users/me/stats` | GET | Performans istatistikleri |
| `/tasks/` | GET | Görevleri listele |
| `/tasks/generate` | POST | AI ile görev oluştur |
| `/ai-mentor/chat` | POST | AI mentor ile sohbet |
| `/ai-feedback/evaluate` | POST | Kod değerlendirmesi |

Tam API dokümantasyonu: http://localhost:8000/docs

---

## 📧 Destek

Sorun yaşarsanız:
1. Konsol/terminal hatalarını kontrol edin
2. `.env` dosyalarının doğru yapılandırıldığından emin olun
3. Veritabanının oluşturulduğundan emin olun

---

**İyi çalışmalar! 🎉**


## 📁 Modül Geçmişi

Orijinal 4 modül `_archive/` klasöründe saklanmıştır:
- `ai-mentor/` - AI Code Review sistemi
- `ai-feedback/` - AI Görev değerlendirme sistemi
- İki identik backend modülü birleştirildi

## 🛠️ Teknoloji Stack

### Backend
- **Framework**: FastAPI 0.128.0
- **Database**: PostgreSQL + SQLAlchemy 2.0.45
- **Authentication**: JWT (python-jose)
- **AI**: io.net API (Llama-3.3-70B-Instruct)
- **Server**: Uvicorn 0.40.0

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.19
- **Language**: TypeScript 5.8.3
- **UI Library**: Shadcn/UI + Radix UI
- **Styling**: TailwindCSS 3.4.17
- **Routing**: React Router 6.30.1
- **State**: TanStack Query 5.83.0


## 🐛 Sorun Giderme

### Backend başlamıyor
1. Virtual environment aktif mi kontrol edin
2. PostgreSQL çalışıyor mu kontrol edin
3. .env dosyasındaki DB bilgilerini kontrol edin

### Frontend başlamıyor
1. `node_modules` yüklü mü kontrol edin
2. `npm install` komutunu tekrar çalıştırın

### Database bağlanmıyor
1. PostgreSQL servisinin çalıştığından emin olun
2. Database'in oluşturulduğunu kontrol edin: `psql -U postgres -c "\l"`
3. Şifrenin doğru olduğunu kontrol edin

### AI servisleri çalışmıyor
1. .env dosyasında `IO_NET_API_KEY` ve `IOINTELLIGENCE_API_KEY` değerlerini kontrol edin
2. API key'in geçerli olduğundan emin olun

## 📝 Geliştirme Notları

### Virtual Environment Yeniden Oluşturma
Eğer projeyi taşıdıysanız venv'i yeniden oluşturun:

```powershell
cd backend
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## 👥 Katkıda Bulunanlar

4 kişilik ekip tarafından geliştirilmiştir:
- Backend modülü geliştiricisi
- Frontend modülü geliştiricisi
- AI Feedback sistem geliştiricisi
- AI Mentor sistem geliştiricisi

Entegrasyon: AI Assistant
