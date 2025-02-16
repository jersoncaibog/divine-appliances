// API Base URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const paymentsTableBody = document.getElementById('payments-table-body');
const recordPaymentBtn = document.getElementById('record-payment-btn');
const paymentModal = document.getElementById('payment-modal');
const paymentForm = document.getElementById('payment-form');
const cancelPaymentBtn = document.getElementById('cancel-payment');
const savePaymentBtn = document.getElementById('save-payment');
const searchBox = document.querySelector('.search-box');
const loanSelect = document.getElementById('loan');
const historyModal = document.getElementById('history-modal');
const closeHistoryBtn = document.getElementById('close-history');
const printHistoryBtn = document.getElementById('print-history');
const receiptModal = document.getElementById('receipt-modal');
const closeReceiptBtn = document.getElementById('close-receipt');
const printReceiptBtn = document.getElementById('print-receipt');
const errorDialog = document.getElementById('error-dialog');
const errorMessage = document.getElementById('error-message');
const errorOkBtn = document.getElementById('error-ok');
const successDialog = document.getElementById('success-dialog');
const successMessage = document.getElementById('success-message');
const successOkBtn = document.getElementById('success-ok');

// New DOM Elements for RFID
const rfidInput = document.getElementById('rfid');
const customerInfo = document.getElementById('customer-info');
const customerDetails = document.getElementById('customer-details');
const paymentFields = document.getElementById('payment-fields');
const amountInput = document.getElementById('amount');
const paymentDateInput = document.getElementById('payment-date');

// Pagination Elements
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 10;

// Load payments on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPayments(1);
    // Remove loadActiveLoans() since we'll load loans after RFID scan
});

// Event Listeners
recordPaymentBtn.addEventListener('click', openPaymentModal);
cancelPaymentBtn.addEventListener('click', closePaymentModal);
paymentForm.addEventListener('submit', handlePaymentSubmit);
closeHistoryBtn.addEventListener('click', () => historyModal.classList.remove('active'));
printHistoryBtn.addEventListener('click', handlePrintHistory);
closeReceiptBtn.addEventListener('click', () => receiptModal.classList.remove('active'));
printReceiptBtn.addEventListener('click', handlePrintReceipt);
errorOkBtn.addEventListener('click', () => errorDialog.classList.remove('active'));
successOkBtn.addEventListener('click', () => successDialog.classList.remove('active'));

// Add RFID input event listener
rfidInput.addEventListener('input', handleRFIDScan);

// Add loan select event listener
loanSelect.addEventListener('change', handleLoanSelect);

// Add pagination event listeners
prevPageBtn.addEventListener('click', () => loadPayments(currentPage - 1));
nextPageBtn.addEventListener('click', () => loadPayments(currentPage + 1));

// Add search box event listener
searchBox.addEventListener('input', debounce(handleSearch, 300));

// Handle loan selection
function handleLoanSelect(e) {
    const selectedLoan = window.customerLoans.find(loan => loan.id === parseInt(e.target.value));
    if (selectedLoan) {
        amountInput.value = selectedLoan.monthly_payment;
    } else {
        amountInput.value = '';
    }
}

// Handle RFID scan
async function handleRFIDScan(e) {
    const rfidValue = e.target.value.trim();
    
    // Clear previous info
    customerInfo.style.display = 'none';
    paymentFields.style.display = 'none';
    savePaymentBtn.style.display = 'none';
    customerDetails.innerHTML = '';
    loanSelect.innerHTML = '';
    
    // Remove required attributes when hiding fields
    setFormFieldsRequired(false);
    
    if (rfidValue.length > 0) {
        try {
            const response = await fetch(`${API_URL}/customers/rfid/${encodeURIComponent(rfidValue)}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Customer not found');
            }
            
            // Store loans data for reference in loan select handler
            window.customerLoans = data.loans;
            
            // Display customer info
            customerInfo.style.display = 'block';
            customerDetails.innerHTML = `
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${data.customer.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Contact:</span>
                    <span class="info-value">${data.customer.contact_number}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value">${data.customer.loan_status}</span>
                </div>
            `;
            
            // Populate loan select with customer's active loans
            loanSelect.innerHTML = '<option value="">Select Loan</option>';
            data.loans.forEach(loan => {
                const option = document.createElement('option');
                option.value = loan.id;
                option.textContent = `${loan.appliance_name} (Balance: ₱${parseFloat(loan.balance).toFixed(2)})`;
                option.dataset.balance = loan.balance;
                option.dataset.monthlyPayment = loan.monthly_payment;
                loanSelect.appendChild(option);
            });
            
            if (data.loans.length === 0) {
                customerDetails.innerHTML += `
                    <div class="info-row">
                        <div class="error-message">
                            No active loans found for this customer
                        </div>
                    </div>
                `;
            } else {
                // Show payment fields and save button
                paymentFields.style.display = 'block';
                savePaymentBtn.style.display = 'inline-block';
                
                // Add required attributes when showing fields
                setFormFieldsRequired(true);
                
                // Set default payment date to today
                document.getElementById('payment-date').valueAsDate = new Date();
            }
            
        } catch (error) {
            console.error('Error finding customer:', error);
            customerInfo.style.display = 'block';
            customerDetails.innerHTML = `
                <div class="error-message">
                    ❌ ${error.message || 'Error finding customer'}
                </div>
            `;
        }
    }
}

// Function to set/remove required attributes
function setFormFieldsRequired(required) {
    const fields = [
        document.getElementById('loan'),
        document.getElementById('amount'),
        document.getElementById('payment-date')
    ];
    
    fields.forEach(field => {
        if (required) {
            field.setAttribute('required', '');
        } else {
            field.removeAttribute('required');
        }
    });
}

// Load active loans for specific customer
async function loadCustomerLoans(customerId) {
    try {
        const response = await fetch(`${API_URL}/loans/customer/${customerId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load customer loans');
        }

        loanSelect.innerHTML = '<option value="">Select Loan</option>';
        data.loans.forEach(loan => {
            // Only show unpaid and overdue loans
            if (loan.payment_status !== 'Paid') {
                const option = document.createElement('option');
                option.value = loan.id;
                option.textContent = `${loan.appliance_name} (Balance: ₱${parseFloat(loan.balance).toFixed(2)})`;
                option.dataset.balance = loan.balance;
                loanSelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading customer loans:', error);
        showError('Failed to load customer loans');
    }
}

// Open payment modal
function openPaymentModal() {
    paymentModal.classList.add('active');
    // Reset form and hide sections
    paymentForm.reset();
    customerInfo.style.display = 'none';
    paymentFields.style.display = 'none';
    savePaymentBtn.style.display = 'none';
    // Remove required attributes
    setFormFieldsRequired(false);
    // Set default payment date to today
    document.getElementById('payment-date').valueAsDate = new Date();
    // Focus on RFID input
    rfidInput.focus();
}

// Close payment modal
function closePaymentModal() {
    paymentModal.classList.remove('active');
    paymentForm.reset();
    customerInfo.style.display = 'none';
    paymentFields.style.display = 'none';
    savePaymentBtn.style.display = 'none';
    // Remove required attributes
    setFormFieldsRequired(false);
}

// Update pagination controls
function updatePagination(pagination) {
    currentPage = pagination.page;
    totalPages = pagination.totalPages;
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

// Load all payments with pagination
async function loadPayments(page = 1) {
    try {
        const response = await fetch(`${API_URL}/payments?page=${page}&limit=${itemsPerPage}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load payments');
        }

        displayPayments(data.payments);
        updatePagination(data.pagination);
    } catch (error) {
        console.error('Error loading payments:', error);
        showError('Failed to load payments');
    }
}

// Display payments in table
function displayPayments(payments) {
    paymentsTableBody.innerHTML = '';
    
    payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.customer_name}</td>
            <td>${payment.appliance_name}</td>
            <td>₱${parseFloat(payment.amount_paid).toFixed(2)}</td>
            <td>${formatDate(payment.payment_date)}</td>
            <td>₱${parseFloat(payment.remaining_balance).toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewPaymentHistory(${payment.loan_id})">
                        📋
                    </button>
                    <button class="btn-icon" onclick="viewReceipt(${payment.id})">
                        🧾
                    </button>
                    <button class="btn-icon" onclick="openDeleteModal(${payment.id})">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        paymentsTableBody.appendChild(row);
    });
}

// Handle payment form submit
async function handlePaymentSubmit(e) {
    e.preventDefault();
    
    if (!loanSelect.value) {
        showError('Please select a loan');
        return;
    }
    
    const loanId = parseInt(loanSelect.value);
    const amountPaid = parseFloat(document.getElementById('amount').value);
    const paymentDate = document.getElementById('payment-date').value;
    
    if (!amountPaid || amountPaid <= 0) {
        showError('Please enter a valid payment amount');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loan_id: loanId,
                amount_paid: amountPaid,
                payment_date: paymentDate
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to record payment');
        }
        
        closePaymentModal();
        loadPayments();
        viewReceipt(data.id); // Show receipt for new payment
    } catch (error) {
        console.error('Error recording payment:', error);
        showError(error.message || 'Failed to record payment. Please try again.');
    }
}

// View payment history for a loan
async function viewPaymentHistory(loanId) {
    try {
        const response = await fetch(`${API_URL}/payments/loan/${loanId}`);
        const payments = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load payment history');
        }

        const historyList = document.querySelector('.payment-history-list');
        historyList.innerHTML = '';
        
        payments.forEach(payment => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-details">
                    <div class="history-date">${formatDate(payment.payment_date)}</div>
                    <div class="history-amount">₱${parseFloat(payment.amount_paid).toFixed(2)}</div>
                </div>
                <div class="remaining-balance">
                    Balance: ₱${parseFloat(payment.remaining_balance).toFixed(2)}
                </div>
            `;
            historyList.appendChild(historyItem);
        });
        
        historyModal.classList.add('active');
    } catch (error) {
        console.error('Error loading payment history:', error);
        showError('Failed to load payment history');
    }
}

// View receipt for a payment
async function viewReceipt(paymentId) {
    try {
        const response = await fetch(`${API_URL}/payments/${paymentId}`);
        const payment = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load payment receipt');
        }

        const receiptContent = document.querySelector('.receipt-content');
        receiptContent.innerHTML = `
            <div class="receipt-header">
                <h2>Divine Appliances</h2>
                <p>Payment Receipt</p>
            </div>
            <div class="receipt-details">
                <div class="receipt-row">
                    <span class="receipt-label">Customer:</span>
                    <span class="receipt-value">${payment.customer_name}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Appliance:</span>
                    <span class="receipt-value">${payment.appliance_name}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Payment Date:</span>
                    <span class="receipt-value">${formatDate(payment.payment_date)}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Amount Paid:</span>
                    <span class="receipt-value">₱${parseFloat(payment.amount_paid).toFixed(2)}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Remaining Balance:</span>
                    <span class="receipt-value">₱${parseFloat(payment.remaining_balance).toFixed(2)}</span>
                </div>
            </div>
            <div class="receipt-footer">
                <p>Thank you for your payment!</p>
                <p>Receipt #: ${payment.id}</p>
            </div>
        `;
        
        receiptModal.classList.add('active');
    } catch (error) {
        console.error('Error loading payment receipt:', error);
        showError('Failed to load payment receipt');
    }
}

// Handle print history
function handlePrintHistory() {
    const historyContent = document.querySelector('.payment-history-list').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Payment History</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .history-item { margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ccc; }
                    .history-date { color: #666; }
                    .history-amount { font-weight: bold; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <h2>Payment History</h2>
                ${historyContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Handle print receipt
function handlePrintReceipt() {
    const receiptContent = document.querySelector('.receipt-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Payment Receipt</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .receipt-header { text-align: center; margin-bottom: 20px; }
                    .receipt-details { margin: 20px 0; }
                    .receipt-row { margin: 10px 0; display: flex; justify-content: space-between; }
                    .receipt-footer { text-align: center; margin-top: 20px; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Handle search with pagination reset
async function handleSearch(e) {
    const searchTerm = e.target.value.trim();
    
    try {
        if (searchTerm) {
            const response = await fetch(`${API_URL}/payments/search?query=${searchTerm}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const payments = await response.json();
            displayPayments(payments);
            // Hide pagination during search
            document.querySelector('.pagination').style.display = 'none';
        } else {
            // If search is cleared, reset to first page
            loadPayments(1);
            document.querySelector('.pagination').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error searching payments:', error);
        paymentsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Error searching payments. Please try again.</td>
            </tr>
        `;
        showError('Error searching payments. Please try again.');
    }
}

// Show error dialog
function showError(message) {
    if (errorDialog && errorMessage) {
        errorMessage.textContent = message;
        errorDialog.style.display = 'block';
    } else {
        alert(message);
    }
}

// Hide error dialog
function hideError() {
    if (errorDialog) {
        errorDialog.style.display = 'none';
    }
}

// Add error dialog event listener
if (errorOkBtn) {
    errorOkBtn.addEventListener('click', hideError);
}

// Format date
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show success dialog
function showSuccess(message) {
    successMessage.textContent = message;
    successDialog.classList.add('active');
}

const deleteModal = document.getElementById('delete-confirmation');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

let currentPaymentId = null;

// Add event listeners for delete functionality
cancelDeleteBtn.addEventListener('click', () => deleteModal.classList.remove('active'));
confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);

// Open delete confirmation modal
function openDeleteModal(paymentId) {
    currentPaymentId = paymentId;
    deleteModal.classList.add('active');
}

// Handle delete confirmation
async function handleDeleteConfirm() {
    try {
        const response = await fetch(`${API_URL}/payments/${currentPaymentId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete payment');
        }
        
        // Close delete modal
        deleteModal.classList.remove('active');
        // Refresh payments table
        loadPayments(currentPage);
        // Reset current payment id
        currentPaymentId = null;
        
        showSuccess('Payment record deleted successfully');
    } catch (error) {
        console.error('Error deleting payment:', error);
        showError(error.message || 'Failed to delete payment record');
    }
}

// Save Payment Button Click Handler
savePaymentBtn.addEventListener('click', async () => {
    try {
        const selectedLoan = loanSelect.value;
        if (!selectedLoan) {
            showError('Please select a loan');
            return;
        }

        const amountPaid = parseFloat(amountInput.value);
        if (isNaN(amountPaid) || amountPaid <= 0) {
            showError('Please enter a valid payment amount greater than zero');
            return;
        }

        const paymentDate = paymentDateInput.value;
        if (!paymentDate) {
            showError('Please select a payment date');
            return;
        }

        const response = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                loan_id: selectedLoan,
                amount_paid: amountPaid,
                payment_date: paymentDate
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to record payment');
        }

        const result = await response.json();
        // Refresh the payments table
        loadPayments();
        // Close the modal
        closePaymentModal();
        // Show success message
        showSuccess('Payment recorded successfully');
    } catch (error) {
        showError(error.message || 'An error occurred while recording the payment');
    }
});
