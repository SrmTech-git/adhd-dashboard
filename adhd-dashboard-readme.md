# ADHD Focus Dashboard 🎯

A clean, effective dashboard designed specifically for people with ADHD to manage daily tasks, maintain routines, and stay focused throughout the day.

## 📌 Current Version: v1.0 (Stable)
**Last Updated:** September 2024  
**Status:** ✅ Production-ready for demo/personal use

## 🌟 Features

### Daily Routine Manager
- **Customizable daily tasks** that reset automatically each day
- **Progress tracking** with visual progress bar
- **Add/remove items** to personalize your routine
- **One-click reset** to mark all as incomplete for the next day

### Focus Timer (Pomodoro)
- **Visual countdown timer** with large, easy-to-read display
- **Quick presets**: 5, 15, 25, and 45 minutes
- **Play/Pause/Reset controls**
- **Clean, distraction-free interface**

### Dynamic To-Do List
- **Priority levels**: High (red), Medium (yellow), Low (green)
- **Visual priority indicators** for quick scanning
- **Add/remove tasks** on the fly
- **Persistent storage** - tasks remain until you complete or delete them

### Interactive Calendar
- **Month view** with all events visible
- **Click any date** to add/edit/delete events
- **Visual event indicators** on calendar dates
- **Today's Schedule** section for quick daily overview
- **Color-coded events** for easy categorization

### Gentle Reminders
- **Fully editable reminders** - Change time, text, or frequency without recreating
- **Multiple reminder types**: Once, Daily, or Interval-based (every 1-3 hours)
- **Visual notifications** - Toast notifications and browser alerts
- **Enable/disable toggle** - Turn off reminders without deleting them
- **15-minute event warnings** - Automatic alerts before calendar events

### Data Persistence
- **Automatic saving** with visual confirmation
- **localStorage implementation** for demo/prototype
- **Database-ready architecture** for easy transition to production
- **Daily routine reset** - Automatically resets completion status each day

## 🚀 Getting Started

### Installation

1. **For Development/Demo (Current Implementation)**
   ```bash
   # Clone or download the project
   npm install
   npm start
   ```

2. **Dependencies**
   - React 18+
   - Lucide React (for icons)
   - No other external dependencies required!

### Usage

1. **Daily Routine**: Add your morning/evening routines. They'll reset automatically each day.
2. **Timer**: Use for focused work sessions. Try 25-minute blocks with 5-minute breaks.
3. **To-Do List**: Add tasks with priorities. High-priority items stand out visually.
4. **Calendar**: Click any date to manage events. See your whole month at a glance.
5. **Reminders**: Set gentle reminders for meds, meals, breaks. Edit them anytime without recreating.

## 📊 Current Implementation Status

### ✅ Working Features
- **Daily Routines** - Fully customizable with add/edit/delete
- **Focus Timer** - Pomodoro-style with quick presets
- **Dynamic To-Do List** - Priority levels and persistence
- **Interactive Calendar** - Full CRUD operations for events
- **Editable Reminders** - Complete edit functionality
- **Data Persistence** - All data saves to localStorage
- **Visual Notifications** - Toast and browser notifications
- **Event Alerts** - 15-minute warnings for calendar events
- **Responsive Design** - Works on desktop, tablet, and mobile

### ⚠️ Known Issues / Removed Features
- **Sound Notifications**: Temporarily removed due to Web Audio API compatibility issues
  - The sound system was causing crashes in some browsers
  - Visual notifications still work perfectly
  - Future solution: Consider using Howler.js or pre-recorded audio files

### 🔄 Version History
- **v1.0** (Current) - Stable release with visual notifications only
- **v0.9** - Added sound features (rolled back due to issues)
- **v0.8** - Added editable reminders and event alerts
- **v0.7** - Initial feature-complete version

## 🚀 Deployment Options

### Quick Deployment (Current Version)

#### Option 1: Netlify Drop
1. Build your React app: `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag your `build` folder to the browser
4. Get instant URL!

#### Option 2: Vercel
```bash
npm i -g vercel
vercel
```

#### Option 3: GitHub Pages
```bash
npm install --save-dev gh-pages
# Add to package.json:
# "homepage": "https://username.github.io/adhd-dashboard"
# "scripts": { "deploy": "gh-pages -d build" }
npm run build
npm run deploy
```

#### Option 4: CodeSandbox/StackBlitz
- Import your GitHub repo directly
- Auto-deployment with every push
- Free hosting for prototypes

## 🏗 Architecture

### Current Implementation (Demo/Prototype)

```javascript
// Clean separation of concerns
DataService Layer -> React Components -> Local Storage
```

### Component Structure
```
ADHDDashboard (Main Container)
├── DataService (Data Access Layer)
├── Daily Routine Component
├── Focus Timer Component
├── To-Do List Component
├── Today's Schedule Component
└── Calendar Component (with Event Modal)
```

### Data Structure
```javascript
{
  dailyRoutine: [
    { id: 1, text: "Brush teeth", completed: false }
  ],
  todos: [
    { id: 1, text: "Email team", priority: "high", completed: false }
  ],
  events: [
    { id: 1, date: "2024-01-15", time: "10:00 AM", title: "Team meeting", color: "#4F46E5" }
  ],
  lastResetDate: "2024-01-15",
  lastUpdated: "2024-01-15T10:30:00Z"
}
```

## 🔄 Transitioning to Production (SQL/Java Backend)

### Phase 1: Database Schema

```sql
-- Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily routines table
CREATE TABLE daily_routines (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    text VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Routine completions table (tracks daily completion status)
CREATE TABLE routine_completions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    routine_id BIGINT NOT NULL,
    completion_date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (routine_id) REFERENCES daily_routines(id),
    UNIQUE KEY unique_routine_date (routine_id, completion_date)
);

-- Todos table
CREATE TABLE todos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    text VARCHAR(500) NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reminders table
CREATE TABLE reminders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    text VARCHAR(500) NOT NULL,
    time TIME NULL,
    frequency ENUM('once', 'daily', 'interval-1', 'interval-2', 'interval-3') NOT NULL,
    enabled BOOLEAN DEFAULT true,
    last_shown DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Events table
CREATE TABLE events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(20),
    color VARCHAR(7) DEFAULT '#4F46E5',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_date (user_id, event_date)
);
```

### Phase 2: Java REST API Endpoints

```java
// Example Spring Boot Controller Structure

@RestController
@RequestMapping("/api")
public class DashboardController {
    
    // Get all user data
    @GetMapping("/user/{userId}/data")
    public ResponseEntity<UserDashboardData> getUserData(@PathVariable Long userId) {
        // Fetch and combine all user data
        return ResponseEntity.ok(dashboardService.getUserData(userId));
    }
    
    // Daily Routines
    @PostMapping("/user/{userId}/routines")
    public ResponseEntity<DailyRoutine> createRoutine(@PathVariable Long userId, @RequestBody DailyRoutine routine) {
        return ResponseEntity.ok(routineService.create(userId, routine));
    }
    
    @PutMapping("/routines/{id}")
    public ResponseEntity<DailyRoutine> updateRoutine(@PathVariable Long id, @RequestBody DailyRoutine routine) {
        return ResponseEntity.ok(routineService.update(id, routine));
    }
    
    @DeleteMapping("/routines/{id}")
    public ResponseEntity<Void> deleteRoutine(@PathVariable Long id) {
        routineService.delete(id);
        return ResponseEntity.ok().build();
    }
    
    // Routine Completions
    @PostMapping("/routines/{routineId}/complete")
    public ResponseEntity<Void> toggleRoutineCompletion(@PathVariable Long routineId, @RequestParam String date) {
        routineService.toggleCompletion(routineId, date);
        return ResponseEntity.ok().build();
    }
    
    // Todos
    @PostMapping("/user/{userId}/todos")
    public ResponseEntity<Todo> createTodo(@PathVariable Long userId, @RequestBody Todo todo) {
        return ResponseEntity.ok(todoService.create(userId, todo));
    }
    
    @PutMapping("/todos/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todo) {
        return ResponseEntity.ok(todoService.update(id, todo));
    }
    
    @DeleteMapping("/todos/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoService.delete(id);
        return ResponseEntity.ok().build();
    }
    
    // Events
    @GetMapping("/user/{userId}/events")
    public ResponseEntity<List<Event>> getUserEvents(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(eventService.getEventsBetween(userId, startDate, endDate));
    }
    
    @PostMapping("/user/{userId}/events")
    public ResponseEntity<Event> createEvent(@PathVariable Long userId, @RequestBody Event event) {
        return ResponseEntity.ok(eventService.create(userId, event));
    }
    
    @PutMapping("/events/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        return ResponseEntity.ok(eventService.update(id, event));
    }
    
    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok().build();
    }
}
```

### Phase 3: Update DataService (Frontend)

Replace the localStorage implementation with API calls:

```javascript
const DataService = {
  // Replace this:
  loadUserData: () => {
    try {
      const data = localStorage.getItem('adhd_dashboard_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  },

  // With this:
  loadUserData: async () => {
    try {
      const response = await fetch(`/api/user/${userId}/data`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  },

  // Similar pattern for save operations
  saveUserData: async (data) => {
    try {
      const response = await fetch(`/api/user/${userId}/data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }
};
```

## 🔐 Security Considerations for Production

1. **Authentication**: Implement JWT or OAuth2
2. **User Isolation**: Ensure users can only access their own data
3. **Input Validation**: Sanitize all user inputs
4. **Rate Limiting**: Prevent API abuse
5. **HTTPS**: Always use encrypted connections
6. **CORS**: Configure appropriate CORS policies

## 🎨 Customization Options

### Theme Variables
```css
/* Easy to customize colors */
--primary-color: #6366F1;
--success-color: #10B981;
--warning-color: #F59E0B;
--danger-color: #EF4444;
--gradient-start: #667eea;
--gradient-end: #764ba2;
```

### Adding New Features
1. **Sound Notifications**: 
   - Recommended: Use Howler.js or pre-recorded audio files
   - Avoid: Web Audio API (caused compatibility issues)
   - Consider: User preference for sound types/volume
2. **Dark Mode**: Implement theme switching
3. **Data Export**: Allow users to export their data
4. **Statistics**: Track completion rates and productivity metrics
5. **Recurring Events**: Add support for repeating calendar events
6. **Categories**: Group todos, reminders, and routines by category

## 🤝 Contributing

This dashboard was designed to be simple and accessible. When contributing:

1. **Keep code beginner-friendly** - clear variable names, commented sections
2. **No regex** - use simple string operations
3. **Maintain clean architecture** - keep data layer separate
4. **Test daily routine reset** - ensure it works across timezones
5. **Preserve accessibility** - maintain keyboard navigation and ARIA labels

## 📝 License

MIT License - Feel free to use this for personal or commercial projects!

## 🙏 Acknowledgments

Built with love for the ADHD community. Special focus on:
- **Visual clarity** over feature complexity
- **Immediate feedback** for all actions
- **Gentle reminders** without shame
- **Flexibility** to match different ADHD presentations

---

**Remember**: This tool is meant to help, not add pressure. Use what works for you, ignore what doesn't. You've got this! 💜

## 🐛 Troubleshooting

### Common Issues

1. **Reminders not showing up**
   - Check browser notification permissions
   - Ensure the reminder is enabled (bell icon should be blue)
   - Verify the time is set correctly (24-hour format internally)

2. **Data not persisting**
   - Check if localStorage is enabled in your browser
   - Try clearing browser cache if data seems corrupted
   - Check browser console for any error messages

3. **Calendar events not appearing**
   - Ensure you're clicking "Add Event" after entering details
   - Check the date is selected correctly
   - Events only show on the specific date they're added to

4. **Daily routine not resetting**
   - The reset happens based on date change
   - Manual reset available with the rotate button
   - Check your system date/time settings

## 🚨 Support

For questions about transitioning to production or database setup, feel free to reach out. The architecture is designed to scale from 1 to 1 million users with minimal changes.

### Future Sound Implementation
If you want to add sound back in, here's the recommended approach:
```javascript
// Use Howler.js instead of Web Audio API
import { Howl } from 'howler';

const sounds = {
  reminder: new Howl({ src: ['reminder.mp3'] }),
  timer: new Howl({ src: ['timer-complete.mp3'] }),
  event: new Howl({ src: ['event-alert.mp3'] })
};
```

**Happy focusing!** 🎯✨