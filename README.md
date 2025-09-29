# GetItDone - Task Management Platform

A modern web application that connects students with tasks that need to be done. Built with HTML, CSS, JavaScript, and Bootstrap.

## 🌟 Features

- **User Registration & Authentication** - Create accounts and login securely
- **Task Posting** - Post tasks with detailed descriptions, location, and payment
- **Task Browsing** - Browse and search for available tasks
- **Application System** - Apply to tasks and manage applications
- **Messaging System** - Communicate between task posters and helpers
- **Notification System** - Real-time notifications for updates
- **Dashboard** - Track your posted tasks, applications, and earnings
- **Profile Management** - Manage your profile and view statistics

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for local development server)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/getitdone.git
cd getitdone
```

2. Start a local development server:
```bash
python3 -m http.server 8000
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

## 🧪 Test Accounts

For testing purposes, you can use these sample accounts:

- **Email:** `test@example.com` **Password:** `test123`
- **Email:** `ally@example.com` **Password:** `password123`
- **Email:** `jessica@example.com` **Password:** `password123`

## 💻 Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **UI Framework:** Bootstrap 5.3
- **Icons:** Bootstrap Icons
- **Data Storage:** LocalStorage (client-side)
- **Development Server:** Python HTTP Server

## 📱 Features Overview

### For Task Posters
- Create detailed task posts with location, timing, and payment
- Review and approve helper applications
- Communicate with helpers through messaging
- Track task completion and payments

### For Helpers
- Browse available tasks by category and location
- Apply to tasks with personalized messages
- Receive notifications about application status
- Track earnings and completed tasks

### Platform Features
- 5% platform fee on all transactions
- Secure user authentication
- Real-time notifications
- Responsive design for mobile and desktop

## 🎯 How It Works

1. **Post a Task** - Describe what you need, when, where, and how much you'll pay
2. **Apply** - Helpers nearby see your task and apply with a quick message
3. **Get it Done** - Pick a helper, complete the work, and pay when done

## 📁 Project Structure

```
Group4Project1/
├── index.html                 # Main entry point
├── pages/                     # Application pages
│   ├── index.html            # Home page
│   ├── browse.html           # Task browsing
│   ├── post.html             # Task posting
│   ├── task-detail.html      # Task details
│   ├── my-stuff.html         # User dashboard
│   └── account.html          # User profile
├── assets/
│   ├── scripts/
│   │   ├── app.js            # Main application logic
│   │   └── data.js           # Data management
│   └── styles/
│       └── styles.css        # Custom styles
└── backend/                  # Backend API (PHP)
    └── api/
        ├── config.php        # Database configuration
        └── users.php         # User API endpoints
```

## 🔧 Development

### Local Development
1. Clone the repository
2. Start a local server: `python3 -m http.server 8000`
3. Open `http://localhost:8000` in your browser

### Data Management
The application uses LocalStorage for client-side data persistence. To reset data:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Bootstrap for the UI framework
- Unsplash for profile pictures
- University of Alabama for the project context

