-- GetItDone Database Schema
-- MySQL Database for GetItDone Task Management System

-- Create database
CREATE DATABASE IF NOT EXISTS getitdone;
USE getitdone;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    bio TEXT,
    college VARCHAR(255),
    year VARCHAR(50),
    major VARCHAR(100),
    skills JSON,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    pay_type ENUM('flat', 'hour') NOT NULL,
    pay_amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    time_window VARCHAR(100) NOT NULL,
    job_type ENUM('local', 'remote') NOT NULL,
    college VARCHAR(255),
    location_type VARCHAR(100),
    location_name VARCHAR(255),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status ENUM('open', 'review', 'assigned', 'completed', 'cancelled') DEFAULT 'open',
    poster_id INT NOT NULL,
    poster_name VARCHAR(255) NOT NULL,
    poster_email VARCHAR(255) NOT NULL,
    completed_at TIMESTAMP NULL,
    completion_notes TEXT,
    completion_photos JSON,
    payment_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (poster_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_job_type (job_type),
    INDEX idx_college (college),
    INDEX idx_date (date),
    INDEX idx_poster (poster_id)
);

-- Task tags table (many-to-many relationship)
CREATE TABLE task_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_task_tag (task_id, tag),
    INDEX idx_tag (tag)
);

-- Applications table
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    helper_id INT NOT NULL,
    helper_name VARCHAR(255) NOT NULL,
    helper_email VARCHAR(255) NOT NULL,
    note TEXT NOT NULL,
    phone VARCHAR(20),
    status ENUM('submitted', 'accepted', 'rejected', 'withdrawn') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (helper_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_task_helper (task_id, helper_id),
    INDEX idx_status (status),
    INDEX idx_helper (helper_id)
);

-- Messages table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    receiver_id INT NOT NULL,
    receiver_email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_created (created_at)
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_unread (user_id, is_read),
    INDEX idx_type (type)
);

-- Ratings table
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rater_id INT NOT NULL,
    rated_user_id INT NOT NULL,
    task_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    UNIQUE KEY unique_rating (rater_id, rated_user_id, task_id),
    INDEX idx_rated_user (rated_user_id),
    INDEX idx_rating (rating)
);

-- Posted tasks tracking table
CREATE TABLE posted_tasks_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task_id INT NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_task (user_id, task_id),
    INDEX idx_user_status (user_id, status)
);

-- Popular tags table (for caching frequently used tags)
CREATE TABLE popular_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(100) UNIQUE NOT NULL,
    usage_count INT DEFAULT 1,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usage (usage_count DESC)
);

-- Insert sample data
INSERT INTO users (email, name, phone, password_hash, profile_picture, bio, skills, rating, total_ratings, college, year, major, is_verified) VALUES
('ally@example.com', 'Ally', '555-0101', '$2b$10$example_hash_1', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'Love helping with pets and small tasks around campus! Available most weekends.', '["pet care", "moving", "cleaning"]', 4.8, 12, 'University of Alabama - Tuscaloosa', 'Junior', 'Biology', TRUE),
('jessica@example.com', 'Jessica', '555-0102', '$2b$10$example_hash_2', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'Engineering student who loves assembling furniture and fixing things. Handy with tools!', '["assembly", "tech support", "moving"]', 4.9, 8, 'University of Alabama - Tuscaloosa', 'Senior', 'Mechanical Engineering', TRUE),
('mike@example.com', 'Mike', '555-0103', '$2b$10$example_hash_3', NULL, NULL, NULL, 0.0, 0, 'University of Alabama - Tuscaloosa', 'Sophomore', 'Computer Science', TRUE),
('sarah@example.com', 'Sarah', '555-0104', '$2b$10$example_hash_4', NULL, NULL, NULL, 0.0, 0, 'University of Alabama - Tuscaloosa', 'Junior', 'Business', TRUE),
('david@example.com', 'David', '555-0105', '$2b$10$example_hash_5', NULL, NULL, NULL, 0.0, 0, 'University of Alabama - Tuscaloosa', 'Senior', 'Psychology', TRUE),
('lisa@example.com', 'Lisa', '555-0106', '$2b$10$example_hash_6', NULL, NULL, NULL, 0.0, 0, 'University of Alabama - Tuscaloosa', 'Freshman', 'Art', TRUE),
('tom@example.com', 'Tom', '555-0107', '$2b$10$example_hash_7', NULL, NULL, NULL, 0.0, 0, 'University of Alabama - Tuscaloosa', 'Graduate', 'Education', TRUE),
('emma@example.com', 'Emma', '555-0108', '$2b$10$example_hash_8', NULL, NULL, NULL, 0.0, 0, 'University of Alabama - Tuscaloosa', 'Junior', 'Mathematics', TRUE),
('alex@example.com', 'Alex', '555-0109', '$2b$10$example_hash_9', NULL, NULL, NULL, 0.0, 0, 'University of Alabama - Tuscaloosa', 'Senior', 'Information Systems', TRUE),
('john@example.com', 'John', '555-0123', '$2b$10$example_hash_10', NULL, NULL, NULL, 0.0, 0, 'University of Alabama - Tuscaloosa', 'Sophomore', 'Engineering', TRUE),
('maria@example.com', 'Maria', '555-0456', '$2b$10$example_hash_11', NULL, NULL, NULL, 0.0, 0, 'University of Alabama - Tuscaloosa', 'Junior', 'Marketing', TRUE),
('jordan@example.com', 'Jordan', '555-0789', '$2b$10$example_hash_12', NULL, NULL, NULL, 0.0, 0, 'University of Alabama - Tuscaloosa', 'Senior', 'Computer Science', TRUE),
('taylor@example.com', 'Taylor', '555-0321', '$2b$10$example_hash_13', NULL, NULL, NULL, 0.0, 0, 'University of Alabama - Tuscaloosa', 'Graduate', 'Data Science', TRUE);

-- Insert sample tasks
INSERT INTO tasks (title, description, pay_type, pay_amount, date, time_window, job_type, college, location_type, location_name, address, latitude, longitude, status, poster_id, poster_name, poster_email) VALUES
('Feed my two cats Fri–Sun', 'Need someone to feed my two cats while I''m away for the weekend. They''re very friendly and just need food and water. Located 5 minutes from Riverside campus.', 'flat', 45.00, '2024-01-19', 'Morning and evening', 'local', 'University of Alabama - Tuscaloosa', 'Apartment', 'Riverside Apartments', '123 Riverside Dr, Tuscaloosa, AL 35401', 33.2098, -87.5692, 'open', 1, 'Ally', 'ally@example.com'),
('Assemble futon this afternoon', 'Help assemble a futon frame. All parts and tools provided. Should take about 30 minutes.', 'flat', 30.00, '2024-01-15', '2:00 PM - 4:00 PM', 'local', 'University of Alabama - Tuscaloosa', 'Apartment', 'Lakeside Apartments lobby', '456 Lakeside Dr, Tuscaloosa, AL 35401', 33.2156, -87.5623, 'assigned', 2, 'Jessica', 'jessica@example.com'),
('Move 6 boxes from car to 3rd floor', 'Need help carrying 6 medium-sized boxes from my car to my 3rd floor apartment. No elevator available.', 'flat', 25.00, '2024-01-16', '10:00 AM - 12:00 PM', 'local', 'University of Alabama - Tuscaloosa', 'Campus', 'Hewson Hall', '789 University Blvd, Tuscaloosa, AL 35401', 33.2074, -87.5506, 'open', 3, 'Mike', 'mike@example.com'),
('Print & deliver 30 flyers to Hewson', 'Print 30 flyers (file provided) and deliver them to bulletin boards in Hewson Hall. Must be completed by Friday.', 'flat', 15.00, '2024-01-18', 'Any time before 5 PM', 'local', 'University of Alabama - Tuscaloosa', 'Campus', 'Hewson Hall', '789 University Blvd, Tuscaloosa, AL 35401', 33.2074, -87.5506, 'open', 4, 'Sarah', 'sarah@example.com'),
('Dog walk 20 minutes at 6 pm', 'Walk my friendly golden retriever for 20 minutes around campus. He''s very well-behaved on leash.', 'flat', 12.00, '2024-01-15', '6:00 PM - 6:30 PM', 'local', 'University of Alabama - Tuscaloosa', 'Campus', 'Student Center', 'Student Center, Tuscaloosa, AL 35401', 33.2098, -87.5692, 'open', 5, 'David', 'david@example.com'),
('Hang 2 frames with level', 'Help hang 2 picture frames on the wall. I have a level and all necessary hardware. Need someone with steady hands.', 'flat', 20.00, '2024-01-17', '3:00 PM - 5:00 PM', 'local', 'University of Alabama - Tuscaloosa', 'Apartment', 'Campus View Apartments', '321 Campus View Dr, Tuscaloosa, AL 35401', 33.2045, -87.5756, 'open', 6, 'Lisa', 'lisa@example.com'),
('Grocery run: milk & eggs', 'Quick grocery run to nearby store for milk and eggs. Will reimburse cost plus $10 for your time.', 'flat', 10.00, '2024-01-16', 'Afternoon', 'local', 'University of Alabama - Tuscaloosa', 'Campus', 'Student Center', 'Student Center, Tuscaloosa, AL 35401', 33.2098, -87.5692, 'completed', 7, 'Tom', 'tom@example.com'),
('Study partner for MIS exam', 'Looking for a study partner to review MIS 321 material. Free - just mutual help studying.', 'flat', 0.00, '2024-01-20', '7:00 PM - 9:00 PM', 'local', 'University of Alabama - Tuscaloosa', 'Campus', 'Library Study Room', 'University Library, Tuscaloosa, AL 35401', 33.2074, -87.5506, 'open', 8, 'Emma', 'emma@example.com'),
('Basic laptop cleanup (updates)', 'Help update my Windows laptop - install updates, clear temporary files, and optimize performance.', 'flat', 15.00, '2024-01-17', 'Evening', 'local', 'University of Alabama - Tuscaloosa', 'Campus', 'Student Center', 'Student Center, Tuscaloosa, AL 35401', 33.2098, -87.5692, 'open', 9, 'Alex', 'alex@example.com'),
('Virtual tutoring for Python programming', 'Need help with Python programming concepts via video call. Can work around your schedule.', 'hour', 25.00, '2024-01-22', 'Flexible - evenings preferred', 'remote', 'University of Alabama - Tuscaloosa', 'Remote', 'Online via Zoom', 'Remote', NULL, NULL, 'open', 12, 'Jordan', 'jordan@example.com'),
('Data entry project - 50 hours', 'Need help entering data from PDFs into Excel spreadsheets. Can be done remotely at your own pace.', 'flat', 200.00, '2024-01-25', 'Flexible deadline - 2 weeks', 'remote', 'University of Alabama - Tuscaloosa', 'Remote', 'Work from home', 'Remote', NULL, NULL, 'open', 13, 'Taylor', 'taylor@example.com');

-- Insert task tags
INSERT INTO task_tags (task_id, tag) VALUES
(1, 'pets'), (1, 'weekend'),
(2, 'assembly'), (2, 'furniture'),
(3, 'moving'), (3, 'manual'),
(4, 'printing'), (4, 'delivery'),
(5, 'pets'), (5, 'walking'),
(6, 'assembly'), (6, 'home'),
(7, 'errand'), (7, 'groceries'),
(8, 'tutoring'), (8, 'study'),
(9, 'tech'), (9, 'computer'),
(10, 'tutoring'), (10, 'programming'), (10, 'remote'),
(11, 'data entry'), (11, 'remote'), (11, 'excel');

-- Insert sample applications
INSERT INTO applications (task_id, helper_id, helper_name, helper_email, note, phone, status) VALUES
(2, 10, 'John', 'john@example.com', 'I have experience assembling furniture and can help this afternoon. Available at 2:30 PM.', '555-0123', 'accepted'),
(7, 11, 'Maria', 'maria@example.com', 'I can do the grocery run this afternoon. I have a car and know the area well.', '555-0456', 'accepted');

-- Insert popular tags
INSERT INTO popular_tags (tag, usage_count) VALUES
('assembly', 2), ('pets', 2), ('errand', 1), ('moving', 1), ('tutoring', 2), 
('delivery', 1), ('cleaning', 0), ('tech', 1), ('printing', 1), ('study', 1),
('manual', 1), ('groceries', 1), ('walking', 1), ('home', 1), ('computer', 1),
('remote', 2), ('programming', 1), ('data entry', 1);

-- Create views for common queries
CREATE VIEW task_details AS
SELECT 
    t.*,
    u.name as poster_name,
    u.email as poster_email,
    u.rating as poster_rating,
    u.total_ratings as poster_total_ratings,
    GROUP_CONCAT(tt.tag) as tags
FROM tasks t
JOIN users u ON t.poster_id = u.id
LEFT JOIN task_tags tt ON t.id = tt.task_id
GROUP BY t.id;

CREATE VIEW application_details AS
SELECT 
    a.*,
    t.title as task_title,
    t.poster_name as task_poster_name,
    t.pay_amount as task_pay_amount,
    u.name as helper_name,
    u.email as helper_email
FROM applications a
JOIN tasks t ON a.task_id = t.id
JOIN users u ON a.helper_id = u.id;

-- Create stored procedures for common operations
DELIMITER //

-- Procedure to get tasks with filters
CREATE PROCEDURE GetFilteredTasks(
    IN search_query VARCHAR(255),
    IN status_filter VARCHAR(50),
    IN job_type_filter VARCHAR(50),
    IN college_filter VARCHAR(255),
    IN tag_filter VARCHAR(255),
    IN limit_count INT,
    IN offset_count INT
)
BEGIN
    SELECT DISTINCT t.*, u.name as poster_name, u.rating as poster_rating
    FROM tasks t
    JOIN users u ON t.poster_id = u.id
    LEFT JOIN task_tags tt ON t.id = tt.task_id
    WHERE 
        (search_query IS NULL OR search_query = '' OR 
         t.title LIKE CONCAT('%', search_query, '%') OR 
         t.description LIKE CONCAT('%', search_query, '%'))
        AND (status_filter IS NULL OR status_filter = '' OR t.status = status_filter)
        AND (job_type_filter IS NULL OR job_type_filter = '' OR t.job_type = job_type_filter)
        AND (college_filter IS NULL OR college_filter = '' OR t.college = college_filter)
        AND (tag_filter IS NULL OR tag_filter = '' OR tt.tag = tag_filter)
    ORDER BY t.created_at DESC
    LIMIT limit_count OFFSET offset_count;
END //

-- Procedure to update user rating
CREATE PROCEDURE UpdateUserRating(IN user_id INT)
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    DECLARE total_count INT;
    
    SELECT AVG(rating), COUNT(*) INTO avg_rating, total_count
    FROM ratings 
    WHERE rated_user_id = user_id;
    
    UPDATE users 
    SET rating = COALESCE(avg_rating, 0), total_ratings = total_count
    WHERE id = user_id;
END //

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_tasks_search ON tasks(title, description);
CREATE INDEX idx_tasks_location ON tasks(latitude, longitude);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON getitdone.* TO 'getitdone_user'@'localhost' IDENTIFIED BY 'your_password';
-- FLUSH PRIVILEGES;
