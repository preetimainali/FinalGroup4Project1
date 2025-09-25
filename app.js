// Main application logic for GetItDone

class GetItDoneApp {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.currentUserData = this.getCurrentUserData();
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
        
        // Initialize new features
        this.initNotificationSystem();
        this.initMessagingSystem();
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

    getCurrentUserData() {
        const email = this.getCurrentUser();
        if (email) {
            return dataManager.getUserByEmail(email);
        }
        return null;
    }

    setCurrentUser(email) {
        localStorage.setItem('getitdone_current_user', email);
        this.currentUser = email;
        this.currentUserData = this.getCurrentUserData();
        this.updateNavigation();
    }

    logout() {
        localStorage.removeItem('getitdone_current_user');
        this.currentUser = null;
        this.currentUserData = null;
        this.updateNavigation();
        this.showSuccess('Logged out successfully');
        // Redirect to home page
        window.location.href = 'index.html';
    }

    updateNavigation() {
        const guestActions = document.getElementById('guest-actions');
        const userActions = document.getElementById('user-actions');
        const profileInitial = document.getElementById('profile-initial');
        const dropdownInitial = document.getElementById('dropdown-initial');
        const dropdownName = document.getElementById('dropdown-name');
        const dropdownEmail = document.getElementById('dropdown-email');
        
        if (this.currentUser && this.currentUserData) {
            // Show user actions
            if (guestActions) guestActions.style.display = 'none';
            if (userActions) userActions.style.display = 'flex';
            
            // Update user info
            if (profileInitial) profileInitial.textContent = this.currentUserData.name.charAt(0).toUpperCase();
            if (dropdownInitial) dropdownInitial.textContent = this.currentUserData.name.charAt(0).toUpperCase();
            if (dropdownName) dropdownName.textContent = this.currentUserData.name;
            if (dropdownEmail) dropdownEmail.textContent = this.currentUserData.email;
        } else {
            // Show guest actions
            if (guestActions) guestActions.style.display = 'flex';
            if (userActions) userActions.style.display = 'none';
        }
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
        this.applyUrlFilters();
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

        // All filter types
        this.setupTagFilters();
        this.setupStatusFilters();
        this.setupJobTypeFilters();
        this.setupCollegeFilters();
        this.setupLocationFilters();
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

    setupJobTypeFilters() {
        const container = document.getElementById('job-type-filters');
        if (!container) return;

        const jobTypes = [
            { value: 'local', text: 'Local Jobs', icon: 'bi-geo-alt' },
            { value: 'remote', text: 'Remote Jobs', icon: 'bi-laptop' }
        ];

        container.innerHTML = '';
        jobTypes.forEach(jobType => {
            const checkbox = document.createElement('div');
            checkbox.className = 'form-check';
            checkbox.innerHTML = `
                <input class="form-check-input" type="checkbox" id="job-type-${jobType.value}" value="${jobType.value}">
                <label class="form-check-label" for="job-type-${jobType.value}">
                    <i class="bi ${jobType.icon} me-2"></i>${jobType.text}
                </label>
            `;
            container.appendChild(checkbox);
        });
    }

    setupCollegeFilters() {
        const collegeSelect = document.getElementById('college-filter');
        if (!collegeSelect) return;

        const colleges = dataManager.getUSColleges();
        collegeSelect.innerHTML = '<option value="">All colleges</option>';
        
        colleges.forEach(college => {
            const option = document.createElement('option');
            option.value = college;
            option.textContent = college;
            collegeSelect.appendChild(option);
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

    applyUrlFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const search = urlParams.get('search');
        
        if (category) {
            // Filter tasks by category
            this.currentFilters = { ...this.currentFilters, category: category };
            this.loadAllTasks(this.currentFilters);
            
            // Map categories to their corresponding tags and check them
            const categoryMapping = {
                'academic': ['tutoring', 'academic', 'homework', 'essay', 'research', 'study'],
                'household': ['cleaning', 'household', 'laundry', 'organizing', 'maintenance'],
                'tech': ['tech', 'computer', 'software', 'website', 'programming', 'technical'],
                'creative': ['creative', 'design', 'art', 'photography', 'video', 'writing'],
                'delivery': ['delivery', 'pickup', 'shopping', 'errands', 'transport'],
                'other': ['other', 'miscellaneous', 'general']
            };
            
            const categoryTags = categoryMapping[category] || [];
            
            // Check the corresponding tag checkboxes
            categoryTags.forEach(tag => {
                const checkbox = document.getElementById(`tag-${tag}`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
            
            // Update filters to include the checked tags
            this.currentFilters = { ...this.currentFilters, tags: categoryTags };
            this.loadAllTasks(this.currentFilters);
        }
        
        if (search) {
            // Set search input
            const searchInputs = document.querySelectorAll('#search-input, #search-input-mobile');
            searchInputs.forEach(input => {
                if (input) input.value = search;
            });
            
            // Apply search filter
            this.currentFilters = { ...this.currentFilters, search: search };
            this.loadAllTasks(this.currentFilters);
        }
    }

    getActiveFilters() {
        const form = document.getElementById('filter-form');
        if (!form) return {};

        const formData = new FormData(form);
        const filters = {};

        // Get category filter from URL or hidden input
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category');
        const categoryFromForm = formData.get('category');
        const category = categoryFromUrl || categoryFromForm;
        if (category) {
            filters.category = category;
        }

        // Get search term
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value.trim()) {
            filters.search = searchInput.value.trim();
        }

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

        // Get selected job types
        const jobTypeCheckboxes = form.querySelectorAll('input[id^="job-type-"]:checked');
        if (jobTypeCheckboxes.length > 0) {
            filters.jobType = Array.from(jobTypeCheckboxes).map(cb => cb.value);
        }

        // Get college filter
        const college = formData.get('college');
        if (college) {
            filters.college = [college];
        }

        // Get location filter (legacy)
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

        // Get poster info
        const poster = dataManager.getUserByEmail(task.posterEmail);

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

        // Populate poster info with rating
        const posterInfoContainer = document.getElementById('poster-info');
        if (posterInfoContainer) {
            posterInfoContainer.innerHTML = `
                <div class="poster-card">
                    <div class="poster-avatar">
                        <img src="${poster?.profilePicture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNGMUY1RjkiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMyIgeT0iMTMiPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjkiIHI9IjMiIGZpbGw9IiM2QjcyODAiLz4KPHBhdGggZD0iTTYgMTkuNWMwLTMuMzEgMi42OS02IDYtNnM2IDIuNjkgNiA2djQuNUg2di00LjV6IiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPgo8L3N2Zz4K'}" 
                             alt="${task.posterName}" class="rounded-circle">
                    </div>
                    <div class="poster-info">
                        <h6 class="poster-name">${task.posterName}</h6>
                        ${poster?.rating > 0 ? `
                            <div class="poster-rating">
                                <div class="stars">
                                    ${Array.from({length: 5}, (_, i) => 
                                        `<i class="bi bi-star${i < Math.floor(poster.rating) ? '-fill' : ''}"></i>`
                                    ).join('')}
                                </div>
                                <span class="rating-text">${poster.rating} (${poster.totalRatings} reviews)</span>
                            </div>
                        ` : '<div class="no-rating">No ratings yet</div>'}
                    </div>
                    <div class="poster-actions">
                        <button class="btn btn-outline-primary btn-sm profile-action-btn" onclick="showUserProfile('${task.posterEmail}')" title="View Profile">
                            <i class="bi bi-person me-1"></i>Profile
                        </button>
                        ${this.currentUser && this.currentUser !== task.posterEmail ? `
                            <button class="btn btn-outline-secondary btn-sm message-action-btn" onclick="startConversation('${task.posterEmail}')" title="Message">
                                <i class="bi bi-chat-dots me-1"></i>Message
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // Populate contact section
        const contactContainer = document.getElementById('task-contact');
        if (contactContainer) {
            if (this.currentUser && this.currentUser !== task.posterEmail) {
                contactContainer.innerHTML = `
                    <button class="btn btn-primary btn-sm" onclick="startConversation('${task.posterEmail}')">
                        <i class="bi bi-chat-dots me-1"></i>Message Poster
                    </button>
                `;
            } else if (this.currentUser === task.posterEmail) {
                contactContainer.innerHTML = `
                    <span class="text-muted">This is your task</span>
                `;
            } else {
                contactContainer.innerHTML = `
                    <a href="#" class="btn btn-outline-primary btn-sm" onclick="showLoginModal()">
                        <i class="bi bi-box-arrow-in-right me-1"></i>Login to Message
                    </a>
                `;
            }
        }

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

        // Show/hide apply button based on status and user
        const applyButton = document.getElementById('apply-button');
        const completionButton = document.getElementById('completion-button');
        
        if (applyButton) {
            if (task.status === 'open' && this.currentUser !== task.posterEmail) {
                applyButton.style.display = 'block';
            } else {
                applyButton.style.display = 'none';
            }
        }

        // Show completion button for assigned tasks where user is the helper
        if (completionButton) {
            const applications = dataManager.getApplicationsByTaskId(task.id);
            const userApplication = applications.find(app => app.helperEmail === this.currentUser && app.status === 'accepted');
            
            if (userApplication && task.status === 'assigned') {
                completionButton.style.display = 'block';
                completionButton.onclick = () => this.showTaskCompletionModal(task.id);
            } else {
                completionButton.style.display = 'none';
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
        this.updatePostPageUserInfo();
    }

    updatePostPageUserInfo() {
        const userInfoNotice = document.getElementById('user-info-notice');
        if (userInfoNotice) {
            if (this.currentUser && this.currentUserData) {
                userInfoNotice.innerHTML = `Logged in as <strong>${this.currentUserData.name}</strong> (${this.currentUser})`;
            } else {
                userInfoNotice.textContent = 'Please log in to post a task.';
            }
        }
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
        // Check if user is logged in
        if (!this.currentUser) {
            this.showError('Please log in to post a task');
            this.showLoginModal();
            return;
        }

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
            jobType: formData.get('jobType'),
            college: formData.get('college') || '',
            locationType: formData.get('locationType'),
            locationName: formData.get('jobType') === 'remote' ? formData.get('remoteLocationName') : formData.get('locationName'),
            address: formData.get('address') || '',
            coordinates: null, // Will be set if needed for local jobs
            posterName: this.currentUserData.name,
            posterEmail: this.currentUser
        };

        // Validate required fields
        if (!this.validateTaskData(taskData)) {
            return;
        }

        // Add task
        const newTask = dataManager.addTask(taskData);

        // Show success message
        this.showSuccess('Task posted successfully!');
        
        // Redirect to task detail
        setTimeout(() => {
            window.location.href = `task-detail.html?id=${newTask.id}`;
        }, 1500);
    }

    validateTaskData(data) {
        const required = ['title', 'description', 'payAmount', 'date', 'timeWindow', 'jobType', 'posterName', 'posterEmail'];
        
        for (const field of required) {
            if (!data[field]) {
                this.showError(`Please fill in the ${field} field`);
                return false;
            }
        }

        // Additional validation for local jobs
        if (data.jobType === 'local') {
            if (!data.locationName) {
                this.showError('Location name is required for local jobs');
                return false;
            }
            if (!data.address) {
                this.showError('Address is required for local jobs');
                return false;
            }
        }

        // Additional validation for remote jobs
        if (data.jobType === 'remote') {
            if (!data.locationName) {
                this.showError('Platform/Details is required for remote jobs');
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
            this.showLoginPrompt();
            return;
        }

        this.loadMyPostedTasks();
        this.loadMyApplications();
    }

    showLoginPrompt() {
        const container = document.getElementById('my-stuff-content');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-5">
                <h3>Please log in to view your tasks</h3>
                <p class="text-muted mb-4">You need to be logged in to see your posted tasks and applications.</p>
                <button class="btn btn-primary" onclick="showLoginModal()">Log In</button>
                <button class="btn btn-outline-primary ms-2" onclick="showRegisterModal()">Sign Up</button>
            </div>
        `;
    }

    loadMyPostedTasks() {
        const container = document.getElementById('my-posted-tasks');
        if (!container) {
            console.log('My posted tasks container not found');
            return;
        }

        console.log('Loading posted tasks for user:', this.currentUser);
        
        const allTasks = dataManager.getAllTasks();
        console.log('All tasks:', allTasks);
        
        const myTasks = allTasks.filter(task => task.posterEmail === this.currentUser);
        console.log('My tasks:', myTasks);

        container.innerHTML = '';

        if (myTasks.length === 0) {
            container.innerHTML = '<p class="text-muted">You haven\'t posted any tasks yet.</p>';
            return;
        }

        // Sort tasks by creation date (newest first)
        myTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
        
        // Show/hide appropriate sections based on login status
        const loginPrompt = document.getElementById('apply-login-prompt');
        const formFields = document.getElementById('apply-form-fields');
        
        if (this.currentUser && this.currentUserData) {
            // User is logged in - show form and auto-fill
            loginPrompt.style.display = 'none';
            formFields.style.display = 'block';
            
            // Auto-fill user information
            document.getElementById('helper-name').value = this.currentUserData.name;
            document.getElementById('helper-email').value = this.currentUser;
            document.getElementById('helper-phone').value = this.currentUserData.phone || '';
        } else {
            // User is not logged in - show login prompt
            loginPrompt.style.display = 'block';
            formFields.style.display = 'none';
        }
        
        modal.show();
    }

    handleApply(form) {
        // Check if user is logged in
        if (!this.currentUser) {
            this.showError('Please log in to apply for a task');
            this.showLoginModal();
            return;
        }

        const formData = new FormData(form);
        const taskId = parseInt(formData.get('taskId'));

        const applicationData = {
            taskId: taskId,
            helperName: this.currentUserData.name,
            helperEmail: this.currentUser,
            note: formData.get('note'),
            phone: this.currentUserData.phone
        };

        // Validate
        if (!applicationData.note) {
            this.showError('Please provide a note explaining why you\'re a good fit for this task');
            return;
        }

        // Check if user already applied
        const existingApplications = dataManager.getApplicationsByHelperEmail(this.currentUser);
        const alreadyApplied = existingApplications.some(app => app.taskId === taskId);
        
        if (alreadyApplied) {
            this.showError('You have already applied for this task');
            return;
        }

        // Add application
        dataManager.addApplication(applicationData);

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

        // Generate random pastel class for variety
        const pastelClasses = ['card-pastel-blue', 'card-pastel-green', 'card-pastel-purple', 'card-pastel-pink', 'card-pastel-yellow', 'card-pastel-orange'];
        const randomPastelClass = pastelClasses[Math.floor(Math.random() * pastelClasses.length)];

        col.innerHTML = `
            <div class="card task-card h-100 ${randomPastelClass}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title task-title">${task.title}</h5>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <p class="card-text text-muted mb-3">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="task-pay">$${task.payAmount}</span>
                        <small class="task-location">
                            <i class="bi ${task.jobType === 'remote' ? 'bi-laptop' : 'bi-geo-alt'} me-1"></i>
                            ${task.jobType === 'remote' ? 'Remote' : (task.college ? task.college.split(' - ')[0] : task.locationName)}
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
        
        // Get application count for this task
        const applications = dataManager.getApplicationsByTaskId(task.id);
        const applicationCount = applications.length;

        div.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title">${task.title}</h5>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <p class="card-text text-muted">${task.description.substring(0, 150)}${task.description.length > 150 ? '...' : ''}</p>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <small class="text-muted">
                            <i class="bi bi-calendar me-1"></i>Posted: ${this.formatDate(task.createdAt)}
                        </small>
                    </div>
                    <div class="col-md-6">
                        <small class="text-muted">
                            <i class="bi bi-people me-1"></i>${applicationCount} application${applicationCount !== 1 ? 's' : ''}
                        </small>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="badge bg-success me-2">$${task.payAmount}</span>
                        <small class="text-muted">Due: ${this.formatDate(task.date)}</small>
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

    // Show notifications modal
    showNotifications() {
        const modal = new bootstrap.Modal(document.getElementById('notifications-modal'));
        this.loadNotifications();
        modal.show();
    }

    // Open messages modal
    openMessagesModal() {
        const modal = new bootstrap.Modal(document.getElementById('messages-modal'));
        this.loadConversations();
        modal.show();
    }

    // Perform search from header
    performSearch() {
        const searchInput = document.getElementById('header-search-input');
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm) {
            // Redirect to browse page with search term
            window.location.href = `browse.html?search=${encodeURIComponent(searchTerm)}`;
        }
    }

    // Toggle profile dropdown
    toggleProfileDropdown() {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    // Close profile dropdown when clicking outside
    closeProfileDropdown() {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
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
        this.setupLoginModal();
        this.setupRegisterModal();
        this.updateNavigation();
    }

    setupLoginModal() {
        const form = document.getElementById('login-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(form);
        });
    }

    setupRegisterModal() {
        const form = document.getElementById('register-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(form);
        });
    }

    handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        const user = dataManager.authenticateUser(email, password);
        if (user) {
            this.setCurrentUser(email);
            const modal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
            modal.hide();
            this.showSuccess(`Welcome back, ${user.name}!`);
            form.reset();
        } else {
            this.showError('Invalid email or password');
        }
    }

    handleRegister(form) {
        const formData = new FormData(form);
        const userData = {
            email: formData.get('email'),
            name: formData.get('name'),
            phone: formData.get('phone'),
            password: formData.get('password')
        };

        // Validate required fields
        if (!userData.email || !userData.name || !userData.password) {
            this.showError('Please fill in all required fields');
            return;
        }

        // Check if user already exists
        if (dataManager.getUserByEmail(userData.email)) {
            this.showError('An account with this email already exists');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Validate password length
        if (userData.password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }

        // Add user
        const newUser = dataManager.addUser(userData);
        this.setCurrentUser(newUser.email);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('register-modal'));
        modal.hide();
        this.showSuccess(`Welcome to GetItDone, ${newUser.name}!`);
        form.reset();
    }

    setupApplyModal() {
        const form = document.getElementById('apply-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleApply(form);
        });
    }

    // Enhanced Task Card with Ratings and Messaging
    createTaskCard(task) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';

        const statusClass = `status-${task.status}`;
        const statusText = task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ');

        // Get poster info
        const poster = dataManager.getUserByEmail(task.posterEmail);
        const posterRating = poster?.rating || 0;
        const posterRatingCount = poster?.totalRatings || 0;

        // Generate random pastel class for variety
        const pastelClasses = ['card-pastel-blue', 'card-pastel-green', 'card-pastel-purple', 'card-pastel-pink', 'card-pastel-yellow', 'card-pastel-orange'];
        const randomPastelClass = pastelClasses[Math.floor(Math.random() * pastelClasses.length)];

        col.innerHTML = `
            <div class="card task-card h-100 ${randomPastelClass}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title task-title">${task.title}</h5>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <p class="card-text text-muted mb-3">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
                    
                    <!-- Poster Info with Rating -->
                    <div class="d-flex align-items-center mb-3">
                        <div class="user-avatar-small me-2">
                            <img src="${poster?.profilePicture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNGMUY1RjkiLz4KPHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI2IiB5PSI2Ij4KPGNpcmNsZSBjeD0iNiIgY3k9IjQuNSIgcj0iMS41IiBmaWxsPSIjNkI3MjgwIi8+CjxwYXRoIGQ9Ik0zIDkuNzVjMC0xLjY1IDEuMzUtMyAzLTNoNmMxLjY1IDAgMyAxLjM1IDMgM3YyLjI1SDN2LTIuMjV6IiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPgo8L3N2Zz4K'}" 
                                 alt="${task.posterName}" class="rounded-circle profile-avatar" style="width: 24px; height: 24px; object-fit: cover;">
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center">
                                <span class="fw-medium me-2" style="cursor: pointer; color: #60a5fa;" onclick="showUserProfile('${task.posterEmail}')" title="View Profile">${task.posterName}</span>
                                ${posterRating > 0 ? `
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-star-fill text-warning me-1" style="font-size: 0.8em;"></i>
                                        <small class="text-muted">${posterRating} (${posterRatingCount})</small>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary profile-btn" onclick="showUserProfile('${task.posterEmail}')" title="View Profile">
                            <i class="bi bi-person"></i>
                        </button>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="task-pay">$${task.payAmount}</span>
                        <small class="task-location">
                            <i class="bi ${task.jobType === 'remote' ? 'bi-laptop' : 'bi-geo-alt'} me-1"></i>
                            ${task.jobType === 'remote' ? 'Remote' : (task.college ? task.college.split(' - ')[0] : task.locationName)}
                        </small>
                    </div>
                    <div class="mb-3">
                        ${task.tags.map(tag => `<span class="tag-badge">#${tag}</span>`).join('')}
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="task-time">
                            <i class="bi bi-clock me-1"></i>${this.formatDate(task.date)}
                        </small>
                        <div class="btn-group">
                            <a href="task-detail.html?id=${task.id}" class="btn btn-primary btn-sm">View Details</a>
                            ${this.currentUser && this.currentUser !== task.posterEmail ? `
                                <button class="btn btn-outline-secondary btn-sm message-btn" onclick="startConversation('${task.posterEmail}')" title="Message">
                                    <i class="bi bi-chat-dots"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    // Notification System
    initNotificationSystem() {
        this.loadNotifications();
        // Refresh notifications every 30 seconds
        setInterval(() => {
            this.loadNotifications();
        }, 30000);
    }

    loadNotifications() {
        if (!this.currentUserData) return;

        const notifications = dataManager.getNotificationsForUser(this.currentUserData.id);
        const unreadCount = dataManager.getUnreadNotificationCount(this.currentUserData.id);

        // Update notification badge
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }

        // Update notifications list
        const notificationsList = document.getElementById('notifications-list');
        if (notificationsList) {
            notificationsList.innerHTML = '';
            
            if (notifications.length === 0) {
                notificationsList.innerHTML = '<li class="dropdown-item-text text-center text-muted py-3">No notifications</li>';
                return;
            }

            notifications.slice(0, 5).forEach(notification => {
                const notificationElement = document.createElement('li');
                notificationElement.className = `dropdown-item ${!notification.read ? 'bg-light' : ''}`;
                notificationElement.innerHTML = `
                    <div class="d-flex align-items-start">
                        <div class="flex-grow-1">
                            <div class="fw-medium">${notification.title}</div>
                            <div class="text-muted small">${notification.message}</div>
                            <div class="text-muted small">${this.formatDate(notification.createdAt)}</div>
                        </div>
                        ${!notification.read ? '<div class="badge bg-primary rounded-pill ms-2" style="width: 8px; height: 8px;"></div>' : ''}
                    </div>
                `;
                notificationElement.addEventListener('click', () => {
                    this.handleNotificationClick(notification);
                });
                notificationsList.appendChild(notificationElement);
            });
        }
    }

    handleNotificationClick(notification) {
        dataManager.markNotificationAsRead(notification.id);
        this.loadNotifications();

        // Handle different notification types
        switch (notification.type) {
            case 'message':
                if (notification.data?.conversationPartner) {
                    showMessagesModal();
                    setTimeout(() => {
                        this.selectConversation(notification.data.conversationPartner);
                    }, 100);
                }
                break;
            case 'task_completed':
                if (notification.data?.taskId) {
                    window.location.href = `task-detail.html?id=${notification.data.taskId}`;
                }
                break;
        }
    }

    // Messaging System
    initMessagingSystem() {
        this.loadConversations();
        this.setupMessageForm();
    }

    loadConversations() {
        if (!this.currentUser) return;

        const conversations = dataManager.getConversationsForUser(this.currentUser);
        const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

        // Update message badge
        const badge = document.getElementById('message-badge');
        if (badge) {
            if (totalUnread > 0) {
                badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }

        // Update conversations list
        const conversationsList = document.getElementById('conversations-list');
        const conversationsListFull = document.getElementById('conversations-list-full');
        
        [conversationsList, conversationsListFull].forEach(list => {
            if (!list) return;
            
            list.innerHTML = '';
            
            if (conversations.length === 0) {
                list.innerHTML = '<div class="text-center text-muted py-3">No messages</div>';
                return;
            }

            conversations.slice(0, list === conversationsList ? 3 : 10).forEach(conversation => {
                const otherUser = dataManager.getUserByEmail(conversation.otherUserEmail);
                const conversationElement = document.createElement('div');
                conversationElement.className = `dropdown-item ${list === conversationsListFull ? 'border-bottom' : ''} ${conversation.unreadCount > 0 ? 'bg-light' : ''}`;
                conversationElement.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${otherUser?.profilePicture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGMUY1RjkiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPGNpcmNsZSBjeD0iOCIgY3k9IjYiIHI9IjIiIGZpbGw9IiM2QjcyODAiLz4KPHBhdGggZD0iTTQgMTNjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNHYxSDh2LTF6IiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPgo8L3N2Zz4K'}" 
                             alt="${otherUser?.name || 'User'}" class="rounded-circle me-2 conversation-avatar">
                        <div class="flex-grow-1">
                            <div class="fw-medium conversation-name">${otherUser?.name || 'User'}</div>
                            <div class="text-muted small conversation-preview">${conversation.lastMessage.content.substring(0, 50)}${conversation.lastMessage.content.length > 50 ? '...' : ''}</div>
                            <div class="text-muted small conversation-time">${this.formatDate(conversation.lastMessage.createdAt)}</div>
                        </div>
                        ${conversation.unreadCount > 0 ? `<span class="badge bg-primary rounded-pill unread-badge">${conversation.unreadCount}</span>` : ''}
                    </div>
                `;
                conversationElement.addEventListener('click', () => {
                    if (list === conversationsListFull) {
                        this.selectConversation(conversation.otherUserEmail);
                    } else {
                        showMessagesModal();
                        setTimeout(() => {
                            this.selectConversation(conversation.otherUserEmail);
                        }, 100);
                    }
                });
                list.appendChild(conversationElement);
            });
        });
    }

    setupMessageForm() {
        const messageForm = document.getElementById('message-form');
        if (!messageForm) return;

        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
    }

    selectConversation(otherUserEmail) {
        this.currentConversation = otherUserEmail;
        this.loadMessages(otherUserEmail);
        
        // Show message compose area
        const messageCompose = document.getElementById('message-compose');
        if (messageCompose) {
            messageCompose.style.display = 'block';
        }

        // Mark messages as read
        dataManager.markMessagesAsRead(otherUserEmail, this.currentUser);
        this.loadConversations();
    }

    startConversation(userEmail) {
        if (!this.currentUser) {
            this.showError('Please log in to send messages');
            // Show login modal
            const loginModal = new bootstrap.Modal(document.getElementById('login-modal'));
            loginModal.show();
            return;
        }
        
        this.openMessagesModal();
        setTimeout(() => {
            this.selectConversation(userEmail);
        }, 100);
    }

    loadMessages(otherUserEmail) {
        const messages = dataManager.getMessagesBetweenUsers(this.currentUser, otherUserEmail);
        const messagesArea = document.getElementById('messages-area');
        
        if (!messagesArea) return;

        messagesArea.innerHTML = '';
        
        if (messages.length === 0) {
            messagesArea.innerHTML = '<div class="text-center text-muted py-3">No messages yet. Start the conversation!</div>';
            return;
        }

        messages.forEach(message => {
            const isOwnMessage = message.senderEmail === this.currentUser;
            const messageElement = document.createElement('div');
            messageElement.className = `d-flex ${isOwnMessage ? 'justify-content-end' : 'justify-content-start'} mb-3`;
            
            messageElement.innerHTML = `
                <div class="message-bubble ${isOwnMessage ? 'bg-primary text-white' : 'bg-light'} rounded p-3" style="max-width: 70%;">
                    <div class="message-content">${message.content}</div>
                    <div class="message-time small ${isOwnMessage ? 'text-white-50' : 'text-muted'} mt-1">
                        ${this.formatTime(message.createdAt)}
                    </div>
                </div>
            `;
            
            messagesArea.appendChild(messageElement);
        });

        // Scroll to bottom
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput || !this.currentConversation) return;

        const content = messageInput.value.trim();
        if (!content) return;

        const messageData = {
            senderEmail: this.currentUser,
            senderName: this.currentUserData.name,
            receiverEmail: this.currentConversation,
            content: content
        };

        dataManager.addMessage(messageData);
        
        // Clear input and reload messages
        messageInput.value = '';
        this.loadMessages(this.currentConversation);
        this.loadConversations();
    }

    // Location Services (Disabled - no longer requests location permission)
    initLocationServices() {
        // Location services disabled to prevent permission requests
        // Users can still use distance filters if they manually enable location
    }

    // Enhanced Search with New Filters
    getActiveFilters() {
        const form = document.getElementById('filter-form');
        if (!form) return {};

        const formData = new FormData(form);
        const filters = {};

        // Existing filters
        const tags = formData.getAll('tags');
        if (tags.length > 0) {
            filters.tags = tags;
        }

        const statuses = formData.getAll('status');
        if (statuses.length > 0) {
            filters.status = statuses;
        }

        const jobTypeCheckboxes = form.querySelectorAll('input[id^="job-type-"]:checked');
        if (jobTypeCheckboxes.length > 0) {
            filters.jobType = Array.from(jobTypeCheckboxes).map(cb => cb.value);
        }

        const college = formData.get('college');
        if (college) {
            filters.college = [college];
        }

        const location = formData.get('location');
        if (location) {
            filters.location = location;
        }

        const timeFilter = formData.get('timeFilter');
        if (timeFilter) {
            filters.timeFilter = timeFilter;
        }

        // New filters
        const minPrice = document.getElementById('min-price')?.value;
        const maxPrice = document.getElementById('max-price')?.value;
        if (minPrice || maxPrice) {
            filters.priceRange = {
                min: parseInt(minPrice) || 0,
                max: parseInt(maxPrice) || 999999
            };
        }

        const ratingFilter = document.getElementById('rating-filter')?.value;
        if (ratingFilter) {
            filters.minRating = parseFloat(ratingFilter);
        }

        const distanceFilter = document.getElementById('distance-filter')?.value;
        if (distanceFilter && this.userLocation) {
            filters.maxDistance = parseInt(distanceFilter);
            filters.userLocation = this.userLocation;
        }

        return filters;
    }

    // Profile and Rating System
    createFillerProfile(userEmail) {
        // Create a universal sample profile for demonstration
        return {
            email: userEmail,
            name: 'Sample User',
            college: 'Sample University',
            year: 'Junior',
            major: 'Computer Science',
            bio: 'This is a sample profile for demonstration purposes. In a real application, this would show the actual user\'s information and profile details.',
            skills: ['Problem Solving', 'Communication', 'Time Management'],
            rating: 4.2,
            totalRatings: 12,
            profilePicture: null // Will use default avatar
        };
    }

    showUserProfile(userEmail) {
        let user = dataManager.getUserByEmail(userEmail);
        
        // If user doesn't exist, create a filler profile
        if (!user) {
            user = this.createFillerProfile(userEmail);
        }

        // Store current profile user for messaging
        this.currentProfileUser = userEmail;

        const modal = new bootstrap.Modal(document.getElementById('profile-modal'));
        const content = document.getElementById('profile-modal-content');
        
        content.innerHTML = `
            <div class="profile-modal-content">
                <div class="profile-header">
                    <div class="profile-avatar-large">
                        <img src="${user.profilePicture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjYwIiBmaWxsPSIjRjFGNUY5Ii8+Cjxzdmcgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgNjAgNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeD0iMzAiIHk9IjMwIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIyMiIgcj0iOCIgZmlsbD0iIzZCNzI4MCIvPgo8cGF0aCBkPSJNMTUgNDVjMC02LjYzIDUuMzctMTIgMTItMTJzMTIgNS4zNyAxMiAxMnYxNUgxNXYtMTV6IiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPgo8L3N2Zz4K'}" 
                             alt="${user.name}" class="rounded-circle">
                    </div>
                    <div class="profile-info">
                        <h4 class="profile-name">${user.name}</h4>
                        ${user.rating > 0 ? `
                            <div class="profile-rating-display">
                                <div class="stars-large">
                                    ${Array.from({length: 5}, (_, i) => 
                                        `<i class="bi bi-star${i < Math.floor(user.rating) ? '-fill' : ''}"></i>`
                                    ).join('')}
                                </div>
                                <span class="rating-large">${user.rating} (${user.totalRatings} reviews)</span>
                            </div>
                        ` : '<div class="no-rating-large">No ratings yet</div>'}
                        <div class="profile-meta">
                            <div class="meta-item">${user.college || 'No college specified'}</div>
                            <div class="meta-item">${user.year || 'No year'} • ${user.major || 'No major'}</div>
                        </div>
                    </div>
                </div>
                <div class="profile-details">
                    <div class="detail-section">
                        <h5 class="section-title">About</h5>
                        <p class="section-content">${user.bio || 'No bio available.'}</p>
                    </div>
                    
                    ${user.skills && user.skills.length > 0 ? `
                        <div class="detail-section">
                            <h5 class="section-title">Skills</h5>
                            <div class="skills-container">
                                ${user.skills.map(skill => `<span class="skill-badge">${skill}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <h5 class="section-title">Contact</h5>
                        <div class="contact-info">
                            <div class="contact-item">
                                <i class="bi bi-envelope"></i>
                                <span>${user.email}</span>
                            </div>
                            ${user.phone ? `
                                <div class="contact-item">
                                    <i class="bi bi-telephone"></i>
                                    <span>${user.phone}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Store current profile user for messaging
        this.currentProfileUser = userEmail;
        modal.show();
    }

    // Task Completion Workflow
    showTaskCompletionModal(taskId) {
        const modal = new bootstrap.Modal(document.getElementById('completion-modal'));
        document.getElementById('completion-task-id').value = taskId;
        modal.show();
    }

    handleTaskCompletion(form) {
        const formData = new FormData(form);
        const taskId = parseInt(formData.get('taskId'));
        
        const completionData = {
            notes: formData.get('notes'),
            photos: [], // Would handle file uploads in real implementation
            paymentConfirmed: formData.get('paymentConfirmed') === 'on'
        };

        dataManager.markTaskAsCompleted(taskId, completionData);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('completion-modal'));
        modal.hide();
        
        this.showSuccess('Task marked as completed!');
        form.reset();
    }

    // Utility Methods
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
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

function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('login-modal'));
    modal.show();
}

function showRegisterModal() {
    const modal = new bootstrap.Modal(document.getElementById('register-modal'));
    modal.show();
}

function logout() {
    app.logout();
}

// New global functions for enhanced features
function showUserProfile(userEmail) {
    if (window.app) {
        window.app.showUserProfile(userEmail);
    }
}

function startConversation(userEmail) {
    if (window.app) {
        window.app.startConversation(userEmail);
    }
}

function startConversationFromProfile() {
    if (window.app && window.app.currentProfileUser) {
        // Close the profile modal
        const profileModal = bootstrap.Modal.getInstance(document.getElementById('profile-modal'));
        if (profileModal) {
            profileModal.hide();
        }
        
        // Start conversation with the current profile user
        window.app.startConversation(window.app.currentProfileUser);
    }
}

function showUserProfileFromTaskDetail() {
    // Get the current task's poster email
    const taskId = new URLSearchParams(window.location.search).get('id');
    if (taskId && window.app) {
        const task = dataManager.getTaskById(taskId);
        if (task) {
            window.app.showUserProfile(task.posterEmail);
        }
    }
}

function showMessagesModal() {
    const modal = new bootstrap.Modal(document.getElementById('messages-modal'));
    app.loadConversations();
    modal.show();
}

function markAllNotificationsRead() {
    if (app.currentUserData) {
        dataManager.markAllNotificationsAsRead(app.currentUserData.id);
        app.loadNotifications();
    }
}

function clearFilters() {
    const form = document.getElementById('filter-form');
    if (form) {
        form.reset();
        // Clear advanced filters
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        const ratingFilter = document.getElementById('rating-filter');
        const distanceFilter = document.getElementById('distance-filter');
        
        if (minPrice) minPrice.value = '';
        if (maxPrice) maxPrice.value = '';
        if (ratingFilter) ratingFilter.value = '';
        if (distanceFilter) distanceFilter.value = '';
        
        // Trigger change event to reload tasks
        const event = new Event('change');
        form.dispatchEvent(event);
    }
}

// Enhanced search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                const event = new Event('input');
                searchInput.dispatchEvent(event);
            }
        });
    }
    
    // Handle completion form
    const completionForm = document.getElementById('completion-form');
    if (completionForm) {
        completionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            app.handleTaskCompletion(completionForm);
        });
    }
});

// Global functions for header
function performSearch() {
    if (window.app) {
        window.app.performSearch();
    }
}

function toggleProfileDropdown() {
    if (window.app) {
        window.app.toggleProfileDropdown();
    }
}

function showRegisterModal() {
    // Show registration modal (you can implement this)
    alert('Registration modal would open here');
}

function selectSuggestion(suggestion) {
    const searchInput = document.getElementById('header-search-input');
    if (searchInput) {
        searchInput.value = suggestion;
        performSearch();
    }
}

function showNotifications() {
    if (window.app) {
        window.app.showNotifications();
    }
}

function openMessagesModal() {
    if (window.app) {
        window.app.openMessagesModal();
    }
}


// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GetItDoneApp();
    
    // Close profile dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const profileDropdown = document.getElementById('profile-dropdown');
        const profileAvatar = document.querySelector('.profile-avatar-header');
        
        if (profileDropdown && profileAvatar && !profileDropdown.contains(e.target) && !profileAvatar.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    // Handle search form submission
    const headerSearchInput = document.getElementById('header-search-input');
    if (headerSearchInput) {
        headerSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});

