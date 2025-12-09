document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const pageTitle = document.getElementById('page-title');

    const sectionTitles = {
        'overview': 'Dashboard Overview',
        'members': 'Member Management',
        'billing': 'Billing Management',
        'packages': 'Fee Packages',
        'notifications': 'Notifications',
        'supplements': 'Supplement Store',
        'diet': 'Diet Plans',
        'reports': 'Reports & Analytics',
        'receipts': 'My Receipts',
        'profile': 'My Profile',
        'dashboard': 'Member Dashboard'
    };

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            const targetSection = this.getAttribute('data-section');

            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            sections.forEach(section => section.classList.remove('active'));
            const activeSection = document.getElementById(`${targetSection}-section`);
            if (activeSection) {
                activeSection.classList.add('active');
            }

            if (sectionTitles[targetSection]) {
                pageTitle.textContent = sectionTitles[targetSection];
            }
        });
    });

    // Notification Form Handler
    const notificationForm = document.getElementById('notificationForm');
    if (notificationForm) {
        notificationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('notifTitle').value;
            const message = document.getElementById('notifMessage').value;
            const priority = document.getElementById('notifPriority').value;
            
            showMessage(`Notification sent to all members: "${title}"`, 'success');
            this.reset();
        });
    }

    // Initialize all button event listeners
    initializeButtonHandlers();
});

function showSection(sectionName) {
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (navItem) {
        navItem.click();
    }
}

// Helper function to show messages
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `toast-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'error' ? '#ff4444' : '#00ff41'};
        color: ${type === 'error' ? '#fff' : '#0a0a0a'};
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Initialize all button handlers
function initializeButtonHandlers() {
    // All buttons are now using onclick attributes in HTML
    // This function is kept for any dynamic buttons that might be added later
    console.log('Button handlers initialized via HTML onclick attributes');
}

// Member Dashboard Functions
function contactTrainer() {
    const trainerName = document.querySelector('.trainer-name')?.textContent || 'Mike Smith';
    showMessage(`Opening contact form for ${trainerName}...`, 'success');
    
    // Create modal for contacting trainer
    const modal = createModal('Contact Trainer', `
        <form id="contactTrainerForm">
            <div class="form-group">
                <label>Trainer: ${trainerName}</label>
            </div>
            <div class="form-group">
                <label>Subject</label>
                <input type="text" class="form-input" placeholder="Enter subject" required>
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea class="form-input" rows="4" placeholder="Enter your message" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Send Message</button>
        </form>
    `);
    
    document.getElementById('contactTrainerForm').onsubmit = (e) => {
        e.preventDefault();
        showMessage('Message sent to trainer successfully!', 'success');
        modal.remove();
    };
}

function viewFullPlan() {
    showMessage('Loading full diet plan...', 'success');
    
    const modal = createModal('Muscle Gain Plan - Full Details', `
        <div class="diet-plan-details">
            <h3>Daily Meal Plan</h3>
            <div class="meal-schedule">
                <div class="meal-item">
                    <h4>Breakfast (7:00 AM)</h4>
                    <p>• 4 Egg Whites + 2 Whole Eggs</p>
                    <p>• 2 Slices Whole Wheat Toast</p>
                    <p>• 1 Cup Oatmeal with Berries</p>
                    <p><strong>Calories: 550 | Protein: 40g</strong></p>
                </div>
                <div class="meal-item">
                    <h4>Mid-Morning Snack (10:00 AM)</h4>
                    <p>• Protein Shake (30g)</p>
                    <p>• 1 Banana</p>
                    <p>• Handful of Almonds</p>
                    <p><strong>Calories: 400 | Protein: 35g</strong></p>
                </div>
                <div class="meal-item">
                    <h4>Lunch (1:00 PM)</h4>
                    <p>• 200g Grilled Chicken Breast</p>
                    <p>• 1 Cup Brown Rice</p>
                    <p>• Mixed Vegetables</p>
                    <p><strong>Calories: 600 | Protein: 50g</strong></p>
                </div>
                <div class="meal-item">
                    <h4>Pre-Workout (4:00 PM)</h4>
                    <p>• Protein Bar</p>
                    <p>• Black Coffee</p>
                    <p><strong>Calories: 250 | Protein: 20g</strong></p>
                </div>
                <div class="meal-item">
                    <h4>Post-Workout (7:00 PM)</h4>
                    <p>• Protein Shake (40g)</p>
                    <p>• Sweet Potato</p>
                    <p><strong>Calories: 400 | Protein: 45g</strong></p>
                </div>
                <div class="meal-item">
                    <h4>Dinner (8:30 PM)</h4>
                    <p>• 200g Salmon or Lean Beef</p>
                    <p>• Quinoa</p>
                    <p>• Green Salad</p>
                    <p><strong>Calories: 550 | Protein: 55g</strong></p>
                </div>
                <div class="meal-item">
                    <h4>Before Bed (10:00 PM)</h4>
                    <p>• Casein Protein Shake</p>
                    <p>• Greek Yogurt</p>
                    <p><strong>Calories: 250 | Protein: 35g</strong></p>
                </div>
            </div>
            <div class="plan-summary">
                <h3>Daily Totals</h3>
                <p><strong>Total Calories:</strong> 3000/day</p>
                <p><strong>Total Protein:</strong> 280g/day</p>
                <p><strong>Carbs:</strong> 300g/day</p>
                <p><strong>Fats:</strong> 80g/day</p>
            </div>
            <div class="plan-notes">
                <h3>Important Notes</h3>
                <p>• Drink at least 3-4 liters of water daily</p>
                <p>• Adjust portions based on your progress</p>
                <p>• Take recommended supplements consistently</p>
                <p>• Track your progress weekly</p>
            </div>
        </div>
    `);
}

// Receipt Functions
function viewReceipt(receiptCard) {
    const receiptId = receiptCard.querySelector('.receipt-id')?.textContent || '#R001';
    const date = receiptCard.querySelector('.receipt-date')?.textContent || 'December 1, 2024';
    const amount = receiptCard.querySelector('.receipt-amount')?.textContent || '$50.00';
    const package = receiptCard.querySelector('.receipt-package')?.textContent || 'Premium Monthly';
    
    const modal = createModal(`Receipt ${receiptId}`, `
        <div class="receipt-view">
            <div class="receipt-header">
                <h2>FitZone Gym</h2>
                <p>Payment Receipt</p>
            </div>
            <div class="receipt-body">
                <div class="receipt-row">
                    <span>Receipt Number:</span>
                    <strong>${receiptId}</strong>
                </div>
                <div class="receipt-row">
                    <span>Date:</span>
                    <strong>${date}</strong>
                </div>
                <div class="receipt-row">
                    <span>Package:</span>
                    <strong>${package}</strong>
                </div>
                <div class="receipt-row">
                    <span>Amount Paid:</span>
                    <strong>${amount}</strong>
                </div>
                <div class="receipt-row">
                    <span>Payment Method:</span>
                    <strong>Credit Card</strong>
                </div>
                <div class="receipt-row">
                    <span>Status:</span>
                    <strong style="color: #00ff41;">Paid</strong>
                </div>
            </div>
            <div class="receipt-footer">
                <p>Thank you for your payment!</p>
                <button onclick="downloadCurrentReceipt('${receiptId}')" class="btn btn-primary">Download PDF</button>
            </div>
        </div>
    `);
}

function downloadReceipt(receiptCard) {
    const receiptId = receiptCard.querySelector('.receipt-id')?.textContent || '#R001';
    showMessage(`Downloading receipt ${receiptId}...`, 'success');
    setTimeout(() => {
        showMessage(`Receipt ${receiptId} downloaded successfully!`, 'success');
    }, 1000);
}

function downloadAllReceipts() {
    showMessage('Preparing to download all receipts...', 'success');
    setTimeout(() => {
        showMessage('All receipts downloaded as ZIP file!', 'success');
    }, 1500);
}

function downloadCurrentReceipt(receiptId) {
    showMessage(`Downloading receipt ${receiptId}...`, 'success');
    setTimeout(() => {
        showMessage(`Receipt ${receiptId} downloaded as PDF!`, 'success');
    }, 1000);
}

// Profile Edit Function
function editProfile() {
    const modal = createModal('Edit Profile', `
        <form id="editProfileForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" class="form-input" value="John Doe" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-input" value="john.doe@example.com" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" class="form-input" value="+1 (234) 567-8900" required>
                </div>
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" class="form-input" value="1995-01-15" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Height (cm)</label>
                    <input type="number" class="form-input" value="178" required>
                </div>
                <div class="form-group">
                    <label>Weight (lbs)</label>
                    <input type="number" class="form-input" value="180" required>
                </div>
            </div>
            <div class="form-group">
                <label>Fitness Goal</label>
                <select class="form-input">
                    <option>Muscle Gain</option>
                    <option>Weight Loss</option>
                    <option>Maintenance</option>
                    <option>Strength Training</option>
                </select>
            </div>
            <div class="form-group">
                <label>Emergency Contact</label>
                <input type="tel" class="form-input" value="+1 (234) 567-8901" required>
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
    `);
    
    document.getElementById('editProfileForm').onsubmit = (e) => {
        e.preventDefault();
        showMessage('Profile updated successfully!', 'success');
        modal.remove();
    };
}

// Admin Functions
function showAddMemberModal() {
    const modal = createModal('Add New Member', `
        <form id="addMemberForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" class="form-input" placeholder="Enter full name" required>
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" class="form-input" placeholder="Enter email" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone *</label>
                    <input type="tel" class="form-input" placeholder="+1 (234) 567-8900" required>
                </div>
                <div class="form-group">
                    <label>Date of Birth *</label>
                    <input type="date" class="form-input" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Package *</label>
                    <select class="form-input" required>
                        <option value="">Select Package</option>
                        <option value="premium">Premium - $50/month</option>
                        <option value="basic">Basic - $30/month</option>
                        <option value="student">Student - $20/month</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Start Date *</label>
                    <input type="date" class="form-input" required>
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea class="form-input" rows="2" placeholder="Enter address"></textarea>
            </div>
            <div class="form-group">
                <label>Emergency Contact</label>
                <input type="tel" class="form-input" placeholder="Emergency contact number">
            </div>
            <button type="submit" class="btn btn-primary">Add Member</button>
        </form>
    `);
    
    document.getElementById('addMemberForm').onsubmit = (e) => {
        e.preventDefault();
        showMessage('New member added successfully!', 'success');
        modal.remove();
    };
}

function showCreateBillModal() {
    const modal = createModal('Create New Bill', `
        <form id="createBillForm">
            <div class="form-group">
                <label>Select Member *</label>
                <select class="form-input" required>
                    <option value="">Choose a member</option>
                    <option value="001">John Doe - #001</option>
                    <option value="002">Sarah Smith - #002</option>
                    <option value="003">Mike Johnson - #003</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Package *</label>
                    <select class="form-input" required>
                        <option value="">Select Package</option>
                        <option value="premium">Premium - $50/month</option>
                        <option value="basic">Basic - $30/month</option>
                        <option value="student">Student - $20/month</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Amount *</label>
                    <input type="number" class="form-input" placeholder="Enter amount" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Bill Date *</label>
                    <input type="date" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Due Date *</label>
                    <input type="date" class="form-input" required>
                </div>
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <select class="form-input">
                    <option>Cash</option>
                    <option>Credit Card</option>
                    <option>Debit Card</option>
                    <option>Online Transfer</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea class="form-input" rows="2" placeholder="Additional notes"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Create Bill</button>
        </form>
    `);
    
    document.getElementById('createBillForm').onsubmit = (e) => {
        e.preventDefault();
        showMessage('Bill created successfully!', 'success');
        modal.remove();
    };
}

function showCreatePackageModal() {
    const modal = createModal('Create New Package', `
        <form id="createPackageForm">
            <div class="form-group">
                <label>Package Name *</label>
                <input type="text" class="form-input" placeholder="e.g., Premium Plus" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Price *</label>
                    <input type="number" class="form-input" placeholder="Enter price" required>
                </div>
                <div class="form-group">
                    <label>Duration *</label>
                    <select class="form-input" required>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                        <option>Yearly</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Features (one per line)</label>
                <textarea class="form-input" rows="6" placeholder="✓ Gym Access&#10;✓ All Equipment&#10;✓ Personal Trainer&#10;✓ Diet Plan"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Create Package</button>
        </form>
    `);
    
    document.getElementById('createPackageForm').onsubmit = (e) => {
        e.preventDefault();
        showMessage('Package created successfully!', 'success');
        modal.remove();
    };
}

function showAddProductModal() {
    const modal = createModal('Add New Product', `
        <form id="addProductForm">
            <div class="form-group">
                <label>Product Name *</label>
                <input type="text" class="form-input" placeholder="e.g., Whey Protein" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Price *</label>
                    <input type="number" step="0.01" class="form-input" placeholder="Enter price" required>
                </div>
                <div class="form-group">
                    <label>Stock Quantity *</label>
                    <input type="number" class="form-input" placeholder="Enter quantity" required>
                </div>
            </div>
            <div class="form-group">
                <label>Category *</label>
                <select class="form-input" required>
                    <option value="">Select category</option>
                    <option>Protein</option>
                    <option>Pre-Workout</option>
                    <option>Post-Workout</option>
                    <option>Vitamins</option>
                    <option>Accessories</option>
                </select>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-input" rows="3" placeholder="Product description"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Add Product</button>
        </form>
    `);
    
    document.getElementById('addProductForm').onsubmit = (e) => {
        e.preventDefault();
        showMessage('Product added successfully!', 'success');
        modal.remove();
    };
}

function showCreateDietPlanModal() {
    const modal = createModal('Create Diet Plan', `
        <form id="createDietPlanForm">
            <div class="form-group">
                <label>Plan Name *</label>
                <input type="text" class="form-input" placeholder="e.g., Cutting Plan" required>
            </div>
            <div class="form-group">
                <label>Description *</label>
                <textarea class="form-input" rows="2" placeholder="Plan description" required></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Calories/day *</label>
                    <input type="number" class="form-input" placeholder="e.g., 2500" required>
                </div>
                <div class="form-group">
                    <label>Protein/day (g) *</label>
                    <input type="number" class="form-input" placeholder="e.g., 180" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Duration *</label>
                    <input type="text" class="form-input" placeholder="e.g., 8 weeks" required>
                </div>
                <div class="form-group">
                    <label>Goal *</label>
                    <select class="form-input" required>
                        <option>Weight Loss</option>
                        <option>Muscle Gain</option>
                        <option>Maintenance</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Meal Plan Details</label>
                <textarea class="form-input" rows="6" placeholder="Enter detailed meal plan"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Create Plan</button>
        </form>
    `);
    
    document.getElementById('createDietPlanForm').onsubmit = (e) => {
        e.preventDefault();
        showMessage('Diet plan created successfully!', 'success');
        modal.remove();
    };
}

function showNotificationModal() {
    showSection('notifications');
}

// Edit/Delete Functions
function editMember(memberId) {
    showMessage('Opening edit form for member ' + memberId, 'success');
    showAddMemberModal(); // Reuse the add form with pre-filled data
}

function deleteMember(memberId) {
    if (confirm('Are you sure you want to delete this member?')) {
        showMessage('Member ' + memberId + ' deleted successfully!', 'success');
    }
}

function editPackage(packageName) {
    showMessage('Opening edit form for ' + packageName, 'success');
    showCreatePackageModal();
}

function deletePackage(packageName) {
    if (confirm(`Are you sure you want to delete ${packageName}?`)) {
        showMessage(packageName + ' deleted successfully!', 'success');
    }
}

function editProduct(productName) {
    showMessage('Opening edit form for ' + productName, 'success');
    showAddProductModal();
}

function deleteProduct(productName) {
    if (confirm(`Are you sure you want to delete ${productName}?`)) {
        showMessage(productName + ' deleted successfully!', 'success');
    }
}

// Modal Helper Function
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    return modal;
}