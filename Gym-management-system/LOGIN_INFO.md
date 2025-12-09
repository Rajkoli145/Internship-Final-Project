# Login Credentials & Firebase Setup

## Demo Login Credentials

### Admin Login
- **URL**: `admin-login.html`
- **Email**: `admin@fitzone.com`
- **Password**: `admin123`
- **Access**: Full admin dashboard with management capabilities

### Member Login
- **URL**: `member-login.html`
- **Email**: `member@fitzone.com`
- **Password**: `member123`
- **Access**: Member dashboard with personal records

### User Login
- **URL**: `user-login.html`
- **Username**: `user123`
- **Password**: `user123`
- **Access**: User dashboard for viewing gym records

---

## Firebase Configuration

Your Firebase configuration has been added to `scripts/auth.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbczQtwoH6d9goVTlP8gxCvtoh_D7w0IA",
  authDomain: "gym-management-a5ea7.firebaseapp.com",
  projectId: "gym-management-a5ea7",
  storageBucket: "gym-management-a5ea7.firebasestorage.app",
  messagingSenderId: "1090101884271",
  appId: "1:1090101884271:web:a3b30cfd3625d8eb8be49a",
  measurementId: "G-70XL4D7PVZ"
};
```

---

## Enable Firebase Authentication

To enable Firebase authentication, follow these steps:

### 1. Add Firebase SDK to HTML files

Add these script tags before the closing `</body>` tag in your login pages:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- Your auth script -->
<script src="scripts/auth.js"></script>
```

### 2. Uncomment Firebase initialization in auth.js

In `scripts/auth.js`, uncomment these lines:

```javascript
// Uncomment these lines:
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
```

### 3. Uncomment Firebase authentication in login functions

In each login function (adminLogin, memberLogin), uncomment the Firebase authentication code.

### 4. Set up Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `gym-management-a5ea7`
3. Enable **Email/Password** authentication:
   - Click "Authentication" in the left menu
   - Go to "Sign-in method" tab
   - Enable "Email/Password"
4. Create test users:
   - Go to "Users" tab
   - Add users with the demo credentials above

### 5. Set up Firestore Database (Optional)

For storing user data, gym records, etc.:
1. Go to Firestore Database in Firebase Console
2. Create database
3. Set up collections: `users`, `members`, `gym_records`, etc.

---

## Current Authentication Mode

**Mode**: Demo/Development Mode

The system currently uses hardcoded credentials for testing. To switch to production Firebase authentication:

1. Follow the steps above to add Firebase SDK
2. Uncomment Firebase code in `auth.js`
3. Remove or comment out the demo credentials section
4. Create actual users in Firebase Authentication

---

## Security Notes

⚠️ **Important**: 
- Never commit Firebase config with write permissions to public repositories
- Use Firebase Security Rules to protect your data
- Implement proper role-based access control in Firestore
- Remove demo credentials before deploying to production
