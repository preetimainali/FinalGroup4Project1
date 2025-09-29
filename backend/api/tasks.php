<?php
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];
$path_parts = explode('/', trim($path, '/'));

// Get the last part of the URL for task ID
$task_id = end($path_parts);
$task_id = is_numeric($task_id) ? (int)$task_id : null;

switch ($method) {
    case 'GET':
        if ($task_id) {
            getTask($db, $task_id);
        } else {
            getTasks($db);
        }
        break;
    case 'POST':
        createTask($db);
        break;
    case 'PUT':
        if ($task_id) {
            updateTask($db, $task_id);
        } else {
            sendError('Task ID required for update');
        }
        break;
    case 'DELETE':
        if ($task_id) {
            deleteTask($db, $task_id);
        } else {
            sendError('Task ID required for deletion');
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getTasks($db) {
    $filters = $_GET;
    
    $sql = "SELECT t.*, u.name as poster_name, u.rating as poster_rating, u.total_ratings as poster_total_ratings,
                   GROUP_CONCAT(tt.tag) as tags
            FROM tasks t
            JOIN users u ON t.poster_id = u.id
            LEFT JOIN task_tags tt ON t.id = tt.task_id
            WHERE 1=1";
    
    $params = [];
    
    // Apply filters
    if (!empty($filters['search'])) {
        $sql .= " AND (t.title LIKE :search OR t.description LIKE :search)";
        $params[':search'] = '%' . $filters['search'] . '%';
    }
    
    if (!empty($filters['status'])) {
        $sql .= " AND t.status = :status";
        $params[':status'] = $filters['status'];
    }
    
    if (!empty($filters['job_type'])) {
        $sql .= " AND t.job_type = :job_type";
        $params[':job_type'] = $filters['job_type'];
    }
    
    if (!empty($filters['college'])) {
        $sql .= " AND t.college = :college";
        $params[':college'] = $filters['college'];
    }
    
    if (!empty($filters['tag'])) {
        $sql .= " AND t.id IN (SELECT task_id FROM task_tags WHERE tag = :tag)";
        $params[':tag'] = $filters['tag'];
    }
    
    if (!empty($filters['min_price'])) {
        $sql .= " AND t.pay_amount >= :min_price";
        $params[':min_price'] = $filters['min_price'];
    }
    
    if (!empty($filters['max_price'])) {
        $sql .= " AND t.pay_amount <= :max_price";
        $params[':max_price'] = $filters['max_price'];
    }
    
    $sql .= " GROUP BY t.id";
    
    // Sorting
    $sort_by = $filters['sort'] ?? 'newest';
    switch ($sort_by) {
        case 'newest':
            $sql .= " ORDER BY t.created_at DESC";
            break;
        case 'oldest':
            $sql .= " ORDER BY t.created_at ASC";
            break;
        case 'deadline':
            $sql .= " ORDER BY t.date ASC";
            break;
        case 'pay':
            $sql .= " ORDER BY t.pay_amount DESC";
            break;
        case 'rating':
            $sql .= " ORDER BY u.rating DESC";
            break;
        default:
            $sql .= " ORDER BY t.created_at DESC";
    }
    
    // Pagination
    $limit = (int)($filters['limit'] ?? 20);
    $offset = (int)($filters['offset'] ?? 0);
    $sql .= " LIMIT :limit OFFSET :offset";
    $params[':limit'] = $limit;
    $params[':offset'] = $offset;
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $tasks = $stmt->fetchAll();
        
        // Convert tags string to array
        foreach ($tasks as &$task) {
            $task['tags'] = $task['tags'] ? explode(',', $task['tags']) : [];
            $task['coordinates'] = $task['latitude'] && $task['longitude'] ? 
                ['lat' => (float)$task['latitude'], 'lng' => (float)$task['longitude']] : null;
        }
        
        sendResponse($tasks);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function getTask($db, $task_id) {
    $sql = "SELECT t.*, u.name as poster_name, u.email as poster_email, u.rating as poster_rating, 
                   u.total_ratings as poster_total_ratings, u.profile_picture as poster_profile_picture,
                   GROUP_CONCAT(tt.tag) as tags
            FROM tasks t
            JOIN users u ON t.poster_id = u.id
            LEFT JOIN task_tags tt ON t.id = tt.task_id
            WHERE t.id = :task_id
            GROUP BY t.id";
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':task_id', $task_id, PDO::PARAM_INT);
        $stmt->execute();
        $task = $stmt->fetch();
        
        if (!$task) {
            sendError('Task not found', 404);
        }
        
        // Convert tags string to array
        $task['tags'] = $task['tags'] ? explode(',', $task['tags']) : [];
        $task['coordinates'] = $task['latitude'] && $task['longitude'] ? 
            ['lat' => (float)$task['latitude'], 'lng' => (float)$task['longitude']] : null;
        
        sendResponse($task);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function createTask($db) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['title', 'description', 'pay_type', 'pay_amount', 'date', 'time_window', 'job_type']);
    
    try {
        $db->beginTransaction();
        
        // Insert task
        $sql = "INSERT INTO tasks (title, description, pay_type, pay_amount, date, time_window, job_type, 
                                  college, location_type, location_name, address, latitude, longitude, 
                                  poster_id, poster_name, poster_email) 
                VALUES (:title, :description, :pay_type, :pay_amount, :date, :time_window, :job_type, 
                        :college, :location_type, :location_name, :address, :latitude, :longitude, 
                        :poster_id, :poster_name, :poster_email)";
        
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':title', $input['title']);
        $stmt->bindParam(':description', $input['description']);
        $stmt->bindParam(':pay_type', $input['pay_type']);
        $stmt->bindParam(':pay_amount', $input['pay_amount']);
        $stmt->bindParam(':date', $input['date']);
        $stmt->bindParam(':time_window', $input['time_window']);
        $stmt->bindParam(':job_type', $input['job_type']);
        $stmt->bindParam(':college', $input['college']);
        $stmt->bindParam(':location_type', $input['location_type']);
        $stmt->bindParam(':location_name', $input['location_name']);
        $stmt->bindParam(':address', $input['address']);
        $stmt->bindParam(':latitude', $input['coordinates']['lat'] ?? null);
        $stmt->bindParam(':longitude', $input['coordinates']['lng'] ?? null);
        $stmt->bindParam(':poster_id', $user['id']);
        $stmt->bindParam(':poster_name', $user['name']);
        $stmt->bindParam(':poster_email', $user['email']);
        
        $stmt->execute();
        $task_id = $db->lastInsertId();
        
        // Insert tags
        if (!empty($input['tags'])) {
            $tag_sql = "INSERT INTO task_tags (task_id, tag) VALUES (:task_id, :tag)";
            $tag_stmt = $db->prepare($tag_sql);
            
            foreach ($input['tags'] as $tag) {
                $tag_stmt->bindParam(':task_id', $task_id, PDO::PARAM_INT);
                $tag_stmt->bindParam(':tag', $tag);
                $tag_stmt->execute();
            }
        }
        
        // Update popular tags
        if (!empty($input['tags'])) {
            $popular_sql = "INSERT INTO popular_tags (tag, usage_count) VALUES (:tag, 1) 
                           ON DUPLICATE KEY UPDATE usage_count = usage_count + 1";
            $popular_stmt = $db->prepare($popular_sql);
            
            foreach ($input['tags'] as $tag) {
                $popular_stmt->bindParam(':tag', $tag);
                $popular_stmt->execute();
            }
        }
        
        $db->commit();
        
        // Return the created task
        getTask($db, $task_id);
        
    } catch (PDOException $e) {
        $db->rollBack();
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function updateTask($db, $task_id) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Check if user owns the task
    $check_sql = "SELECT poster_id FROM tasks WHERE id = :task_id";
    $check_stmt = $db->prepare($check_sql);
    $check_stmt->bindParam(':task_id', $task_id, PDO::PARAM_INT);
    $check_stmt->execute();
    $task = $check_stmt->fetch();
    
    if (!$task || $task['poster_id'] != $user['id']) {
        sendError('Unauthorized', 403);
    }
    
    try {
        $db->beginTransaction();
        
        // Update task
        $update_fields = [];
        $params = [':task_id' => $task_id];
        
        $allowed_fields = ['title', 'description', 'pay_type', 'pay_amount', 'date', 'time_window', 
                          'job_type', 'college', 'location_type', 'location_name', 'address', 'status'];
        
        foreach ($allowed_fields as $field) {
            if (isset($input[$field])) {
                $update_fields[] = "$field = :$field";
                $params[":$field"] = $input[$field];
            }
        }
        
        if (!empty($update_fields)) {
            $sql = "UPDATE tasks SET " . implode(', ', $update_fields) . " WHERE id = :task_id";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
        }
        
        // Update tags if provided
        if (isset($input['tags'])) {
            // Delete existing tags
            $delete_sql = "DELETE FROM task_tags WHERE task_id = :task_id";
            $delete_stmt = $db->prepare($delete_sql);
            $delete_stmt->bindParam(':task_id', $task_id, PDO::PARAM_INT);
            $delete_stmt->execute();
            
            // Insert new tags
            if (!empty($input['tags'])) {
                $tag_sql = "INSERT INTO task_tags (task_id, tag) VALUES (:task_id, :tag)";
                $tag_stmt = $db->prepare($tag_sql);
                
                foreach ($input['tags'] as $tag) {
                    $tag_stmt->bindParam(':task_id', $task_id, PDO::PARAM_INT);
                    $tag_stmt->bindParam(':tag', $tag);
                    $tag_stmt->execute();
                }
            }
        }
        
        $db->commit();
        
        // Return updated task
        getTask($db, $task_id);
        
    } catch (PDOException $e) {
        $db->rollBack();
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function deleteTask($db, $task_id) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    // Check if user owns the task
    $check_sql = "SELECT poster_id FROM tasks WHERE id = :task_id";
    $check_stmt = $db->prepare($check_sql);
    $check_stmt->bindParam(':task_id', $task_id, PDO::PARAM_INT);
    $check_stmt->execute();
    $task = $check_stmt->fetch();
    
    if (!$task || $task['poster_id'] != $user['id']) {
        sendError('Unauthorized', 403);
    }
    
    try {
        $db->beginTransaction();
        
        // Delete related records first
        $delete_sqls = [
            "DELETE FROM task_tags WHERE task_id = :task_id",
            "DELETE FROM applications WHERE task_id = :task_id",
            "DELETE FROM posted_tasks_tracking WHERE task_id = :task_id"
        ];
        
        foreach ($delete_sqls as $sql) {
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':task_id', $task_id, PDO::PARAM_INT);
            $stmt->execute();
        }
        
        // Delete the task
        $sql = "DELETE FROM tasks WHERE id = :task_id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':task_id', $task_id, PDO::PARAM_INT);
        $stmt->execute();
        
        $db->commit();
        
        sendResponse(['message' => 'Task deleted successfully']);
        
    } catch (PDOException $e) {
        $db->rollBack();
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}
?>
