# 📚 EduConnect - Student-Teacher Appointment Booking System

A modern, responsive web application for managing student-teacher appointments with role-based access control, built with HTML, CSS, JavaScript, and Firebase.

![EduConnect Banner](https://img.shields.io/badge/EduConnect-Appointment%20System-6366f1?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?style=for-the-badge)

## 🚀 Live Demo

**Deployed Application:** [https://student-teacher-booking-tau.vercel.app/](https://student-teacher-booking-tau.vercel.app/)

**Demo Credentials:**
- **Admin:** `admin@educonnect.com` / `admin123`
- **Create your own student/teacher accounts via registration**

## ✨ Features

### 👨‍🎓 For Students
- **User Registration & Login** - Secure authentication with email and password (requires admin approval)
- **Search Teachers** - Find teachers by name, subject, or department with advanced filters
- **Book Appointments** - Schedule appointments with available teachers (12-hour time format)
- **Send Messages** - Communicate directly with teachers about appointment purposes
- **Track Appointments** - View appointment status (pending/approved/cancelled) in real-time
- **Profile Management** - View and edit personal information (name, student ID, department, course)

### 👨‍🏫 For Teachers
- **Registration & Approval** - Teacher registration (requires admin approval before access)
- **Dashboard Overview** - View statistics and recent appointments with modern UI
- **Manage Appointments** - Approve or reject student appointment requests (teacher-only approval)
- **Schedule Management** - Set availability slots with start/end times (12-hour format)
- **View Messages** - Read messages from students with timestamp tracking
- **Profile Management** - Update professional information (name, subject, department, phone, experience, office hours)

### ⚙️ For Administrators
- **System Overview** - Complete dashboard with statistics and activity feed
- **Teacher Management** - Approve/reject teacher registrations, manage teacher accounts
- **Student Management** - Approve or reject student registrations with filtering
- **Appointment Monitoring** - View all appointments across the system (view-only, no approval rights)
- **Activity Logs** - Track all system activities with detailed logging and filtering
- **User Management** - Comprehensive user management with search functionality

## 🚀 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Authentication & Firestore Database
- **Icons**: Google Material Icons
- **Design**: Modern CSS with CSS Variables, Flexbox, Grid, Purple Gradient Theme
- **Architecture**: Modular JavaScript with separation of concerns
- **Database**: Firebase Firestore (real-time synchronization)
- **Authentication**: Firebase Auth (email/password)

## 📁 Project Structure

```
Student-booking(intern)/
│
├── index.html                 # Landing page
├── login.html                 # Login page with role selection
├── register.html              # Registration page with dynamic fields
├── create-admin.html          # Admin account creation utility
├── add-sample-teachers.html   # Sample teacher data generator
│
├── student/
│   └── dashboard.html         # Student dashboard with Material Icons
│
├── teacher/
│   └── dashboard.html         # Teacher dashboard with modern UI
│
├── admin/
│   └── dashboard.html         # Admin dashboard with gradient theme
│
├── css/
│   ├── style.css              # Base stylesheet with CSS variables
│   ├── admin.css              # Admin-specific styles (purple gradient)
│   └── teacher.css            # Teacher-specific styles (modern cards)
│
├── js/
│   ├── firebase.js            # Firebase config & helper functions
│   ├── auth.js                # Authentication & role-based access
│   ├── appointment.js         # Appointment booking & approval
│   ├── teacher.js             # Teacher operations & messaging
│   ├── admin.js               # Admin operations & user management
│   └── logs.js                # Activity logging & tracking
│
├── assets/
│   └── images/                # Image assets
│
├── README.md                  # Complete documentation
└── PROJECT_SPECIFICATION.md   # Technical specifications
```

## 🛠️ Setup Instructions

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Local web server (Python, Node.js, or PHP)
- Firebase account (free tier is sufficient)

### Step 1: Clone the Project
```bash
git clone <repository-url>
cd Student-booking(intern)
```

### Step 2: Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name: `student-booking`
   - Disable Google Analytics (optional)

2. **Enable Authentication**
   - Navigate to Authentication → Sign-in method
   - Enable **Email/Password** provider
   - Save changes

3. **Create Firestore Database**
   - Navigate to Firestore Database
   - Click "Create database"
   - Start in **Test mode** (or Production with custom rules)
   - Choose your region

4. **Get Firebase Configuration**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click Web icon (</>) to add a web app
   - Register app with nickname: "EduConnect"
   - Copy the firebaseConfig object

5. **Update Configuration**
   - Open `js/firebase.js`
   - Replace the configuration (around line 10-20):
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID",
       measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

### Step 3: Start Local Server

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

### Step 4: Create Admin Account

1. Open browser: `http://localhost:8000/create-admin.html`
2. Fill in admin details:
   - Full Name: `Admin User`
   - Email: `admin@educonnect.com`
   - Password: `admin123`
3. Click "Create Admin Account"
4. Wait for success message

### Step 5: Access the Application

- **Landing Page**: `http://localhost:8000`
- **Login**: `http://localhost:8000/login.html`
- **Register**: `http://localhost:8000/register.html`

### Step 6: Add Sample Data (Optional)

1. Open: `http://localhost:8000/add-sample-teachers.html`
2. Click "Add 20 Sample Teachers"
3. Wait for completion
4. Login as admin to approve teachers
   ```

6. **Set Firestore Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

7. **Deploy** (Optional)
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase Hosting
   firebase init hosting
   
   # Deploy
   firebase deploy
   ```

## 📊 Database Collections

### `users` Collection
```javascript
{
  uid: string,                    // Firebase Auth UID
  email: string,                  // User email
  fullName: string,               // Full name
  phone: string,                  // Phone number
  role: 'student' | 'teacher' | 'admin',  // User role
  approved: boolean,              // Approval status
  
  // Student-specific fields
  studentId?: string,             // Student ID number
  department?: string,            // Student department
  course?: string,                // Course enrolled
  
  // Teacher-specific fields
  subject?: string,               // Teaching subject
  teacherDepartment?: string,     // Teacher department
  experience?: number,            // Years of experience
  officeHours?: string,           // Available office hours
  
  createdAt: timestamp            // Registration timestamp
}
```

### `appointments` Collection
```javascript
{
  studentId: string,              // Student UID
  studentName: string,            // Student full name
  studentEmail: string,           // Student email
  teacherId: string,              // Teacher UID
  teacherName: string,            // Teacher full name
  teacherEmail: string,           // Teacher email
  teacherSubject: string,         // Subject being taught
  date: string,                   // Appointment date (YYYY-MM-DD)
  time: string,                   // Appointment time (HH:mm 24-hour)
  reason: string,                 // Purpose of appointment
  status: 'pending' | 'approved' | 'cancelled',  // Status
  createdAt: timestamp,           // Booking timestamp
  approvedAt?: timestamp,         // Approval timestamp
  cancelledAt?: timestamp,        // Cancellation timestamp
  cancelledBy?: string            // Who cancelled (UID)
}
```

### `messages` Collection
```javascript
{
  senderId: string,               // Sender UID
  senderName: string,             // Sender full name
  senderEmail: string,            // Sender email
  senderType: 'student' | 'teacher',  // Sender role
  teacherId: string,              // Teacher UID
  teacherName: string,            // Teacher full name
  subject: string,                // Message subject
  content: string,                // Message content
  read: boolean,                  // Read status
  createdAt: timestamp            // Message timestamp
}
```

### `schedules` Collection
```javascript
{
  teacherId: string,              // Teacher UID
  date: string,                   // Schedule date (YYYY-MM-DD)
  startTime: string,              // Start time (HH:mm 24-hour)
  endTime: string,                // End time (HH:mm 24-hour)
  notes: string,                  // Additional notes
  createdAt: timestamp            // Creation timestamp
}
```

### `logs` Collection
```javascript
{
  type: string,                   // Log type (auth, appointment, etc)
  action: string,                 // Action description
  userId: string,                 // User UID who performed action
  userName: string,               // User full name
  userRole: string,               // User role
  timestamp: timestamp            // Action timestamp
}
```

### `teachers` Collection (Optional - for additional teacher data)
```javascript
{
  teacherId: string,              // Teacher UID
  bio: string,                    // Biography
  qualifications: string[],       // List of qualifications
  availability: object,           // Weekly availability schedule
  rating: number,                 // Average rating
  totalAppointments: number       // Total appointments handled
}
```

## 🎨 Design Features

- **Modern Purple Gradient Theme** - Professional purple color scheme (#6366f1 → #8b5cf6 → #a855f7)
- **Google Material Icons** - Crisp, professional icons throughout
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Modular CSS Architecture** - Base styles + role-specific stylesheets
- **Smooth Animations** - Hover effects, transitions, and micro-interactions
- **Toast Notifications** - Non-intrusive feedback system
- **Modal Dialogs** - Clean popup forms with backdrop blur
- **Data Tables** - Horizontal scrolling for wide tables
- **Status Badges** - Color-coded status indicators (pending, approved, cancelled)
- **Card-Based Layouts** - Modern card designs with gradients and shadows
- **Glassmorphism Effects** - Subtle transparency and blur effects

## 🔐 Security Features

- **Role-Based Access Control** - Separate dashboards and permissions for each role
- **Firebase Authentication** - Secure email/password authentication
- **Admin Approval System** - Teachers and students require approval before access
- **Protected Routes** - Authentication checks on dashboard pages
- **Input Validation** - Client-side form validation with regex patterns
- **Password Requirements** - Minimum 6 characters enforced
- **Session Management** - LocalStorage for user data caching
- **Activity Logging** - Comprehensive tracking of all system actions
- **Field Name Consistency** - Standardized field names (`role`, `approved`, `teacherDepartment`)

## 🔧 Key Technical Decisions

### Database Query Optimization
- **No Composite Indexes Required** - All `orderBy()` clauses removed
- **JavaScript Sorting** - Data sorted client-side using `Array.sort()`
- **Performance** - Faster development without index creation delays

### Permission Model
- **Teacher-Only Approval** - Only teachers can approve their own appointments
- **Admin View-Only** - Admin can view appointments but not approve/reject them
- **Clear Separation** - Admin manages users, Teachers manage appointments, Students book appointments

### Time Format
- **12-Hour Display** - All times displayed in 12-hour format with AM/PM
- **Helper Function** - `formatTime12Hour()` converts 24-hour to 12-hour format
- **Consistent** - Applied to appointments, schedules, and all time displays

### Modal State Management
- **Class-Based** - Using `classList.add('active')` / `classList.remove('active')`
- **No Inline Styles** - Better performance and easier debugging
- **Consistent Pattern** - Same approach across all dashboards

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## 🎯 User Workflows

### Student Registration & Booking Flow
```
1. Register → Fill details (Student ID, Department, Course)
2. Wait for Admin Approval
3. Login → Search Teachers (by name, subject, department)
4. Select Teacher → Book Appointment
5. Enter Date, Time (12-hour format), Reason
6. Submit → Wait for Teacher Approval
7. Track Status → View in "My Appointments"
8. Send Messages → Communicate with teachers
9. Edit Profile → Update personal information
```

### Teacher Registration & Management Flow
```
1. Register → Fill details (Subject, Department, Experience)
2. Wait for Admin Approval
3. Login → View Dashboard Overview (stats, recent appointments)
4. Manage Appointments → Approve/Reject student requests
5. Set Schedule → Add availability slots with time ranges
6. View Messages → Read student inquiries
7. Edit Profile → Update professional information (phone, office hours)
```

### Admin Management Flow
```
1. Login with Admin Credentials (admin@educonnect.com)
2. View System Overview → Statistics and recent activity
3. Approve Teachers → Review and approve teacher registrations
4. Approve Students → Review and approve student registrations
5. Monitor Appointments → View all appointments (read-only)
6. View Activity Logs → Track system actions with filters
7. Manage Users → Search, filter, and manage all users
```

## 📱 User Interface Sections

### Student Dashboard
- 🔍 **Search Teachers** - Filter by name, subject, department with real-time search
- 📆 **My Appointments** - View all appointments with status badges
- 💬 **Messages** - Send messages to teachers
- 👤 **Profile** - View and edit personal details

### Teacher Dashboard
- 📊 **Overview** - Statistics cards (total, pending, approved, messages)
- 📆 **Appointments** - Tabs for filtering (All, Pending, Approved, Cancelled)
- 🕒 **My Schedule** - Add and manage availability slots
- 💬 **Messages** - View student messages
- 👤 **Profile** - Edit professional information

### Admin Dashboard
- 📊 **Overview** - System statistics (teachers, students, appointments, pending)
- 👨‍🏫 **Teachers** - Approve/reject teacher registrations, manage accounts
- 👨‍🎓 **Students** - Filter tabs (All, Pending Approval, Approved)
- 📆 **Appointments** - View all appointments with filters (no action buttons)
- 📋 **Activity Logs** - Comprehensive system activity tracking

## 🔧 Customization Guide

### Changing Theme Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #6366f1;        /* Purple */
    --secondary-color: #8b5cf6;      /* Medium Purple */
    --accent-color: #a855f7;         /* Light Purple */
    --success-color: #22c55e;        /* Green */
    --warning-color: #f59e0b;        /* Orange */
    --error-color: #ef4444;          /* Red */
    --bg-color: #0f172a;             /* Dark Navy */
    --card-bg: #1e293b;              /* Dark Blue-Gray */
}
```

### Admin-Specific Styles
Edit `css/admin.css` for admin dashboard customization:
- Gradient navbar colors
- Stat card designs
- Table styling
- Action button colors

### Teacher-Specific Styles
Edit `css/teacher.css` for teacher dashboard customization:
- Stat icon sizes
- Appointment card styles
- Message card designs
- Schedule card layouts

### Adding New Material Icons
```html
<span class="icon material-icons">icon_name</span>
```
Browse icons at: [Google Material Icons](https://fonts.google.com/icons)

## 🐛 Common Issues & Solutions

### Issue: "Firebase not defined"
**Solution**: 
- Check Firebase SDK scripts are loaded before app scripts
- Verify Firebase CDN URLs are correct (9.22.0)
- Clear browser cache

### Issue: "getCurrentUser is not defined"
**Solution**:
- Ensure `auth.js` is loaded before other modules
- Check script order in HTML files
- Verify `getCurrentUser()` function exists in `auth.js`

### Issue: "Permission denied" in Firestore
**Solution**:
- Update Firestore rules to allow authenticated users
- Verify user is logged in (`request.auth != null`)
- Check field names match (use `role`, not `userType`)

### Issue: Appointments not showing
**Solution**:
- Check browser console for errors
- Verify Firestore queries have no `orderBy()` clauses
- Check if data exists in Firebase Console

### Issue: Time format showing 24-hour
**Solution**:
- Ensure `formatTime12Hour()` is called on time displays
- Check function exists in `firebase.js`
- Verify time strings are in HH:mm format

### Issue: Profile edit not saving
**Solution**:
- Check Firestore update permissions
- Verify user is authenticated
- Check localStorage has updated user data
- Look for console errors

## 📈 Future Enhancements

### High Priority
- [ ] **Email Notifications** - Send emails for appointment confirmations and updates
- [ ] **Push Notifications** - Browser notifications for new appointments/messages
- [ ] **Calendar Integration** - Google Calendar sync for appointments
- [ ] **Export Functionality** - Download appointments/logs as PDF/Excel

### Medium Priority
- [ ] **Real-Time Chat** - Live messaging between students and teachers
- [ ] **Video Conferencing** - Integrated video calls for remote appointments
- [ ] **Rating System** - Students can rate teachers after appointments
- [ ] **Analytics Dashboard** - Charts and graphs for appointment trends

### Low Priority
- [ ] **Mobile App** - React Native or Flutter mobile application
- [ ] **Multi-Language** - Internationalization support
- [ ] **Payment Integration** - Premium features or paid appointments
- [ ] **File Attachments** - Upload documents with messages
- [ ] **Recurring Appointments** - Schedule repeating appointments
- [ ] **Teacher Availability Sync** - Auto-block unavailable time slots

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code structure
- Test changes thoroughly before committing
- Update documentation for new features

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review documentation thoroughly

## 📄 License

This project is open-source and available under the MIT License.

## 🙏 Acknowledgments

- **Firebase** - Backend infrastructure
- **Google Material Icons** - Icon library
- **Modern CSS** - Design inspiration

## 📝 Version History

- **v1.0.0** (Current)
  - Initial release with core features
  - Firebase integration
  - Role-based access control
  - Modern UI with purple gradient theme
  - 12-hour time format
  - Profile editing for students and teachers
  - Teacher-only appointment approval
  - Material Icons integration

---

**Built with ❤️ for Education** | Last Updated: December 2025

- **Development Team** - Initial work and design

## 🙏 Acknowledgments

- Firebase for backend services
- Google Fonts for typography
- Modern CSS techniques and best practices
- Community feedback and contributions

## 📞 Support

For support, email support@educonnect.com or open an issue in the repository.

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ using HTML, CSS, JavaScript, and Firebase**

*Last Updated: December 2024*
