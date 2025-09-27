# GetItDone Database Setup Guide

This guide will help you set up a MySQL database for your GetItDone project to replace the localStorage implementation.

## Prerequisites

- MySQL Server (5.7 or higher) or MariaDB (10.2 or higher)
- PHP 7.4 or higher with PDO MySQL extension
- Web server (Apache/Nginx) with mod_rewrite enabled

## Step 1: Install MySQL

### On macOS (using Homebrew):
```bash
brew install mysql
brew services start mysql
```

### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### On Windows:
Download and install MySQL from [mysql.com](https://dev.mysql.com/downloads/mysql/)

## Step 2: Create Database and User

1. Connect to MySQL as root:
```bash
mysql -u root -p
```

2. Create the database and user:
```sql
CREATE DATABASE getitdone;
CREATE USER 'getitdone_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON getitdone.* TO 'getitdone_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 3: Import Database Schema

1. Import the database schema:
```bash
mysql -u getitdone_user -p getitdone < database_schema.sql
```

2. Verify the tables were created:
```bash
mysql -u getitdone_user -p getitdone -e "SHOW TABLES;"
```

## Step 4: Configure PHP API

1. Update the database configuration in `api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'getitdone');
define('DB_USER', 'getitdone_user');  // Change this
define('DB_PASS', 'your_secure_password');  // Change this
define('JWT_SECRET', 'your_jwt_secret_key_here_change_in_production');  // Change this
```

2. Ensure your web server can execute PHP files in the `api` directory.

## Step 5: Test the API

1. Start your web server and navigate to the API endpoints:

### Test Database Connection:
```bash
curl http://localhost/Group4Project1/api/users
```

### Test User Registration:
```bash
curl -X POST http://localhost/Group4Project1/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

### Test User Login:
```bash
curl -X POST http://localhost/Group4Project1/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Step 6: Update Frontend to Use API

To connect your frontend to the database, you'll need to modify the `data.js` file to make API calls instead of using localStorage. Here's an example:

### Example API Integration:

```javascript
class DataManager {
    constructor() {
        this.apiBase = '/Group4Project1/api';
        this.token = localStorage.getItem('auth_token');
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    }

    async getAllTasks() {
        return await this.makeRequest('/tasks');
    }

    async getTaskById(id) {
        return await this.makeRequest(`/tasks/${id}`);
    }

    async addTask(taskData) {
        return await this.makeRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    async authenticateUser(email, password) {
        const response = await this.makeRequest('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        this.token = response.token;
        localStorage.setItem('auth_token', this.token);
        
        return response.user;
    }

    async addUser(userData) {
        const response = await this.makeRequest('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        this.token = response.token;
        localStorage.setItem('auth_token', this.token);
        
        return response.user;
    }
}
```

## Database Schema Overview

The database includes the following tables:

- **users**: User accounts and profiles
- **tasks**: Task postings
- **task_tags**: Many-to-many relationship for task tags
- **applications**: Job applications
- **messages**: User-to-user messaging
- **notifications**: System notifications
- **ratings**: User ratings and reviews
- **posted_tasks_tracking**: Track user's posted tasks
- **popular_tags**: Cache frequently used tags

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/{id}` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get specific user
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Applications
- `GET /api/applications` - Get applications
- `GET /api/applications/{id}` - Get specific application
- `POST /api/applications` - Create application
- `PUT /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete application

### Messages
- `GET /api/messages` - Get user's messages
- `GET /api/messages?conversations=1` - Get conversations
- `GET /api/messages?other_user=email` - Get messages with specific user
- `POST /api/messages` - Send message

### Notifications
- `GET /api/notifications` - Get user's notifications
- `PUT /api/notifications/mark_all_read` - Mark all as read
- `PUT /api/notifications/{id}` - Update notification

## Security Notes

1. **Change default passwords** in the database configuration
2. **Use HTTPS** in production
3. **Implement proper JWT secret** management
4. **Add input validation** and sanitization
5. **Implement rate limiting** for API endpoints
6. **Use prepared statements** (already implemented)
7. **Regular database backups**

## Troubleshooting

### Common Issues:

1. **Connection refused**: Check if MySQL is running
2. **Access denied**: Verify database user credentials
3. **Table doesn't exist**: Re-run the schema import
4. **API not responding**: Check web server configuration and PHP errors
5. **CORS issues**: Ensure proper headers are set in config.php

### Debug Mode:

Add this to `config.php` for debugging:
```php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

## Next Steps

1. Test all API endpoints
2. Update frontend JavaScript to use API calls
3. Implement proper error handling
4. Add data validation
5. Set up production environment
6. Implement caching for better performance
7. Add monitoring and logging

## Sample Data

The database schema includes sample data for testing:
- 13 sample users
- 11 sample tasks
- 2 sample applications
- Popular tags

You can modify or add more sample data as needed for testing.
