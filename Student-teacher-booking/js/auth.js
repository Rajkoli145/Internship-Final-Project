/**
 * Authentication Module - REAL FIREBASE MODE
 * Handles user registration, login, logout, and authentication checks
 */

/**
 * Register a new student or teacher
 * @param {Object} formData - User registration data
 */
async function registerStudent(formData) {
    try {
        // Create authentication user with Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(
            formData.email,
            formData.password
        );

        const user = userCredential.user;

        // Prepare user data for Firestore
        const userData = {
            uid: user.uid,
            email: formData.email,
            fullName: formData.fullName,
            role: formData.role,
            approved: formData.role === 'student' ? true : false, // Students auto-approved, teachers need approval
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Add role-specific data
        if (formData.role === 'student') {
            userData.studentId = formData.studentId;
            userData.department = formData.department;
        } else if (formData.role === 'teacher') {
            userData.subject = formData.subject;
            userData.department = formData.teacherDepartment;
        }

        // Save user data to Firestore 'users' collection
        await db.collection('users').doc(user.uid).set(userData);

        // If teacher, also add to teachers collection
        if (formData.role === 'teacher') {
            await db.collection('teachers').doc(user.uid).set({
                name: formData.fullName,
                email: formData.email,
                department: formData.teacherDepartment,
                subject: formData.subject,
                approved: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Log the registration
        if (typeof logAction === 'function') {
            await logAction('register', `New ${formData.role} registered: ${formData.fullName}`);
        }

        showToast('Registration successful!', 'success');

        // Redirect based on role
        setTimeout(() => {
            if (formData.role === 'teacher') {
                showToast('Your account is pending admin approval', 'info');
                auth.signOut();
                window.location.href = 'login.html';
            } else {
                window.location.href = 'student/dashboard.html';
            }
        }, 1500);

    } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed. Please try again.';

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email already in use. Please login or use a different email.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        }

        showToast(errorMessage, 'error');
        throw error;
    }
}

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} userType - Expected user role (student/teacher/admin)
 */
async function loginUser(email, password, userType) {
    try {
        // Sign in with Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (!userDoc.exists) {
            await auth.signOut();
            showToast('User data not found. Please contact administrator.', 'error');
            return;
        }

        const userData = userDoc.data();

        // Verify user type matches
        if (userData.role !== userType) {
            await auth.signOut();
            showToast(`Please login as ${userData.role}`, 'error');
            return;
        }

        // Check if user is approved (except for admin and students)
        if (userType === 'teacher' && !userData.approved) {
            await auth.signOut();
            showToast('Your account is pending approval. Please wait for admin approval.', 'warning');
            return;
        }

        // Store current user data in localStorage for quick access
        localStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            ...userData
        }));

        // Log the login
        await logAction('login', `User logged in: ${userData.fullName} (${userType})`);

        showToast(`Welcome back, ${userData.fullName}!`, 'success');

        // Redirect to appropriate dashboard
        setTimeout(() => {
            if (userType === 'admin') {
                window.location.href = 'admin/dashboard.html';
            } else if (userType === 'teacher') {
                window.location.href = 'teacher/dashboard.html';
            } else if (userType === 'student') {
                window.location.href = 'student/dashboard.html';
            }
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Invalid email or password';

        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled.';
        }

        showToast(errorMessage, 'error');
        throw error;
    }
}

/**
 * Logout current user
 */
async function logout() {
    try {
        const currentUser = getCurrentUser();

        if (currentUser) {
            // Log the logout
            await logAction('logout', `User logged out: ${currentUser.fullName}`);
        }

        // Sign out from Firebase
        await auth.signOut();

        // Clear local storage
        localStorage.removeItem('currentUser');

        showToast('Logged out successfully', 'success');

        // Redirect to home page
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);

    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error logging out', 'error');
    }
}

/**
 * Check if user is authenticated and has correct role
 * @param {string} requiredRole - Required user role
 */
function checkAuth(requiredRole) {
    // Check Firebase auth state
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            // Not logged in, redirect to login
            showToast('Please login to continue', 'warning');
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 1000);
            return;
        }

        try {
            // Get user data from Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();

            if (!userDoc.exists) {
                showToast('User data not found', 'error');
                await auth.signOut();
                setTimeout(() => {
                    window.location.href = '../login.html';
                }, 1000);
                return;
            }

            const userData = userDoc.data();

            // Check if user has correct role
            if (userData.role !== requiredRole) {
                showToast('Unauthorized access', 'error');
                setTimeout(() => {
                    if (userData.role === 'admin') {
                        window.location.href = '../admin/dashboard.html';
                    } else if (userData.role === 'teacher') {
                        window.location.href = '../teacher/dashboard.html';
                    } else if (userData.role === 'student') {
                        window.location.href = '../student/dashboard.html';
                    } else {
                        window.location.href = '../login.html';
                    }
                }, 1000);
                return;
            }

            // Check if teacher is approved
            if (userData.role === 'teacher' && !userData.approved) {
                showToast('Your account is pending admin approval', 'warning');
                await auth.signOut();
                setTimeout(() => {
                    window.location.href = '../login.html';
                }, 2000);
                return;
            }

            // Store user data in localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                ...userData
            }));

            // Display user name in navbar
            const userNameDisplay = document.getElementById('userNameDisplay');
            if (userNameDisplay) {
                userNameDisplay.textContent = userData.fullName;
            }

        } catch (error) {
            console.error('Auth check error:', error);
            showToast('Error verifying authentication', 'error');
        }
    });
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 */
async function updateUserProfile(userId, updateData) {
    try {
        // Add updated timestamp
        updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

        await db.collection('users').doc(userId).update(updateData);

        // Update current user in localStorage if it's the same user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.uid === userId) {
            const updatedUser = { ...currentUser, ...updateData };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }

        showToast('Profile updated successfully', 'success');

    } catch (error) {
        console.error('Profile update error:', error);
        showToast('Failed to update profile', 'error');
        throw error;
    }
}

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
async function changePassword(currentPassword, newPassword) {
    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error('No user logged in');
        }

        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        await user.reauthenticateWithCredential(credential);

        // Update password
        await user.updatePassword(newPassword);

        // Log the action
        await logAction('password_change', `Password changed for user: ${user.email}`);

        showToast('Password changed successfully', 'success');

    } catch (error) {
        console.error('Password change error:', error);
        showToast('Failed to change password. Please check your current password.', 'error');
        throw error;
    }
}

/**
 * Request password reset
 * @param {string} email - User email
 */
async function requestPasswordReset(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        showToast('Password reset email sent. Please check your inbox.', 'success');
    } catch (error) {
        console.error('Password reset error:', error);
        showToast('Failed to send password reset email', 'error');
        throw error;
    }
}

// Authentication handler for login and register

// Check if user is already logged in
firebase.auth().onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('login.html')) {
        checkUserRoleAndRedirect(user.uid);
    }
});

// Login Form Handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const selectedRole = document.getElementById('role').value;

        if (!selectedRole) {
            showToast('Please select a role!', 'error');
            return;
        }

        try {
            // Sign in with Firebase Auth
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Get user data from Firestore
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();

            if (!userDoc.exists) {
                await firebase.auth().signOut();
                showToast('User profile not found!', 'error');
                return;
            }

            const userData = userDoc.data();

            // Verify role matches
            if (userData.role !== selectedRole) {
                await firebase.auth().signOut();
                showToast(`This account is registered as ${userData.role}, not ${selectedRole}!`, 'error');
                return;
            }

            // Check if teacher is approved
            if (userData.role === 'teacher' && !userData.approved) {
                await firebase.auth().signOut();
                showToast('Your account is pending admin approval!', 'warning');
                return;
            }

            // Log the login
            if (typeof logAction === 'function') {
                await logAction('login', `${userData.role} logged in: ${userData.fullName}`);
            }

            showToast('Login successful!', 'success');

            // Redirect based on role
            setTimeout(() => {
                switch (userData.role) {
                    case 'admin':
                        window.location.href = 'admin/dashboard.html';
                        break;
                    case 'teacher':
                        window.location.href = 'teacher/dashboard.html';
                        break;
                    case 'student':
                        window.location.href = 'student/dashboard.html';
                        break;
                    default:
                        window.location.href = 'index.html';
                }
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                showToast('Invalid email or password!', 'error');
            } else {
                showToast(error.message, 'error');
            }
        }
    });
}

// Helper function to check user role and redirect
async function checkUserRoleAndRedirect(uid) {
    try {
        const userDoc = await firebase.firestore().collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            switch (userData.role) {
                case 'admin':
                    window.location.href = 'admin/dashboard.html';
                    break;
                case 'teacher':
                    window.location.href = 'teacher/dashboard.html';
                    break;
                case 'student':
                    window.location.href = 'student/dashboard.html';
                    break;
            }
        }
    } catch (error) {
        console.error('Error checking user role:', error);
    }
}

console.log('Authentication module loaded (REAL FIREBASE MODE)');
