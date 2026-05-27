// DOM Elements
const videoIframe = document.getElementById('mainVideoIframe');
const currentVideoTitle = document.getElementById('currentVideoTitle');
const playlistItems = document.querySelectorAll('.playlist-item');
const overlayLockMsg = document.getElementById('overlayLockMsg');

// Playlist Navigation (Using Google Drive Preview Player which bypasses CORS/CORP blocks)
function loadVideo(fileId, videoTitle) {
    if (currentVideoTitle) {
        currentVideoTitle.textContent = videoTitle;
    }
    if (videoIframe) {
        videoIframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
    }
}

// Anti-Download Security protections
function showSecurityWarning() {
    if (overlayLockMsg) {
        overlayLockMsg.style.display = 'flex';
        // Force browser layout update
        void overlayLockMsg.offsetWidth;
        overlayLockMsg.classList.add('show');
        setTimeout(() => {
            overlayLockMsg.classList.remove('show');
            setTimeout(() => {
                overlayLockMsg.style.display = 'none';
            }, 300);
        }, 2200);
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
});

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

// Disable double-click Zoom on iOS Safari/Chrome mobile viewport
document.addEventListener('touchstart', function() {}, { passive: true });
