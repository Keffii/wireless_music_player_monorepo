# Wireless Music Player

A full-stack music player application with IoT integration. Built with Spring Boot backend and React frontend.

## Project Structure

```
wireless_music_player_monorepo/
├── backend/           # Spring Boot application (Java 21, Maven)
├── frontend/          # React application (React 18)
└── README.md
```

## Features

- 🎵 Music playback with play/pause controls
- 🎨 Album cover art display
- 🔊 Volume control
- 📡 Real-time state synchronization via Server-Sent Events (SSE)
- 🔌 Bluetooth listener integration for IoT commands

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 21
- **Build Tool**: Maven
- **Database**: MySQL 8.0
- **Server**: Tomcat 10.1.46

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite
- **Styling**: CSS3

## Getting Started

### Prerequisites

- Java 21 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6+ (or use included Maven wrapper)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure database connection in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/wireless_music_player_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. Run the backend:
   ```bash
   ./mvnw spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`

## Quick Start Script

For convenience, you can create a startup script to run both services:

**Windows (PowerShell):**
```powershell
# start-all.ps1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; ./mvnw spring-boot:run"
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"
```

## API Endpoints

- **GET** `/api/player/songs` - Get all songs
- **POST** `/api/player/command` - Send player commands (play, pause, next, prev)
- **GET** `/api/player/stream` - SSE endpoint for real-time state updates

## Database Schema

### songs table
- `id` (INT, PRIMARY KEY)
- `artist` (VARCHAR)
- `title` (VARCHAR)
- `src_url` (VARCHAR) - Path to audio file
- `cover_url` (VARCHAR) - Path to cover image

## Development

### Backend Development
- Spring Boot DevTools enabled for hot reload
- Default port: 8080
- CORS configured for localhost:3000

### Frontend Development
- Vite dev server with hot module replacement
- Default port: 3000
- Proxies API requests to localhost:8080

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure:
- Backend is running on port 8080
- Frontend is running on port 3000
- `CorsConfig.java` allows the frontend origin

### Database Connection
Verify MySQL is running and credentials in `application.properties` are correct.

### Port Conflicts
If ports 8080 or 3000 are in use, you can change them in:
- Backend: `application.properties` → `server.port`
- Frontend: Vite config or environment variables

## License

See LICENSE file for details.

## Migration Notes

This project was converted from a vanilla JavaScript frontend to React. See `REACT_CONVERSION_SUMMARY.md` and `MIGRATION_GUIDE.md` for details.
