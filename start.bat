@echo off
title MERN Project - Starting Servers
color 0A

echo.
echo ========================================
echo   MERN Employee Management - Starting
echo ========================================
echo.

:: Kill anything already on port 5000 or 5173
echo Clearing ports 5000 and 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000 "') do (
  taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do (
  taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

:: Start Backend in new window
echo Starting Backend on http://localhost:5000 ...
start "Backend - Port 5000" cmd /k "cd /d %~dp0backend && npm run dev"

:: Wait 2 seconds then start Frontend
timeout /t 2 /nobreak >nul

:: Start Frontend in new window
echo Starting Frontend on http://localhost:5173 ...
start "Frontend - Port 5173" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait for Vite to boot then open browser
timeout /t 4 /nobreak >nul

echo.
echo ========================================
echo   Both servers started!
echo ========================================
echo.
echo   Frontend  ->  http://localhost:5173
echo   Backend   ->  http://localhost:5000
echo   API Test  ->  http://localhost:5000/health
echo.
echo Opening browser...
start http://localhost:5173

exit
