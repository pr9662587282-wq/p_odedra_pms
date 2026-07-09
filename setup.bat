@echo off
title MERN Project Setup
color 0A

echo.
echo ========================================
echo   MERN Employee Management - Setup
echo ========================================
echo.

:: ── Step 1: Root dependencies (Husky, lint-staged, commitlint)
echo [1/4] Installing root tools (Husky, Commitlint, lint-staged)...
call npm install
if %errorlevel% neq 0 ( echo ERROR: Root install failed & pause & exit /b 1 )
echo       Done.
echo.

:: ── Step 2: Backend dependencies
echo [2/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 ( echo ERROR: Backend install failed & pause & exit /b 1 )
cd ..
echo       Done.
echo.

:: ── Step 3: Frontend dependencies
echo [3/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 ( echo ERROR: Frontend install failed & pause & exit /b 1 )
cd ..
echo       Done.
echo.

:: ── Step 4: Init Husky git hooks
echo [4/4] Setting up Husky git hooks...
call npx husky init >nul 2>&1
echo       Done.
echo.

:: ── Copy .env files if not already present
if not exist "backend\.env" (
  copy "backend\.env.example" "backend\.env" >nul
  echo [ENV] Created backend\.env from .env.example
)
if not exist "frontend\.env" (
  copy "frontend\.env.example" "frontend\.env" >nul
  echo [ENV] Created frontend\.env from .env.example
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo   To start the project run:
echo     start.bat
echo.
echo   Or manually:
echo     Backend  ^>  cd backend   ^&^& npm run dev
echo     Frontend ^>  cd frontend  ^&^& npm run dev
echo.
pause
