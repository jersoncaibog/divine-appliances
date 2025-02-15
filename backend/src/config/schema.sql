use divine_appliances;
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfid_number VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    loan_status ENUM('Active', 'Completed') NOT NULL DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE
);
CREATE TABLE appliances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL
);
CREATE TABLE loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    appliance_id INT NOT NULL,
    total_loan_amount DECIMAL(10, 2) NOT NULL,
    monthly_payment DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('Paid', 'Unpaid', 'Overdue') NOT NULL DEFAULT 'Unpaid',
    balance DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (appliance_id) REFERENCES appliances(id)
);
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remaining_balance DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (loan_id) REFERENCES loans(id)
);