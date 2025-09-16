// Main application logic for GetItDone

class GetItDoneApp {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        // Initialize page-specific functionality
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'index':
                this.initHomePage();
                break;
            case 'browse':
                this.initBrowsePage();
                break;
            case 'task-detail':
                this.initTaskDetailPage();
                break;
            case 'post':
                this.initPostPage();
                break;
            case 'my-stuff':
                this.initMyStuffPage();
                break;
        }

        // Initialize common functionality
        this.initCommonFeatures();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('browse')) return 'browse';
        if (path.includes('task-detail')) return 'task-detail';
        if (path.includes('post')) return 'post';
        if (path.includes('my-stuff')) return 'my-stuff';
        return 'index';
    }

    getCurrentUser() {
        return localStorage.getItem('getitdone_current_user') || null;
    }

    setCurrentUser(email) {
        localStorage.setItem('getitdone_current_user', email);
        this.currentUser = email;
    }

    // Home Page
    initHomePage() {
        this.loadPopularTags();
        this.loadRecentTasks();
    }

    loadPopularTags() {
        const tagsContainer = document.getElementById('popular-tags');
        if (!tagsContainer) return;

        const popularTags = dataManager.getPopularTags();
        tagsContainer.innerHTML = '';

        popularTags.forEach(tag => {
            const tagElement = document.createElement('a');
            tagElement.href = `browse.html?tag=${encodeURIComponent(tag)}`;
            tagElement.className = 'tag-badge';
            tagElement.textContent = `#${tag}`;
            tagsContainer.appendChild(tagElement);
        });
    }

    loadRecentTasks() {
        const container = document.getElementById('recent-tasks');
        if (!container) return;

        const recentTasks = dataManager.getAllTasks()
            .filter(task => task.status === 'open')
            .slice(0, 6);

        container.innerHTML = '';

        if (recentTasks.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted">No recent tasks available.</div>';
            return;
        }

        recentTasks.forEach(task => {
            const taskCard = this.createTaskCard(task);
            container.appendChild(taskCard);
        });
    }

    // Browse Page
    initBrowsePage() {
        this.loadAllTasks();
        this.setupFilters();
        this.setupSearch();
    }

    loadAllTasks(filters = {}) {
        const container = document.getElementById('tasks-container');
        if (!container) return;

        const searchQuery = document.getElementById('search-input')?.value || '';
        const tasks = dataManager.searchTasks(searchQuery, filters);
        const sortBy = document.getElementById('sort-select')?.value || 'newest';
        const sortedTasks = dataManager.sortTasks(tasks, sortBy);

        container.innerHTML = '';

        if (sortedTasks.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5">No tasks found matching your criteria.</div>';
            return;
        }

        sortedTasks.forEach(task => {
            const taskCard = this.createTaskCard(task);
            container.appendChild(taskCard);
        });

        // Update results count
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = `${sortedTasks.length} task${sortedTasks.length !== 1 ? 's' : ''} found`;
        }
    }

    setupFilters() {
        const filterForm = document.getElementById('filter-form');
        if (!filterForm) return;

        // Tag filters
        this.setupTagFilters();

        // Status filters
        this.setupStatusFilters();

        // Location filters
        this.setupLocationFilters();

        // Time filters
        this.setupTimeFilters();

        // Apply filters on change
        filterForm.addEventListener('change', () => {
            const filters = this.getActiveFilters();
            this.loadAllTasks(filters);
        });
    }

    setupTagFilters() {
        const tagContainer = document.getElementById('tag-filters');
        if (!tagContainer) return;

        const popularTags = dataManager.getPopularTags();
        tagContainer.innerHTML = '';

        popularTags.forEach(tag => {
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input" type="checkbox" value="${tag}" id="tag-${tag}" name="tags">
                <label class="form-check-label" for="tag-${tag}">
                    #${tag}
                </label>
            `;
            tagContainer.appendChild(div);
        });
    }

    setupStatusFilters() {
        const statusContainer = document.getElementById('status-filters');
        if (!statusContainer) return;

        const statuses = [
            { value: 'open', label: 'Open' },
            { value: 'review', label: 'Under Review' },
            { value: 'assigned', label: 'Assigned' }
        ];

        statusContainer.innerHTML = '';

        statuses.forEach(status => {
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input" type="checkbox" value="${status.value}" id="status-${status.value}" name="status" checked>
                <label class="form-check-label" for="status-${status.value}">
                    ${status.label}
                </label>
            `;
            statusContainer.appendChild(div);
        });
    }

    setupLocationFilters() {
        const locationSelect = document.getElementById('location-filter');
        if (!locationSelect) return;

        const locations = [
            { value: '', label: 'All Locations' },
            { value: 'Campus', label: 'Campus' },
            { value: 'Riverside', label: 'Riverside' },
            { value: 'Lakeside', label: 'Lakeside' },
            { value: 'Hewson', label: 'Hewson' },
            { value: 'Student Center', label: 'Student Center' }
        ];

        locationSelect.innerHTML = '';

        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location.value;
            option.textContent = location.label;
            locationSelect.appendChild(option);
        });
    }

    setupTimeFilters() {
        const timeSelect = document.getElementById('time-filter');
        if (!timeSelect) return;

        const timeOptions = [
            { value: '', label: 'Any Time' },
            { value: 'today', label: 'Today' },
            { value: 'tomorrow', label: 'Tomorrow' },
            { value: 'weekend', label: 'This Weekend' }
        ];

        timeSelect.innerHTML = '';

        timeOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            timeSelect.appendChild(optionElement);
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const filters = this.getActiveFilters();
                this.loadAllTasks(filters);
            }, 300);
        });
    }

    getActiveFilters() {
        const form = document.getElementById('filter-form');
        if (!form) return {};

        const formData = new FormData(form);
        const filters = {};

        // Get selected tags
        const tags = formData.getAll('tags');
        if (tags.length > 0) {
            filters.tags = tags;
        }

        // Get selected statuses
        const statuses = formData.getAll('status');
        if (statuses.length > 0) {
            filters.status = statuses;
        }

        // Get location filter
        const location = formData.get('location');
        if (location) {
            filters.location = location;
        }

        // Get time filter
        const timeFilter = formData.get('timeFilter');
        if (timeFilter) {
            filters.timeFilter = timeFilter;
        }

        return filters;
    }

    // Task Detail Page
    initTaskDetailPage() {
        const taskId = this.getTaskIdFromUrl();
        if (taskId) {
            this.loadTaskDetail(taskId);
        }
    }

    getTaskIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    loadTaskDetail(taskId) {
        const task = dataManager.getTaskById(taskId);
        if (!task) {
            this.showError('Task not found');
            return;
        }

        this.populateTaskDetail(task);
        this.loadTaskApplications(taskId);
    }

    populateTaskDetail(task) {
        // Update page title
        document.title = `${task.title} - GetItDone`;

        // Populate task information
        const elements = {
            'task-title': task.title,
            'task-description': task.description,
            'task-pay': `$${task.payAmount}`,
            'task-date': this.formatDate(task.date),
            'task-time': task.timeWindow,
            'task-location': `${task.locationType}: ${task.locationName}`,
            'task-status': task.status,
            'task-poster': task.posterName,
            'task-created': this.formatDate(task.createdAt)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Populate tags
        const tagsContainer = document.getElementById('task-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            task.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag-badge me-2 mb-2';
                tagElement.textContent = `#${tag}`;
                tagsContainer.appendChild(tagElement);
            });
        }

        // Show/hide apply button based on status
        const applyButton = document.getElementById('apply-button');
        if (applyButton) {
            if (task.status === 'open') {
                applyButton.style.display = 'block';
            } else {
                applyButton.style.display = 'none';
            }
        }
    }

    loadTaskApplications(taskId) {
        const applications = dataManager.getApplicationsByTaskId(taskId);
        const container = document.getElementById('applications-container');
        if (!container) return;

        container.innerHTML = '';

        if (applications.length === 0) {
            container.innerHTML = '<p class="text-muted">No applications yet.</p>';
            return;
        }

        applications.forEach(app => {
            const appElement = this.createApplicationElement(app);
            container.appendChild(appElement);
        });
    }

    // Post Task Page
    initPostPage() {
        this.setupPostForm();
    }

    setupPostForm() {
        const form = document.getElementById('post-task-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePostTask(form);
        });

        // Setup tag input
        this.setupTagInput();
    }

    setupTagInput() {
        const tagInput = document.getElementById('task-tags-input');
        const tagContainer = document.getElementById('selected-tags');
        if (!tagInput || !tagContainer) return;

        const popularTags = dataManager.getPopularTags();
        let selectedTags = [];

        // Create tag checkboxes
        const tagCheckboxes = document.getElementById('tag-checkboxes');
        if (tagCheckboxes) {
            popularTags.forEach(tag => {
                const div = document.createElement('div');
                div.className = 'form-check form-check-inline';
                div.innerHTML = `
                    <input class="form-check-input" type="checkbox" value="${tag}" id="checkbox-${tag}">
                    <label class="form-check-label" for="checkbox-${tag}">#${tag}</label>
                `;
                tagCheckboxes.appendChild(div);
            });

            // Handle checkbox changes
            tagCheckboxes.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox') {
                    if (e.target.checked) {
                        selectedTags.push(e.target.value);
                    } else {
                        selectedTags = selectedTags.filter(tag => tag !== e.target.value);
                    }
                    this.updateSelectedTags(tagContainer, selectedTags);
                }
            });
        }

        // Handle custom tag input
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const customTag = tagInput.value.trim().toLowerCase();
                if (customTag && !selectedTags.includes(customTag)) {
                    selectedTags.push(customTag);
                    this.updateSelectedTags(tagContainer, selectedTags);
                    tagInput.value = '';
                }
            }
        });
    }

    updateSelectedTags(container, tags) {
        container.innerHTML = '';
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-badge me-2 mb-2';
            tagElement.innerHTML = `#${tag} <button type="button" class="btn-close btn-close-white ms-1" style="font-size: 0.7em;" onclick="removeTag('${tag}')"></button>`;
            container.appendChild(tagElement);
        });
    }

    handlePostTask(form) {
        const formData = new FormData(form);
        
        // Get selected tags
        const selectedTags = [];
        const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            selectedTags.push(checkbox.value);
        });

        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            tags: selectedTags,
            payType: formData.get('payType'),
            payAmount: parseInt(formData.get('payAmount')),
            date: formData.get('date'),
            timeWindow: formData.get('timeWindow'),
            locationType: formData.get('locationType'),
            locationName: formData.get('locationName'),
            posterName: formData.get('posterName'),
            posterEmail: formData.get('posterEmail')
        };

        // Validate required fields
        if (!this.validateTaskData(taskData)) {
            return;
        }

        // Add task
        const newTask = dataManager.addTask(taskData);
        
        // Set current user
        this.setCurrentUser(taskData.posterEmail);

        // Show success message
        this.showSuccess('Task posted successfully!');
        
        // Redirect to task detail
        setTimeout(() => {
            window.location.href = `task-detail.html?id=${newTask.id}`;
        }, 1500);
    }

    validateTaskData(data) {
        const required = ['title', 'description', 'payAmount', 'date', 'timeWindow', 'locationName', 'posterName', 'posterEmail'];
        
        for (const field of required) {
            if (!data[field]) {
                this.showError(`Please fill in the ${field} field`);
                return false;
            }
        }

        if (data.payAmount < 0) {
            this.showError('Pay amount must be positive');
            return false;
        }

        return true;
    }

    // My Stuff Page
    initMyStuffPage() {
        this.loadMyStuff();
    }

    loadMyStuff() {
        if (!this.currentUser) {
            this.showUserPrompt();
            return;
        }

        this.loadMyPostedTasks();
        this.loadMyApplications();
    }

    showUserPrompt() {
        const container = document.getElementById('my-stuff-content');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-5">
                <h3>Enter your email to view your tasks</h3>
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="input-group">
                            <input type="email" class="form-control" id="user-email-input" placeholder="your@email.com">
                            <button class="btn btn-primary" onclick="app.setUserAndLoad()">Load My Stuff</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setUserAndLoad() {
        const emailInput = document.getElementById('user-email-input');
        if (!emailInput || !emailInput.value) {
            this.showError('Please enter your email');
            return;
        }

        this.setCurrentUser(emailInput.value);
        this.loadMyStuff();
    }

    loadMyPostedTasks() {
        const container = document.getElementById('my-posted-tasks');
        if (!container) return;

        const myTasks = dataManager.getAllTasks()
            .filter(task => task.posterEmail === this.currentUser);

        container.innerHTML = '';

        if (myTasks.length === 0) {
            container.innerHTML = '<p class="text-muted">You haven\'t posted any tasks yet.</p>';
            return;
        }

        myTasks.forEach(task => {
            const taskElement = this.createMyTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    loadMyApplications() {
        const container = document.getElementById('my-applications');
        if (!container) return;

        const myApplications = dataManager.getApplicationsByHelperEmail(this.currentUser);

        container.innerHTML = '';

        if (myApplications.length === 0) {
            container.innerHTML = '<p class="text-muted">You haven\'t applied to any tasks yet.</p>';
            return;
        }

        myApplications.forEach(app => {
            const appElement = this.createMyApplicationElement(app);
            container.appendChild(appElement);
        });
    }

    // Application handling
    showApplyModal(taskId) {
        const modal = new bootstrap.Modal(document.getElementById('apply-modal'));
        document.getElementById('apply-task-id').value = taskId;
        modal.show();
    }

    handleApply(form) {
        const formData = new FormData(form);
        const taskId = parseInt(formData.get('taskId'));

        const applicationData = {
            taskId: taskId,
            helperName: formData.get('helperName'),
            helperEmail: formData.get('helperEmail'),
            note: formData.get('note'),
            phone: formData.get('phone')
        };

        // Validate
        if (!applicationData.helperName || !applicationData.helperEmail || !applicationData.note) {
            this.showError('Please fill in all required fields');
            return;
        }

        // Add application
        dataManager.addApplication(applicationData);

        // Set current user
        this.setCurrentUser(applicationData.helperEmail);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('apply-modal'));
        modal.hide();

        // Show success
        this.showSuccess('Application submitted successfully!');

        // Reset form
        form.reset();
    }

    // Utility methods
    createTaskCard(task) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';

        const statusClass = `status-${task.status}`;
        const statusText = task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ');

        col.innerHTML = `
            <div class="card task-card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title task-title">${task.title}</h5>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <p class="card-text text-muted mb-3">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="task-pay">$${task.payAmount}</span>
                        <small class="task-location">
                            <i class="bi bi-geo-alt me-1"></i>${task.locationName}
                        </small>
                    </div>
                    <div class="mb-3">
                        ${task.tags.map(tag => `<span class="tag-badge">#${tag}</span>`).join('')}
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="task-time">
                            <i class="bi bi-clock me-1"></i>${this.formatDate(task.date)}
                        </small>
                        <a href="task-detail.html?id=${task.id}" class="btn btn-primary btn-sm">View Details</a>
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    createApplicationElement(app) {
        const div = document.createElement('div');
        div.className = 'applicant-card';
        
        const statusClass = `status-${app.status}`;
        const statusText = app.status.charAt(0).toUpperCase() + app.status.slice(1);

        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <div class="applicant-name">${app.helperName}</div>
                    <div class="applicant-email">${app.helperEmail}</div>
                    ${app.phone ? `<div class="applicant-phone">${app.phone}</div>` : ''}
                </div>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="applicant-note">${app.note}</div>
            <div class="mt-2">
                <small class="text-muted">Applied: ${this.formatDate(app.createdAt)}</small>
            </div>
        `;

        return div;
    }

    createMyTaskElement(task) {
        const div = document.createElement('div');
        div.className = 'card mb-3';
        
        const statusClass = `status-${task.status}`;
        const statusText = task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ');

        div.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title">${task.title}</h5>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <p class="card-text text-muted">${task.description.substring(0, 150)}${task.description.length > 150 ? '...' : ''}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="badge bg-success me-2">$${task.payAmount}</span>
                        <small class="text-muted">${this.formatDate(task.date)}</small>
                    </div>
                    <a href="task-detail.html?id=${task.id}" class="btn btn-outline-primary btn-sm">View Details</a>
                </div>
            </div>
        `;

        return div;
    }

    createMyApplicationElement(app) {
        const task = dataManager.getTaskById(app.taskId);
        if (!task) return document.createElement('div');

        const div = document.createElement('div');
        div.className = 'card mb-3';
        
        const statusClass = `status-${app.status}`;
        const statusText = app.status.charAt(0).toUpperCase() + app.status.slice(1);

        div.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title">${task.title}</h5>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <p class="card-text text-muted">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="badge bg-success me-2">$${task.payAmount}</span>
                        <small class="text-muted">Applied: ${this.formatDate(app.createdAt)}</small>
                    </div>
                    <a href="task-detail.html?id=${task.id}" class="btn btn-outline-primary btn-sm">View Task</a>
                </div>
            </div>
        `;

        return div;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type) {
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Remove toast element after it's hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
        return container;
    }

    initCommonFeatures() {
        // Initialize any common features that apply to all pages
        this.setupApplyModal();
    }

    setupApplyModal() {
        const form = document.getElementById('apply-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleApply(form);
        });
    }
}

// Global functions for HTML onclick handlers
function removeTag(tag) {
    // This will be handled by the tag input setup
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.value === tag) {
            checkbox.checked = false;
        }
    });
    
    // Trigger change event
    const event = new Event('change');
    document.getElementById('tag-checkboxes').dispatchEvent(event);
}

function showApplyModal(taskId) {
    app.showApplyModal(taskId);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GetItDoneApp();
});

