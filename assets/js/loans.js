// API Base URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const loanTableBody = document.getElementById('loans-table-body');
const createLoanBtn = document.getElementById('create-loan-btn');
const loanModal = document.getElementById('loan-modal');
const loanForm = document.getElementById('loan-form');
const modalTitle = document.getElementById('modal-title');
const cancelLoanBtn = document.getElementById('cancel-loan');
const deleteModal = document.getElementById('delete-confirmation');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const searchBox = document.querySelector('.search-box');
const customerSelect = document.getElementById('customer');
const applianceSelect = document.getElementById('appliance');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

let currentLoanId = null;
let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 10;

// Load loans on page load
document.addEventListener('DOMContentLoaded', () => {
    loadLoans(1);
    loadCustomers();
    loadAppliances();
});

// Event Listeners
createLoanBtn.addEventListener('click', () => openModal('create'));
cancelLoanBtn.addEventListener('click', closeModal);
loanForm.addEventListener('submit', handleLoanSubmit);
cancelDeleteBtn.addEventListener('click', () => deleteModal.classList.remove('active'));
confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
searchBox.addEventListener('input', debounce(handleSearch, 300));
prevPageBtn.addEventListener('click', () => loadLoans(currentPage - 1));
nextPageBtn.addEventListener('click', () => loadLoans(currentPage + 1));

// Load all loans with pagination
async function loadLoans(page = 1) {
    try {
        const response = await fetch(`${API_URL}/loans?page=${page}&limit=${itemsPerPage}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load loans');
        }

        displayLoans(data.loans);
        updatePagination(data.pagination);
    } catch (error) {
        console.error('Error loading loans:', error);
        loanTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Error loading loans. Please try again.</td>
            </tr>
        `;
    }
}

// Update pagination controls
function updatePagination(pagination) {
    currentPage = pagination.page;
    totalPages = pagination.totalPages;
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

// Load customers for select dropdown
async function loadCustomers() {
    try {
        // Get all customers without pagination by setting a large limit
        const response = await fetch(`${API_URL}/customers?limit=1000`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load customers');
        }

        customerSelect.innerHTML = '<option value="">Select Customer</option>';
        data.customers.forEach(customer => {
            // Only show active customers
            if (customer.is_active) {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name;
                customerSelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading customers:', error);
        showError('Failed to load customers');
    }
}

// Load appliances for select dropdown
async function loadAppliances() {
    try {
        // Get all appliances without pagination by setting a large limit
        const response = await fetch(`${API_URL}/appliances?limit=1000`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load appliances');
        }

        applianceSelect.innerHTML = '<option value="">Select Appliance</option>';
        data.appliances.forEach(appliance => {
            // Only show appliances with stock available
            if (appliance.stock_quantity > 0) {
                const option = document.createElement('option');
                option.value = appliance.id;
                option.textContent = `${appliance.name} - ₱${parseFloat(appliance.price).toFixed(2)}`;
                option.dataset.price = appliance.price;
                applianceSelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading appliances:', error);
        showError('Failed to load appliances');
    }
}

// Display loans in table
function displayLoans(loans) {
    loanTableBody.innerHTML = '';
    
    loans.forEach(loan => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${loan.customer_name}</td>
            <td>${loan.appliance_name}</td>
            <td>₱${parseFloat(loan.total_loan_amount).toFixed(2)}</td>
            <td>₱${parseFloat(loan.monthly_payment).toFixed(2)}</td>
            <td>
                <span class="status-badge status-${loan.payment_status.toLowerCase()}">
                    ${loan.payment_status}
                </span>
            </td>
            <td>₱${parseFloat(loan.balance).toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="openModal('edit', ${loan.id})">
                        ✏️
                    </button>
                    <button class="btn-icon" onclick="openDeleteModal(${loan.id})">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        loanTableBody.appendChild(row);
    });
}

// Open modal for create/edit
function openModal(mode, loanId = null) {
    currentLoanId = loanId;
    modalTitle.textContent = mode === 'create' ? 'Create New Loan' : 'Edit Loan';
    loanModal.classList.add('active');
    
    if (mode === 'edit') {
        fetchAndPopulateLoan(loanId);
    } else {
        loanForm.reset();
    }
}

// Close modal
function closeModal() {
    loanModal.classList.remove('active');
    loanForm.reset();
    currentLoanId = null;
}

// Fetch and populate loan data for editing
async function fetchAndPopulateLoan(loanId) {
    try {
        const response = await fetch(`${API_URL}/loans/${loanId}`);
        const loan = await response.json();
        
        customerSelect.value = loan.customer_id;
        applianceSelect.value = loan.appliance_id;
        document.getElementById('monthly-payment').value = loan.monthly_payment;
    } catch (error) {
        console.error('Error fetching loan:', error);
        showError('Failed to load loan data');
    }
}

// Handle form submit for both create and edit
async function handleLoanSubmit(e) {
    e.preventDefault();
    
    const selectedAppliance = applianceSelect.options[applianceSelect.selectedIndex];
    const totalLoanAmount = parseFloat(selectedAppliance.dataset.price);
    const monthlyPayment = parseFloat(document.getElementById('monthly-payment').value);
    
    const loanData = {
        customer_id: parseInt(customerSelect.value),
        appliance_id: parseInt(applianceSelect.value),
        total_loan_amount: totalLoanAmount,
        monthly_payment: monthlyPayment
    };
    
    try {
        const url = currentLoanId 
            ? `${API_URL}/loans/${currentLoanId}`
            : `${API_URL}/loans`;
            
        const method = currentLoanId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loanData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to save loan');
        }
        
        closeModal();
        loadLoans(currentPage);
    } catch (error) {
        console.error('Error saving loan:', error);
        showError(error.message);
    }
}

// Open delete confirmation modal
function openDeleteModal(loanId) {
    currentLoanId = loanId;
    deleteModal.classList.add('active');
}

// Handle delete confirmation
async function handleDeleteConfirm() {
    try {
        const response = await fetch(`${API_URL}/loans/${currentLoanId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
        
        deleteModal.classList.remove('active');
        loadLoans(currentPage);
    } catch (error) {
        console.error('Error deleting loan:', error);
        deleteModal.classList.remove('active');
        showError(error.message);
    }
}

// Handle search with pagination reset
async function handleSearch(e) {
    const searchTerm = e.target.value;
    
    try {
        if (searchTerm) {
            const response = await fetch(`${API_URL}/loans/search?query=${searchTerm}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const loans = await response.json();
            displayLoans(loans);
            // Hide pagination during search
            document.querySelector('.pagination').style.display = 'none';
        } else {
            loadLoans(1);
            document.querySelector('.pagination').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error searching loans:', error);
        showError('Error searching loans. Please try again.');
    }
}

// Show error dialog
function showError(message) {
    const errorDialog = document.getElementById('error-dialog');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorDialog.classList.add('active');
}

// Calculate monthly payment when appliance changes
applianceSelect.addEventListener('change', calculateMonthlyPayment);

function calculateMonthlyPayment() {
    const selectedAppliance = applianceSelect.options[applianceSelect.selectedIndex];
    if (selectedAppliance && selectedAppliance.dataset.price) {
        const totalLoanAmount = parseFloat(selectedAppliance.dataset.price);
        // 12 months payment term
        const monthlyPayment = totalLoanAmount / 12;
        document.getElementById('monthly-payment').value = monthlyPayment.toFixed(2);
    } else {
        document.getElementById('monthly-payment').value = '';
    }
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