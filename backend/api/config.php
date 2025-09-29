<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'getitdone');
define('DB_USER', 'root'); // Change this to your MySQL username
define('DB_PASS', ''); // Change this to your MySQL password
define('DB_CHARSET', 'utf8mb4');

// JWT Secret for authentication (change this in production)
define('JWT_SECRET', 'your_jwt_secret_key_here_change_in_production');

// CORS settings
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection class
class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    private $charset = DB_CHARSET;
    public $conn;

    public function getConnection() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}

// Utility functions
function sendResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

function sendError($message, $status = 400) {
    sendResponse(['error' => $message], $status);
}

function validateRequired($data, $required_fields) {
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendError("Missing required field: $field");
        }
    }
}

function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

// JWT functions (simple implementation)
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function validateJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
    $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[2]));
    
    $expectedSignature = hash_hmac('sha256', $parts[0] . "." . $parts[1], JWT_SECRET, true);
    
    return hash_equals($signature, $expectedSignature) ? json_decode($payload, true) : false;
}

function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }
    
    $token = substr($authHeader, 7);
    return validateJWT($token);
}
?>
