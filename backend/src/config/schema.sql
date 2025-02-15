-- Create Passenger Table
CREATE TABLE Passenger (
    RFID VARCHAR(50) PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(15) NOT NULL,
    CurrentBalance DECIMAL(10, 2) DEFAULT 0.00
);

-- Create Transactions Table
CREATE TABLE Transactions (
    TransactionID INT AUTO_INCREMENT PRIMARY KEY,
    RFID VARCHAR(50),
    TransactionType ENUM('Cash-in', 'Payment') NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL,
    Destination VARCHAR(100),
    Fare DECIMAL(10, 2),
    RemainingBalance DECIMAL(10, 2) NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RFID) REFERENCES Passenger(RFID) ON DELETE CASCADE
);
