/**
 * Firebase Configuration - REAL FIREBASE MODE
 * This file initializes Firebase services for the application
 */

// REAL Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAARwNZqqa0fKI5iKSmMjhHdaCPrNxhMko",
  authDomain: "student-booking-7194b.firebaseapp.com",
  databaseURL: "https://student-booking-7194b-default-rtdb.firebaseio.com",
  projectId: "student-booking-7194b",
  storageBucket: "student-booking-7194b.firebasestorage.app",
  messagingSenderId: "978872936020",
  appId: "1:978872936020:web:f87483cbda1b81e06aafc1",
  measurementId: "G-VN28T4NKV2"
};



// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Initialize Analytics if available
let analytics;
if (typeof firebase.analytics === 'function') {
    analytics = firebase.analytics();
    console.log('Firebase Analytics initialized');
}

// Note: Offline persistence is now enabled by default in Firebase 9.22.0+
// No need to call enablePersistence() - it causes deprecation warnings

/**
 * Toast Notification System
 * Shows temporary notifications to users
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-message">${message}</div>`;

    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

/**
 * Get current logged-in user from Firebase Auth
 * @returns {Object|null} Current user data or null
 */
function getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
        // Get additional user data from localStorage (cached)
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            return JSON.parse(userData);
        }
        // Return basic user info if no cached data
        return {
            uid: user.uid,
            email: user.email
        };
    }
    return null;
}

/**
 * Format date string
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format date and time string
 * @param {string} dateString - Date string or timestamp
 * @returns {string} Formatted date and time
 */
function formatDateTime(dateString) {
    let date;

    // Handle Firestore Timestamp
    if (dateString && typeof dateString.toDate === 'function') {
        date = dateString.toDate();
    } else if (dateString && dateString.seconds) {
        date = new Date(dateString.seconds * 1000);
    } else {
        date = new Date(dateString);
    }

    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format time string from 24-hour to 12-hour format with AM/PM
 * @param {string} timeString - Time string in HH:mm format (24-hour)
 * @returns {string} Formatted time in 12-hour format with AM/PM
 */
function formatTime12Hour(timeString) {
    if (!timeString) return 'N/A';
    
    const [hours, minutes] = timeString.split(':');
    let hour = parseInt(hours);
    const min = minutes || '00';
    
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert 0 to 12 for midnight
    
    return `${hour}:${min} ${period}`;
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function getInitials(name) {
    if (!name) return '??';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

/**
 * Monitor authentication state
 */
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('User is signed in:', user.email);

        // Fetch and cache user data
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    ...userDoc.data()
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    } else {
        console.log('User is signed out');
        localStorage.removeItem('currentUser');
    }
});

console.log('Firebase initialized successfully (REAL MODE)');
console.log('Project ID:', firebaseConfig.projectId);
