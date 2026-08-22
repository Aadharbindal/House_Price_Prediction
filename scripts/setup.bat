@echo off
title House Price Prediction — Setup
color 0A

echo.
echo  ═══════════════════════════════════════════════════
echo    House Price Prediction — Full Stack Setup
echo    Stack: Node.js + Express + MySQL + Python ML
echo  ═══════════════════════════════════════════════════
echo.

:: Run everything from the repository root, whatever directory this script
:: was launched from.
cd /d "%~dp0.."

:: ── Check Node.js ─────────────────────────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found. Install from https://nodejs.org
    pause & exit /b 1
)
echo  [OK] Node.js found.

:: ── Check Python ──────────────────────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python not found. Install from https://python.org
    pause & exit /b 1
)
echo  [OK] Python found.

:: ── Install Node dependencies ─────────────────────────────────
echo.
echo  [SETUP] Installing Node.js backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 ( echo [ERROR] npm install failed. & pause & exit /b 1 )
cd ..
echo  [OK] Node.js packages installed.

:: ── Install Python ML dependencies ───────────────────────────
echo.
echo  [SETUP] Installing Python ML dependencies...
python -m pip install -r ml/requirements.txt --prefer-binary --quiet
if %errorlevel% neq 0 ( echo [ERROR] Python pip install failed. & pause & exit /b 1 )
echo  [OK] Python packages installed.

:: ── Setup .env ────────────────────────────────────────────────
echo.
if not exist "backend\.env" (
    copy backend\.env.example backend\.env >nul
    echo  [NOTICE] Created backend\.env — EDIT your MySQL credentials before starting!
    echo.
    echo   Open: backend\.env
    echo   Set:  DB_PASSWORD=your_actual_password
    echo.
) else (
    echo  [OK] backend\.env already exists.
)

:: ── Train ML Model ────────────────────────────────────────────
echo.
if not exist "ml\model.joblib" (
    echo  [ML] Training model ^(1-3 minutes^)...
    python ml/train.py
    if %errorlevel% neq 0 ( echo [ERROR] Training failed. & pause & exit /b 1 )
    echo  [OK] Model trained.
) else (
    echo  [OK] ML model already trained.
)

echo.
echo  ═══════════════════════════════════════════════════
echo    Setup Complete!
echo    1. Edit backend\.env with your MySQL credentials
echo    2. Make sure MySQL is running
echo    3. Run: scripts\start.bat
echo  ═══════════════════════════════════════════════════
echo.
pause
