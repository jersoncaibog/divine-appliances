// API Base URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const activeLoanCount = document.getElementById('active-loans-count');
const totalCustomers = document.getElementById('total-customers');
const overduePayments = document.getElementById('overdue-payments');
const todayCollections = document.getElementById('todays-collections');
const activityList = document.getElementById('activity-list');

// Load dashboard data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardMetrics();
    loadRecentActivity();
});

// Load dashboard metrics
async function loadDashboardMetrics() {
    try {
        const response = await fetch(`${API_URL}/dashboard/metrics`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard metrics');
        }

        // Update metrics
        activeLoanCount.textContent = data.active_loans;
        totalCustomers.textContent = data.total_customers;
        overduePayments.textContent = data.overdue_payments;
        todayCollections.textContent = `₱${parseFloat(data.todays_collections).toFixed(2)}`;
    } catch (error) {
        console.error('Error loading dashboard metrics:', error);
        showError('Failed to load dashboard metrics');
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_URL}/dashboard/recent-activity`);
        const activities = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load recent activity');
        }

        displayRecentActivity(activities);
    } catch (error) {
        console.error('Error loading recent activity:', error);
        showError('Failed to load recent activity');
    }
}

// Display recent activity
function displayRecentActivity(activities) {
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        let activityContent = '';
        if (activity.activity_type === 'payment') {
            activityContent = `
                <div class="activity-content">
                    <div class="activity-title">
                        ${activity.customer_name} made a payment of ₱${parseFloat(activity.amount_paid).toFixed(2)}
                    </div>
                    <div class="activity-timestamp">
                        ${formatDate(activity.payment_date)}
                    </div>
                </div>
            `;
        } else if (activity.activity_type === 'loan') {
            activityContent = `
                <div class="activity-content">
                    <div class="activity-title">
                        ${activity.customer_name} took a loan for ${activity.appliance_name}
                    </div>
                    <div class="activity-timestamp">
                        Amount: ₱${parseFloat(activity.total_loan_amount).toFixed(2)}
                    </div>
                </div>
            `;
        }
        
        activityItem.innerHTML = activityContent;
        activityList.appendChild(activityItem);
    });
}

// Format date for display
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Show error message
function showError(message) {
    // You can implement this based on your UI requirements
    console.error(message);
}

// Auto-refresh dashboard data every 5 minutes
setInterval(() => {
    loadDashboardMetrics();
    loadRecentActivity();
}, 300000); // 5 minutes in milliseconds
