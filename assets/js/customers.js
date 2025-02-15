// API Base URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const customerTableBody = document.getElementById('customers-table-body');
const addCustomerBtn = document.getElementById('add-customer-btn');
const customerModal = document.getElementById('customer-modal');
const customerForm = document.getElementById('customer-form');
const modalTitle = document.getElementById('modal-title');
const cancelCustomerBtn = document.getElementById('cancel-customer');
const deleteModal = document.getElementById('delete-confirmation');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const searchBox = document.querySelector('.search-box');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const errorDialog = document.getElementById('error-dialog');
const errorMessage = document.getElementById('error-message');
const errorOkBtn = document.getElementById('error-ok');

let currentCustomerId = null;
let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 10;

// Load customers on page load
document.addEventListener('DOMContentLoaded', () => loadCustomers(1));

// Event Listeners
addCustomerBtn.addEventListener('click', () => openModal('add'));
cancelCustomerBtn.addEventListener('click', closeModal);
customerForm.addEventListener('submit', handleCustomerSubmit);
cancelDeleteBtn.addEventListener('click', () => deleteModal.classList.remove('active'));
confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
searchBox.addEventListener('input', debounce(handleSearch, 300));
prevPageBtn.addEventListener('click', () => loadCustomers(currentPage - 1));
nextPageBtn.addEventListener('click', () => loadCustomers(currentPage + 1));
errorOkBtn.addEventListener('click', () => errorDialog.classList.remove('active'));

// Load customers with pagination
async function loadCustomers(page = 1) {
    try {
        const response = await fetch(`${API_URL}/customers?page=${page}&limit=${itemsPerPage}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load customers');
        }

        displayCustomers(data.customers);
        updatePagination(data.pagination);
    } catch (error) {
        console.error('Error loading customers:', error);
        customerTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Error loading customers. Please try again.</td>
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

// Display customers in table
function displayCustomers(customers) {
    customerTableBody.innerHTML = '';
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.rfid_number}</td>
            <td>${customer.name}</td>
            <td>${customer.contact_number}</td>
            <td>
                <span class="status-badge ${customer.loan_status.toLowerCase()}">
                    ${customer.loan_status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="openModal('edit', ${customer.id})">
                        ✏️
                    </button>
                    <button class="btn-icon" onclick="openDeleteModal(${customer.id})">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        customerTableBody.appendChild(row);
    });
}

// Open modal for add/edit
function openModal(mode, customerId = null) {
    currentCustomerId = customerId;
    modalTitle.textContent = mode === 'add' ? 'Add New Customer' : 'Edit Customer';
    customerModal.classList.add('active');
    
    if (mode === 'edit') {
        fetchAndPopulateCustomer(customerId);
    } else {
        customerForm.reset();
    }
}

// Close modal
function closeModal() {
    customerModal.classList.remove('active');
    customerForm.reset();
    currentCustomerId = null;
}

// Show error dialog
function showError(message) {
    errorMessage.textContent = message;
    errorDialog.classList.add('active');
}

// Fetch and populate customer data for editing
async function fetchAndPopulateCustomer(customerId) {
    try {
        const response = await fetch(`${API_URL}/customers/${customerId}`);
        const customer = await response.json();
        
        document.getElementById('rfid').value = customer.rfid_number;
        document.getElementById('name').value = customer.name;
        document.getElementById('contact').value = customer.contact_number;
    } catch (error) {
        console.error('Error fetching customer:', error);
        showError('Failed to load customer data');
    }
}

// Handle form submit for both add and edit
async function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const customerData = {
        rfid_number: document.getElementById('rfid').value,
        name: document.getElementById('name').value,
        contact_number: document.getElementById('contact').value
    };
    
    try {
        const url = currentCustomerId 
            ? `${API_URL}/customers/${currentCustomerId}`
            : `${API_URL}/customers`;
            
        const method = currentCustomerId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to save customer');
        }
        
        closeModal();
        loadCustomers(currentPage);
    } catch (error) {
        console.error('Error saving customer:', error);
        showError(error.message);
    }
}

// Open delete confirmation modal
function openDeleteModal(customerId) {
    currentCustomerId = customerId;
    deleteModal.classList.add('active');
}

// Handle delete confirmation
async function handleDeleteConfirm() {
    try {
        const response = await fetch(`${API_URL}/customers/${currentCustomerId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
        
        deleteModal.classList.remove('active');
        loadCustomers(currentPage);
    } catch (error) {
        console.error('Error deleting customer:', error);
        deleteModal.classList.remove('active');
        showError(error.message);
    }
}

// Handle search with pagination
async function handleSearch(e) {
    const searchTerm = e.target.value;
    
    try {
        if (searchTerm) {
            const response = await fetch(`${API_URL}/customers/search?query=${searchTerm}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const customers = await response.json();
            if (!Array.isArray(customers)) {
                throw new Error('Invalid response format');
            }
            displayCustomers(customers);
            // Hide pagination during search
            document.querySelector('.pagination').style.display = 'none';
        } else {
            loadCustomers(1);
            document.querySelector('.pagination').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error searching customers:', error);
        customerTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Error searching customers. Please try again.</td>
            </tr>
        `;
        showError('Error searching customers. Please try again.');
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
