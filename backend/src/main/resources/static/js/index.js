const musicPlayer = document.querySelector('audio');
const playButton = document.querySelector('.play-button');
const playIcon = playButton.querySelector('#play-pause-icon');
const volumeSlider = document.querySelector('#volume-slider');
const volumeIcon = document.querySelector('#volume-icon');
const progressSlider = document.querySelector('#progress-slider');
const currentTimeLabel = document.querySelector('#current-time');
const totalDurationLabel = document.querySelector('#total-duration');
const coverArt = document.querySelector('#cover-art');

let lastSongId = null;
let songs = [];
let songsLoaded = false;
let shuffleEnabled = false;
let repeatEnabled = false;

// Slider background update function for Chrome
function updateSliderBackground(slider) {
    const value = slider.value;
    const min = slider.min || 0;
    const max = slider.max || 100;
    const percentage = ((value - min) / (max - min)) * 100;

    slider.style.background = `linear-gradient(to right, hotpink 0%, hotpink ${percentage}%, white ${percentage}%, white 100%)`;
}

async function loadSongs() {
    const res = await fetch('/api/player/songs');
    songs = await res.json();
    songsLoaded = true;
    console.log("Songs loaded:", songs);
}

function resolveSongById(id) {
    return songs.find(s => s.id === id);
}

function playPauseListener() {
    playButton.addEventListener('click', async () => {
        if (musicPlayer.paused) {
            await sendCommand("PLAY");
        } else {
            await sendCommand("PAUSE");
        }
    });
}

function volumeControl() {
    volumeSlider.addEventListener('input', () => {
        musicPlayer.volume = volumeSlider.value / 100;
        sendCommand(`VOLUME:${volumeSlider.value}`);
        updateSliderBackground(volumeSlider);
    });

    volumeIcon.addEventListener('click', () => {
        sendCommand("MUTE");
    });
}

function unlockOverlay() {
    const unlockOverlay = document.querySelector('#audio-unlock');
    if (!unlockOverlay) return; // Skip if overlay is commented out

    unlockOverlay.addEventListener('click', () => {
        musicPlayer.muted = true;
        musicPlayer.play()
            .then(() => {
                musicPlayer.pause();
                musicPlayer.muted = false;
                unlockOverlay.classList.add('hidden');
            });
    });
}

async function sendCommand(cmd) {
    try {
        await fetch('/api/player/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: cmd })
        });
        console.log("Command sent:", cmd);
    } catch (error) {
        console.error("Failed to send command:", error);
    }
}

function updateStateFromServer(data) {
    document.querySelector('#song-title').innerText = data.title;
    document.querySelector('#song-artist').innerText = data.artist;

    const song = resolveSongById(data.currentSongId);
    if (!song) return;

    // Detect when current song changes
    if (song.id !== lastSongId) {
        musicPlayer.src = song.srcUrl;
        coverArt.src = song.coverUrl;
        lastSongId = song.id;
        safePlay();
    }

    if (data.isPlaying && musicPlayer.paused) {
        safePlay();
    } else if (!data.isPlaying && !musicPlayer.paused) {
        musicPlayer.pause();
    }

    musicPlayer.volume = data.volume / 100;
    musicPlayer.muted = data.isMuted;
    volumeSlider.value = data.volume;
    updateSliderBackground(volumeSlider);

    if (data.isMuted || data.volume === 0) {
        volumeIcon.classList.replace('fa-volume-up', 'fa-volume-xmark');
    } else {
        volumeIcon.classList.replace('fa-volume-xmark', 'fa-volume-up');
    }

    if (data.isMuted) {
        playIcon.classList.replace('fa-pause', 'fa-play');
    } else if (data.isPlaying) {
        playIcon.classList.replace('fa-play', 'fa-pause');
    } else {
        playIcon.classList.replace('fa-pause', 'fa-play');
    }
}

function progressBar() {
    musicPlayer.addEventListener('timeupdate', () => {
        progressSlider.value = musicPlayer.currentTime;
        currentTimeLabel.innerText = formatTime(musicPlayer.currentTime);
        updateSliderBackground(progressSlider);
    });

    musicPlayer.addEventListener('loadedmetadata', () => {
        progressSlider.max = musicPlayer.duration;
        totalDurationLabel.innerText = formatTime(musicPlayer.duration);
        updateSliderBackground(progressSlider);

        musicPlayer.addEventListener('ended', () => {
            sendCommand("NEXT"); // Always autoplay next song
        });
    });

    progressSlider.addEventListener('input', () => {
        currentTimeLabel.innerText = formatTime(progressSlider.value);
        updateSliderBackground(progressSlider);
    });

    progressSlider.addEventListener('change', () => {
        const wasPlaying = !musicPlayer.paused;
        musicPlayer.currentTime = progressSlider.value;

        if (wasPlaying) {
            safePlay();
        }
    });
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

function safePlay() {
    musicPlayer.play().catch(() => {
        console.warn("Autoplay blocked — waiting for user interaction.");
    });
}

function connectSSE() {
    const eventSource = new EventSource("/api/player/stream");

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateStateFromServer(data);

        shuffleEnabled = data.shuffle;
        repeatEnabled = data.repeat;
        updateShuffleUI();
        updateRepeatUI();

        // Handle seek forward from esp32 controller
        if (data.lastCommand === "SEEK_FORWARD") {
            musicPlayer.currentTime = Math.min(
                musicPlayer.currentTime + 10,
                musicPlayer.duration
            );
        }
    };

    eventSource.onerror = () => {
        console.warn("SSE connection lost — reconnecting...");
        setTimeout(connectSSE, 2000);
    };
}


function updateShuffleUI() {
    const btn = document.getElementById('shuffle-btn');
    btn.style.opacity = shuffleEnabled ? "1" : "0.3";
}

function updateRepeatUI() {
    const btn = document.getElementById('repeat-btn');
    btn.style.opacity = repeatEnabled ? "1" : "0.3";
}

(async function init() {
    await loadSongs();
    connectSSE();
    unlockOverlay();
    playPauseListener();
    volumeControl();
    progressBar();

    updateSliderBackground(progressSlider);
    updateSliderBackground(volumeSlider);

    document.getElementById('shuffle-btn').addEventListener('click', async () => {
        await sendCommand("SHUFFLE");
    });

    document.getElementById('repeat-btn').addEventListener('click', async () => {
        await sendCommand("REPEAT");
    });

    // Add event listeners for prev/next buttons
    document.querySelectorAll('.prev-next-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-backward')) {
                await sendCommand('PREV');
            } else if (icon.classList.contains('fa-forward')) {
                await sendCommand('NEXT');
            }
        });
    });
})();