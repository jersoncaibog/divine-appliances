# Requirements for Academic Loan Management Web App

## Pages

### Dashboard
The dashboard provides an overview of key metrics:
- **Total Active Loans** – Number of currently active loans
- **Total Customers** – Total registered customers
- **Due/Overdue Payments** – Loans with unpaid balances past the due date
- **Today's Collections** – Payments received today
- **Quick Search Box** – Search customers, loans, or payments

### Customers Management
A table displaying customer details:
- **RFID Number** – Unique identifier for customers
- **Customer Name**
- **Contact Number**
- **Address**
- **Loan Status** – Active / Completed

#### CRUD Functions
- **Add New Customer** – Register a new customer
- **Edit Customer Info** – Update customer details
- **Delete Customer** – Soft delete customers (mark as inactive)
- **Search Customer** – Find customers by name, RFID, or loan status

#### Rules & Validations
- **Deletion is only allowed if:**
  - The customer has no active loans
  - The customer has no unpaid balances
- **Soft delete implementation:**
  - Customers are marked as inactive instead of being permanently removed
  - Deleted customers won’t appear in the active list but can be restored
- **Audit Trail:** Logs all modifications (creation, updates, deletions)

### Loan Management
A table displaying loan details:
- **Customer Name**
- **Appliance** – The product financed by the loan
- **Total Loan Amount**
- **Monthly Payment**
- **Payment Status** – Paid / Unpaid / Overdue
- **Balance** – Remaining loan amount

#### CRUD Functions
- **Create New Loan** – Assign a loan to a customer
- **Update Loan Info** – Modify loan terms or payment schedules
- **Delete Loan Record** – Allowed only if fully paid (Soft delete preferred)

#### Rules & Validations
- **Deletion is only allowed if:**
  - The loan is fully paid
  - There are no pending payments
- **Audit Trail:** Logs all modifications to loan records

### Payment Management
A table displaying payment transactions:
- **Customer Name**
- **Loan Reference**
- **Amount Paid**
- **Payment Date**
- **Remaining Balance**

#### Payment Functions
- **Record Payment** – Add a new payment to a loan
- **Print Receipt** – Generate a receipt for payment confirmation
- **View Payment History** – List of all payments made for a loan

#### Audit & Security
- **Audit Trail:** Logs all payment actions, including modifications

### Appliances Management
A table displaying available appliances for loans:
- **Appliance Name**
- **Brand**
- **Model**
- **Price**
- **Stock Quantity**

#### CRUD Functions
- **Add New Appliance** – Register a new appliance
- **Update Appliance Info** – Modify appliance details such as price or stock
- **Delete Appliance** – Soft delete appliances (mark as inactive)
- **Search Appliance** – Find appliances by name, brand, or model

#### Rules & Validations
- **Deletion is only allowed if:**
  - The appliance is not linked to any active loan
- **Audit Trail:** Logs all modifications (creation, updates, deletions)

---

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Express.js
- **Database:** MariaDB

---

## Design Style
The UI should follow a **New York-style** design using [shadcn/ui](https://ui.shadcn.com/), focusing on:
- Clean, minimalistic layout
- High contrast and well-spaced typography
- Dark and light mode support
- Smooth animations and interactions
- Responsive design optimized for all devices

---

## Database Schema

### Customers Table
```sql
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfid_number VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    loan_status ENUM('Active', 'Completed') NOT NULL DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE,
);
```

### Loans Table
```sql
CREATE TABLE loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    appliance_id INT NOT NULL,
    total_loan_amount DECIMAL(10,2) NOT NULL,
    monthly_payment DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Paid', 'Unpaid', 'Overdue') NOT NULL DEFAULT 'Unpaid',
    balance DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (appliance_id) REFERENCES appliances(id)
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remaining_balance DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (loan_id) REFERENCES loans(id)
);
```

### Appliances Table
```sql
CREATE TABLE appliances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
);
```

---

## Additional Features & Best Practices
- **Confirmation Dialogs:** Prompt users before deleting customers, loans, or payments. NEVER USE alert() or confirm() or prompt(). just custom dialogs.
- **Soft Delete Implementation:** Instead of hard deletion, mark customers/loans as inactive
