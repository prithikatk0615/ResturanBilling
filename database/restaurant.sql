-- ============================================
-- RESTAURANT BILLING DATABASE
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS restaurant_db;

-- Select database
USE restaurant_db;


-- ============================================
-- ORDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    tip INT DEFAULT 0,

    food_total INT DEFAULT 0,

    final_total INT DEFAULT 0,

    status VARCHAR(20) DEFAULT 'OPEN'
);


-- ============================================
-- ORDER ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    category VARCHAR(50) NOT NULL,

    item_name VARCHAR(100) NOT NULL,

    price INT NOT NULL,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);


-- ============================================
-- CHECK ORDERS
-- ============================================

SELECT * FROM orders;


-- ============================================
-- CHECK ORDER ITEMS
-- ============================================

SELECT * FROM order_items;