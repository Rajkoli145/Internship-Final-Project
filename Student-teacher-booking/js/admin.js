/**
 * Admin Management Module - REAL FIREBASE MODE
 * Handles all admin operations with Firestore
 */

/**
 * Load admin overview statistics
 */
async function loadAdminOverview() {
    try {
        // Get all users from Firestore
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => doc.data());

        // Calculate statistics
        const teachers = users.filter(u => u.role === 'teacher');
        const students = users.filter(u => u.role === 'student');
        const pendingUsers = users.filter(u => !u.approved && u.role === 'teacher');

        // Get appointments
        const appointmentsSnapshot = await db.collection('appointments').get();
        const appointments = appointmentsSnapshot.size;

        // Update stats
        const totalTeachersEl = document.getElementById('totalTeachers');
        const totalStudentsEl = document.getElementById('totalStudents');
        const totalAppointmentsEl = document.getElementById('totalAppointments');
        const pendingEl = document.getElementById('pendingRegistrations');

        if (totalTeachersEl) totalTeachersEl.textContent = teachers.length;
        if (totalStudentsEl) totalStudentsEl.textContent = students.length;
        if (totalAppointmentsEl) totalAppointmentsEl.textContent = appointments;
        if (pendingEl) pendingEl.textContent = pendingUsers.length;

        // Load recent activity
        await loadRecentActivity();

    } catch (error) {
        console.error('Load admin overview error:', error);
    }
}

/**
 * Load recent activity
 */
async function loadRecentActivity() {
    try {
        const recentActivity = document.getElementById('recentActivity');
        if (!recentActivity) return;

        const logsSnapshot = await db.collection('logs')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        if (logsSnapshot.empty) {
            recentActivity.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>No recent activity</p></div>';
            return;
        }

        const logs = logsSnapshot.docs.map(doc => doc.data());

        recentActivity.innerHTML = logs.map(log => `
            <div class="activity-item">
                <div class="activity-icon">\ud83d\udcdd</div>
                <div class="activity-content">
                    <p>${log.action}</p>
                    <div class="activity-time">${formatDateTime(log.timestamp)}</div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Load recent activity error:', error);
    }
}

/**
 * Add a new teacher (Admin only)
 * @param {Object} teacherData - Teacher information
 */
async function addTeacher(teacherData) {
    try {
        // Create authentication user with Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(
            teacherData.email,
            teacherData.password
        );

        const user = userCredential.user;

        // Prepare teacher data for Firestore
        const userData = {
            uid: user.uid,
            email: teacherData.email,
            fullName: teacherData.name,
            phone: teacherData.phone,
            teacherDepartment: teacherData.department,
            subject: teacherData.subject,
            experience: parseInt(teacherData.experience),
            role: 'teacher',
            approved: true, // Auto-approve when added by admin
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Save to Firestore users collection
        await db.collection('users').doc(user.uid).set(userData);

        // Also add to teachers collection for easier querying
        await db.collection('teachers').doc(user.uid).set({
            name: teacherData.name,
            email: teacherData.email,
            department: teacherData.department,
            subject: teacherData.subject,
            experience: parseInt(teacherData.experience),
            approved: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Log the action
        const currentUser = getCurrentUser();
        await logAction('teacher', `Teacher added: ${teacherData.name} by ${currentUser.fullName}`);

        showToast('Teacher added successfully', 'success');

        // Reload teachers list
        loadTeachersData();
        loadAdminOverview();

    } catch (error) {
        console.error('Add teacher error:', error);
        let errorMessage = 'Failed to add teacher';

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email already in use';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters';
        }

        showToast(errorMessage, 'error');
        throw error;
    }
}

/**
 * Update teacher information
 * @param {string} teacherId - Teacher ID
 * @param {Object} teacherData - Updated teacher information
 */
async function updateTeacher(teacherId, teacherData) {
    try {
        const updateData = {
            fullName: teacherData.name,
            email: teacherData.email,
            phone: teacherData.phone,
            department: teacherData.department,
            subject: teacherData.subject,
            experience: parseInt(teacherData.experience),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Update in users collection
        await db.collection('users').doc(teacherId).update(updateData);

        // Update in teachers collection
        const teacherUpdateData = {
            name: teacherData.name,
            email: teacherData.email,
            department: teacherData.department,
            subject: teacherData.subject,
            experience: parseInt(teacherData.experience),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('teachers').doc(teacherId).update(teacherUpdateData);

        // Log the action
        const currentUser = getCurrentUser();
        await logAction('teacher', `Teacher updated: ${teacherData.name} by ${currentUser.fullName}`);

        showToast('Teacher updated successfully', 'success');

        // Reload teachers list
        loadTeachersData();

    } catch (error) {
        console.error('Update teacher error:', error);
        showToast('Failed to update teacher', 'error');
        throw error;
    }
}

/**
 * Delete a teacher
 * @param {string} teacherId - Teacher ID
 */
async function deleteTeacher(teacherId) {
    try {
        if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
            return;
        }

        // Get teacher data before deleting
        const teacherDoc = await db.collection('users').doc(teacherId).get();
        const teacherData = teacherDoc.data();

        // Delete from users collection
        await db.collection('users').doc(teacherId).delete();

        // Delete from teachers collection
        await db.collection('teachers').doc(teacherId).delete();

        // Note: Firebase Auth user deletion requires admin SDK or user re-authentication
        // For now, we'll just delete from Firestore

        // Log the action
        const currentUser = getCurrentUser();
        await logAction('teacher', `Teacher deleted: ${teacherData.fullName} by ${currentUser.fullName}`);

        showToast('Teacher deleted successfully', 'success');

        // Reload teachers list
        loadTeachersData();
        loadAdminOverview();

    } catch (error) {
        console.error('Delete teacher error:', error);
        showToast('Failed to delete teacher', 'error');
    }
}

/**
 * Load all teachers for admin
 */
async function loadTeachersData() {
    try {
        const teachersTable = document.getElementById('teachersTable');
        if (!teachersTable) return;

        // Show loading state
        teachersTable.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

        const snapshot = await db.collection('users')
            .where('role', '==', 'teacher')
            .get();

        if (snapshot.empty) {
            teachersTable.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👨‍🏫</div><p>No teachers found</p></div>';
            return;
        }

        const teachers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        teachersTable.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Subject</th>
                        <th>Experience</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${teachers.map(teacher => `
                        <tr>
                            <td>${teacher.fullName}</td>
                            <td>${teacher.email}</td>
                            <td>${teacher.teacherDepartment || 'N/A'}</td>
                            <td>${teacher.subject || 'N/A'}</td>
                            <td>${teacher.experience || 0} years</td>
                            <td><span class="status-badge ${teacher.approved ? 'status-approved' : 'status-pending'}">${teacher.approved ? 'Approved' : 'Pending'}</span></td>
                            <td>
                                ${!teacher.approved ? `
                                    <button class="action-btn approve" onclick="approveTeacher('${teacher.id}')">Approve</button>
                                    <button class="action-btn reject" onclick="rejectTeacher('${teacher.id}')">Reject</button>
                                ` : `
                                    <button class="action-btn edit" onclick="editTeacher('${teacher.id}')">Edit</button>
                                    <button class="action-btn delete" onclick="deleteTeacher('${teacher.id}')">Delete</button>
                                `}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('Load teachers data error:', error);
        const teachersTable = document.getElementById('teachersTable');
        if (teachersTable) {
            teachersTable.innerHTML = '<p class="text-muted">Error loading teachers</p>';
        }
        showToast('Failed to load teachers', 'error');
    }
}

/**
 * Edit teacher
 * @param {string} teacherId - Teacher ID
 */
async function editTeacher(teacherId) {
    try {
        const teacherDoc = await db.collection('users').doc(teacherId).get();

        if (!teacherDoc.exists) {
            showToast('Teacher not found', 'error');
            return;
        }

        const teacher = teacherDoc.data();

        // Populate form
        document.getElementById('teacherId').value = teacherId;
        document.getElementById('teacherName').value = teacher.fullName;
        document.getElementById('teacherEmail').value = teacher.email;
        document.getElementById('teacherPhone').value = teacher.phone || '';
        document.getElementById('teacherDepartment').value = teacher.teacherDepartment || '';
        document.getElementById('teacherSubject').value = teacher.subject || '';
        document.getElementById('teacherExperience').value = teacher.experience || 0;

        // Make password optional for edit
        document.getElementById('teacherPassword').required = false;

        // Update modal title
        document.getElementById('teacherModalTitle').textContent = 'Edit Teacher';

        // Show modal
        document.getElementById('teacherModal').style.display = 'block';

    } catch (error) {
        console.error('Edit teacher error:', error);
        showToast('Failed to load teacher data', 'error');
    }
}

/**
 * Approve teacher
 * @param {string} teacherId - Teacher ID
 */
async function approveTeacher(teacherId) {
    try {
        await db.collection('users').doc(teacherId).update({
            approved: true,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Log the action
        const currentUser = getCurrentUser();
        await logAction('approval', `Teacher approved by ${currentUser.fullName}`);

        showToast('Teacher approved successfully', 'success');

        // Reload teachers
        loadTeachersData();
        loadAdminOverview();

    } catch (error) {
        console.error('Approve teacher error:', error);
        showToast('Failed to approve teacher', 'error');
    }
}

/**
 * Reject teacher
 * @param {string} teacherId - Teacher ID
 */
async function rejectTeacher(teacherId) {
    try {
        if (!confirm('Are you sure you want to reject this teacher registration?')) {
            return;
        }

        // Get teacher data before deleting
        const teacherDoc = await db.collection('users').doc(teacherId).get();
        const teacherData = teacherDoc.data();

        // Delete from Firestore
        await db.collection('users').doc(teacherId).delete();

        // Log the action
        const currentUser = getCurrentUser();
        await logAction('rejection', `Teacher registration rejected: ${teacherData.fullName} by ${currentUser.fullName}`);

        showToast('Teacher registration rejected', 'success');

        // Reload teachers
        loadTeachersData();
        loadAdminOverview();

    } catch (error) {
        console.error('Reject teacher error:', error);
        showToast('Failed to reject teacher', 'error');
    }
}

/**
 * Search teachers
 * @param {string} query - Search query
 */
function searchTeachers(query) {
    const rows = document.querySelectorAll('#teachersTable tbody tr');
    const searchLower = query.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchLower) ? '' : 'none';
    });
}

/**
 * Load students with filter
 * @param {string} filter - Filter by status (all/pending/approved)
 */
async function loadStudents(filter = 'all') {
    try {
        const studentsTable = document.getElementById('studentsTable');
        if (!studentsTable) return;

        // Show loading state
        studentsTable.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

        // Get all students
        const snapshot = await db.collection('users').where('role', '==', 'student').get();

        if (snapshot.empty) {
            studentsTable.innerHTML = `<div class="empty-state"><div class="empty-state-icon">👨‍🎓</div><p>No students found</p></div>`;
            return;
        }

        let students = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Apply filter in JavaScript
        if (filter === 'pending') {
            students = students.filter(s => !s.approved);
        } else if (filter === 'approved') {
            students = students.filter(s => s.approved);
        }

        if (students.length === 0) {
            studentsTable.innerHTML = `<div class="empty-state"><div class="empty-state-icon">👨‍🎓</div><p>No ${filter} students found</p></div>`;
            return;
        }

        studentsTable.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Student ID</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => `
                        <tr>
                            <td>${student.fullName}</td>
                            <td>${student.email}</td>
                            <td>${student.studentId || 'N/A'}</td>
                            <td>${student.course || 'N/A'}</td>
                            <td><span class="status-badge ${student.approved ? 'status-approved' : 'status-pending'}">${student.approved ? 'Approved' : 'Pending'}</span></td>
                            <td>
                                ${!student.approved ? `
                                    <button class="action-btn approve" onclick="approveStudent('${student.id}')">Approve</button>
                                    <button class="action-btn reject" onclick="rejectStudent('${student.id}')">Reject</button>
                                ` : `
                                    <button class="action-btn delete" onclick="deleteStudent('${student.id}')">Delete</button>
                                `}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('Load students error:', error);
        const studentsTable = document.getElementById('studentsTable');
        if (studentsTable) {
            studentsTable.innerHTML = '<p class="text-muted">Error loading students</p>';
        }
        showToast('Failed to load students', 'error');
    }
}

/**
 * Approve student registration
 * @param {string} studentId - Student ID
 */
async function approveStudent(studentId) {
    try {
        await db.collection('users').doc(studentId).update({
            approved: true,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Log the action
        const currentUser = getCurrentUser();
        await logAction('approval', `Student approved by ${currentUser.fullName}`);

        showToast('Student approved successfully', 'success');

        // Reload students with current filter
        const activeTab = document.querySelector('.tab-btn.active');
        const currentFilter = activeTab ? activeTab.dataset.filter : 'all';
        loadStudents(currentFilter);
        loadAdminOverview();

    } catch (error) {
        console.error('Approve student error:', error);
        showToast('Failed to approve student', 'error');
    }
}

/**
 * Reject student registration
 * @param {string} studentId - Student ID
 */
async function rejectStudent(studentId) {
    try {
        if (!confirm('Are you sure you want to reject this student registration?')) {
            return;
        }

        // Delete from Firestore
        await db.collection('users').doc(studentId).delete();

        // Log the action
        const currentUser = getCurrentUser();
        await logAction('rejection', `Student registration rejected by ${currentUser.fullName}`);

        showToast('Student registration rejected', 'success');

        // Reload students with current filter
        const activeTab = document.querySelector('.tab-btn.active');
        const currentFilter = activeTab ? activeTab.dataset.filter : 'all';
        loadStudents(currentFilter);
        loadAdminOverview();

    } catch (error) {
        console.error('Reject student error:', error);
        showToast('Failed to reject student', 'error');
    }
}

/**
 * Delete student
 * @param {string} studentId - Student ID
 */
async function deleteStudent(studentId) {
    try {
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            return;
        }

        await db.collection('users').doc(studentId).delete();

        // Log the action
        const currentUser = getCurrentUser();
        await logAction('deletion', `Student deleted by ${currentUser.fullName}`);

        showToast('Student deleted successfully', 'success');

        // Reload students
        loadStudents('all');
        loadAdminOverview();

    } catch (error) {
        console.error('Delete student error:', error);
        showToast('Failed to delete student', 'error');
    }
}

/**
 * Search students
 * @param {string} query - Search query
 */
function searchStudents(query) {
    const rows = document.querySelectorAll('#studentsTable tbody tr');
    const searchLower = query.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchLower) ? '' : 'none';
    });
}

/**
 * Load all appointments for admin
 * @param {string} filter - Filter by status
 */
async function loadAllAppointments(filter = 'all') {
    try {
        const appointmentsTable = document.getElementById('appointmentsTable');
        if (!appointmentsTable) return;

        // Show loading state
        appointmentsTable.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

        // Build query - Remove orderBy to avoid index requirement
        let query = db.collection('appointments');

        const snapshot = await query.get();

        if (snapshot.empty) {
            appointmentsTable.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div><p>No appointments found</p></div>`;
            return;
        }

        let appointments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filter by status if not 'all'
        if (filter !== 'all') {
            appointments = appointments.filter(apt => apt.status === filter);
        }

        // Sort by createdAt in JavaScript
        appointments.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        appointmentsTable.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Teacher</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Booked On</th>
                    </tr>
                </thead>
                <tbody>
                    ${appointments.map(apt => `
                        <tr>
                            <td>${apt.studentName}</td>
                            <td>${apt.teacherName}</td>
                            <td>${formatDate(apt.date)}</td>
                            <td>${formatTime12Hour(apt.time)}</td>
                            <td>${apt.reason || 'N/A'}</td>
                            <td><span class="status-badge status-${apt.status}">${apt.status}</span></td>
                            <td>${formatDateTime(apt.createdAt)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('Load all appointments error:', error);
        const appointmentsTable = document.getElementById('appointmentsTable');
        if (appointmentsTable) {
            appointmentsTable.innerHTML = '<p class="text-muted">Error loading appointments</p>';
        }
        showToast('Failed to load appointments', 'error');
    }
}

console.log('Admin module loaded (REAL FIREBASE MODE)');
