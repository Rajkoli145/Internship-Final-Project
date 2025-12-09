/**
 * Teacher Management Module - REAL FIREBASE MODE
 * Handles teacher-related operations with Firestore
 */

/**
 * Load and display all teachers for students
 */
async function loadTeachers() {
    try {
        const teachersGrid = document.getElementById('teachersGrid');
        if (!teachersGrid) return;

        // Show loading state
        teachersGrid.innerHTML = '<p class="text-muted">Loading teachers...</p>';

        // Get search filters
        const nameFilter = document.getElementById('searchName')?.value.toLowerCase() || '';
        const subjectFilter = document.getElementById('searchSubject')?.value.toLowerCase() || '';
        const departmentFilter = document.getElementById('searchDepartment')?.value.toLowerCase() || '';

        // Get all approved teachers from Firestore
        const snapshot = await db.collection('users')
            .where('role', '==', 'teacher')
            .where('approved', '==', true)
            .get();

        let teachers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Apply client-side filters
        if (nameFilter) {
            teachers = teachers.filter(t =>
                t.fullName.toLowerCase().includes(nameFilter)
            );
        }
        if (subjectFilter) {
            teachers = teachers.filter(t =>
                t.subject && t.subject.toLowerCase().includes(subjectFilter)
            );
        }
        if (departmentFilter) {
            teachers = teachers.filter(t =>
                t.department && t.department.toLowerCase().includes(departmentFilter)
            );
        }

        if (teachers.length === 0) {
            teachersGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <p>No teachers found</p>
                    <p class="text-muted">Try adjusting your search filters</p>
                </div>
            `;
            return;
        }

        teachersGrid.innerHTML = teachers.map(teacher => `
            <div class="teacher-card">
                <div class="teacher-header">
                    <div class="teacher-avatar">${getInitials(teacher.fullName)}</div>
                    <div class="teacher-info">
                        <h3>${teacher.fullName}</h3>
                        <p>${teacher.subject || 'N/A'}</p>
                    </div>
                </div>
                <div class="teacher-details">
                    <div class="teacher-detail-item">
                        <span>Department</span>
                        <span>${teacher.department || 'N/A'}</span>
                    </div>
                    <div class="teacher-detail-item">
                        <span>Experience</span>
                        <span>${teacher.experience || 0} years</span>
                    </div>
                    <div class="teacher-detail-item">
                        <span>Email</span>
                        <span>${teacher.email}</span>
                    </div>
                </div>
                <div class="teacher-actions">
                    <button class="btn btn-primary" onclick="openBookAppointmentModal('${teacher.id}', '${teacher.fullName}')">
                        Book Appointment
                    </button>
                    <button class="btn btn-secondary" onclick="openSendMessageModal('${teacher.id}', '${teacher.fullName}')">
                        Send Message
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Load teachers error:', error);
        const teachersGrid = document.getElementById('teachersGrid');
        if (teachersGrid) {
            teachersGrid.innerHTML = '<p class="text-muted">Error loading teachers</p>';
        }
        showToast('Failed to load teachers', 'error');
    }
}

/**
 * Open book appointment modal
 * @param {string} teacherId - Teacher ID
 * @param {string} teacherName - Teacher name
 */
function openBookAppointmentModal(teacherId, teacherName) {
    const modal = document.getElementById('bookAppointmentModal');
    document.getElementById('selectedTeacherId').value = teacherId;
    document.getElementById('selectedTeacherName').value = teacherName;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;

    modal.classList.add('active');
}

/**
 * Open send message modal
 * @param {string} teacherId - Teacher ID
 * @param {string} teacherName - Teacher name
 */
function openSendMessageModal(teacherId, teacherName) {
    const modal = document.getElementById('sendMessageModal');
    document.getElementById('messageTeacherId').value = teacherId;
    document.getElementById('messageTeacherName').value = teacherName;
    modal.classList.add('active');
}

/**
 * Send message to teacher
 * @param {string} teacherId - Teacher ID
 * @param {string} subject - Message subject
 * @param {string} content - Message content
 */
async function sendMessage(teacherId, subject, content) {
    try {
        const currentUser = getCurrentUser();

        // Get teacher details from Firestore
        const teacherDoc = await db.collection('users').doc(teacherId).get();

        if (!teacherDoc.exists) {
            showToast('Teacher not found', 'error');
            return;
        }

        const teacherData = teacherDoc.data();

        const messageData = {
            senderId: currentUser.uid,
            senderName: currentUser.fullName,
            senderEmail: currentUser.email,
            senderType: currentUser.role,
            teacherId: teacherId,
            teacherName: teacherData.fullName,
            subject: subject,
            content: content,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('messages').add(messageData);

        // Log the action
        await logAction('message', `Message sent from ${currentUser.fullName} to ${teacherData.fullName}`);

        showToast('Message sent successfully', 'success');

    } catch (error) {
        console.error('Send message error:', error);
        showToast('Failed to send message', 'error');
        throw error;
    }
}

/**
 * Load messages for student
 */
async function loadStudentMessages() {
    try {
        const currentUser = getCurrentUser();
        const messagesList = document.getElementById('messagesList');

        if (!messagesList) return;

        // Show loading state
        messagesList.innerHTML = '<p class="text-muted">Loading messages...</p>';

        const snapshot = await db.collection('messages')
            .where('senderId', '==', currentUser.uid)
            .get();

        if (snapshot.empty) {
            messagesList.innerHTML = `
                <div class="empty-state">
                    <p>No messages found</p>
                    <p class="text-muted">Send a message to a teacher to get started</p>
                </div>
            `;
            return;
        }

        // Map and sort messages by createdAt in JavaScript
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA; // desc order
        });

        messagesList.innerHTML = messages.map(msg => `
            <div class="message-card">
                <div class="message-header">
                    <span class="message-from">To: ${msg.teacherName}</span>
                    <span class="message-date">${formatDateTime(msg.createdAt)}</span>
                </div>
                <div class="message-subject">${msg.subject}</div>
                <div class="message-content">${msg.content}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Load student messages error:', error);
        const messagesList = document.getElementById('messagesList');
        if (messagesList) {
            messagesList.innerHTML = '<p class="text-muted">Error loading messages</p>';
        }
        showToast('Failed to load messages', 'error');
    }
}

/**
 * Load messages for teacher
 */
async function loadTeacherMessages() {
    try {
        const currentUser = getCurrentUser();
        const messagesList = document.getElementById('messagesList');

        if (!messagesList) return;

        // Show loading state
        messagesList.innerHTML = '<p class="text-muted">Loading messages...</p>';

        const snapshot = await db.collection('messages')
            .where('teacherId', '==', currentUser.uid)
            .get();

        if (snapshot.empty) {
            messagesList.innerHTML = `
                <div class="empty-state">
                    <p>No messages found</p>
                </div>
            `;
            return;
        }

        let messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort by createdAt in JavaScript
        messages.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        messagesList.innerHTML = messages.map(msg => `
            <div class="message-card">
                <div class="message-header">
                    <span class="message-from">From: ${msg.senderName} (${msg.senderEmail})</span>
                    <span class="message-date">${formatDateTime(msg.createdAt)}</span>
                </div>
                <div class="message-subject">${msg.subject}</div>
                <div class="message-content">${msg.content}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Load teacher messages error:', error);
        const messagesList = document.getElementById('messagesList');
        if (messagesList) {
            messagesList.innerHTML = '<p class="text-muted">Error loading messages</p>';
        }
        showToast('Failed to load messages', 'error');
    }
}

/**
 * Add teacher schedule/availability
 * @param {string} date - Schedule date
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @param {string} notes - Optional notes
 */
async function addTeacherSchedule(date, startTime, endTime, notes) {
    try {
        const currentUser = getCurrentUser();

        const scheduleData = {
            teacherId: currentUser.uid,
            teacherName: currentUser.fullName,
            date: date,
            startTime: startTime,
            endTime: endTime,
            notes: notes || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('schedules').add(scheduleData);

        showToast('Schedule added successfully', 'success');

        // Reload schedule
        loadTeacherSchedule();

    } catch (error) {
        console.error('Add schedule error:', error);
        showToast('Failed to add schedule', 'error');
        throw error;
    }
}

/**
 * Load teacher schedule
 */
async function loadTeacherSchedule() {
    try {
        const currentUser = getCurrentUser();
        const scheduleList = document.getElementById('scheduleList');

        if (!scheduleList) return;

        // Show loading state
        scheduleList.innerHTML = '<p class="text-muted">Loading schedule...</p>';

        const snapshot = await db.collection('schedules')
            .where('teacherId', '==', currentUser.uid)
            .get();

        if (snapshot.empty) {
            scheduleList.innerHTML = `
                <div class="empty-state">
                    <p>No schedule added yet</p>
                    <p class="text-muted">Add your availability to let students know when you're free</p>
                </div>
            `;
            return;
        }

        let schedules = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort by date in JavaScript
        schedules.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        scheduleList.innerHTML = schedules.map(schedule => `
            <div class="schedule-card">
                <div class="schedule-info">
                    <h4>${formatDate(schedule.date)}</h4>
                    <p class="schedule-time">${formatTime12Hour(schedule.startTime)} - ${formatTime12Hour(schedule.endTime)}</p>
                    ${schedule.notes ? `<p class="text-muted">${schedule.notes}</p>` : ''}
                </div>
                <div class="schedule-actions">
                    <button class="btn btn-danger btn-small" onclick="deleteSchedule('${schedule.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Load schedule error:', error);
        const scheduleList = document.getElementById('scheduleList');
        if (scheduleList) {
            scheduleList.innerHTML = '<p class="text-muted">Error loading schedule</p>';
        }
        showToast('Failed to load schedule', 'error');
    }
}

/**
 * Delete teacher schedule
 * @param {string} scheduleId - Schedule ID
 */
async function deleteSchedule(scheduleId) {
    try {
        if (!confirm('Are you sure you want to delete this schedule?')) {
            return;
        }

        await db.collection('schedules').doc(scheduleId).delete();

        showToast('Schedule deleted', 'success');

        // Reload schedule
        loadTeacherSchedule();

    } catch (error) {
        console.error('Delete schedule error:', error);
        showToast('Failed to delete schedule', 'error');
    }
}

/**
 * Load student profile
 */
async function loadStudentProfile() {
    try {
        const currentUser = getCurrentUser();
        const profileDetails = document.getElementById('profileDetails');

        if (!profileDetails) return;

        profileDetails.innerHTML = `
            <div class="profile-item">
                <span class="profile-label">Full Name</span>
                <span class="profile-value">${currentUser.fullName}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Email</span>
                <span class="profile-value">${currentUser.email}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Phone</span>
                <span class="profile-value">${currentUser.phone || 'N/A'}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Student ID</span>
                <span class="profile-value">${currentUser.studentId || 'N/A'}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Course</span>
                <span class="profile-value">${currentUser.course || 'N/A'}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Status</span>
                <span class="profile-value">${currentUser.status ? currentUser.status.toUpperCase() : 'N/A'}</span>
            </div>
        `;

    } catch (error) {
        console.error('Load student profile error:', error);
    }
}

/**
 * Load teacher profile
 */
async function loadTeacherProfile() {
    try {
        const currentUser = getCurrentUser();
        const profileDetails = document.getElementById('profileDetails');

        if (!profileDetails) return;

        profileDetails.innerHTML = `
            <div class="profile-item">
                <span class="profile-label">Full Name</span>
                <span class="profile-value">${currentUser.fullName}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Email</span>
                <span class="profile-value">${currentUser.email}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Phone</span>
                <span class="profile-value">${currentUser.phone || 'N/A'}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Department</span>
                <span class="profile-value">${currentUser.department || 'N/A'}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Subject</span>
                <span class="profile-value">${currentUser.subject || 'N/A'}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Experience</span>
                <span class="profile-value">${currentUser.experience || 0} years</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Status</span>
                <span class="profile-value">${currentUser.status ? currentUser.status.toUpperCase() : 'N/A'}</span>
            </div>
        `;

    } catch (error) {
        console.error('Load teacher profile error:', error);
    }
}

console.log('Teacher module loaded (REAL FIREBASE MODE)');
