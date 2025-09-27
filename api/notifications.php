<?php
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];
$path_parts = explode('/', trim($path, '/'));

// Get the last part of the URL for notification ID
$notification_id = end($path_parts);
$notification_id = is_numeric($notification_id) ? (int)$notification_id : null;

switch ($method) {
    case 'GET':
        if ($notification_id) {
            getNotification($db, $notification_id);
        } else {
            getNotifications($db);
        }
        break;
    case 'POST':
        createNotification($db);
        break;
    case 'PUT':
        if ($notification_id) {
            updateNotification($db, $notification_id);
        } else {
            sendError('Notification ID required for update');
        }
        break;
    case 'DELETE':
        if ($notification_id) {
            deleteNotification($db, $notification_id);
        } else {
            sendError('Notification ID required for deletion');
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getNotifications($db) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $filters = $_GET;
    
    $sql = "SELECT * FROM notifications WHERE user_id = :user_id";
    $params = [':user_id' => $user['id']];
    
    // Apply filters
    if (isset($filters['unread_only']) && $filters['unread_only'] === 'true') {
        $sql .= " AND is_read = 0";
    }
    
    if (!empty($filters['type'])) {
        $sql .= " AND type = :type";
        $params[':type'] = $filters['type'];
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    // Pagination
    $limit = (int)($filters['limit'] ?? 20);
    $offset = (int)($filters['offset'] ?? 0);
    $sql .= " LIMIT :limit OFFSET :offset";
    $params[':limit'] = $limit;
    $params[':offset'] = $offset;
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $notifications = $stmt->fetchAll();
        
        // Decode JSON data field
        foreach ($notifications as &$notification) {
            $notification['data'] = $notification['data'] ? json_decode($notification['data'], true) : null;
        }
        
        sendResponse($notifications);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function getNotification($db, $notification_id) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $sql = "SELECT * FROM notifications WHERE id = :notification_id AND user_id = :user_id";
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':notification_id', $notification_id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $user['id'], PDO::PARAM_INT);
        $stmt->execute();
        $notification = $stmt->fetch();
        
        if (!$notification) {
            sendError('Notification not found', 404);
        }
        
        // Decode JSON data field
        $notification['data'] = $notification['data'] ? json_decode($notification['data'], true) : null;
        
        sendResponse($notification);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function createNotification($db) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['user_id', 'type', 'title', 'message']);
    
    // Check if user is creating notification for themselves or is admin
    if ($input['user_id'] != $user['id']) {
        // In a real app, you'd check if user is admin
        sendError('Unauthorized', 403);
    }
    
    try {
        $sql = "INSERT INTO notifications (user_id, type, title, message, data) 
                VALUES (:user_id, :type, :title, :message, :data)";
        
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':user_id', $input['user_id'], PDO::PARAM_INT);
        $stmt->bindParam(':type', $input['type']);
        $stmt->bindParam(':title', $input['title']);
        $stmt->bindParam(':message', $input['message']);
        $stmt->bindParam(':data', json_encode($input['data'] ?? null));
        
        $stmt->execute();
        $notification_id = $db->lastInsertId();
        
        // Return the created notification
        getNotification($db, $notification_id);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function updateNotification($db, $notification_id) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        // Check if notification exists and belongs to user
        $check_sql = "SELECT user_id FROM notifications WHERE id = :notification_id";
        $check_stmt = $db->prepare($check_sql);
        $check_stmt->bindParam(':notification_id', $notification_id, PDO::PARAM_INT);
        $check_stmt->execute();
        $notification = $check_stmt->fetch();
        
        if (!$notification) {
            sendError('Notification not found', 404);
        }
        
        if ($notification['user_id'] != $user['id']) {
            sendError('Unauthorized', 403);
        }
        
        // Update notification
        $update_fields = [];
        $params = [':notification_id' => $notification_id];
        
        $allowed_fields = ['is_read'];
        
        foreach ($allowed_fields as $field) {
            if (isset($input[$field])) {
                $update_fields[] = "$field = :$field";
                $params[":$field"] = $input[$field];
            }
        }
        
        if (empty($update_fields)) {
            sendError('No valid fields to update');
        }
        
        $sql = "UPDATE notifications SET " . implode(', ', $update_fields) . " WHERE id = :notification_id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        // Return updated notification
        getNotification($db, $notification_id);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function deleteNotification($db, $notification_id) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    try {
        // Check if notification exists and belongs to user
        $check_sql = "SELECT user_id FROM notifications WHERE id = :notification_id";
        $check_stmt = $db->prepare($check_sql);
        $check_stmt->bindParam(':notification_id', $notification_id, PDO::PARAM_INT);
        $check_stmt->execute();
        $notification = $check_stmt->fetch();
        
        if (!$notification) {
            sendError('Notification not found', 404);
        }
        
        if ($notification['user_id'] != $user['id']) {
            sendError('Unauthorized', 403);
        }
        
        // Delete notification
        $sql = "DELETE FROM notifications WHERE id = :notification_id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':notification_id', $notification_id, PDO::PARAM_INT);
        $stmt->execute();
        
        sendResponse(['message' => 'Notification deleted successfully']);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

// Special endpoint to mark all notifications as read
if ($method === 'PUT' && isset($_GET['mark_all_read'])) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    try {
        $sql = "UPDATE notifications SET is_read = 1 WHERE user_id = :user_id AND is_read = 0";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':user_id', $user['id'], PDO::PARAM_INT);
        $stmt->execute();
        
        sendResponse(['message' => 'All notifications marked as read']);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}
?>
