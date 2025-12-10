# Migration Guide: From Thymeleaf to React

## Overview

Your project has been converted from a monolithic Spring Boot + Thymeleaf application to a modern **separate frontend/backend architecture**:

- **Backend:** Spring Boot REST API (Port 8080)
- **Frontend:** React SPA (Port 3000 for development)

## What Changed

### Backend Changes (Spring Boot)

1. **Added CORS Configuration** (`CorsConfig.java`)
   - Allows React app on `localhost:3000` to connect to backend
   - Configured for all HTTP methods

2. **WebController is now optional**
   - Previously served Thymeleaf templates
   - Can be removed if you only use React
   - Keep it if you want to serve React build from Spring Boot

3. **API Controllers remain the same**
   - `PlayerController.java` - Handles player commands and SSE
   - `SongController.java` - Handles song data

### Frontend Changes (React)

**New React Project Location:**
```
C:\Users\keffi\Documents\Java\wireless-music-player-frontend\
```

**Key Files Created:**
- `src/components/MusicPlayer.jsx` - Main music player component (converted from index.js)
- `src/components/MusicPlayer.css` - Styles (converted from style.css)
- `src/App.js` - Root component
- `public/index.html` - HTML entry point

**JavaScript to React Conversion:**

| Old (Vanilla JS) | New (React) |
|------------------|-------------|
| `document.querySelector()` | `useRef()` hook |
| Event listeners | React event handlers (`onClick`, `onChange`) |
| Direct DOM manipulation | State management (`useState`) |
| Manual updates | React re-renders automatically |
| `let` variables | `useState` for reactive state |

## How to Run

### Step 1: Start the Backend

```powershell
cd C:\Users\keffi\Documents\Java\wireless_music_player
./mvnw spring-boot:run
```

Backend runs on: `http://localhost:8080`

### Step 2: Start the React Frontend

Open a new terminal:

```powershell
cd C:\Users\keffi\Documents\Java\wireless-music-player-frontend
npm install    # First time only
npm start
```

Frontend runs on: `http://localhost:3000`

### Step 3: Access the Application

Open your browser and go to: `http://localhost:3000`

## Architecture Diagram

```
┌─────────────────────┐
│   React Frontend    │
│   (Port 3000)       │
│                     │
│  - MusicPlayer.jsx  │
│  - State Management │
│  - UI Components    │
└──────────┬──────────┘
           │
           │ HTTP/SSE
           │
┌──────────▼──────────┐
│  Spring Boot API    │
│   (Port 8080)       │
│                     │
│  - REST Controllers │
│  - PlayerService    │
│  - Database Access  │
│  - Bluetooth/Serial │
└─────────────────────┘
```

## Key Differences

### 1. State Management

**Old (Vanilla JS):**
```javascript
let isPlaying = false;
let volume = 50;

function updateState() {
  isPlaying = true;
  document.querySelector('.play-button').innerText = 'Pause';
}
```

**New (React):**
```javascript
const [isPlaying, setIsPlaying] = useState(false);
const [volume, setVolume] = useState(50);

// React automatically re-renders when state changes
setIsPlaying(true);
```

### 2. DOM References

**Old (Vanilla JS):**
```javascript
const playButton = document.querySelector('.play-button');
playButton.addEventListener('click', handlePlay);
```

**New (React):**
```javascript
const audioRef = useRef(null);
<audio ref={audioRef} />

// Access directly
audioRef.current.play();
```

### 3. Event Handling

**Old (Vanilla JS):**
```javascript
button.addEventListener('click', () => {
  sendCommand('PLAY');
});
```

**New (React):**
```javascript
<button onClick={() => sendCommand('PLAY')}>
  Play
</button>
```

## Benefits of React Architecture

1. **Separation of Concerns**
   - Frontend and backend are independent
   - Can be deployed separately
   - Easier to scale

2. **Modern Development**
   - Hot reloading in development
   - Component-based architecture
   - Better state management

3. **Better Performance**
   - Virtual DOM for efficient updates
   - Optimized re-rendering
   - Code splitting

4. **Developer Experience**
   - Component reusability
   - Easier testing
   - Better debugging tools

## Production Deployment

### Option 1: Serve React from Spring Boot

1. Build React:
   ```powershell
   cd C:\Users\keffi\Documents\Java\wireless-music-player-frontend
   npm run build
   ```

2. Copy `build/` contents to `wireless_music_player/src/main/resources/static/`

3. Update `WebController.java`:
   ```java
   @GetMapping("/")
   public String home() {
       return "forward:/index.html";
   }
   ```

4. Deploy Spring Boot as usual. React will be served at `http://localhost:8080`

### Option 2: Separate Deployment

- Deploy React to: Netlify, Vercel, AWS S3, etc.
- Deploy Spring Boot to: Heroku, AWS, Azure, etc.
- Update CORS in `CorsConfig.java` with production URL

## Troubleshooting

### Issue: CORS Errors

**Solution:** Check `CorsConfig.java` includes the React app's origin:
```java
.allowedOrigins("http://localhost:3000")
```

### Issue: SSE Not Connecting

**Solution:** Verify:
1. Backend is running on port 8080
2. React is using correct API base URL
3. No firewall blocking connections

### Issue: Audio Won't Play

**Solution:** Browsers require user interaction before playing audio. Make sure the user clicks a button first.

## Next Steps

1. **Remove Old Thymeleaf Files** (optional):
   - `src/main/resources/templates/index.html`
   - `src/main/resources/static/js/index.js`
   - `src/main/resources/static/css/style.css`

2. **Update Dependencies** (optional):
   - Remove Thymeleaf dependency from `pom.xml` if not needed

3. **Add Features:**
   - User authentication
   - Playlist management
   - Search functionality
   - Dark mode toggle

## File Comparison

### Before (Thymeleaf + Vanilla JS)
```
src/main/resources/
├── static/
│   ├── css/style.css
│   ├── js/index.js
│   ├── cover/
│   └── music/
└── templates/
    └── index.html
```

### After (React)
```
wireless-music-player-frontend/
├── public/
│   └── index.html
└── src/
    ├── components/
    │   ├── MusicPlayer.jsx
    │   └── MusicPlayer.css
    ├── App.js
    └── index.js
```

## Questions?

- React Documentation: https://react.dev
- Spring Boot CORS: https://spring.io/guides/gs/rest-service-cors/
- Server-Sent Events: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
