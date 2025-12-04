// Multiple Countdown Timers with Themes JavaScript

// Global variables
let timers = new Map(); // Store all active timers
let timerCounter = 0; // Unique ID counter for timers
let currentTheme = 'dark'; // Default theme
let currentRingtone = 'default'; // Default ringtone
let phoneTones = null; // PhoneTones instance

// DOM elements
const timerNameInput = document.getElementById('timer-name');
const targetDateInput = document.getElementById('target-date');
const targetTimeInput = document.getElementById('target-time');
const addTimerBtn = document.getElementById('add-timer-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const timersContainer = document.getElementById('timers-container');
const messagesContainer = document.getElementById('messages-container');
const themeBtn = document.getElementById('theme-btn');
const themeMenu = document.getElementById('theme-menu');
const themeOptions = document.querySelectorAll('.theme-option');
const ringtoneBtn = document.getElementById('ringtone-btn');
const ringtoneMenu = document.getElementById('ringtone-menu');
const ringtoneOptions = document.querySelectorAll('.ringtone-option');

// Theme Management
function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('countdown-theme', theme);
    themeMenu.classList.add('hidden');
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('countdown-theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }
}

// Ringtone Management
function setRingtone(ringtone) {
    currentRingtone = ringtone;
    localStorage.setItem('countdown-ringtone', ringtone);
    ringtoneMenu.classList.add('hidden');
}

function loadSavedRingtone() {
    const savedRingtone = localStorage.getItem('countdown-ringtone');
    if (savedRingtone) {
        currentRingtone = savedRingtone;
    }
}

// Ringtone patterns for PhoneTones
const ringtonePatterns = {
    'us-ring': { frequencies: [440, 480], pattern: '440+480/2000,0/4000' },
    'uk-ring': { frequencies: [400, 450], pattern: '400+450/400,0/200,400+450/400,0/2000' },
    'de-ring': { frequencies: [425], pattern: '425/1000,0/4000' },
    'fr-ring': { frequencies: [440], pattern: '440/1500,0/3500' },
    'beep': { frequencies: [800], pattern: '800/200,0/200,800/200,0/200,800/200' },
    'alarm': { frequencies: [800, 1000], pattern: '800/100,1000/100,800/100,1000/100,800/100,1000/100' }
};

// Set minimum date to today
function setMinimumDate() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    targetDateInput.min = todayString;
    
    // Set default date to today
    targetDateInput.value = todayString;
    
    // Set default time to current time + 1 hour
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + 1);
    const timeString = currentTime.toTimeString().slice(0, 5);
    targetTimeInput.value = timeString;
}

// Format number with leading zero
function formatNumber(num) {
    return num.toString().padStart(2, '0');
}

// Calculate time difference
function calculateTimeDifference(targetDateTime) {
    const now = new Date().getTime();
    const target = new Date(targetDateTime).getTime();
    const difference = target - now;
    
    if (difference <= 0) {
        return null; // Time has passed
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
}

// Enhanced sound effects with ringtone support
function playCompletionSound() {
    try {
        if (currentRingtone === 'default') {
            // Original chord progression
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const startTime = audioContext.currentTime + (index * 0.15);
                gainNode.gain.setValueAtTime(0.1, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.2);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 1.2);
            });
        } else {
            // Force looping with HTML5 Audio for reliability
            let audioElement;
            let playCount = 0;
            const maxPlays = 10;
            
            // Create audio data URL for different ringtones
            const createToneDataUrl = () => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const sampleRate = audioContext.sampleRate;
                const duration = 1; // 1 second
                const length = sampleRate * duration;
                const buffer = audioContext.createBuffer(1, length, sampleRate);
                const data = buffer.getChannelData(0);
                
                // Generate tone based on ringtone type
                let frequency = 800; // default
                switch(currentRingtone) {
                    case 'us-ring': frequency = 440; break;
                    case 'uk-ring': frequency = 400; break;
                    case 'de-ring': frequency = 425; break;
                    case 'fr-ring': frequency = 440; break;
                    case 'beep': frequency = 800; break;
                    case 'alarm': frequency = 900; break;
                }
                
                for (let i = 0; i < length; i++) {
                    data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
                }
                
                // Convert to WAV
                const wav = audioBufferToWav(buffer);
                return URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
            };
            
            // Simple WAV converter
            const audioBufferToWav = (buffer) => {
                const length = buffer.length;
                const arrayBuffer = new ArrayBuffer(44 + length * 2);
                const view = new DataView(arrayBuffer);
                const data = buffer.getChannelData(0);
                
                // WAV header
                const writeString = (offset, string) => {
                    for (let i = 0; i < string.length; i++) {
                        view.setUint8(offset + i, string.charCodeAt(i));
                    }
                };
                
                writeString(0, 'RIFF');
                view.setUint32(4, 36 + length * 2, true);
                writeString(8, 'WAVE');
                writeString(12, 'fmt ');
                view.setUint32(16, 16, true);
                view.setUint16(20, 1, true);
                view.setUint16(22, 1, true);
                view.setUint32(24, 44100, true);
                view.setUint32(28, 88200, true);
                view.setUint16(32, 2, true);
                view.setUint16(34, 16, true);
                writeString(36, 'data');
                view.setUint32(40, length * 2, true);
                
                // Convert samples
                let offset = 44;
                for (let i = 0; i < length; i++) {
                    const sample = Math.max(-1, Math.min(1, data[i]));
                    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                    offset += 2;
                }
                
                return arrayBuffer;
            };
            
            // Play function
            const playRingtone = () => {
                console.log('Playing ringtone attempt:', playCount + 1);
                
                if (playCount >= maxPlays) return;
                
                try {
                    if (audioElement) {
                        audioElement.currentTime = 0;
                        audioElement.play();
                    }
                    playCount++;
                    
                    // Schedule next play
                    if (playCount < maxPlays) {
                        setTimeout(playRingtone, 1000);
                    }
                } catch (error) {
                    console.log('Audio play error:', error);
                }
            };
            
            // Create and setup audio element
            try {
                const dataUrl = createToneDataUrl();
                audioElement = new Audio(dataUrl);
                audioElement.volume = 0.5;
                audioElement.preload = 'auto';
                
                audioElement.addEventListener('canplaythrough', () => {
                    console.log('Audio ready, starting playback');
                    playRingtone();
                });
                
                audioElement.addEventListener('error', (e) => {
                    console.log('Audio error:', e);
                    // Fallback to simple beep
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const playBeep = () => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        oscillator.frequency.value = 800;
                        oscillator.type = 'sine';
                        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.5);
                    };
                    
                    const beepInterval = setInterval(playBeep, 1000);
                    setTimeout(() => clearInterval(beepInterval), 10000);
                });
                
                audioElement.load();
            } catch (error) {
                console.log('Failed to create audio element:', error);
            }
        }
    } catch (error) {
        console.log('Audio notification not supported');
    }
}

// Create fireworks effect
function createFireworks() {
    const fireworksContainer = document.createElement('div');
    fireworksContainer.className = 'fireworks';
    document.body.appendChild(fireworksContainer);
    
    // Create multiple fireworks
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * window.innerWidth + 'px';
            firework.style.top = Math.random() * window.innerHeight + 'px';
            fireworksContainer.appendChild(firework);
            
            // Remove firework after animation
            setTimeout(() => {
                firework.remove();
            }, 1500);
        }, i * 150);
    }
    
    // Remove container after all fireworks
    setTimeout(() => {
        fireworksContainer.remove();
    }, 4000);
}

// Show completion message
function showCompletionMessage(timerName) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'completion-message';
    messageDiv.innerHTML = `
        <strong>🎉 ${timerName} Complete!</strong>
        <br>Time's up!
        <button class="close-message" onclick="this.parentElement.remove()">×</button>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 8000);
}

// Create timer HTML element
function createTimerElement(id, name, targetDateTime) {
    const timerDiv = document.createElement('div');
    timerDiv.className = 'timer-item';
    timerDiv.id = `timer-${id}`;
    
    timerDiv.innerHTML = `
        <div class="timer-header">
            <h3 class="timer-title">${name}</h3>
            <button class="remove-timer" onclick="removeTimer(${id})">×</button>
        </div>
        <div class="timer-display">
            <div class="time-unit">
                <span class="time-value" id="days-${id}">00</span>
                <span class="time-label">Days</span>
            </div>
            <div class="time-unit">
                <span class="time-value" id="hours-${id}">00</span>
                <span class="time-label">Hours</span>
            </div>
            <div class="time-unit">
                <span class="time-value" id="minutes-${id}">00</span>
                <span class="time-label">Minutes</span>
            </div>
            <div class="time-unit">
                <span class="time-value" id="seconds-${id}">00</span>
                <span class="time-label">Seconds</span>
            </div>
        </div>
    `;
    
    return timerDiv;
}

// Update timer display
function updateTimerDisplay(id, timeObj) {
    const daysElement = document.getElementById(`days-${id}`);
    const hoursElement = document.getElementById(`hours-${id}`);
    const minutesElement = document.getElementById(`minutes-${id}`);
    const secondsElement = document.getElementById(`seconds-${id}`);
    
    if (daysElement) daysElement.textContent = formatNumber(timeObj.days);
    if (hoursElement) hoursElement.textContent = formatNumber(timeObj.hours);
    if (minutesElement) minutesElement.textContent = formatNumber(timeObj.minutes);
    if (secondsElement) secondsElement.textContent = formatNumber(timeObj.seconds);
}

// Add new timer
function addTimer() {
    const name = timerNameInput.value.trim() || `Timer ${timerCounter + 1}`;
    const targetDate = targetDateInput.value;
    const targetTime = targetTimeInput.value;
    
    // Validate inputs
    if (!targetDate || !targetTime) {
        alert('Please select both date and time!');
        return;
    }
    
    // Create target datetime
    const targetDateTime = `${targetDate}T${targetTime}`;
    const targetTimestamp = new Date(targetDateTime).getTime();
    const currentTimestamp = new Date().getTime();
    
    // Check if target time is in the future
    if (targetTimestamp <= currentTimestamp) {
        alert('Please select a future date and time!');
        return;
    }
    
    const id = ++timerCounter;
    
    // Create timer object
    const timer = {
        id: id,
        name: name,
        targetDateTime: targetDateTime,
        interval: null
    };
    
    // Add to timers map
    timers.set(id, timer);
    
    // Create and add HTML element
    const timerElement = createTimerElement(id, name, targetDateTime);
    timersContainer.appendChild(timerElement);
    
    // Start the timer interval
    timer.interval = setInterval(() => {
        const timeRemaining = calculateTimeDifference(targetDateTime);
        
        if (timeRemaining === null) {
            // Timer has ended
            clearInterval(timer.interval);
            timers.delete(id);
            
            // Show completion effects
            showCompletionMessage(name);
            playCompletionSound();
            createFireworks();
            
            // Remove timer element after a delay
            setTimeout(() => {
                const element = document.getElementById(`timer-${id}`);
                if (element) {
                    element.style.animation = 'slideOut 0.5s ease-in forwards';
                    setTimeout(() => element.remove(), 500);
                }
            }, 12000);
        } else {
            // Update display
            updateTimerDisplay(id, timeRemaining);
        }
    }, 1000);
    
    // Initial update
    const initialTime = calculateTimeDifference(targetDateTime);
    if (initialTime) {
        updateTimerDisplay(id, initialTime);
    }
    
    // Clear input fields
    timerNameInput.value = '';
    setMinimumDate(); // Reset to default time
}

// Remove specific timer
function removeTimer(id) {
    const timer = timers.get(id);
    if (timer) {
        clearInterval(timer.interval);
        timers.delete(id);
        
        const element = document.getElementById(`timer-${id}`);
        if (element) {
            element.style.animation = 'slideOut 0.5s ease-in forwards';
            setTimeout(() => element.remove(), 500);
        }
    }
}

// Clear all timers
function clearAllTimers() {
    if (timers.size === 0) {
        alert('No active timers to clear!');
        return;
    }
    
    if (confirm(`Are you sure you want to clear all ${timers.size} active timers?`)) {
        timers.forEach((timer) => {
            clearInterval(timer.interval);
        });
        timers.clear();
        timersContainer.innerHTML = '';
        
        // Clear all messages
        messagesContainer.innerHTML = '';
    }
}

// Add slideOut animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
`;
document.head.appendChild(style);

// Event listeners
addTimerBtn.addEventListener('click', addTimer);
clearAllBtn.addEventListener('click', clearAllTimers);

// Theme toggle event listeners
themeBtn.addEventListener('click', () => {
    themeMenu.classList.toggle('hidden');
});

themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        setTheme(theme);
    });
});

// Ringtone toggle event listeners
ringtoneBtn.addEventListener('click', () => {
    ringtoneMenu.classList.toggle('hidden');
});

ringtoneOptions.forEach(option => {
    option.addEventListener('click', () => {
        const ringtone = option.getAttribute('data-ringtone');
        setRingtone(ringtone);
    });
});

// Close menus when clicking outside
document.addEventListener('click', (e) => {
    if (!themeBtn.contains(e.target) && !themeMenu.contains(e.target)) {
        themeMenu.classList.add('hidden');
    }
    if (!ringtoneBtn.contains(e.target) && !ringtoneMenu.contains(e.target)) {
        ringtoneMenu.classList.add('hidden');
    }
});

// Allow Enter key to add timer
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && (e.target === timerNameInput || e.target === targetDateInput || e.target === targetTimeInput)) {
        addTimer();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
    loadSavedRingtone();
    setMinimumDate();
    
    // Focus on name input for better UX
    timerNameInput.focus();
    
    console.log('Multiple Countdown Timers with Themes and Ringtones initialized successfully!');
});
