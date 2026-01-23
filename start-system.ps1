# InternSim - System Startup Script
# This script starts backend and frontend in separate terminals

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Starting InternSim System..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "[1/2] Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\gulic\TumProje\backend'; if (Test-Path 'venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 } elseif (Test-Path '..\venv\Scripts\Activate.ps1') { ..\venv\Scripts\Activate.ps1 }; Write-Host 'Backend running: http://localhost:8000' -ForegroundColor Green; Write-Host 'Swagger UI: http://localhost:8000/docs' -ForegroundColor Green; python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\gulic\TumProje\frontend\frontend'; Write-Host 'Frontend running: http://localhost:8080' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "=================================" -ForegroundColor Green
Write-Host "System Started!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Swagger:  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop: Close the terminal windows" -ForegroundColor Yellow
