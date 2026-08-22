@echo off
title House Price Prediction — Server
color 0A

echo.
echo  ═══════════════════════════════════════════════════
echo    Starting House Price Prediction Server...
echo    URL: http://127.0.0.1:8000
echo  ═══════════════════════════════════════════════════
echo.

:: Anchored to this script's own folder, so the path holds no matter
:: which directory it is launched from.
cd /d "%~dp0.."
cd backend
node server.js

pause
