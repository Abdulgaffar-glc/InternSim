# Veritabanını oluşturma scripti
$DB_NAME = "internsim"
$DB_USER = "postgres"
$PG_PASSWORD = "1234" # Varsayılan şifreniz

Write-Host "Veritabanı oluşturuluyor: $DB_NAME ..." -ForegroundColor Yellow

# PGPASSWORD environment değişkenini ayarla (şifre sormaması için)
$env:PGPASSWORD = $PG_PASSWORD

# Veritabanı var mı kontrol et, yoksa oluştur
$exists = psql -U $DB_USER -lqt | Select-String $DB_NAME

if (-not $exists) {
    createdb -U $DB_USER $DB_NAME
    if ($?) {
        Write-Host "✅ Veritabanı başarıyla oluşturuldu!" -ForegroundColor Green
    } else {
        Write-Host "❌ Hata: Veritabanı oluşturulamadı. Şifre yanlış olabilir veya PostgreSQL çalışmıyor." -ForegroundColor Red
        Write-Host "Lütfen manuel deneyin: psql -U postgres -c 'CREATE DATABASE internsim;'" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Veritabanı zaten mevcut." -ForegroundColor Yellow
}

# Environment değişkenini temizle
Remove-Item Env:\PGPASSWORD
