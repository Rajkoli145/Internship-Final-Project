// Firebase Configuration
// IMPORTANT: Create a file named 'firebase-config.js' in the scripts folder
// with your Firebase credentials. See README.md for setup instructions.
// 
// Example structure for firebase-config.js:
// const firebaseConfig = {
//     apiKey: "YOUR_API_KEY",
//     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//     projectId: "YOUR_PROJECT_ID",
//     storageBucket: "YOUR_PROJECT_ID.appspot.com",
//     messagingSenderId: "YOUR_SENDER_ID",
//     appId: "YOUR_APP_ID",
//     measurementId: "YOUR_MEASUREMENT_ID"
// };

// Initialize Firebase (uncomment when firebase-config.js is created)
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();

// Demo credentials for testing (remove in production)
const DEMO_CREDENTIALS = {
    admin: {
        email: 'admin@fitzone.com',
        password: 'admin123',
        role: 'admin'
    },
    member: {
        email: 'member@fitzone.com',
        password: 'member123',
        role: 'member'
    },
    user: {
        username: 'user123',
        password: 'user123',
        role: 'user'
    }
};

// Helper function to show messages
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#ff4444' : '#00ff41'};
        color: ${type === 'error' ? '#fff' : '#0a0a0a'};
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

// Admin Login with Firebase
async function adminLogin(email, password) {
    try {
        // Demo mode - remove this in production
        if (email === DEMO_CREDENTIALS.admin.email && password === DEMO_CREDENTIALS.admin.password) {
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('userEmail', email);
            showMessage('Admin login successful!', 'success');
            setTimeout(() => window.location.href = 'admin-dashboard.html', 1000);
            return;
        }

        // Firebase authentication (uncomment when Firebase SDK is loaded)
        // const userCredential = await auth.signInWithEmailAndPassword(email, password);
        // const user = userCredential.user;
        // localStorage.setItem('userRole', 'admin');
        // localStorage.setItem('userId', user.uid);
        // localStorage.setItem('userEmail', user.email);
        // showMessage('Admin login successful!', 'success');
        // setTimeout(() => window.location.href = 'admin-dashboard.html', 1000);

        showMessage('Invalid credentials. Try: admin@fitzone.com / admin123', 'error');
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Member Login with Firebase
async function memberLogin(email, password) {
    try {
        // Demo mode - remove this in production
        if (email === DEMO_CREDENTIALS.member.email && password === DEMO_CREDENTIALS.member.password) {
            localStorage.setItem('userRole', 'member');
            localStorage.setItem('userEmail', email);
            showMessage('Member login successful!', 'success');
            setTimeout(() => window.location.href = 'member-dashboard.html', 1000);
            return;
        }

        // Firebase authentication (uncomment when Firebase SDK is loaded)
        // const userCredential = await auth.signInWithEmailAndPassword(email, password);
        // const user = userCredential.user;
        // localStorage.setItem('userRole', 'member');
        // localStorage.setItem('userId', user.uid);
        // localStorage.setItem('userEmail', user.email);
        // showMessage('Member login successful!', 'success');
        // setTimeout(() => window.location.href = 'member-dashboard.html', 1000);

        showMessage('Invalid credentials. Try: member@fitzone.com / member123', 'error');
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// User Login (custom authentication)
async function userLogin(username, password) {
    try {
        // Demo mode - remove this in production
        if (username === DEMO_CREDENTIALS.user.username && password === DEMO_CREDENTIALS.user.password) {
            localStorage.setItem('userRole', 'user');
            localStorage.setItem('username', username);
            showMessage('User login successful!', 'success');
            setTimeout(() => window.location.href = 'user-dashboard.html', 1000);
            return;
        }

        showMessage('Invalid credentials. Try: user123 / user123', 'error');
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const memberLoginForm = document.getElementById('memberLoginForm');
    const userLoginForm = document.getElementById('userLoginForm');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            adminLogin(email, password);
        });
    }

    if (memberLoginForm) {
        memberLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            memberLogin(email, password);
        });
    }

    if (userLoginForm) {
        userLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            userLogin(username, password);
        });
    }
});