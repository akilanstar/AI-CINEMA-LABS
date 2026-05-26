// DOM Elements
const videoIframe = document.getElementById('mainVideoIframe');
const currentVideoTitle = document.getElementById('currentVideoTitle');
const playlistItems = document.querySelectorAll('.playlist-item');

// 1. Playlist Navigation
function loadVideo(fileId, videoTitle) {
    // Update title text
    currentVideoTitle.textContent = videoTitle;
    
    // Construct Google Drive official preview URL
    const newSrc = `https://drive.google.com/file/d/${fileId}/preview`;
    
    // Change iframe src to load new video
    videoIframe.src = newSrc;
}

// Playlist click listener
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

// 2. Anti-Download Security protections
function showSecurityWarning() {
    const lockMsg = document.querySelector('.overlay-lock-msg');
    if (lockMsg) {
        lockMsg.classList.add('show');
        
        // Hide warning after 2.5 seconds
        setTimeout(() => {
            lockMsg.classList.remove('show');
        }, 2500);
    }
}

// Right Click block
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showSecurityWarning();
    return false;
});

// Block dragging on layout elements
const shield = document.getElementById('iframeShieldTop');
if (shield) {
    shield.addEventListener('dragstart', (e) => e.preventDefault());
}

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
});

// Trigger build - 2026-05-26

