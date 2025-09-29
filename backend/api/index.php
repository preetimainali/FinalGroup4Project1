<?php
// GetItDone API Root
header('Content-Type: application/json');

$response = [
    'name' => 'GetItDone API',
    'version' => '1.0.0',
    'description' => 'API for GetItDone task management system',
    'endpoints' => [
        'tasks' => [
            'GET /api/tasks' => 'Get all tasks (with filters)',
            'GET /api/tasks/{id}' => 'Get specific task',
            'POST /api/tasks' => 'Create new task',
            'PUT /api/tasks/{id}' => 'Update task',
            'DELETE /api/tasks/{id}' => 'Delete task'
        ],
        'users' => [
            'GET /api/users' => 'Get all users',
            'GET /api/users/{id}' => 'Get specific user',
            'POST /api/users/register' => 'Register new user',
            'POST /api/users/login' => 'Login user',
            'PUT /api/users/{id}' => 'Update user',
            'DELETE /api/users/{id}' => 'Delete user'
        ],
        'applications' => [
            'GET /api/applications' => 'Get applications',
            'GET /api/applications/{id}' => 'Get specific application',
            'POST /api/applications' => 'Create application',
            'PUT /api/applications/{id}' => 'Update application',
            'DELETE /api/applications/{id}' => 'Delete application'
        ],
        'messages' => [
            'GET /api/messages' => 'Get user messages',
            'GET /api/messages?conversations=1' => 'Get conversations',
            'GET /api/messages?other_user=email' => 'Get messages with user',
            'POST /api/messages' => 'Send message',
            'PUT /api/messages/{id}' => 'Update message',
            'DELETE /api/messages/{id}' => 'Delete message'
        ],
        'notifications' => [
            'GET /api/notifications' => 'Get user notifications',
            'PUT /api/notifications/mark_all_read' => 'Mark all as read',
            'PUT /api/notifications/{id}' => 'Update notification',
            'DELETE /api/notifications/{id}' => 'Delete notification'
        ]
    ],
    'authentication' => 'Bearer token required for most endpoints',
    'status' => 'active'
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
