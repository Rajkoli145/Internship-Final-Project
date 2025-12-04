# 🕒 Multiple Countdown Timers

A modern, feature-rich countdown timer web application with multiple timers, customizable themes, ringtones, and spectacular visual/audio effects.

**[GitHub Repository](https://github.com/Rajkoli145/Countdown-Timer)**

## ✨ Features

### 🎯 **Multiple Timer Management**
- **Unlimited Timers**: Create as many countdown timers as you need
- **Custom Names**: Give each timer a personalized name or use auto-generated names
- **Individual Control**: Remove specific timers or clear all at once
- **Real-time Updates**: All timers update independently every second
- **Future Validation**: Prevents setting timers for past dates/times
- **Keyboard Support**: Press Enter to quickly add timers

### 🎨 **Theme Customization**
- **5 Beautiful Themes**:
  - **Dark**: Classic black background with white elements (default)
  - **Light**: Clean light theme with subtle shadows
  - **Blue**: Professional blue theme with blue accents
  - **Green**: Nature-inspired green theme
  - **Purple**: Creative purple theme with vibrant accents
- **Theme Toggle**: Easy access via 🎨 button in top-right corner
- **Persistent Settings**: Your theme choice is automatically saved
- **Smooth Transitions**: All theme changes include elegant animations

### 🎵 **Ringtone System**
- **7 Unique Ringtones**:
  - **Default Chord**: Rich multi-tone chord progression (C5-E5-G5-C6)
  - **US Ring**: Classic American phone ring pattern
  - **UK Ring**: Traditional British phone ring
  - **German Ring**: European phone ring style
  - **French Ring**: French telephone ring pattern
  - **Simple Beep**: Clean triple beep sequence
  - **Alarm**: Alternating high-pitched alarm tones
- **Ringtone Toggle**: Easy selection via 🎵 button in top-right corner
- **Extended Duration**: Ringtones play continuously for 10 seconds
- **Looping Audio**: Each ringtone repeats multiple times for maximum attention
- **Persistent Settings**: Your ringtone preference is automatically saved

### 🎆 **Visual & Audio Effects**
- **Fireworks Display**: 20 animated fireworks burst across the screen when timers complete
- **Completion Notifications**: Slide-in messages appear in the top-right corner
- **Auto-cleanup**: Notifications auto-remove after 8 seconds
- **Hover Effects**: Interactive elements respond to user interaction
- **Smooth Animations**: Timers slide in/out with elegant transitions

### 📱 **Responsive Design**
- **Mobile Friendly**: Works perfectly on all screen sizes
- **Grid Layout**: Timers automatically arrange in responsive grid
- **Touch Optimized**: All buttons and controls work great on touch devices
- **Adaptive Interface**: UI elements scale appropriately for different screen sizes

## 🚀 Getting Started

### Installation
1. Clone or download the project files
2. Ensure you have all three files in the same directory:
   - `index.html`
   - `style.css`
   - `script.js`

### Running the Application
1. **Local File**: Simply open `index.html` in any modern web browser
2. **Local Server**: For best experience, serve via HTTP server:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Navigate to `http://localhost:8000` in your browser

## 📖 How to Use

### Adding a Timer
1. **Enter Timer Name** (optional): Give your timer a descriptive name
2. **Select Date**: Choose the target date using the date picker
3. **Select Time**: Set the target time using the time picker
4. **Click "Add Timer"**: Your countdown will start immediately

### Managing Timers
- **Remove Individual Timer**: Click the × button on any timer card
- **Clear All Timers**: Click the "Clear All" button to remove all active timers
- **Automatic Cleanup**: Completed timers automatically remove themselves after showing effects

### Changing Themes
1. Click the 🎨 button in the top-right corner
2. Select your preferred theme from the dropdown menu
3. The theme will apply instantly and be saved for future visits

### Selecting Ringtones
1. Click the 🎵 button in the top-right corner
2. Choose from 7 different ringtone options
3. Your selection will be saved automatically
4. When timers complete, the selected ringtone will play for 10 seconds

### Keyboard Shortcuts
- **Enter Key**: Press Enter while in any input field to quickly add a timer

## 🛠️ Technical Details

### File Structure
```
countdown-timer/
├── index.html          # Main HTML structure
├── style.css          # Styling and theme definitions
├── script.js          # JavaScript functionality
└── README.md          # Project documentation
```

### Technologies Used
- **HTML5**: Semantic structure with modern input types
- **CSS3**: Advanced styling with CSS variables, animations, and grid layout
- **Vanilla JavaScript**: No external dependencies, pure ES6+ JavaScript
- **Web Audio API**: For rich sound effects and ringtone generation
- **LocalStorage**: For persistent theme and ringtone settings
- **PhoneTones.js**: External library for additional ringtone patterns

### Browser Compatibility
- **Chrome**: 60+ ✅
- **Firefox**: 55+ ✅
- **Safari**: 12+ ✅
- **Edge**: 79+ ✅

### Key Features Implementation
- **CSS Variables**: Enable dynamic theme switching
- **CSS Grid**: Responsive layout for timer cards
- **CSS Animations**: Smooth transitions and effects
- **JavaScript Maps**: Efficient timer management
- **setInterval**: Precise countdown updates
- **Web Audio API**: Rich completion sounds and ringtone generation
- **Audio Looping**: 10-second continuous ringtone playback
- **Event Listeners**: Interactive theme and ringtone selection

## 🎯 Usage Examples

### Personal Use Cases
- **Cooking Timers**: Set multiple timers for different dishes
- **Work Sessions**: Pomodoro technique with break timers
- **Event Countdowns**: Track multiple upcoming events
- **Exercise Routines**: Time different workout intervals

### Professional Use Cases
- **Meeting Management**: Track multiple meeting durations
- **Project Deadlines**: Monitor various project milestones
- **Presentation Timing**: Manage presentation segments
- **Break Scheduling**: Coordinate team break times

## 🔧 Customization

### Adding New Themes
1. Add new theme variables in `style.css`:
   ```css
   [data-theme="your-theme"] {
       --bg-primary: #your-color;
       --bg-secondary: #your-color;
       --text-primary: #your-color;
       --text-secondary: #your-color;
       --accent-color: #your-color;
       --border-color: #your-color;
       --shadow-color: rgba(your-color, 0.3);
   }
   ```
2. Add theme option in `index.html`:
   ```html
   <button class="theme-option" data-theme="your-theme">Your Theme</button>
   ```

### Modifying Sound Effects
Edit the `playCompletionSound()` function in `script.js` to change frequencies or add more tones:
```javascript
const frequencies = [523.25, 659.25, 783.99, 1046.50]; // Your custom frequencies
```

## 🐛 Troubleshooting

### Common Issues
1. **Audio not playing**: Some browsers require user interaction before playing audio
2. **Theme not saving**: Ensure LocalStorage is enabled in your browser
3. **Timers not updating**: Check if JavaScript is enabled

### Performance Tips
- **Limit Active Timers**: For best performance, avoid running 50+ timers simultaneously
- **Close Completed Notifications**: Let notifications auto-close or manually close them

## 📝 Changelog

### Version 2.1.0 (Current)
- ✅ Added multiple timer functionality
- ✅ Implemented 5 customizable themes
- ✅ Added comprehensive ringtone system with 7 options
- ✅ Extended ringtone duration to 10 seconds with looping
- ✅ Added fireworks visual effects
- ✅ Enhanced audio with chord progressions and Web Audio API
- ✅ Added completion notifications
- ✅ Improved responsive design
- ✅ Added theme and ringtone persistence
- ✅ Fixed ringtone button visibility across all themes

### Version 1.0.0 (Previous)
- ✅ Basic single countdown timer
- ✅ Simple black and white theme
- ✅ Basic completion message

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the countdown timer!

### Development Setup
1. Fork the repository
2. Make your changes
3. Test across different browsers
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by productivity and time management needs
- Designed for simplicity and functionality

---

**Enjoy your countdown timers! 🎉**
