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
const cinemaFilterBtn = document.getElementById('cinemaFilterBtn');
const filmGrain = document.getElementById('filmGrain');
const playerControls = document.getElementById('playerControls');
const playerDescText = document.getElementById('playerDescText');
const playerLoader = document.getElementById('playerLoader');
const playerTipText = document.getElementById('playerTipText');
const seekLeftFeedback = document.getElementById('seekLeftFeedback');
const seekRightFeedback = document.getElementById('seekRightFeedback');
const playerErrorOverlay = document.getElementById('playerErrorOverlay');

// State Variables
let isMuted = false;
let lastVolume = 1;
let controlsTimeout;
let isMobile = false;
let currentFileId = "11D7i7oKexWVdOFh0lvr6ttfz5F5W8Ewt"; // Initial video ID
let currentVideoName = "01-Stay Tonight Official Song.mp4";
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

// Update UI Layout based on Player Mode
function updatePlayerModeUI() {
    // Hide error overlay whenever we reset/update player mode
    if (playerErrorOverlay) {
        playerErrorOverlay.classList.remove('show');
    }

    console.log("Updating Custom HTML5 Player UI");
    
    // Show HTML5 Elements
    if (video) {
        video.style.display = 'block';
        // Use local compressed video path
        const expectedSrc = `videos/${currentVideoName}`;
        if (!decodeURIComponent(video.src).endsWith(expectedSrc)) {
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
    
    updatePlayIcons(video ? !video.paused : false);
    
    // Refresh Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 2. Play / Pause Logic
function togglePlay() {
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
    video.pause();
    video.currentTime = 0;
    updatePlayIcons(false);
}

// 3. Timeline Progress tracking
function updateProgress() {
    if (isNaN(video.duration)) return;
    const progressPercent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeDisplay.textContent = formatTime(video.currentTime);
}

function setProgress(e) {
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

// 6. Fullscreen Handler (Compatible with iOS and standard desktop/Android viewports)
function toggleFullscreen() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    
    if (!isFullscreen) {
        if (playerContainer.requestFullscreen) {
            playerContainer.requestFullscreen()
                .then(() => {
                    fullscreenBtn.innerHTML = '<i data-lucide="minimize"></i>';
                    if (window.lucide) lucide.createIcons();
                })
                .catch(err => {
                    console.error("Fullscreen error:", err);
                });
        } else if (video.webkitEnterFullscreen) {
            // iOS Safari native video fullscreen fallback
            video.webkitEnterFullscreen();
        } else if (playerContainer.webkitRequestFullscreen) {
            // Webkit engine fallback
            playerContainer.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        fullscreenBtn.innerHTML = '<i data-lucide="maximize"></i>';
        if (window.lucide) lucide.createIcons();
    }
}

const handleFullscreenChange = () => {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFullscreen) {
        fullscreenBtn.innerHTML = '<i data-lucide="maximize"></i>';
    } else {
        fullscreenBtn.innerHTML = '<i data-lucide="minimize"></i>';
    }
    if (window.lucide) lucide.createIcons();
};

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

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

// 8. Playlist Navigation
function loadVideo(fileId, videoTitle) {
    currentFileId = fileId;
    currentVideoName = videoTitle;
    currentVideoTitle.textContent = videoTitle;
    
    // Hide error overlay
    if (playerErrorOverlay) {
        playerErrorOverlay.classList.remove('show');
    }

    video.pause();
    // Use local compressed video path
    const newSrc = `videos/${videoTitle}`;
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

// 9. Touch Gesture Handlers (Tap to Play/Pause, Double-Tap to Seek)
function handleVideoTap(e) {
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
    
    // Keyboard controls for custom video player
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
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

// 11. Auto Hide Media Controls on Idle
function resetControlsTimer() {
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

// 12. Contact Form Submission Logic (Simulated with premium animations & feedback)
const contactForm = document.getElementById('collaborationForm');
const contactToast = document.getElementById('contactToast');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnHTML = submitBtn.innerHTML;
        
        // Disable button & show loader state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border-width: 2px; margin-right: 8px; display: inline-block; border-color: rgba(255,255,255,0.1); border-top-color: var(--text-primary);"></div> Sending...';
        
        // Refresh icons if any loader styling changes
        if (window.lucide) lucide.createIcons();
        
        // Simulate network delay
        setTimeout(() => {
            // Show toast notification
            if (contactToast) {
                contactToast.classList.add('show');
                
                // Hide toast after 4 seconds
                setTimeout(() => {
                    contactToast.classList.remove('show');
                }, 4000);
            }
            
            // Reset form fields
            contactForm.reset();
            
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
            if (window.lucide) lucide.createIcons();
        }, 1200);
    });
}

// Device detection & Initialization
window.addEventListener('DOMContentLoaded', detectDevice);
window.addEventListener('resize', detectDevice);

// Init duration text on page load if cached
if (video && video.readyState >= 1) {
    durationDisplay.textContent = formatTime(video.duration);
}

// Disable double-click Zoom on iOS Safari/Chrome mobile viewport
document.addEventListener('touchstart', function() {}, { passive: true });
