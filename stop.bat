@echo off
title Stopping MERN Servers
color 0C

echo.
echo Stopping servers on ports 5000 and 5173...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000 "') do (
  taskkill /PID %%a /F >nul 2>&1
  echo Stopped process on port 5000
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do (
  taskkill /PID %%a /F >nul 2>&1
  echo Stopped process on port 5173
)

echo.
echo All servers stopped.
timeout /t 2 /nobreak >nul
exit
