<?php
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];
$path_parts = explode('/', trim($path, '/'));

// Get the last part of the URL for user ID or email
$identifier = end($path_parts);
$identifier = $identifier === 'users' ? null : $identifier;

switch ($method) {
    case 'GET':
        if ($identifier) {
            getUser($db, $identifier);
        } else {
            getUsers($db);
        }
        break;
    case 'POST':
        if ($identifier === 'login') {
            loginUser($db);
        } elseif ($identifier === 'register') {
            registerUser($db);
        } else {
            createUser($db);
        }
        break;
    case 'PUT':
        if ($identifier) {
            updateUser($db, $identifier);
        } else {
            sendError('User ID or email required for update');
        }
        break;
    case 'DELETE':
        if ($identifier) {
            deleteUser($db, $identifier);
        } else {
            sendError('User ID or email required for deletion');
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getUsers($db) {
    $filters = $_GET;
    
    $sql = "SELECT id, email, name, phone, profile_picture, bio, college, year, major, 
                   skills, rating, total_ratings, is_verified, created_at
            FROM users WHERE 1=1";
    
    $params = [];
    
    // Apply filters
    if (!empty($filters['search'])) {
        $sql .= " AND (name LIKE :search OR email LIKE :search)";
        $params[':search'] = '%' . $filters['search'] . '%';
    }
    
    if (!empty($filters['college'])) {
        $sql .= " AND college = :college";
        $params[':college'] = $filters['college'];
    }
    
    if (!empty($filters['min_rating'])) {
        $sql .= " AND rating >= :min_rating";
        $params[':min_rating'] = $filters['min_rating'];
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
        $users = $stmt->fetchAll();
        
        // Decode JSON fields
        foreach ($users as &$user) {
            $user['skills'] = $user['skills'] ? json_decode($user['skills'], true) : [];
        }
        
        sendResponse($users);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function getUser($db, $identifier) {
    // Check if identifier is numeric (ID) or email
    $is_email = filter_var($identifier, FILTER_VALIDATE_EMAIL);
    
    if ($is_email) {
        $sql = "SELECT * FROM users WHERE email = :identifier";
    } else {
        $sql = "SELECT * FROM users WHERE id = :identifier";
    }
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':identifier', $identifier);
        $stmt->execute();
        $user = $stmt->fetch();
        
        if (!$user) {
            sendError('User not found', 404);
        }
        
        // Remove sensitive data
        unset($user['password_hash']);
        
        // Decode JSON fields
        $user['skills'] = $user['skills'] ? json_decode($user['skills'], true) : [];
        
        sendResponse($user);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function loginUser($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['email', 'password']);
    
    try {
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':email', $input['email']);
        $stmt->execute();
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            sendError('Invalid email or password', 401);
        }
        
        // Remove sensitive data
        unset($user['password_hash']);
        
        // Generate JWT token
        $payload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'exp' => time() + (24 * 60 * 60) // 24 hours
        ];
        
        $token = generateJWT($payload);
        
        // Decode JSON fields
        $user['skills'] = $user['skills'] ? json_decode($user['skills'], true) : [];
        
        sendResponse([
            'user' => $user,
            'token' => $token
        ]);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function registerUser($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['email', 'name', 'password']);
    
    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format');
    }
    
    // Validate password strength
    if (strlen($input['password']) < 6) {
        sendError('Password must be at least 6 characters long');
    }
    
    try {
        // Check if user already exists
        $check_sql = "SELECT id FROM users WHERE email = :email";
        $check_stmt = $db->prepare($check_sql);
        $check_stmt->bindParam(':email', $input['email']);
        $check_stmt->execute();
        
        if ($check_stmt->fetch()) {
            sendError('User with this email already exists', 409);
        }
        
        // Hash password
        $password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
        
        // Insert user
        $sql = "INSERT INTO users (email, name, phone, password_hash, bio, college, year, major, skills) 
                VALUES (:email, :name, :phone, :password_hash, :bio, :college, :year, :major, :skills)";
        
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':email', $input['email']);
        $stmt->bindParam(':name', $input['name']);
        $stmt->bindParam(':phone', $input['phone'] ?? null);
        $stmt->bindParam(':password_hash', $password_hash);
        $stmt->bindParam(':bio', $input['bio'] ?? null);
        $stmt->bindParam(':college', $input['college'] ?? null);
        $stmt->bindParam(':year', $input['year'] ?? null);
        $stmt->bindParam(':major', $input['major'] ?? null);
        $stmt->bindParam(':skills', json_encode($input['skills'] ?? []));
        
        $stmt->execute();
        $user_id = $db->lastInsertId();
        
        // Get the created user
        $user_sql = "SELECT * FROM users WHERE id = :user_id";
        $user_stmt = $db->prepare($user_sql);
        $user_stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $user_stmt->execute();
        $user = $user_stmt->fetch();
        
        // Remove sensitive data
        unset($user['password_hash']);
        
        // Generate JWT token
        $payload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'exp' => time() + (24 * 60 * 60) // 24 hours
        ];
        
        $token = generateJWT($payload);
        
        // Decode JSON fields
        $user['skills'] = $user['skills'] ? json_decode($user['skills'], true) : [];
        
        sendResponse([
            'user' => $user,
            'token' => $token
        ], 201);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function createUser($db) {
    $user = getCurrentUser();
    if (!$user) {
        sendError('Authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['email', 'name', 'password']);
    
    try {
        // Check if user already exists
        $check_sql = "SELECT id FROM users WHERE email = :email";
        $check_stmt = $db->prepare($check_sql);
        $check_stmt->bindParam(':email', $input['email']);
        $check_stmt->execute();
        
        if ($check_stmt->fetch()) {
            sendError('User with this email already exists', 409);
        }
        
        // Hash password
        $password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
        
        // Insert user
        $sql = "INSERT INTO users (email, name, phone, password_hash, bio, college, year, major, skills) 
                VALUES (:email, :name, :phone, :password_hash, :bio, :college, :year, :major, :skills)";
        
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':email', $input['email']);
        $stmt->bindParam(':name', $input['name']);
        $stmt->bindParam(':phone', $input['phone'] ?? null);
        $stmt->bindParam(':password_hash', $password_hash);
        $stmt->bindParam(':bio', $input['bio'] ?? null);
        $stmt->bindParam(':college', $input['college'] ?? null);
        $stmt->bindParam(':year', $input['year'] ?? null);
        $stmt->bindParam(':major', $input['major'] ?? null);
        $stmt->bindParam(':skills', json_encode($input['skills'] ?? []));
        
        $stmt->execute();
        $user_id = $db->lastInsertId();
        
        // Get the created user
        getUser($db, $user_id);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function updateUser($db, $identifier) {
    $current_user = getCurrentUser();
    if (!$current_user) {
        sendError('Authentication required', 401);
    }
    
    // Check if user is updating their own profile
    $is_email = filter_var($identifier, FILTER_VALIDATE_EMAIL);
    if ($is_email && $identifier !== $current_user['email']) {
        sendError('Unauthorized', 403);
    } elseif (!$is_email && (int)$identifier !== $current_user['id']) {
        sendError('Unauthorized', 403);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        $update_fields = [];
        $params = [];
        
        $allowed_fields = ['name', 'phone', 'bio', 'college', 'year', 'major', 'skills', 'profile_picture'];
        
        foreach ($allowed_fields as $field) {
            if (isset($input[$field])) {
                $update_fields[] = "$field = :$field";
                $params[":$field"] = $field === 'skills' ? json_encode($input[$field]) : $input[$field];
            }
        }
        
        // Handle password update separately
        if (isset($input['password'])) {
            if (strlen($input['password']) < 6) {
                sendError('Password must be at least 6 characters long');
            }
            $update_fields[] = "password_hash = :password_hash";
            $params[':password_hash'] = password_hash($input['password'], PASSWORD_DEFAULT);
        }
        
        if (empty($update_fields)) {
            sendError('No valid fields to update');
        }
        
        $params[':identifier'] = $identifier;
        
        if ($is_email) {
            $sql = "UPDATE users SET " . implode(', ', $update_fields) . " WHERE email = :identifier";
        } else {
            $sql = "UPDATE users SET " . implode(', ', $update_fields) . " WHERE id = :identifier";
        }
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        // Return updated user
        getUser($db, $identifier);
        
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function deleteUser($db, $identifier) {
    $current_user = getCurrentUser();
    if (!$current_user) {
        sendError('Authentication required', 401);
    }
    
    // Check if user is deleting their own account
    $is_email = filter_var($identifier, FILTER_VALIDATE_EMAIL);
    if ($is_email && $identifier !== $current_user['email']) {
        sendError('Unauthorized', 403);
    } elseif (!$is_email && (int)$identifier !== $current_user['id']) {
        sendError('Unauthorized', 403);
    }
    
    try {
        $db->beginTransaction();
        
        // Delete related records first
        $delete_sqls = [
            "DELETE FROM task_tags WHERE task_id IN (SELECT id FROM tasks WHERE poster_id = :user_id)",
            "DELETE FROM applications WHERE helper_id = :user_id OR task_id IN (SELECT id FROM tasks WHERE poster_id = :user_id)",
            "DELETE FROM messages WHERE sender_id = :user_id OR receiver_id = :user_id",
            "DELETE FROM notifications WHERE user_id = :user_id",
            "DELETE FROM ratings WHERE rater_id = :user_id OR rated_user_id = :user_id",
            "DELETE FROM posted_tasks_tracking WHERE user_id = :user_id",
            "DELETE FROM tasks WHERE poster_id = :user_id"
        ];
        
        $user_id = $is_email ? $current_user['id'] : $identifier;
        
        foreach ($delete_sqls as $sql) {
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();
        }
        
        // Delete the user
        if ($is_email) {
            $sql = "DELETE FROM users WHERE email = :identifier";
        } else {
            $sql = "DELETE FROM users WHERE id = :identifier";
        }
        
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':identifier', $identifier);
        $stmt->execute();
        
        $db->commit();
        
        sendResponse(['message' => 'User deleted successfully']);
        
    } catch (PDOException $e) {
        $db->rollBack();
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}
?>
