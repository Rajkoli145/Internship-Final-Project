/**
 * Activity Logging Module - REAL FIREBASE MODE
 * Tracks and logs all important actions in Firestore
 */

/**
 * Log an action to Firestore
 * @param {string} type - Type of action (login, teacher, appointment, message, etc.)
 * @param {string} action - Description of the action
 */
async function logAction(type, action) {
    try {
        const currentUser = getCurrentUser();

        const logData = {
            type: type,
            action: action,
            userId: currentUser ? currentUser.uid : 'system',
            userName: currentUser ? currentUser.fullName : 'System',
            userRole: currentUser ? currentUser.role : 'system',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('logs').add(logData);

        console.log('Action logged:', action);

    } catch (error) {
        console.error('Log action error:', error);
        // Don't show error toast for logging failures
    }
}

/**
 * Load activity logs for admin
 */
async function loadActivityLogs() {
    try {
        const logsTable = document.getElementById('logsTable');
        if (!logsTable) return;

        // Show loading state
        logsTable.innerHTML = '<p class="text-muted">Loading activity logs...</p>';

        // Get filter values
        const typeFilter = document.getElementById('logTypeFilter')?.value || 'all';
        const dateFilter = document.getElementById('logDateFilter')?.value || '';

        // Build query
        let query = db.collection('logs').orderBy('timestamp', 'desc').limit(100);

        // Apply type filter
        if (typeFilter !== 'all') {
            query = db.collection('logs')
                .where('type', '==', typeFilter)
                .orderBy('timestamp', 'desc')
                .limit(100);
        }

        const snapshot = await query.get();

        let logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Apply date filter (client-side since Firestore has query limitations)
        if (dateFilter) {
            logs = logs.filter(log => {
                if (!log.timestamp) return false;
                const logDate = log.timestamp.toDate();
                const filterDate = new Date(dateFilter);
                return logDate.toDateString() === filterDate.toDateString();
            });
        }

        if (logs.length === 0) {
            logsTable.innerHTML = '<p class="text-muted">No logs found</p>';
            return;
        }

        logsTable.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Type</th>
                        <th>User</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map(log => `
                        <tr>
                            <td>${formatDateTime(log.timestamp)}</td>
                            <td><span class="appointment-status status-${getLogTypeClass(log.type)}">${log.type}</span></td>
                            <td>${log.userName}</td>
                            <td>${log.userType}</td>
                            <td>${log.action}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('Load activity logs error:', error);
        const logsTable = document.getElementById('logsTable');
        if (logsTable) {
            logsTable.innerHTML = '<p class="text-muted">Error loading logs</p>';
        }
        showToast('Failed to load activity logs', 'error');
    }
}

/**
 * Get CSS class for log type
 * @param {string} type - Log type
 * @returns {string} CSS class
 */
function getLogTypeClass(type) {
    const typeMap = {
        'login': 'approved',
        'logout': 'cancelled',
        'registration': 'pending',
        'teacher': 'approved',
        'appointment': 'pending',
        'message': 'approved',
        'approval': 'approved',
        'rejection': 'cancelled',
        'deletion': 'cancelled',
        'password_change': 'pending'
    };

    return typeMap[type] || 'pending';
}

/**
 * Export logs to CSV
 */
async function exportLogs() {
    try {
        const snapshot = await db.collection('logs')
            .orderBy('timestamp', 'desc')
            .limit(1000)
            .get();

        if (snapshot.empty) {
            showToast('No logs to export', 'warning');
            return;
        }

        const logs = snapshot.docs.map(doc => doc.data());

        // Create CSV content
        const headers = ['Timestamp', 'Type', 'User', 'Role', 'Action'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                log.timestamp ? formatDateTime(log.timestamp) : 'N/A',
                log.type,
                log.userName,
                log.userType,
                `"${log.action.replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Logs exported successfully', 'success');

    } catch (error) {
        console.error('Export logs error:', error);
        showToast('Failed to export logs', 'error');
    }
}

/**
 * Clear old logs (older than specified days)
 * @param {number} days - Number of days to keep
 */
async function clearOldLogs(days = 30) {
    try {
        if (!confirm(`Are you sure you want to delete logs older than ${days} days?`)) {
            return;
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const snapshot = await db.collection('logs')
            .where('timestamp', '<', firebase.firestore.Timestamp.fromDate(cutoffDate))
            .get();

        if (snapshot.empty) {
            showToast('No old logs to delete', 'info');
            return;
        }

        // Delete old logs in batches
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        showToast(`Deleted ${snapshot.size} old logs`, 'success');

        // Reload logs
        loadActivityLogs();

    } catch (error) {
        console.error('Clear old logs error:', error);
        showToast('Failed to clear old logs', 'error');
    }
}

/**
 * Get logs statistics
 * @returns {Object} Statistics object
 */
async function getLogsStatistics() {
    try {
        const snapshot = await db.collection('logs')
            .orderBy('timestamp', 'desc')
            .limit(1000)
            .get();

        const logs = snapshot.docs.map(doc => doc.data());

        const stats = {
            total: logs.length,
            byType: {},
            byUser: {},
            today: 0,
            thisWeek: 0,
            thisMonth: 0
        };

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        logs.forEach(log => {
            // Count by type
            stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;

            // Count by user
            stats.byUser[log.userName] = (stats.byUser[log.userName] || 0) + 1;

            // Count by time period
            if (log.timestamp) {
                const logDate = log.timestamp.toDate();
                if (logDate >= todayStart) stats.today++;
                if (logDate >= weekStart) stats.thisWeek++;
                if (logDate >= monthStart) stats.thisMonth++;
            }
        });

        return stats;

    } catch (error) {
        console.error('Get logs statistics error:', error);
        return null;
    }
}

/**
 * Search logs
 * @param {string} query - Search query
 */
function searchLogs(query) {
    const rows = document.querySelectorAll('#logsTable tbody tr');
    const searchLower = query.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchLower) ? '' : 'none';
    });
}

// Toast notification function
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

console.log('Logs module loaded (REAL FIREBASE MODE)');
