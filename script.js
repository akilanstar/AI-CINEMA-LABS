// DOM Elements
const video = document.getElementById('mainVideo');
const videoIframe = document.getElementById('mainVideoIframe');
const iframeShield = document.getElementById('iframeShieldTopRight');
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
const cinemaFilterBtn = document.getElementById('cinemaFilterBtn');
const filmGrain = document.getElementById('filmGrain');
const playerControls = document.getElementById('playerControls');
const playerDescText = document.getElementById('playerDescText');

// State Variables
let isMuted = false;
let lastVolume = 1;
let controlsTimeout;
let isMobile = false;

// 1. Detect Device to activate Hybrid mode
function detectDevice() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);
    
    if (isMobile) {
        console.log("Mobile device detected - Activating Google Drive Native Player");
        // Hide HTML5 elements
        if (video) video.style.display = 'none';
        if (videoOverlay) videoOverlay.style.display = 'none';
        if (centerPlayBtn) centerPlayBtn.style.display = 'none';
        if (playerControls) playerControls.style.display = 'none';
        if (filmGrain) filmGrain.style.display = 'none';
        
        // Show Iframe elements
        if (videoIframe) {
            videoIframe.style.display = 'block';
            videoIframe.src = `https://drive.google.com/file/d/10xtVZftIS17rxdaWraNpXE2gtpEW08vc/preview`;
        }
        if (iframeShield) iframeShield.style.display = 'block';
        if (playerDescText) playerDescText.textContent = "Streaming securely via Google Mobile player.";
    } else {
        console.log("Desktop device detected - Activating Custom HTML5 Player");
        // Hide Iframe elements
        if (videoIframe) videoIframe.style.display = 'none';
        if (iframeShield) iframeShield.style.display = 'none';
        
        // Show HTML5 elements
        if (video) video.style.display = 'block';
        if (videoOverlay) videoOverlay.style.display = 'block';
        if (centerPlayBtn) centerPlayBtn.style.display = 'flex';
        if (playerControls) playerControls.style.display = 'block';
        if (filmGrain) filmGrain.style.display = 'block';
        if (playerDescText) playerDescText.textContent = "Securely streamed in 4K with Lens filter enabled.";
    }
}

// 2. Play / Pause Logic (Desktop only)
function togglePlay() {
    if (isMobile) return;
    if (video.paused) {
        video.play().then(() => {
            updatePlayIcons(true);
        }).catch(err => {
            console.error("Play error:", err);
            updatePlayIcons(false);
        });
    } else {
        video.pause();
        updatePlayIcons(false);
    }
}

function updatePlayIcons(isPlaying) {
    if (isPlaying) {
        playPauseBtn.innerHTML = '<i data-lucide="pause"></i>';
        centerPlayBtn.innerHTML = '<i data-lucide="pause"></i>';
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

function stopVideo() {
    if (isMobile) return;
    video.pause();
    video.currentTime = 0;
    updatePlayIcons(false);
}

// 3. Timeline Progress tracking (Desktop only)
function updateProgress() {
    if (isMobile || isNaN(video.duration)) return;
    const progressPercent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeDisplay.textContent = formatTime(video.currentTime);
}

function setProgress(e) {
    if (isMobile) return;
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

// 4. Volume Logic (Desktop only)
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

// 5. Playback Speed Selector (Desktop only)
function toggleSpeedMenu(e) {
    e.stopPropagation();
    speedOptions.classList.toggle('show');
}

function changeSpeed(e) {
    const speed = parseFloat(e.target.dataset.speed);
    if (isNaN(speed)) return;
    
    video.playbackRate = speed;
    speedBtn.textContent = `${speed.toFixed(1)}x`;
    
    document.querySelectorAll('.speed-opt').forEach(opt => {
        opt.classList.remove('active');
    });
    e.target.classList.add('active');
    speedOptions.classList.remove('show');
}

document.addEventListener('click', () => {
    speedOptions.classList.remove('show');
});

// 6. Fullscreen Handler
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

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenBtn.innerHTML = '<i data-lucide="maximize"></i>';
        lucide.createIcons();
    }
});

// 7. Cinema 4K Lens Filter Switcher
if (cinemaFilterBtn) {
    cinemaFilterBtn.addEventListener('click', () => {
        cinemaFilterBtn.classList.toggle('active');
        if (cinemaFilterBtn.classList.contains('active')) {
            video.classList.add('cinema-4k-filter');
            filmGrain.style.opacity = '0.04';
            console.log("Cinema 4K Filter enabled");
        } else {
            video.classList.remove('cinema-4k-filter');
            filmGrain.style.opacity = '0';
            console.log("Cinema 4K Filter disabled");
        }
    });
}

// 8. Playlist Navigation (Hybrid implementation)
function loadVideo(fileId, videoTitle) {
    currentVideoTitle.textContent = videoTitle;
    
    if (isMobile) {
        // Mobile iframe preview mode
        const newSrc = `https://drive.google.com/file/d/${fileId}/preview`;
        videoIframe.src = newSrc;
    } else {
        // Desktop HTML5 mode
        video.pause();
        const newSrc = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
        video.src = newSrc;
        video.load();
        
        updatePlayIcons(false);
        video.play()
            .then(() => {
                updatePlayIcons(true);
            })
            .catch(err => {
                console.log("Auto-play blocked or failed:", err);
                updatePlayIcons(false);
            });
    }
}

// 9. Anti-Download Security protections
function showSecurityWarning() {
    const lockMsg = document.querySelector('.overlay-lock-msg');
    if (lockMsg) {
        lockMsg.classList.add('show');
        setTimeout(() => {
            lockMsg.classList.remove('show');
        }, 2500);
    }
}

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showSecurityWarning();
    return false;
});

// Block hotkeys for viewing source, inspect element, saving
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        showSecurityWarning();
        return false;
    }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.keyCode === 73 || e.keyCode === 74)) {
        e.preventDefault();
        showSecurityWarning();
        return false;
    }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        showSecurityWarning();
        return false;
    }
    if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
        e.preventDefault();
        showSecurityWarning();
        return false;
    }
    
    // Player controls keyboard shortcuts (Desktop only)
    if (!isMobile && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        }
        if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            toggleFullscreen();
        }
        if (e.key === 'm' || e.key === 'M') {
            e.preventDefault();
            toggleMute();
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            video.currentTime = Math.max(0, video.currentTime - 5);
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
        }
    }
});

// 10. Auto Hide Media Controls on Idle (Desktop only)
function resetControlsTimer() {
    if (isMobile) return;
    playerContainer.classList.remove('controls-hidden');
    clearTimeout(controlsTimeout);
    
    if (!video.paused) {
        controlsTimeout = setTimeout(() => {
            playerContainer.classList.add('controls-hidden');
        }, 3000);
    }
}

// Event Listeners
if (video) {
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('click', togglePlay);
    video.addEventListener('loadedmetadata', () => {
        durationDisplay.textContent = formatTime(video.duration);
    });
}

if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
if (centerPlayBtn) centerPlayBtn.addEventListener('click', togglePlay);
if (stopBtn) stopBtn.addEventListener('click', stopVideo);
if (progressContainer) progressContainer.addEventListener('click', setProgress);
if (videoOverlay) videoOverlay.addEventListener('click', togglePlay);
if (muteBtn) muteBtn.addEventListener('click', toggleMute);
if (volumeSlider) volumeSlider.addEventListener('input', handleVolumeChange);
if (speedBtn) speedBtn.addEventListener('click', toggleSpeedMenu);
document.querySelectorAll('.speed-opt').forEach(opt => {
    opt.addEventListener('click', changeSpeed);
});
if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

if (playerContainer) {
    playerContainer.addEventListener('mousemove', resetControlsTimer);
    playerContainer.addEventListener('mouseleave', () => {
        if (!video.paused) {
            playerContainer.classList.add('controls-hidden');
        }
    });
}

// Playlist interaction
playlistItems.forEach(item => {
    item.addEventListener('click', () => {
        playlistItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const fileId = item.dataset.id;
        const name = item.dataset.name;
        loadVideo(fileId, name);
    });
});

// Device detection & Initialization
window.addEventListener('DOMContentLoaded', detectDevice);
window.addEventListener('resize', detectDevice);

// Init duration text on page load if cached
if (video && video.readyState >= 1) {
    durationDisplay.textContent = formatTime(video.duration);
}

// Trigger build - 2026-05-27
