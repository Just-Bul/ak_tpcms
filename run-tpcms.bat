@echo off
setlocal

set "ROOT=%~dp0"

if not exist "%ROOT%backend\package.json" (
    echo Backend package.json was not found in "%ROOT%backend".
    pause
    exit /b 1
)

if not exist "%ROOT%frontend\package.json" (
    echo Frontend package.json was not found in "%ROOT%frontend".
    pause
    exit /b 1
)

start "TPCMS Backend" /D "%ROOT%backend" cmd /k "npm run dev"
start "TPCMS Frontend" /D "%ROOT%frontend" cmd /k "npm run dev"

endlocal
