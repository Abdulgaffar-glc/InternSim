$ErrorActionPreference = "Stop"

# Get the script's directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Starting MentorunAI Backend..."
Write-Host "Working Directory: $PWD"

# Check for venv
if (Test-Path "venv\Scripts\Activate.ps1") {
    . .\venv\Scripts\Activate.ps1
} elseif (Test-Path "..\venv\Scripts\Activate.ps1") {
    . ..\venv\Scripts\Activate.ps1
} else {
    Write-Warning "Virtual environment not found. Attempting to run with system Python..."
}

# Run uvicorn
# We add the parent directory to PYTHONPATH to ensure 'app' module is found if needed, 
# but running as a module (python -m uvicorn) is often safer for path resolution.
$env:PYTHONPATH = "$PWD;$env:PYTHONPATH"

python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
