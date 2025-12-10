# Script to update React frontend files

Write-Host "Updating React frontend files..." -ForegroundColor Green

$frontendPath = "C:\Users\keffi\Documents\Java\wireless-music-player-frontend"

# Update App.js
$appJsContent = @"
import React from 'react';
import MusicPlayer from './components/MusicPlayer';
import './App.css';

function App() {
  return (
    <div className="App">
      <MusicPlayer />
    </div>
  );
}

export default App;
"@

Set-Content -Path "$frontendPath\src\App.js" -Value $appJsContent
Write-Host "✓ Updated App.js" -ForegroundColor Cyan

# Update App.css
$appCssContent = @"
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.App {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
"@

Set-Content -Path "$frontendPath\src\App.css" -Value $appCssContent
Write-Host "✓ Updated App.css" -ForegroundColor Cyan

# Update index.css
$indexCssContent = @"
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
"@

Set-Content -Path "$frontendPath\src\index.css" -Value $indexCssContent
Write-Host "✓ Updated index.css" -ForegroundColor Cyan

# Update index.js
$indexJsContent = @"
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@

Set-Content -Path "$frontendPath\src\index.js" -Value $indexJsContent
Write-Host "✓ Updated index.js" -ForegroundColor Cyan

# Update public/index.html
$indexHtmlContent = @"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Wireless Music Player"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <title>Music Player</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
"@

Set-Content -Path "$frontendPath\public\index.html" -Value $indexHtmlContent
Write-Host "✓ Updated public/index.html" -ForegroundColor Cyan

Write-Host ""
Write-Host "All files updated successfully!" -ForegroundColor Green
Write-Host "Now restart your React dev server:" -ForegroundColor Yellow
Write-Host "  cd C:\Users\keffi\Documents\Java\wireless-music-player-frontend" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
