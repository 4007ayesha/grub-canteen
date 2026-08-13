CREATE DATABASE IF NOT EXISTS grub_canteen;
USE grub_canteen;

-- ============================================================
-- GRUB CANTEEN DATABASE SCHEMA
-- ============================================================
-- Foreign keys use MySQL's default ON DELETE RESTRICT behavior.
-- This prevents accidental deletion of records that are referenced
-- by other tables and helps preserve order history.
--
-- Token policy is intentionally NOT enforced at the database level.
-- Whether tokens reset daily, monthly, or follow another policy
-- will be decided during backend design.
-- ============================================================


-- 1. Categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);


-- 2. Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 3. Menu Items
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    category_id INT NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),

    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_menu_items_category
ON menu_items(category_id);


-- 4. Orders
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_number VARCHAR(10) NOT NULL,
    status ENUM('received', 'preparing', 'ready', 'collected')
        NOT NULL DEFAULT 'received',
    total_amount DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_orders_user
ON orders(user_id);

CREATE INDEX idx_orders_created_at
ON orders(created_at);

CREATE INDEX idx_orders_token_created
ON orders(token_number, created_at);


-- 5. Order Items
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_order DECIMAL(8,2) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE INDEX idx_order_items_order
ON order_items(order_id);

CREATE INDEX idx_order_items_menu_item
ON order_items(menu_item_id);


-- 6. Payments
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    status ENUM('pending', 'success', 'failed')
        NOT NULL DEFAULT 'pending',
    method VARCHAR(50),
    paid_at TIMESTAMP NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id)
);


-- 7. Feedback
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT chk_feedback_rating
        CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_feedback_order
ON feedback(order_id);

CREATE INDEX idx_feedback_user
ON feedback(user_id);


-- 8. Notifications
-- is_read is used instead of read for clearer naming.
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_user
ON notifications(user_id);


-- 9. Inventory
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id INT NOT NULL UNIQUE,
    current_stock INT NOT NULL DEFAULT 0,
    min_threshold INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);


-- 10. Waste Records
CREATE TABLE waste_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id INT NOT NULL,
    date DATE NOT NULL,
    prepared_qty INT NOT NULL,
    sold_qty INT NOT NULL,
    wasted_qty INT NOT NULL,

    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE INDEX idx_waste_records_menu_item
ON waste_records(menu_item_id);

CREATE INDEX idx_waste_records_date
ON waste_records(date);


-- 11. Demand Predictions
CREATE TABLE demand_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id INT NOT NULL,
    date DATE NOT NULL,
    predicted_qty INT NOT NULL,
    actual_qty INT,

    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE INDEX idx_demand_predictions_menu_item
ON demand_predictions(menu_item_id);

CREATE INDEX idx_demand_predictions_date
ON demand_predictions(date);


-- 12. Events and Holidays
CREATE TABLE events_holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('holiday', 'event') NOT NULL
);