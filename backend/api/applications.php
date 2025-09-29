<?php
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];
$path_parts = explode('/', trim($path, '/'));

// Get the last part of the URL for application ID
$application_id = end($path_parts);
$application_id = is_numeric($application_id) ? (int)$application_id : null;

switch ($method) {
    case 'GET':
        if ($application_id) {
            getApplication($db, $application_id);
        } else {
            getApplications($db);
        }
        break;
    case 'POST':
        createApplication($db);
        break;
    case 'PUT':
        if ($application_id) {
            updateApplication($db, $application_id);
        } else {
            sendError('Application ID required for update');
        }
        break;
    case 'DELETE':
        if ($application_id) {
            deleteApplication($db, $application_id);
        } else {
            sendError('Application ID required for deletion');
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getApplications($db) {
    $filters = $_GET;
    
    $sql = "SELECT a.*, t.title as task_title, t.poster_name as task_poster_name, 
                   t.pay_amount as task_pay_amount, u.name as helper_name, u.email as helper_email
            FROM applications a
            JOIN tasks t ON a.task_id = t.id
            JOIN users u ON a.helper_id = u.id
            WHERE 1=1";
    
    $params = [];
    
    // Apply filters
    if (!empty($filters['task_id'])) {
        $sql .= " AND a.task_id = :task_id";
        $params[':task_id'] = $filters['task_id'];
    }
    
    if (!empty($filters['helper_id'])) {
        $sql .= " AND a.helper_id = :helper_id";
        $params[':helper_id'] = $filters['helper_id'];
    }
    
    if (!empty($filters['status'])) {
        $sql .= " AND a.status = :status";
        $params[':status'] = $filters['status'];
    }
    
    $sql .= " ORDER BY a.created_at DESC";
    
    // Pagination
    $limit = (int)($filters['limit'] ?? 20);
    $offset = (int)($filters['offset'] ?? 0);
    $sql .= " LIMIT :limit OFFSET :offset";
    $params[':limit'] = $limit;
    $params[':offset'] = $offset;
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $applications = $stmt->fetchAll();
        
        sendResponse($applications);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function getApplication($db, $application_id) {
    $sql = "SELECT a.*, t.title as task_title, t.poster_name as task_poster_name, 
                   t.pay_amount as task_pay_amount, u.name as helper_name, u.email as helper_email
            FROM applications a
            JOIN tasks t ON a.task_id = t.id
            JOIN users u ON a.helper_id = u.id
            WHERE a.id = :application_id";
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':application_id', $application_id, PDO::PARAM_INT);
        $stmt->execute();
        $application = $stmt->fetch();
        
        if (!$application) {
            sendError('Application not found', 404);
        }
        
        sendResponse($application);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function createApplication($db) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['task_id', 'note']);
    
    try {
        // Check if task exists
        $task_sql = "SELECT * FROM tasks WHERE id = :task_id";
        $task_stmt = $db->prepare($task_sql);
        $task_stmt->bindParam(':task_id', $input['task_id'], PDO::PARAM_INT);
        $task_stmt->execute();
        $task = $task_stmt->fetch();
        
        if (!$task) {
            sendError('Task not found', 404);
        }
        
        // Check if user already applied
        $check_sql = "SELECT id FROM applications WHERE task_id = :task_id AND helper_id = :helper_id";
        $check_stmt = $db->prepare($check_sql);
        $check_stmt->bindParam(':task_id', $input['task_id'], PDO::PARAM_INT);
        $check_stmt->bindParam(':helper_id', $user['id'], PDO::PARAM_INT);
        $check_stmt->execute();
        
        if ($check_stmt->fetch()) {
            sendError('You have already applied for this task', 409);
        }
        
        // Check if user is trying to apply to their own task
        if ($task['poster_id'] == $user['id']) {
            sendError('You cannot apply to your own task', 400);
        }
        
        // Insert application
        $sql = "INSERT INTO applications (task_id, helper_id, helper_name, helper_email, note, phone) 
                VALUES (:task_id, :helper_id, :helper_name, :helper_email, :note, :phone)";
        
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':task_id', $input['task_id'], PDO::PARAM_INT);
        $stmt->bindParam(':helper_id', $user['id'], PDO::PARAM_INT);
        $stmt->bindParam(':helper_name', $user['name']);
        $stmt->bindParam(':helper_email', $user['email']);
        $stmt->bindParam(':note', $input['note']);
        $stmt->bindParam(':phone', $input['phone'] ?? $user['phone']);
        
        $stmt->execute();
        $application_id = $db->lastInsertId();
        
        // Create notification for task poster
        $notification_sql = "INSERT INTO notifications (user_id, type, title, message, data) 
                            VALUES (:user_id, 'application', 'New Application', 
                                   :message, :data)";
        $notification_stmt = $db->prepare($notification_sql);
        $notification_stmt->bindParam(':user_id', $task['poster_id'], PDO::PARAM_INT);
        $notification_stmt->bindParam(':message', $user['name'] . ' applied for your task: ' . $task['title']);
        $notification_stmt->bindParam(':data', json_encode(['application_id' => $application_id, 'task_id' => $input['task_id']]));
        $notification_stmt->execute();
        
        // Return the created application
        getApplication($db, $application_id);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function updateApplication($db, $application_id) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        // Check if application exists and user has permission
        $check_sql = "SELECT a.*, t.poster_id FROM applications a 
                     JOIN tasks t ON a.task_id = t.id 
                     WHERE a.id = :application_id";
        $check_stmt = $db->prepare($check_sql);
        $check_stmt->bindParam(':application_id', $application_id, PDO::PARAM_INT);
        $check_stmt->execute();
        $application = $check_stmt->fetch();
        
        if (!$application) {
            sendError('Application not found', 404);
        }
        
        // Check if user is the helper or the task poster
        if ($application['helper_id'] != $user['id'] && $application['poster_id'] != $user['id']) {
            sendError('Unauthorized', 403);
        }
        
        $db->beginTransaction();
        
        // Update application
        $update_fields = [];
        $params = [':application_id' => $application_id];
        
        $allowed_fields = ['note', 'phone', 'status'];
        
        foreach ($allowed_fields as $field) {
            if (isset($input[$field])) {
                $update_fields[] = "$field = :$field";
                $params[":$field"] = $input[$field];
            }
        }
        
        if (!empty($update_fields)) {
            $sql = "UPDATE applications SET " . implode(', ', $update_fields) . " WHERE id = :application_id";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
        }
        
        // If status is being changed to 'accepted', update task status and reject other applications
        if (isset($input['status']) && $input['status'] === 'accepted' && $application['poster_id'] == $user['id']) {
            // Update task status to 'assigned'
            $task_sql = "UPDATE tasks SET status = 'assigned' WHERE id = :task_id";
            $task_stmt = $db->prepare($task_sql);
            $task_stmt->bindParam(':task_id', $application['task_id'], PDO::PARAM_INT);
            $task_stmt->execute();
            
            // Reject other applications for this task
            $reject_sql = "UPDATE applications SET status = 'rejected' 
                          WHERE task_id = :task_id AND id != :application_id AND status = 'submitted'";
            $reject_stmt = $db->prepare($reject_sql);
            $reject_stmt->bindParam(':task_id', $application['task_id'], PDO::PARAM_INT);
            $reject_stmt->bindParam(':application_id', $application_id, PDO::PARAM_INT);
            $reject_stmt->execute();
            
            // Create notification for the accepted helper
            $notification_sql = "INSERT INTO notifications (user_id, type, title, message, data) 
                                VALUES (:user_id, 'application_accepted', 'Application Accepted', 
                                       :message, :data)";
            $notification_stmt = $db->prepare($notification_sql);
            $notification_stmt->bindParam(':user_id', $application['helper_id'], PDO::PARAM_INT);
            $notification_stmt->bindParam(':message', 'Your application for "' . $application['task_title'] . '" has been accepted!');
            $notification_stmt->bindParam(':data', json_encode(['application_id' => $application_id, 'task_id' => $application['task_id']]));
            $notification_stmt->execute();
        }
        
        $db->commit();
        
        // Return updated application
        getApplication($db, $application_id);
        
    } catch (PDOException $e) {
        $db->rollBack();
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function deleteApplication($db, $application_id) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    try {
        // Check if application exists and user has permission
        $check_sql = "SELECT helper_id FROM applications WHERE id = :application_id";
        $check_stmt = $db->prepare($check_sql);
        $check_stmt->bindParam(':application_id', $application_id, PDO::PARAM_INT);
        $check_stmt->execute();
        $application = $check_stmt->fetch();
        
        if (!$application) {
            sendError('Application not found', 404);
        }
        
        // Check if user is the helper
        if ($application['helper_id'] != $user['id']) {
            sendError('Unauthorized', 403);
        }
        
        // Delete application
        $sql = "DELETE FROM applications WHERE id = :application_id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':application_id', $application_id, PDO::PARAM_INT);
        $stmt->execute();
        
        sendResponse(['message' => 'Application deleted successfully']);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}
?>
