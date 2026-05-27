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
const playerModeBtn = document.getElementById('playerModeBtn');
const playerLoader = document.getElementById('playerLoader');
const playerTipText = document.getElementById('playerTipText');
const seekLeftFeedback = document.getElementById('seekLeftFeedback');
const seekRightFeedback = document.getElementById('seekRightFeedback');
const playerErrorOverlay = document.getElementById('playerErrorOverlay');
const errorFallbackBtn = document.getElementById('errorFallbackBtn');

// State Variables
let isMuted = false;
let lastVolume = 1;
let controlsTimeout;
let isMobile = false;
let isIframeMode = false; // False = Custom HTML5 Video, True = Google Drive Iframe
let currentFileId = "10xtVZftIS17rxdaWraNpXE2gtpEW08vc"; // Initial video ID
let currentVideoName = "01-I Adore You Official Song.mp4";
let lastTap = 0; // For double tap seek detection

// 1. Detect Device to adjust UI guides
function detectDevice() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);
    console.log("Device detection - isMobile:", isMobile);
    
    if (isMobile) {
        if (playerTipText) playerTipText.style.display = 'flex';
    } else {
        if (playerTipText) playerTipText.style.display = 'none';
    }
    
    // Synchronize UI layout
    updatePlayerModeUI();
}

// Update UI Layout based on Player Mode (HTML5 or Iframe)
function updatePlayerModeUI() {
    // Hide error overlay whenever we reset/update player mode
    if (playerErrorOverlay) {
        playerErrorOverlay.classList.remove('show');
    }

    if (isIframeMode) {
        console.log("Switching to Google Iframe Player (Data Saver Mode)");
        
        // Pause and hide HTML5 video
        if (video) {
            video.pause();
            video.style.display = 'none';
        }
        if (videoOverlay) videoOverlay.style.display = 'none';
        if (centerPlayBtn) centerPlayBtn.style.display = 'none';
        if (filmGrain) filmGrain.style.display = 'none';
        
        // Hide HTML5 specific controls
        if (progressContainer) progressContainer.style.display = 'none';
        if (playPauseBtn) playPauseBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'none';
        if (currentTimeDisplay) currentTimeDisplay.parentElement.style.display = 'none';
        if (speedBtn) speedBtn.style.display = 'none';
        if (cinemaFilterBtn) cinemaFilterBtn.style.display = 'none';
        
        // Show Google Iframe Player
        if (videoIframe) {
            videoIframe.style.display = 'block';
            const expectedSrc = `https://drive.google.com/file/d/${currentFileId}/preview`;
            if (videoIframe.src !== expectedSrc) {
                videoIframe.src = expectedSrc;
                showLoader(2000); // Visual cue while iframe loads
            }
        }
        if (iframeShield) iframeShield.style.display = 'block';
        if (playerDescText) playerDescText.textContent = "Data Saver Mode: Streaming optimized for mobile networks.";
        
        if (playerModeBtn) {
            playerModeBtn.innerHTML = '<i data-lucide="video" style="width: 14px; height: 14px;"></i> 4K PLAYER';
            playerModeBtn.style.borderColor = 'var(--accent-cyan)';
            playerModeBtn.style.color = 'var(--accent-cyan)';
        }
    } else {
        console.log("Switching to Custom HTML5 Player (Original 4K Mode)");
        
        // Hide Google Iframe Player
        if (videoIframe) {
            videoIframe.style.display = 'none';
            videoIframe.src = '';
        }
        if (iframeShield) iframeShield.style.display = 'none';
        
        // Show HTML5 Elements
        if (video) {
            video.style.display = 'block';
            const expectedSrc = `https://drive.usercontent.google.com/download?id=${currentFileId}&export=download&confirm=t`;
            if (video.src !== expectedSrc) {
                video.src = expectedSrc;
                video.load();
            }
        }
        if (videoOverlay) videoOverlay.style.display = 'block';
        if (centerPlayBtn) centerPlayBtn.style.display = 'flex';
        if (filmGrain) filmGrain.style.display = 'block';
        
        // Show controls
        if (progressContainer) progressContainer.style.display = 'block';
        if (playPauseBtn) playPauseBtn.style.display = 'flex';
        if (stopBtn) stopBtn.style.display = 'flex';
        if (currentTimeDisplay) currentTimeDisplay.parentElement.style.display = 'block';
        if (speedBtn) speedBtn.style.display = 'block';
        if (cinemaFilterBtn) cinemaFilterBtn.style.display = 'flex';
        
        if (playerDescText) {
            if (cinemaFilterBtn && cinemaFilterBtn.classList.contains('active')) {
                playerDescText.textContent = "Original Quality: Secure 4K stream with Lens filter enabled.";
            } else {
                playerDescText.textContent = "Original Quality: Secure streaming with direct playback.";
            }
        }
        
        if (playerModeBtn) {
            playerModeBtn.innerHTML = '<i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i> SWAP PLAYER';
            playerModeBtn.style.borderColor = 'var(--text-secondary)';
            playerModeBtn.style.color = 'var(--text-secondary)';
        }
        
        updatePlayIcons(video ? !video.paused : false);
    }
    
    // Refresh Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 2. Play / Pause Logic (HTML5 only)
function togglePlay() {
    if (isIframeMode) return;
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
    if (window.lucide) lucide.createIcons();
}

function stopVideo() {
    if (isIframeMode) return;
    video.pause();
    video.currentTime = 0;
    updatePlayIcons(false);
}

// 3. Timeline Progress tracking (HTML5 only)
function updateProgress() {
    if (isIframeMode || isNaN(video.duration)) return;
    const progressPercent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeDisplay.textContent = formatTime(video.currentTime);
}

function setProgress(e) {
    if (isIframeMode) return;
    const width = progressContainer.clientWidth;
    const rect = progressContainer.getBoundingClientRect();
    const clickX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const duration = video.duration;
    if (isNaN(duration)) return;
    video.currentTime = Math.max(0, Math.min(duration, (clickX / width) * duration));
    updateProgress();
}

function formatTime(timeInSeconds) {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 4. Volume Logic (HTML5 only)
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
    if (window.lucide) lucide.createIcons();
}

// 5. Playback Speed Selector (HTML5 only)
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
    if (speedOptions) speedOptions.classList.remove('show');
});

// 6. Fullscreen Handler
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        playerContainer.requestFullscreen()
            .then(() => {
                fullscreenBtn.innerHTML = '<i data-lucide="minimize"></i>';
                if (window.lucide) lucide.createIcons();
            })
            .catch(err => {
                console.error("Fullscreen error:", err);
            });
    } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = '<i data-lucide="maximize"></i>';
        if (window.lucide) lucide.createIcons();
    }
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenBtn.innerHTML = '<i data-lucide="maximize"></i>';
        if (window.lucide) lucide.createIcons();
    }
});

// 7. Cinema 4K Lens Filter Switcher
if (cinemaFilterBtn) {
    cinemaFilterBtn.addEventListener('click', () => {
        cinemaFilterBtn.classList.toggle('active');
        if (cinemaFilterBtn.classList.contains('active')) {
            video.classList.add('cinema-4k-filter');
            if (filmGrain) filmGrain.style.opacity = '0.04';
            if (playerDescText) playerDescText.textContent = "Original Quality: Secure 4K stream with Lens filter enabled.";
            console.log("Cinema 4K Filter enabled");
        } else {
            video.classList.remove('cinema-4k-filter');
            if (filmGrain) filmGrain.style.opacity = '0';
            if (playerDescText) playerDescText.textContent = "Original Quality: Secure streaming with direct playback.";
            console.log("Cinema 4K Filter disabled");
        }
    });
}

// Loader Screen Visual Controls
function showLoader(duration = null) {
    if (playerLoader) {
        playerLoader.classList.add('show');
        if (duration) {
            setTimeout(hideLoader, duration);
        }
    }
}

// Ensure loader is hidden
function hideLoader() {
    if (playerLoader) {
        playerLoader.classList.remove('show');
    }
}

// 8. Playlist Navigation (Smart Hybrid implementation)
function loadVideo(fileId, videoTitle) {
    currentFileId = fileId;
    currentVideoName = videoTitle;
    currentVideoTitle.textContent = videoTitle;
    
    // Hide error overlay
    if (playerErrorOverlay) {
        playerErrorOverlay.classList.remove('show');
    }

    if (isIframeMode) {
        const newSrc = `https://drive.google.com/file/d/${fileId}/preview`;
        videoIframe.src = newSrc;
        showLoader(2000);
    } else {
        video.pause();
        const newSrc = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
        video.src = newSrc;
        video.load();
        
        updatePlayIcons(false);
        showLoader();
        
        video.play()
            .then(() => {
                updatePlayIcons(true);
            })
            .catch(err => {
                console.log("Playback blocked or failed. Waiting for user action.", err);
                updatePlayIcons(false);
                hideLoader();
            });
    }
}

// 9. Touch Gesture Handlers (Tap to Play/Pause, Double-Tap to Seek)
function handleVideoTap(e) {
    if (isIframeMode) return;
    
    const now = new Date().getTime();
    const timespan = now - lastTap;
    const doubleTapDelay = 300; // ms
    
    const rect = playerContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const playerWidth = rect.width;
    
    if (timespan < doubleTapDelay && timespan > 0) {
        // Double tap!
        e.preventDefault();
        if (clickX < playerWidth * 0.35) {
            // Seek backward 10s
            seekVideo(-10);
            showSeekFeedback('left');
        } else if (clickX > playerWidth * 0.65) {
            // Seek forward 10s
            seekVideo(10);
            showSeekFeedback('right');
        } else {
            // Center double-tap: standard play/pause
            togglePlay();
        }
    } else {
        // Single tap: toggle play/pause after confirming no second tap
        setTimeout(() => {
            const currentNow = new Date().getTime();
            if (currentNow - lastTap >= doubleTapDelay) {
                togglePlay();
            }
        }, doubleTapDelay);
    }
    
    lastTap = now;
}

function seekVideo(amount) {
    if (!video || isNaN(video.duration)) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + amount));
    updateProgress();
}

// Seek overlay animations
function showSeekFeedback(direction) {
    if (direction === 'left' && seekLeftFeedback) {
        seekLeftFeedback.classList.remove('show');
        void seekLeftFeedback.offsetWidth; // Force layout recalculation
        seekLeftFeedback.classList.add('show');
        setTimeout(() => seekLeftFeedback.classList.remove('show'), 600);
    } else if (direction === 'right' && seekRightFeedback) {
        seekRightFeedback.classList.remove('show');
        void seekRightFeedback.offsetWidth;
        seekRightFeedback.classList.add('show');
        setTimeout(() => seekRightFeedback.classList.remove('show'), 600);
    }
}

// 10. Anti-Download Security protections
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

// Block DevTools shortcuts, Save Page, View Source
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
    
    // Keyboard controls for custom video player (when not in Iframe mode)
    if (!isIframeMode && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
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
            seekVideo(-5);
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            seekVideo(5);
        }
    }
});

// 11. Auto Hide Media Controls on Idle (Only in HTML5 mode)
function resetControlsTimer() {
    if (isIframeMode) return;
    playerContainer.classList.remove('controls-hidden');
    clearTimeout(controlsTimeout);
    
    if (video && !video.paused) {
        controlsTimeout = setTimeout(() => {
            playerContainer.classList.add('controls-hidden');
        }, 3000);
    }
}

// Media Event Bindings
if (video) {
    video.addEventListener('loadstart', showLoader);
    video.addEventListener('waiting', showLoader);
    video.addEventListener('seeking', showLoader);
    video.addEventListener('playing', hideLoader);
    video.addEventListener('canplay', hideLoader);
    video.addEventListener('pause', hideLoader);
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', () => {
        durationDisplay.textContent = formatTime(video.duration);
    });
    // Video native loading/decoding errors trigger overlay
    video.addEventListener('error', (e) => {
        console.error("HTML5 video error event:", video.error);
        hideLoader();
        if (playerErrorOverlay) {
            playerErrorOverlay.classList.add('show');
        }
    });
}

// Touch Event Bindings
if (videoOverlay) {
    videoOverlay.addEventListener('click', handleVideoTap);
}

// Button Bindings
if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
if (centerPlayBtn) centerPlayBtn.addEventListener('click', togglePlay);
if (stopBtn) stopBtn.addEventListener('click', stopVideo);

// Progress drag and touch bindings
if (progressContainer) {
    progressContainer.addEventListener('click', setProgress);
    
    let isDraggingProgress = false;
    const startDrag = (e) => {
        isDraggingProgress = true;
        setProgress(e);
    };
    const doDrag = (e) => {
        if (isDraggingProgress) setProgress(e);
    };
    const stopDrag = () => {
        isDraggingProgress = false;
    };
    
    progressContainer.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
    
    progressContainer.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', doDrag, { passive: true });
    window.addEventListener('touchend', stopDrag);
}

if (muteBtn) muteBtn.addEventListener('click', toggleMute);
if (volumeSlider) volumeSlider.addEventListener('input', handleVolumeChange);
if (speedBtn) speedBtn.addEventListener('click', toggleSpeedMenu);
document.querySelectorAll('.speed-opt').forEach(opt => {
    opt.addEventListener('click', changeSpeed);
});
if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

// Player UI Hover Bindings
if (playerContainer) {
    playerContainer.addEventListener('mousemove', resetControlsTimer);
    playerContainer.addEventListener('mouseleave', () => {
        if (video && !video.paused) {
            playerContainer.classList.add('controls-hidden');
        }
    });
}

// Swap Player Button Action
if (playerModeBtn) {
    playerModeBtn.addEventListener('click', () => {
        isIframeMode = !isIframeMode;
        console.log("User toggled player mode manually. isIframeMode:", isIframeMode);
        updatePlayerModeUI();
    });
}

// Error Fallback button action
if (errorFallbackBtn) {
    errorFallbackBtn.addEventListener('click', () => {
        isIframeMode = true;
        console.log("User triggered backup fallback player after stream failure.");
        updatePlayerModeUI();
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

// Disable double-click Zoom on iOS Safari/Chrome mobile viewport
document.addEventListener('touchstart', function() {}, { passive: true });
