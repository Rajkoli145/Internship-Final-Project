/**
 * Appointment Management Module - REAL FIREBASE MODE
 * Handles all appointment-related operations with Firestore
 */

/**
 * Book a new appointment
 * @param {string} teacherId - Teacher's user ID
 * @param {string} date - Appointment date
 * @param {string} time - Appointment time
 * @param {string} reason - Reason for appointment
 */
async function bookAppointment(teacherId, date, time, reason) {
    try {
        const currentUser = getCurrentUser();

        if (!currentUser || currentUser.role !== 'student') {
            showToast('Only students can book appointments', 'error');
            return;
        }

        // Get teacher details from Firestore
        const teacherDoc = await db.collection('users').doc(teacherId).get();

        if (!teacherDoc.exists) {
            showToast('Teacher not found', 'error');
            return;
        }

        const teacherData = teacherDoc.data();

        // Create appointment in Firestore
        const appointmentData = {
            studentId: currentUser.uid,
            studentName: currentUser.fullName,
            studentEmail: currentUser.email,
            teacherId: teacherId,
            teacherName: teacherData.fullName,
            teacherEmail: teacherData.email,
            teacherSubject: teacherData.subject || 'N/A',
            date: date,
            time: time,
            reason: reason,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('appointments').add(appointmentData);

        // Log the action
        await logAction('appointment', `Appointment booked: ${currentUser.fullName} with ${teacherData.fullName}`);

        showToast('Appointment booked successfully! Waiting for teacher approval.', 'success');

        // Reload appointments
        setTimeout(() => {
            loadStudentAppointments();
        }, 1000);

    } catch (error) {
        console.error('Book appointment error:', error);
        showToast('Failed to book appointment', 'error');
        throw error;
    }
}

/**
 * Approve an appointment (Teacher only)
 * @param {string} appointmentId - Appointment ID
 */
async function approveAppointment(appointmentId) {
    try {
        const currentUser = getCurrentUser();

        if (!currentUser || currentUser.role !== 'teacher') {
            showToast('Only teachers can approve appointments', 'error');
            return;
        }

        await db.collection('appointments').doc(appointmentId).update({
            status: 'approved',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Log the action
        await logAction('appointment', `Appointment approved by ${currentUser.fullName}`);

        showToast('Appointment approved successfully', 'success');

        // Reload appointments
        loadTeacherAppointments('all');
        loadTeacherOverview();

    } catch (error) {
        console.error('Approve appointment error:', error);
        showToast('Failed to approve appointment', 'error');
        throw error;
    }
}

/**
 * Cancel an appointment
 * @param {string} appointmentId - Appointment ID
 */
async function cancelAppointment(appointmentId) {
    try {
        const currentUser = getCurrentUser();

        await db.collection('appointments').doc(appointmentId).update({
            status: 'cancelled',
            cancelledAt: firebase.firestore.FieldValue.serverTimestamp(),
            cancelledBy: currentUser.uid
        });

        // Log the action
        await logAction('appointment', `Appointment cancelled by ${currentUser.fullName}`);

        showToast('Appointment cancelled', 'success');

        // Reload appointments based on user type
        if (currentUser.role === 'student') {
            loadStudentAppointments();
        } else if (currentUser.role === 'teacher') {
            loadTeacherAppointments('all');
            loadTeacherOverview();
        }

    } catch (error) {
        console.error('Cancel appointment error:', error);
        showToast('Failed to cancel appointment', 'error');
        throw error;
    }
}

/**
 * Load appointments for student
 */
async function loadStudentAppointments() {
    try {
        const currentUser = getCurrentUser();
        const appointmentsList = document.getElementById('appointmentsList');

        if (!appointmentsList) return;

        // Show loading state
        appointmentsList.innerHTML = '<p class="text-muted">Loading appointments...</p>';

        // Get student's appointments from Firestore
        const snapshot = await db.collection('appointments')
            .where('studentId', '==', currentUser.uid)
            .get();

        if (snapshot.empty) {
            appointmentsList.innerHTML = `
                <div class="empty-state">
                    <p>No appointments found</p>
                    <p class="text-muted">Book your first appointment with a teacher</p>
                </div>
            `;
            return;
        }

        // Map and sort appointments by createdAt in JavaScript
        const appointments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA; // desc order
        });

        appointmentsList.innerHTML = appointments.map(apt => `
            <div class="appointment-card">
                <div class="appointment-header">
                    <h3 class="appointment-title">${apt.teacherName}</h3>
                    <span class="appointment-status status-${apt.status}">${apt.status}</span>
                </div>
                <div class="appointment-details">
                    <div class="appointment-detail">
                        <span class="appointment-detail-label">Subject</span>
                        <span class="appointment-detail-value">${apt.teacherSubject}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="appointment-detail-label">Date</span>
                        <span class="appointment-detail-value">${formatDate(apt.date)}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="appointment-detail-label">Time</span>
                        <span class="appointment-detail-value">${formatTime12Hour(apt.time)}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="appointment-detail-label">Status</span>
                        <span class="appointment-detail-value">${apt.status.toUpperCase()}</span>
                    </div>
                </div>
                <div class="appointment-details">
                    <div class="appointment-detail">
                        <span class="appointment-detail-label">Reason</span>
                        <span class="appointment-detail-value">${apt.reason}</span>
                    </div>
                </div>
                ${apt.status === 'pending' ? `
                    <div class="appointment-actions">
                        <button class="btn btn-danger btn-small" onclick="cancelAppointment('${apt.id}')">
                            Cancel Appointment
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');

    } catch (error) {
        console.error('Load student appointments error:', error);
        const appointmentsList = document.getElementById('appointmentsList');
        if (appointmentsList) {
            appointmentsList.innerHTML = '<p class="text-muted">Error loading appointments</p>';
        }
        showToast('Failed to load appointments', 'error');
    }
}

/**
 * Load appointments for teacher
 * @param {string} filter - Filter by status (all/pending/approved/cancelled)
 */
async function loadTeacherAppointments(filter = 'all') {
    try {
        const currentUser = getCurrentUser();
        const appointmentsList = document.getElementById('appointmentsList');

        if (!appointmentsList) return;

        // Show loading state
        appointmentsList.innerHTML = '<p class="text-muted">Loading appointments...</p>';

        if (!currentUser) {
            appointmentsList.innerHTML = '<p class="text-muted">Please login to view appointments</p>';
            return;
        }

        // Build query
        const snapshot = await db.collection('appointments')
            .where('teacherId', '==', currentUser.uid)
            .get();

        if (snapshot.empty) {
            appointmentsList.innerHTML = `
                <div class="empty-state">
                    <p>No ${filter !== 'all' ? filter : ''} appointments found</p>
                </div>
            `;
            return;
        }

        let appointments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filter by status in JavaScript
        if (filter !== 'all') {
            appointments = appointments.filter(apt => apt.status === filter);
        }

        // Sort by createdAt in JavaScript
        appointments.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        appointmentsList.innerHTML = appointments.map(apt => `
            <div class="appointment-card">
                <div class="appointment-header">
                    <h3 class="appointment-title">${apt.studentName}</h3>
                    <span class="appointment-status status-${apt.status}">${apt.status}</span>
                </div>
                <div class="appointment-details">
                    <div class="appointment-detail">
                        <span class="appointment-detail-label">Student Email</span>
                        <span class="appointment-detail-value">${apt.studentEmail}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="appointment-detail-label">Date</span>
                        <span class="appointment-detail-value">${formatDate(apt.date)}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="appointment-detail-label">Time</span>
                        <span class="appointment-detail-value">${formatTime12Hour(apt.time)}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="appointment-detail-label">Booked On</span>
                        <span class="appointment-detail-value">${formatDateTime(apt.createdAt)}</span>
                    </div>
                </div>
                <div class="appointment-details">
                    <div class="appointment-detail">
                        <span class="appointment-detail-label">Reason</span>
                        <span class="appointment-detail-value">${apt.reason}</span>
                    </div>
                </div>
                ${apt.status === 'pending' ? `
                    <div class="appointment-actions">
                        <button class="btn btn-success btn-small" onclick="approveAppointment('${apt.id}')">
                            Approve
                        </button>
                        <button class="btn btn-danger btn-small" onclick="cancelAppointment('${apt.id}')">
                            Reject
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');

    } catch (error) {
        console.error('Load teacher appointments error:', error);
        const appointmentsList = document.getElementById('appointmentsList');
        if (appointmentsList) {
            appointmentsList.innerHTML = '<p class="text-muted">Error loading appointments</p>';
        }
        showToast('Failed to load appointments', 'error');
    }
}

/**
 * Load teacher overview statistics
 */
async function loadTeacherOverview() {
    try {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            console.error('No user logged in');
            showToast('Please login to view overview', 'error');
            return;
        }

        // Get all appointments for this teacher
        const snapshot = await db.collection('appointments')
            .where('teacherId', '==', currentUser.uid)
            .get();

        const appointments = snapshot.docs.map(doc => doc.data());

        // Calculate statistics
        const total = appointments.length;
        const pending = appointments.filter(apt => apt.status === 'pending').length;
        const approved = appointments.filter(apt => apt.status === 'approved').length;

        // Get messages count
        const messagesSnapshot = await db.collection('messages')
            .where('teacherId', '==', currentUser.uid)
            .get();
        const messagesCount = messagesSnapshot.size;

        // Update stats
        const totalEl = document.getElementById('totalAppointments');
        const pendingEl = document.getElementById('pendingAppointments');
        const approvedEl = document.getElementById('approvedAppointments');
        const messagesEl = document.getElementById('totalMessages');

        if (totalEl) totalEl.textContent = total;
        if (pendingEl) pendingEl.textContent = pending;
        if (approvedEl) approvedEl.textContent = approved;
        if (messagesEl) messagesEl.textContent = messagesCount;

        // Load recent appointments
        const recentAppointments = appointments
            .sort((a, b) => {
                const aTime = a.createdAt?.seconds || 0;
                const bTime = b.createdAt?.seconds || 0;
                return bTime - aTime;
            })
            .slice(0, 5);

        const recentContainer = document.getElementById('recentAppointments');
        if (recentContainer) {
            if (recentAppointments.length === 0) {
                recentContainer.innerHTML = '<p class="text-muted">No recent appointments</p>';
            } else {
                recentContainer.innerHTML = recentAppointments.map(apt => `
                    <div class="appointment-card">
                        <div class="appointment-header">
                            <h4 class="appointment-title">${apt.studentName}</h4>
                            <span class="appointment-status status-${apt.status}">${apt.status}</span>
                        </div>
                        <div class="appointment-details">
                            <div class="appointment-detail">
                                <span class="appointment-detail-label">Date</span>
                                <span class="appointment-detail-value">${formatDate(apt.date)} at ${formatTime12Hour(apt.time)}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

    } catch (error) {
        console.error('Load teacher overview error:', error);
    }
}

console.log('Appointment module loaded (REAL FIREBASE MODE)');
