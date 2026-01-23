# Hızlı Başlangıç Rehberi

## 🚀 İlk Kurulum (Sadece Bir Kez)

### 1. PostgreSQL Database Oluştur
```powershell
# PostgreSQL'e bağlan
psql -U postgres

# Database oluştur
CREATE DATABASE internsim;

# Çıkış
\q
```

### 2. Backend Dependencies Yükle
```powershell
cd backend

# Virtual environment oluştur
python -m venv venv

# Aktive et
.\venv\Scripts\Activate.ps1

# Bağımlılıkları yükle
pip install -r requirements.txt
```

### 3. Frontend Dependencies Yükle
```powershell
cd frontend\frontend
npm install
```

## ▶️ Sistemi Çalıştırma

### Otomatik (Önerilen)
```powershell
# Ana dizinde
.\start-system.ps1
```

### Manuel
**Terminal 1 - Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend\frontend
npm run dev
```

## 🌐 Erişim
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs

## ✅ Test
```powershell
# Backend health check
curl http://localhost:8000/

# Database test
curl http://localhost:8000/db-test
```

Detaylı bilgi için `README.md` dosyasına bakın.
