@echo off
title House Price Prediction — AI System Launcher
color 0A

echo.
echo  ================================================
echo    House Price Prediction — AI Startup Script
echo  ================================================
echo.

:: ── Check Python ───────────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python is not installed or not in PATH.
    echo  Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

echo  [OK] Python found.
echo.

:: ── Create virtual environment ──────────────────────
if not exist ".venv" (
    echo  [SETUP] Creating virtual environment...
    python -m venv .venv
    echo  [OK] Virtual environment created.
) else (
    echo  [OK] Virtual environment already exists.
)

:: ── Activate venv ───────────────────────────────────
call .venv\Scripts\activate.bat

:: ── Install dependencies ────────────────────────────
echo.
echo  [SETUP] Installing Python dependencies...
pip install greenlet==3.0.3 --prefer-binary --only-binary :all: --quiet
pip install -r requirements.txt --prefer-binary --quiet
if %errorlevel% neq 0 (
    echo  [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo  [OK] Dependencies installed.

:: ── Train ML Model ──────────────────────────────────
echo.
if not exist "backend\app\ml\model.joblib" (
    echo  [ML] Training ML model — this may take 1-3 minutes...
    echo  [ML] Generating 15,000 property records...
    python -m backend.app.ml.train
    if %errorlevel% neq 0 (
        echo  [ERROR] Model training failed. Check the error above.
        pause
        exit /b 1
    )
    echo  [OK] Model trained and saved.
) else (
    echo  [OK] Trained model found. Skipping training.
)

:: ── Launch FastAPI Server ───────────────────────────
echo.
echo  ================================================
echo    Starting House Price Prediction Server...
echo    Open your browser: http://127.0.0.1:8000
echo    API Docs:          http://127.0.0.1:8000/api/docs
echo  ================================================
echo.

uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

pause
