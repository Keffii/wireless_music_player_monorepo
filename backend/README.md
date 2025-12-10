# Wireless Music Player
Music Player Web UI Application controlled wirelessly by an ESP32 Bluetooth controller or using the UI.
![Preview](https://github.com/user-attachments/assets/f8b3d224-719f-4d9d-9542-2cfae5082ded)

Features include:
- Play/Pause
- Next/Previous Song
- Shuffle
- Repeat Song
- Trackbar
- Volume Control

## 1 - How to install
Prerequisites:
- Java JDK 21
- MySQL
- ESP32(Optional) [ESP32 Instructions and Information](https://github.com/Keffii/wireless_music_player/tree/feature/esp32-ble-communication)

Instructions:
- Step 1: Clone the Java project.
- Step 2: Create your SQL schema and configure database in [`src/main/resources/application.properties`](https://github.com/Keffii/wireless_music_player/blob/main/src/main/resources/application.properties)
 - Database tables will be automatically created by JPA/Hibernate.
- Step 3: Flash your ESP32 with the firmware in the [esp32 branch](https://github.com/Keffii/wireless_music_player/tree/esp32) and set the correct Bluetooth port in [`src/main/java/com/example/media_controller_iot/serial/BluetoothListener.java`](https://github.com/Keffii/wireless_music_player/blob/main/src/main/java/com/example/media_controller_iot/serial/BluetoothListener.java)
- Step 4: Run the main application class in your preferred Java IDE
## 2 - How to use
- Open the web UI: http://localhost:8080/
  - UI subscribes to SSE at `/api/player/stream` and updates player state in real time.

## 3 - Database Telemetry

The application uses Grafana to monitor music player activity and user interactions in real-time.

<img width="1901" height="615" alt="Grafana Dashboard" src="https://github.com/user-attachments/assets/b7b6482a-0efe-4f38-922f-e09584d43591" />

### Setting up Grafana (Optional)
- Install Grafana from: https://grafana.com/grafana/download
- Configure a MySQL data source pointing to your database
- Access Grafana at: http://localhost:3000

### Dashboard Metrics
The dashboard tracks player usage and provides the following insights:

- **Total Commands**: Aggregate count of all player commands executed (play, pause, next, prev, mute)
- **Last Command**: Most recent command issued to the music player
- **Volume Log Graph**: Historical volume level changes over time, tracking user volume adjustments
- **Most Played Songs**: Ranked list of songs by play count, showing user listening preferences

## 4 - SQL example for creating your SQL Schema
Example SQL with placeholders — replace with your preferred database name, user and password.
```sql
-- Replace placeholders with your database values
CREATE DATABASE <DB_NAME>;
CREATE USER '<DB_USER>'@'localhost' IDENTIFIED BY '<DB_PASSWORD>';
GRANT ALL PRIVILEGES ON <DB_NAME>.* TO '<DB_USER>'@'localhost';
FLUSH PRIVILEGES;
```

## 5 - Features To Implement

- [ ] **Spring Boot JWT Security** – Add authentication & authorization for API endpoints  
- [ ] **AWS Integration** – Deploy backend & database using AWS services  
- [ ] **Docker** – Containerize application for easier deployment  
- [ ] **Login Page** – Create user interface for authentication
