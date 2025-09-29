<?php
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];
$path_parts = explode('/', trim($path, '/'));

// Get the last part of the URL for message ID
$message_id = end($path_parts);
$message_id = is_numeric($message_id) ? (int)$message_id : null;

switch ($method) {
    case 'GET':
        if ($message_id) {
            getMessage($db, $message_id);
        } else {
            getMessages($db);
        }
        break;
    case 'POST':
        createMessage($db);
        break;
    case 'PUT':
        if ($message_id) {
            updateMessage($db, $message_id);
        } else {
            sendError('Message ID required for update');
        }
        break;
    case 'DELETE':
        if ($message_id) {
            deleteMessage($db, $message_id);
        } else {
            sendError('Message ID required for deletion');
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getMessages($db) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $filters = $_GET;
    
    // Get conversations for the user
    if (isset($filters['conversations'])) {
        getConversations($db, $user['id']);
        return;
    }
    
    // Get messages between two users
    if (isset($filters['other_user'])) {
        getMessagesBetweenUsers($db, $user['id'], $filters['other_user']);
        return;
    }
    
    // Get all messages for the user
    $sql = "SELECT m.*, 
                   sender.name as sender_name, sender.email as sender_email,
                   receiver.name as receiver_name, receiver.email as receiver_email
            FROM messages m
            JOIN users sender ON m.sender_id = sender.id
            JOIN users receiver ON m.receiver_id = receiver.id
            WHERE m.sender_id = :user_id OR m.receiver_id = :user_id
            ORDER BY m.created_at DESC";
    
    $params = [':user_id' => $user['id']];
    
    // Pagination
    $limit = (int)($filters['limit'] ?? 50);
    $offset = (int)($filters['offset'] ?? 0);
    $sql .= " LIMIT :limit OFFSET :offset";
    $params[':limit'] = $limit;
    $params[':offset'] = $offset;
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $messages = $stmt->fetchAll();
        
        sendResponse($messages);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function getConversations($db, $user_id) {
    $sql = "SELECT 
                CASE 
                    WHEN m.sender_id = :user_id THEN m.receiver_id
                    ELSE m.sender_id
                END as other_user_id,
                CASE 
                    WHEN m.sender_id = :user_id THEN u_receiver.name
                    ELSE u_sender.name
                END as other_user_name,
                CASE 
                    WHEN m.sender_id = :user_id THEN u_receiver.email
                    ELSE u_sender.email
                END as other_user_email,
                m.content as last_message,
                m.created_at as last_message_time,
                COUNT(CASE WHEN m.receiver_id = :user_id AND m.is_read = 0 THEN 1 END) as unread_count
            FROM messages m
            JOIN users u_sender ON m.sender_id = u_sender.id
            JOIN users u_receiver ON m.receiver_id = u_receiver.id
            WHERE m.sender_id = :user_id OR m.receiver_id = :user_id
            GROUP BY other_user_id, other_user_name, other_user_email, last_message, last_message_time
            ORDER BY last_message_time DESC";
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        $conversations = $stmt->fetchAll();
        
        sendResponse($conversations);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function getMessagesBetweenUsers($db, $user_id, $other_user_email) {
    // Get other user by email
    $user_sql = "SELECT id FROM users WHERE email = :email";
    $user_stmt = $db->prepare($user_sql);
    $user_stmt->bindParam(':email', $other_user_email);
    $user_stmt->execute();
    $other_user = $user_stmt->fetch();
    
    if (!$other_user) {
        sendError('User not found', 404);
    }
    
    $sql = "SELECT m.*, 
                   sender.name as sender_name, sender.email as sender_email
            FROM messages m
            JOIN users sender ON m.sender_id = sender.id
            WHERE (m.sender_id = :user_id AND m.receiver_id = :other_user_id) 
               OR (m.sender_id = :other_user_id AND m.receiver_id = :user_id)
            ORDER BY m.created_at ASC";
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':other_user_id', $other_user['id'], PDO::PARAM_INT);
        $stmt->execute();
        $messages = $stmt->fetchAll();
        
        // Mark messages as read
        $mark_read_sql = "UPDATE messages SET is_read = 1 
                         WHERE sender_id = :other_user_id AND receiver_id = :user_id AND is_read = 0";
        $mark_read_stmt = $db->prepare($mark_read_sql);
        $mark_read_stmt->bindParam(':other_user_id', $other_user['id'], PDO::PARAM_INT);
        $mark_read_stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $mark_read_stmt->execute();
        
        sendResponse($messages);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function getMessage($db, $message_id) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $sql = "SELECT m.*, 
                   sender.name as sender_name, sender.email as sender_email,
                   receiver.name as receiver_name, receiver.email as receiver_email
            FROM messages m
            JOIN users sender ON m.sender_id = sender.id
            JOIN users receiver ON m.receiver_id = receiver.id
            WHERE m.id = :message_id AND (m.sender_id = :user_id OR m.receiver_id = :user_id)";
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':message_id', $message_id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $user['id'], PDO::PARAM_INT);
        $stmt->execute();
        $message = $stmt->fetch();
        
        if (!$message) {
            sendError('Message not found', 404);
        }
        
        sendResponse($message);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function createMessage($db) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['receiver_email', 'content']);
    
    try {
        // Get receiver by email
        $receiver_sql = "SELECT id, name FROM users WHERE email = :email";
        $receiver_stmt = $db->prepare($receiver_sql);
        $receiver_stmt->bindParam(':email', $input['receiver_email']);
        $receiver_stmt->execute();
        $receiver = $receiver_stmt->fetch();
        
        if (!$receiver) {
            sendError('Receiver not found', 404);
        }
        
        // Insert message
        $sql = "INSERT INTO messages (sender_id, sender_email, sender_name, receiver_id, receiver_email, content) 
                VALUES (:sender_id, :sender_email, :sender_name, :receiver_id, :receiver_email, :content)";
        
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':sender_id', $user['id'], PDO::PARAM_INT);
        $stmt->bindParam(':sender_email', $user['email']);
        $stmt->bindParam(':sender_name', $user['name']);
        $stmt->bindParam(':receiver_id', $receiver['id'], PDO::PARAM_INT);
        $stmt->bindParam(':receiver_email', $input['receiver_email']);
        $stmt->bindParam(':content', $input['content']);
        
        $stmt->execute();
        $message_id = $db->lastInsertId();
        
        // Create notification for receiver
        $notification_sql = "INSERT INTO notifications (user_id, type, title, message, data) 
                            VALUES (:user_id, 'message', 'New Message', 
                                   :message, :data)";
        $notification_stmt = $db->prepare($notification_sql);
        $notification_stmt->bindParam(':user_id', $receiver['id'], PDO::PARAM_INT);
        $notification_stmt->bindParam(':message', $user['name'] . ' sent you a message');
        $notification_stmt->bindParam(':data', json_encode(['conversation_partner' => $user['email']]));
        $notification_stmt->execute();
        
        // Return the created message
        getMessage($db, $message_id);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function updateMessage($db, $message_id) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        // Check if message exists and user is the sender
        $check_sql = "SELECT sender_id FROM messages WHERE id = :message_id";
        $check_stmt = $db->prepare($check_sql);
        $check_stmt->bindParam(':message_id', $message_id, PDO::PARAM_INT);
        $check_stmt->execute();
        $message = $check_stmt->fetch();
        
        if (!$message) {
            sendError('Message not found', 404);
        }
        
        if ($message['sender_id'] != $user['id']) {
            sendError('Unauthorized', 403);
        }
        
        // Update message
        $update_fields = [];
        $params = [':message_id' => $message_id];
        
        $allowed_fields = ['content'];
        
        foreach ($allowed_fields as $field) {
            if (isset($input[$field])) {
                $update_fields[] = "$field = :$field";
                $params[":$field"] = $input[$field];
            }
        }
        
        if (empty($update_fields)) {
            sendError('No valid fields to update');
        }
        
        $sql = "UPDATE messages SET " . implode(', ', $update_fields) . " WHERE id = :message_id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        // Return updated message
        getMessage($db, $message_id);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function deleteMessage($db, $message_id) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    try {
        // Check if message exists and user has permission
        $check_sql = "SELECT sender_id, receiver_id FROM messages WHERE id = :message_id";
        $check_stmt = $db->prepare($check_sql);
        $check_stmt->bindParam(':message_id', $message_id, PDO::PARAM_INT);
        $check_stmt->execute();
        $message = $check_stmt->fetch();
        
        if (!$message) {
            sendError('Message not found', 404);
        }
        
        // Check if user is the sender or receiver
        if ($message['sender_id'] != $user['id'] && $message['receiver_id'] != $user['id']) {
            sendError('Unauthorized', 403);
        }
        
        // Delete message
        $sql = "DELETE FROM messages WHERE id = :message_id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':message_id', $message_id, PDO::PARAM_INT);
        $stmt->execute();
        
        sendResponse(['message' => 'Message deleted successfully']);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}
?>
