/**
 * Simple Music Player
 * A minimal music player with playlist management and basic audio controls
 */

class MusicPlayer {
    constructor() {
        // Audio element
        this.audio = document.getElementById('audioPlayer');

        // Playlist
        this.playlist = [];
        this.currentIndex = 0;

        // Player state
        this.isPlaying = false;
        this.isShuffle = false;
        this.repeatMode = 'off'; // 'off', 'one', 'all'
        this.volume = 0.7;
        this.recentlyPlayed = [];

        // Playlist name
        this.playlistName = "My Playlist";

        // Initialize
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        this.setVolume(70); // Set initial volume

        // Add playlist name input event
        const nameInput = document.getElementById('playlistNameInput');
        if (nameInput) {
            nameInput.value = this.playlistName;
            nameInput.addEventListener('change', (e) => {
                this.playlistName = e.target.value.trim() || "My Playlist";
                this.updatePlaylistName();
            });
        }
        this.updatePlaylistName();
    }

    // ===== Event Listeners Setup =====
    setupEventListeners() {
        // Play/Pause button
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());

        // Previous/Next buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.playPrevious());
        document.getElementById('nextBtn').addEventListener('click', () => this.playNext());

        // Repeat button
        document.getElementById('repeatBtn').addEventListener('click', () => this.toggleRepeat());

        // Shuffle button
        document.getElementById('shuffleBtn').addEventListener('click', () => this.toggleShuffle());

        // Volume controls
        document.getElementById('volumeSlider').addEventListener('input', (e) => this.setVolume(e.target.value));
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());

        // Progress bar
        const progressBar = document.getElementById('progressBar');
        progressBar.addEventListener('click', (e) => this.seek(e));

        // File upload
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));

        // Clear playlist
        document.getElementById('clearPlaylist').addEventListener('click', () => this.clearPlaylist());

        // Sort playlist
        document.getElementById('sortBtn').addEventListener('click', () => this.sortPlaylist());

        // Create Playlist button
        const createPlaylistBtn = document.getElementById('createPlaylistBtn');
        if (createPlaylistBtn) {
            createPlaylistBtn.addEventListener('click', () => {
                this.createNewPlaylist();
            });
        }

        // Audio element events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleSongEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // ===== Playlist Management =====
    renderPlaylist() {
        const playlistElement = document.getElementById('playlist');

        if (!playlistElement) {
            console.error('❌ Playlist element not found!');
            return;
        }

        playlistElement.innerHTML = '';

        this.playlist.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'playlist-item';
            if (index === this.currentIndex) {
                li.classList.add('active');
            }

            const playIcon = song.url ? 'fa-play' : 'fa-music';

            li.innerHTML = `
                <div class="song-details">
                    <div class="song-name">${song.title}</div>
                    <div class="song-meta">${song.artist} • ${this.formatTime(song.duration)}</div>
                </div>
                <div class="song-actions">
                    <button class="btn-action" onclick="player.playSong(${index})" title="Play">
                        <i class="fas ${playIcon}"></i>
                    </button>
                    <button class="btn-action" onclick="player.removeSong(${index})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            playlistElement.appendChild(li);
        });

        this.updatePlaylistStats();
    }

    updatePlaylistStats() {
        const totalDuration = this.playlist.reduce((sum, song) => sum + song.duration, 0);
        document.getElementById('playlistCount').textContent = `${this.playlist.length} songs`;
        document.getElementById('playlistDuration').textContent = this.formatTime(totalDuration);
    }

    addSong(song) {
        this.playlist.push(song);
        this.renderPlaylist();
        this.showNotification(`Added: ${song.title}`);
    }

    removeSong(index) {
        const song = this.playlist[index];
        this.playlist.splice(index, 1);

        if (index === this.currentIndex) {
            this.stop();
        } else if (index < this.currentIndex) {
            this.currentIndex--;
        }

        this.renderPlaylist();
        this.showNotification(`Removed: ${song.title}`);
    }

    clearPlaylist() {
        if (confirm('Are you sure you want to clear the entire playlist?')) {
            this.playlist = [];
            this.currentIndex = 0;
            this.stop();
            this.renderPlaylist();
            this.showNotification('Playlist cleared');
        }
    }

    sortPlaylist() {
        this.playlist.sort((a, b) => a.title.localeCompare(b.title));
        this.renderPlaylist();
        this.showNotification('Playlist sorted alphabetically');
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        const btn = document.getElementById('shuffleBtn');
        btn.style.background = this.isShuffle ? '#4ECDC4' : '';
        btn.style.color = this.isShuffle ? 'white' : '';
        this.showNotification(`Shuffle ${this.isShuffle ? 'ON' : 'OFF'}`);
    }

    // ===== Playback Controls =====
    playSong(index) {
        if (index < 0 || index >= this.playlist.length) return;

        // Add the current song to recently played before switching
        if (this.playlist[this.currentIndex]) {
            this.addToRecentlyPlayed(this.playlist[this.currentIndex]);
        }

        this.currentIndex = index;
        const song = this.playlist[index];

        // Update song info first
        this.updateSongInfo(song);
        this.updateCurrentlyPlaying(song);
        this.renderPlaylist();

        // If song has URL (uploaded file), play it
        if (song.url) {
            this.audio.src = song.url;
            this.audio.load();
            this.play();
        } else {
            this.showNotification('⚠️ No audio file. Please upload your music files.');
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.playlist.length === 0) {
            this.showNotification('Playlist is empty. Upload some music!');
            return;
        }

        const song = this.playlist[this.currentIndex];

        if (song.url) {
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updatePlayButton();
                this.updateSongInfo(song);
                document.querySelector('.album-art').classList.add('playing');
            }).catch(error => {
                console.error('Playback error:', error);
                this.showNotification('Error playing audio');
            });
        } else {
            this.showNotification('⚠️ No audio file. Please upload your music files.');
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton();
        document.querySelector('.album-art').classList.remove('playing');
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.updatePlayButton();
        document.querySelector('.album-art').classList.remove('playing');

        // Reset progress bar
        document.getElementById('progress').style.width = '0%';
        document.getElementById('progressHandle').style.left = '0%';
        document.getElementById('currentTime').textContent = '0:00';
    }

    playNext() {
        if (this.isShuffle) {
            this.currentIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        }
        this.playSong(this.currentIndex);
    }

    playPrevious() {
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
        } else {
            this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
            this.playSong(this.currentIndex);
        }
    }

    handleSongEnd() {
        switch (this.repeatMode) {
            case 'one':
                this.audio.currentTime = 0;
                this.play();
                break;
            case 'all':
                this.playNext();
                break;
            default:
                if (this.currentIndex < this.playlist.length - 1) {
                    this.playNext();
                } else {
                    this.stop();
                }
        }
    }

    toggleRepeat() {
        const modes = ['off', 'all', 'one'];
        const currentModeIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentModeIndex + 1) % modes.length];

        const btn = document.getElementById('repeatBtn');
        const icon = btn.querySelector('i');

        switch (this.repeatMode) {
            case 'off':
                btn.classList.remove('active');
                icon.className = 'fas fa-repeat';
                btn.title = 'Repeat Off';
                break;
            case 'all':
                btn.classList.add('active');
                icon.className = 'fas fa-repeat';
                btn.title = 'Repeat All';
                break;
            case 'one':
                btn.classList.add('active');
                icon.className = 'fas fa-repeat-1';
                btn.title = 'Repeat One';
                break;
        }

        this.showNotification(`Repeat: ${this.repeatMode.toUpperCase()}`);
    }

    // ===== Volume Controls =====
    setVolume(value) {
        this.volume = value / 100;
        this.audio.volume = this.volume;
        document.getElementById('volumeValue').textContent = `${value}%`;

        const icon = document.querySelector('#muteBtn i');
        if (value == 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (value < 50) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }

    toggleMute() {
        if (this.audio.volume > 0) {
            this.audio.volume = 0;
            document.getElementById('volumeSlider').value = 0;
            document.getElementById('volumeValue').textContent = '0%';
            document.querySelector('#muteBtn i').className = 'fas fa-volume-mute';
        } else {
            this.audio.volume = this.volume;
            document.getElementById('volumeSlider').value = this.volume * 100;
            document.getElementById('volumeValue').textContent = `${Math.round(this.volume * 100)}%`;
            this.setVolume(this.volume * 100);
        }
    }

    // ===== Progress & Seeking =====
    updateProgress() {
        if (this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progress').style.width = `${percent}%`;
            document.getElementById('progressHandle').style.left = `${percent}%`;
            document.getElementById('currentTime').textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        document.getElementById('duration').textContent = this.formatTime(this.audio.duration);
    }

    seek(e) {
        const progressBar = document.getElementById('progressBar');
        const clickX = e.offsetX;
        const width = progressBar.offsetWidth;
        const percent = clickX / width;

        if (this.audio.duration) {
            this.audio.currentTime = percent * this.audio.duration;
        }
    }

    // ===== File Upload =====
    handleFileUpload(e) {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            if (file.type.startsWith('audio/')) {
                const url = URL.createObjectURL(file);

                // Create audio element to get metadata
                const tempAudio = new Audio(url);
                tempAudio.addEventListener('loadedmetadata', () => {
                    const song = {
                        title: file.name.replace(/\.[^/.]+$/, ''),
                        artist: 'Unknown Artist',
                        album: 'Uploaded',
                        duration: tempAudio.duration,
                        url: url
                    };

                    this.addSong(song);
                });
            }
        });

        // Reset file input
        e.target.value = '';
    }

    // ===== Keyboard Shortcuts =====
    handleKeyboard(e) {
        // Space - Play/Pause
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            this.togglePlay();
        }

        // Arrow Right - Next
        if (e.code === 'ArrowRight') {
            this.playNext();
        }

        // Arrow Left - Previous
        if (e.code === 'ArrowLeft') {
            this.playPrevious();
        }

        // Arrow Up - Volume Up
        if (e.code === 'ArrowUp') {
            e.preventDefault();
            const currentVolume = parseInt(document.getElementById('volumeSlider').value);
            this.setVolume(Math.min(100, currentVolume + 5));
            document.getElementById('volumeSlider').value = Math.min(100, currentVolume + 5);
        }

        // Arrow Down - Volume Down
        if (e.code === 'ArrowDown') {
            e.preventDefault();
            const currentVolume = parseInt(document.getElementById('volumeSlider').value);
            this.setVolume(Math.max(0, currentVolume - 5));
            document.getElementById('volumeSlider').value = Math.max(0, currentVolume - 5);
        }
    }

    // ===== UI Updates =====
    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        const icon = playBtn.querySelector('i');

        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
            playBtn.title = 'Pause';
        } else {
            icon.className = 'fas fa-play';
            playBtn.title = 'Play';
        }
    }

    updateSongInfo(song) {
        document.getElementById('songTitle').textContent = song.title;
        document.getElementById('songArtist').textContent = song.artist;
        document.getElementById('songAlbum').textContent = song.album;

        // Update album art
        const albumArt = document.getElementById('albumArt');
        if (song.albumArt) {
            albumArt.style.backgroundImage = `url(${song.albumArt})`;
            albumArt.innerHTML = '';
        } else {
            albumArt.style.backgroundImage = '';
            albumArt.innerHTML = '<i class="fas fa-music"></i>';
        }
    }

    updatePlaylistName() {
        const nameDisplay = document.getElementById('playlistNameDisplay');
        if (nameDisplay) {
            nameDisplay.textContent = this.playlistName;
        }
    }

    updateUI() {
        this.updatePlayButton();
        this.renderPlaylist();
        this.updateCurrentlyPlaying(null); // Set initial state
    }

    updateCurrentlyPlaying(song) {
        const titleEl = document.getElementById('currentTitle');
        const artistEl = document.getElementById('currentArtist');
        const artEl = document.getElementById('currentAlbumArt');

        if (song) {
            titleEl.textContent = song.title;
            artistEl.textContent = song.artist;
            if (song.albumArt) {
                artEl.style.backgroundImage = `url(${song.albumArt})`;
                artEl.innerHTML = '';
            } else {
                artEl.style.backgroundImage = '';
                artEl.innerHTML = '<i class="fas fa-music"></i>';
            }
        } else {
            titleEl.textContent = 'No song playing';
            artistEl.textContent = '';
            artEl.style.backgroundImage = '';
            artEl.innerHTML = '<i class="fas fa-music"></i>';
        }
    }

    addToRecentlyPlayed(song) {
        // Avoid adding duplicates
        this.recentlyPlayed = this.recentlyPlayed.filter(s => s.url !== song.url);

        // Add to the beginning of the array
        this.recentlyPlayed.unshift(song);

        // Limit to 5 songs
        if (this.recentlyPlayed.length > 5) {
            this.recentlyPlayed.pop();
        }

        this.renderRecentlyPlayed();
    }

    renderRecentlyPlayed() {
        const listEl = document.getElementById('recentlyPlayedList');
        listEl.innerHTML = '';

        this.recentlyPlayed.forEach(song => {
            const li = document.createElement('li');
            li.className = 'recently-played-item';
            li.innerHTML = `<span class="song-name">${song.title}</span>`;
            li.addEventListener('click', () => {
                const songIndex = this.playlist.findIndex(s => s.url === song.url);
                if (songIndex !== -1) {
                    this.playSong(songIndex);
                }
            });
            listEl.appendChild(li);
        });
    }

    // ===== Playlist Creation Feature =====
    createNewPlaylist() {
        const playlistName = prompt('Enter playlist name:');
        if (!playlistName || !playlistName.trim()) return;

        const playlistsContainer = document.getElementById('playlistsContainer');
        if (!playlistsContainer) {
            console.error('Playlists container not found!');
            return;
        }

        // Create playlist box
        const playlistBox = document.createElement('div');
        playlistBox.className = 'playlist-box';

        // Playlist title
        const title = document.createElement('h3');
        title.textContent = playlistName.trim();

        // Add Song button
        const addSongBtn = document.createElement('button');
        addSongBtn.className = 'add-song-btn';
        addSongBtn.innerHTML = '<i class="fas fa-plus"></i> Add Song';

        // Add song event listener
        addSongBtn.addEventListener('click', () => {
            // Trigger the main file upload
            document.getElementById('fileInput').click();
        });

        // Assemble playlist box
        playlistBox.appendChild(title);
        playlistBox.appendChild(addSongBtn);

        playlistsContainer.appendChild(playlistBox);

        this.showNotification(`Playlist "${playlistName.trim()}" created!`);
    }

    // ===== Utility Functions =====
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4ECDC4;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize player
const player = new MusicPlayer();
