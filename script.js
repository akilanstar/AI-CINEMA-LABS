// DOM Elements
const video = document.getElementById('mainVideo');
const playerContainer = document.getElementById('videoPlayerContainer');
const playPauseBtn = document.getElementById('playPauseBtn');
const centerPlayBtn = document.getElementById('centerPlayBtn');
const stopBtn = document.getElementById('stopBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('totalDuration');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const speedBtn = document.getElementById('speedBtn');
const speedOptions = document.getElementById('speedOptions');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const videoOverlay = document.getElementById('videoOverlay');
const currentVideoTitle = document.getElementById('currentVideoTitle');
const playlistItems = document.querySelectorAll('.playlist-item');

// State Variables
let isMuted = false;
let lastVolume = 1;
let controlsTimeout;

// 1. Play / Pause Logic
function togglePlay() {
    if (video.paused) {
        video.play();
        updatePlayIcons(true);
    } else {
        video.pause();
        updatePlayIcons(false);
    }
}

function updatePlayIcons(isPlaying) {
    if (isPlaying) {
        playPauseBtn.innerHTML = '<i data-lucide="pause"></i>';
        centerPlayBtn.innerHTML = '<i data-lucide="pause"></i>';
        // Fade out center play button after play
        centerPlayBtn.style.opacity = '0';
        centerPlayBtn.style.pointerEvents = 'none';
    } else {
        playPauseBtn.innerHTML = '<i data-lucide="play"></i>';
        centerPlayBtn.innerHTML = '<i data-lucide="play"></i>';
        centerPlayBtn.style.opacity = '1';
        centerPlayBtn.style.pointerEvents = 'auto';
    }
    lucide.createIcons();
}

// Stop Logic
function stopVideo() {
    video.pause();
    video.currentTime = 0;
    updatePlayIcons(false);
}

// 2. Timeline Progress tracking
function updateProgress() {
    if (isNaN(video.duration)) return;
    const progressPercent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeDisplay.textContent = formatTime(video.currentTime);
}

function setProgress(e) {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = video.duration;
    if (isNaN(duration)) return;
    video.currentTime = (clickX / width) * duration;
}

function formatTime(timeInSeconds) {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 3. Volume Logic
function handleVolumeChange() {
    video.volume = volumeSlider.value;
    isMuted = video.volume === 0;
    updateVolumeIcon();
}

function toggleMute() {
    if (isMuted) {
        video.volume = lastVolume;
        volumeSlider.value = lastVolume;
        isMuted = false;
    } else {
        lastVolume = video.volume;
        video.volume = 0;
        volumeSlider.value = 0;
        isMuted = true;
    }
    updateVolumeIcon();
}

function updateVolumeIcon() {
    if (isMuted || video.volume === 0) {
        muteBtn.innerHTML = '<i data-lucide="volume-x"></i>';
    } else if (video.volume < 0.5) {
        muteBtn.innerHTML = '<i data-lucide="volume-1"></i>';
    } else {
        muteBtn.innerHTML = '<i data-lucide="volume-2"></i>';
    }
    lucide.createIcons();
}

// 4. Playback Speed Selector
function toggleSpeedMenu(e) {
    e.stopPropagation();
    speedOptions.classList.toggle('show');
}

function changeSpeed(e) {
    const speed = parseFloat(e.target.dataset.speed);
    if (isNaN(speed)) return;
    
    video.playbackRate = speed;
    speedBtn.textContent = `${speed.toFixed(1)}x`;
    
    // Update active UI class
    document.querySelectorAll('.speed-opt').forEach(opt => {
        opt.classList.remove('active');
    });
    e.target.classList.add('active');
    speedOptions.classList.remove('show');
}

// Close speed menu when clicking outside
document.addEventListener('click', () => {
    speedOptions.classList.remove('show');
});

// 5. Fullscreen Handler
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        playerContainer.requestFullscreen()
            .then(() => {
                fullscreenBtn.innerHTML = '<i data-lucide="minimize"></i>';
                lucide.createIcons();
            })
            .catch(err => {
                console.error("Fullscreen error:", err);
            });
    } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = '<i data-lucide="maximize"></i>';
        lucide.createIcons();
    }
}

// Ensure proper icon is updated if exited using 'ESC' key
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenBtn.innerHTML = '<i data-lucide="maximize"></i>';
        lucide.createIcons();
    }
});

// 6. Playlist Navigation
function loadVideo(fileId, videoTitle) {
    // Show loading state
    video.pause();
    currentVideoTitle.textContent = videoTitle;
    
    // Google Drive direct download bypass URL format
    const newSrc = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
    video.src = newSrc;
    video.load();

    
    // Auto play when loaded
    video.play()
        .then(() => {
            updatePlayIcons(true);
        })
        .catch(err => {
            console.log("Auto-play blocked or failed:", err);
            updatePlayIcons(false);
        });
}

// 7. Anti-Download Security protections
function showSecurityWarning() {
    const lockMsg = document.querySelector('.overlay-lock-msg');
    lockMsg.classList.add('show');
    
    // Hide warning after 2.5 seconds
    setTimeout(() => {
        lockMsg.classList.remove('show');
    }, 2500);
}

// Right Click block
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showSecurityWarning();
    return false;
});

// Block dragging on video overlay and page elements
videoOverlay.addEventListener('dragstart', (e) => e.preventDefault());
video.addEventListener('dragstart', (e) => e.preventDefault());

// Block hotkeys for viewing source, inspect element, saving
document.addEventListener('keydown', (e) => {
    // 1. Block F12 (Developer tools)
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        showSecurityWarning();
        return false;
    }
    
    // 2. Block Ctrl+Shift+I, Ctrl+Shift+J (Inspect tools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.keyCode === 73 || e.keyCode === 74)) {
        e.preventDefault();
        showSecurityWarning();
        return false;
    }
    
    // 3. Block Ctrl+U (View Page Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        showSecurityWarning();
        return false;
    }
    
    // 4. Block Ctrl+S (Save page)
    if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
        e.preventDefault();
        showSecurityWarning();
        return false;
    }
    
    // Player controls keyboard shortcuts
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        // Spacebar -> Play / Pause
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        }
        // F key -> Fullscreen
        if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            toggleFullscreen();
        }
        // M key -> Mute
        if (e.key === 'm' || e.key === 'M') {
            e.preventDefault();
            toggleMute();
        }
        // Left arrow -> Rewind 5s
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            video.currentTime = Math.max(0, video.currentTime - 5);
        }
        // Right arrow -> Forward 5s
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
        }
    }
});

// 8. Auto Hide Media Controls on Idle
function resetControlsTimer() {
    playerContainer.classList.remove('controls-hidden');
    clearTimeout(controlsTimeout);
    
    if (!video.paused) {
        controlsTimeout = setTimeout(() => {
            playerContainer.classList.add('controls-hidden');
        }, 3000); // Hide after 3 seconds of inactivity
    }
}

// Event Listeners
// Video events
video.addEventListener('timeupdate', updateProgress);
video.addEventListener('click', togglePlay);
video.addEventListener('loadedmetadata', () => {
    durationDisplay.textContent = formatTime(video.duration);
});

// Play/Pause button
playPauseBtn.addEventListener('click', togglePlay);
centerPlayBtn.addEventListener('click', togglePlay);
stopBtn.addEventListener('click', stopVideo);

// Timeline seek
progressContainer.addEventListener('click', setProgress);

// Overlay click plays/pauses
videoOverlay.addEventListener('click', togglePlay);

// Volume controls
muteBtn.addEventListener('click', toggleMute);
volumeSlider.addEventListener('input', handleVolumeChange);

// Speed controls
speedBtn.addEventListener('click', toggleSpeedMenu);
document.querySelectorAll('.speed-opt').forEach(opt => {
    opt.addEventListener('click', changeSpeed);
});

// Fullscreen
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Idle hide controls events
playerContainer.addEventListener('mousemove', resetControlsTimer);
playerContainer.addEventListener('mouseleave', () => {
    if (!video.paused) {
        playerContainer.classList.add('controls-hidden');
    }
});
video.addEventListener('play', resetControlsTimer);
video.addEventListener('pause', () => {
    playerContainer.classList.remove('controls-hidden');
    clearTimeout(controlsTimeout);
});

// Playlist interaction
playlistItems.forEach(item => {
    item.addEventListener('click', () => {
        // Toggle active styling
        playlistItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Load target video
        const fileId = item.dataset.id;
        const name = item.dataset.name;
        loadVideo(fileId, name);
    });
});

// Init duration text on page load if cached
if (video.readyState >= 1) {
    durationDisplay.textContent = formatTime(video.duration);
}
