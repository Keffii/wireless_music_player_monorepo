# Quick Start Script for React + Spring Boot Setup

Write-Host "Starting Wireless Music Player..." -ForegroundColor Green
Write-Host ""

# Check if backend is already running
$backendRunning = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*java*" }

if (-not $backendRunning) {
    Write-Host "Starting Spring Boot Backend..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\keffi\Documents\Java\wireless_music_player'; .\mvnw.cmd spring-boot:run"
    Write-Host "Backend starting on http://localhost:8080" -ForegroundColor Cyan
    Start-Sleep -Seconds 5
} else {
    Write-Host "Backend already running" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting React Frontend..." -ForegroundColor Yellow

# Check if node_modules exists
$nodeModulesPath = "C:\Users\keffi\Documents\Java\wireless-music-player-frontend\node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "Installing dependencies (first time only)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\keffi\Documents\Java\wireless-music-player-frontend'; npm install; npm start"
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\keffi\Documents\Java\wireless-music-player-frontend'; npm start"
}

Write-Host "Frontend starting on http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "Open your browser to: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
