// Data management for GetItDone
// Using localStorage for persistence across sessions

class DataManager {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Check if data exists in localStorage
        if (!localStorage.getItem('getitdone_tasks')) {
            this.seedSampleData();
        }
        if (!localStorage.getItem('getitdone_users')) {
            this.seedSampleUsers();
        }
    }

    seedSampleData() {
        const sampleTasks = [
            {
                id: 1,
                title: "Feed my two cats Fri–Sun",
                description: "Need someone to feed my two cats while I'm away for the weekend. They're very friendly and just need food and water. Located 5 minutes from Riverside campus.",
                tags: ["pets", "weekend"],
                payType: "flat",
                payAmount: 45,
                date: "2024-01-19",
                timeWindow: "Morning and evening",
                jobType: "local", // "local" or "remote"
                college: "University of Alabama - Tuscaloosa",
                locationType: "Apartment",
                locationName: "Riverside Apartments",
                address: "123 Riverside Dr, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2098, lng: -87.5692 },
                posterName: "Ally",
                posterEmail: "ally@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: "Assemble futon this afternoon",
                description: "Help assemble a futon frame. All parts and tools provided. Should take about 30 minutes.",
                tags: ["assembly", "furniture"],
                payType: "flat",
                payAmount: 30,
                date: "2024-01-15",
                timeWindow: "2:00 PM - 4:00 PM",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Apartment",
                locationName: "Lakeside Apartments lobby",
                address: "456 Lakeside Dr, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2156, lng: -87.5623 },
                posterName: "Jessica",
                posterEmail: "jessica@example.com",
                status: "assigned",
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: "Move 6 boxes from car to 3rd floor",
                description: "Need help carrying 6 medium-sized boxes from my car to my 3rd floor apartment. No elevator available.",
                tags: ["moving", "manual"],
                payType: "flat",
                payAmount: 25,
                date: "2024-01-16",
                timeWindow: "10:00 AM - 12:00 PM",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Campus",
                locationName: "Hewson Hall",
                address: "789 University Blvd, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2074, lng: -87.5506 },
                posterName: "Mike",
                posterEmail: "mike@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                title: "Print & deliver 30 flyers to Hewson",
                description: "Print 30 flyers (file provided) and deliver them to bulletin boards in Hewson Hall. Must be completed by Friday.",
                tags: ["printing", "delivery"],
                payType: "flat",
                payAmount: 15,
                date: "2024-01-18",
                timeWindow: "Any time before 5 PM",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Campus",
                locationName: "Hewson Hall",
                address: "789 University Blvd, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2074, lng: -87.5506 },
                posterName: "Sarah",
                posterEmail: "sarah@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                title: "Dog walk 20 minutes at 6 pm",
                description: "Walk my friendly golden retriever for 20 minutes around campus. He's very well-behaved on leash.",
                tags: ["pets", "walking"],
                payType: "flat",
                payAmount: 12,
                date: "2024-01-15",
                timeWindow: "6:00 PM - 6:30 PM",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Campus",
                locationName: "Student Center",
                address: "Student Center, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2098, lng: -87.5692 },
                posterName: "David",
                posterEmail: "david@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                title: "Hang 2 frames with level",
                description: "Help hang 2 picture frames on the wall. I have a level and all necessary hardware. Need someone with steady hands.",
                tags: ["assembly", "home"],
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Apartment",
                locationName: "Campus View Apartments",
                address: "321 Campus View Dr, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2045, lng: -87.5756 },
                payAmount: 20,
                date: "2024-01-17",
                timeWindow: "3:00 PM - 5:00 PM",
                posterName: "Lisa",
                posterEmail: "lisa@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            },
            {
                id: 7,
                title: "Grocery run: milk & eggs",
                description: "Quick grocery run to nearby store for milk and eggs. Will reimburse cost plus $10 for your time.",
                tags: ["errand", "groceries"],
                payType: "flat",
                payAmount: 10,
                date: "2024-01-16",
                timeWindow: "Afternoon",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Campus",
                locationName: "Student Center",
                address: "Student Center, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2098, lng: -87.5692 },
                posterName: "Tom",
                posterEmail: "tom@example.com",
                status: "completed",
                createdAt: new Date().toISOString()
            },
            {
                id: 8,
                title: "Study partner for MIS exam",
                description: "Looking for a study partner to review MIS 321 material. Free - just mutual help studying.",
                tags: ["tutoring", "study"],
                payType: "flat",
                payAmount: 0,
                date: "2024-01-20",
                timeWindow: "7:00 PM - 9:00 PM",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Campus",
                locationName: "Library Study Room",
                address: "University Library, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2074, lng: -87.5506 },
                posterName: "Emma",
                posterEmail: "emma@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            },
            {
                id: 9,
                title: "Basic laptop cleanup (updates)",
                description: "Help update my Windows laptop - install updates, clear temporary files, and optimize performance.",
                tags: ["tech", "computer"],
                payType: "flat",
                payAmount: 15,
                date: "2024-01-17",
                timeWindow: "Evening",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Campus",
                locationName: "Student Center",
                address: "Student Center, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2098, lng: -87.5692 },
                posterName: "Alex",
                posterEmail: "alex@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            },
            {
                id: 10,
                title: "Virtual tutoring for Python programming",
                description: "Need help with Python programming concepts via video call. Can work around your schedule.",
                tags: ["tutoring", "programming", "remote"],
                payType: "hour",
                payAmount: 25,
                date: "2024-01-22",
                timeWindow: "Flexible - evenings preferred",
                jobType: "remote",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Remote",
                locationName: "Online via Zoom",
                address: "Remote",
                coordinates: null,
                posterName: "Jordan",
                posterEmail: "jordan@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            },
            {
                id: 11,
                title: "Data entry project - 50 hours",
                description: "Need help entering data from PDFs into Excel spreadsheets. Can be done remotely at your own pace.",
                tags: ["data entry", "remote", "excel"],
                payType: "flat",
                payAmount: 200,
                date: "2024-01-25",
                timeWindow: "Flexible deadline - 2 weeks",
                jobType: "remote",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Remote",
                locationName: "Work from home",
                address: "Remote",
                coordinates: null,
                posterName: "Taylor",
                posterEmail: "taylor@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            }
        ];

        const sampleApplications = [
            {
                id: 1,
                taskId: 2,
                helperName: "John",
                helperEmail: "john@example.com",
                note: "I have experience assembling furniture and can help this afternoon. Available at 2:30 PM.",
                phone: "555-0123",
                status: "accepted",
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                taskId: 7,
                helperName: "Maria",
                helperEmail: "maria@example.com",
                note: "I can do the grocery run this afternoon. I have a car and know the area well.",
                phone: "555-0456",
                status: "accepted",
                createdAt: new Date().toISOString()
            }
        ];

        localStorage.setItem('getitdone_tasks', JSON.stringify(sampleTasks));
        localStorage.setItem('getitdone_applications', JSON.stringify(sampleApplications));
    }

    seedSampleUsers() {
        const sampleUsers = [
            {
                id: 1,
                email: "ally@example.com",
                name: "Ally",
                phone: "555-0101",
                password: "password123", // In real app, this would be hashed
                createdAt: new Date().toISOString(),
                isVerified: true,
                profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                bio: "Love helping with pets and small tasks around campus! Available most weekends.",
                skills: ["pet care", "moving", "cleaning"],
                rating: 4.8,
                totalRatings: 12,
                college: "University of Alabama - Tuscaloosa",
                year: "Junior",
                major: "Biology"
            },
            {
                id: 2,
                email: "jessica@example.com",
                name: "Jessica",
                phone: "555-0102",
                password: "password123",
                createdAt: new Date().toISOString(),
                isVerified: true,
                profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                bio: "Engineering student who loves assembling furniture and fixing things. Handy with tools!",
                skills: ["assembly", "tech support", "moving"],
                rating: 4.9,
                totalRatings: 8,
                college: "University of Alabama - Tuscaloosa",
                year: "Senior",
                major: "Mechanical Engineering"
            },
            {
                id: 3,
                email: "mike@example.com",
                name: "Mike",
                phone: "555-0103",
                password: "password123",
                createdAt: new Date().toISOString(),
                isVerified: true
            },
            {
                id: 4,
                email: "sarah@example.com",
                name: "Sarah",
                phone: "555-0104",
                password: "password123",
                createdAt: new Date().toISOString(),
                isVerified: true
            },
            {
                id: 5,
                email: "david@example.com",
                name: "David",
                phone: "555-0105",
                password: "password123",
                createdAt: new Date().toISOString(),
                isVerified: true
            },
            {
                id: 6,
                email: "lisa@example.com",
                name: "Lisa",
                phone: "555-0106",
                password: "password123",
                createdAt: new Date().toISOString(),
                isVerified: true
            },
            {
                id: 7,
                email: "tom@example.com",
                name: "Tom",
                phone: "555-0107",
                password: "password123",
                createdAt: new Date().toISOString(),
                isVerified: true
            },
            {
                id: 8,
                email: "emma@example.com",
                name: "Emma",
                phone: "555-0108",
                password: "password123",
                createdAt: new Date().toISOString(),
                isVerified: true
            },
            {
                id: 9,
                email: "alex@example.com",
                name: "Alex",
                phone: "555-0109",
                password: "password123",
                createdAt: new Date().toISOString(),
                isVerified: true
            },
            {
                id: 10,
                email: "john@example.com",
                name: "John",
                phone: "555-0123",
                password: "password123",
                createdAt: new Date().toISOString(),
                isVerified: true
            },
            {
                id: 11,
                email: "maria@example.com",
                name: "Maria",
                phone: "555-0456",
                password: "password123",
                createdAt: new Date().toISOString(),
                isVerified: true
            }
        ];

        // Initialize new data structures
        const sampleRatings = [];
        const sampleMessages = [];
        const sampleNotifications = [];

        localStorage.setItem('getitdone_users', JSON.stringify(sampleUsers));
        localStorage.setItem('getitdone_ratings', JSON.stringify(sampleRatings));
        localStorage.setItem('getitdone_messages', JSON.stringify(sampleMessages));
        localStorage.setItem('getitdone_notifications', JSON.stringify(sampleNotifications));
    }

    // Task Management
    getAllTasks() {
        const tasks = localStorage.getItem('getitdone_tasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    getTaskById(id) {
        const tasks = this.getAllTasks();
        return tasks.find(task => task.id === parseInt(id));
    }

    getTasksByStatus(status) {
        const tasks = this.getAllTasks();
        return tasks.filter(task => task.status === status);
    }

    getTasksByTag(tag) {
        const tasks = this.getAllTasks();
        return tasks.filter(task => task.tags.includes(tag));
    }

    getTasksByLocation(location) {
        const tasks = this.getAllTasks();
        return tasks.filter(task => 
            task.locationName.toLowerCase().includes(location.toLowerCase()) ||
            task.locationType.toLowerCase().includes(location.toLowerCase())
        );
    }

    addTask(taskData) {
        const tasks = this.getAllTasks();
        const newTask = {
            id: this.getNextId(tasks),
            ...taskData,
            status: 'open',
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        localStorage.setItem('getitdone_tasks', JSON.stringify(tasks));
        
        // Track posted task for the user
        this.trackPostedTask(newTask.posterEmail, newTask.id);
        
        return newTask;
    }

    // Track posted tasks by user
    trackPostedTask(userEmail, taskId) {
        const postedTasks = this.getPostedTasks();
        if (!postedTasks[userEmail]) {
            postedTasks[userEmail] = [];
        }
        postedTasks[userEmail].push({
            taskId: taskId,
            postedAt: new Date().toISOString(),
            status: 'active'
        });
        localStorage.setItem('getitdone_posted_tasks', JSON.stringify(postedTasks));
    }

    // Get posted tasks for a user
    getPostedTasksForUser(userEmail) {
        const postedTasks = this.getPostedTasks();
        return postedTasks[userEmail] || [];
    }

    // Get all posted tasks
    getPostedTasks() {
        const postedTasks = localStorage.getItem('getitdone_posted_tasks');
        return postedTasks ? JSON.parse(postedTasks) : {};
    }

    // Update task status in posted tasks tracking
    updatePostedTaskStatus(userEmail, taskId, status) {
        const postedTasks = this.getPostedTasks();
        if (postedTasks[userEmail]) {
            const taskIndex = postedTasks[userEmail].findIndex(t => t.taskId === taskId);
            if (taskIndex !== -1) {
                postedTasks[userEmail][taskIndex].status = status;
                postedTasks[userEmail][taskIndex].updatedAt = new Date().toISOString();
                localStorage.setItem('getitdone_posted_tasks', JSON.stringify(postedTasks));
            }
        }
    }

    updateTask(id, updates) {
        const tasks = this.getAllTasks();
        const index = tasks.findIndex(task => task.id === parseInt(id));
        if (index !== -1) {
            const oldTask = tasks[index];
            tasks[index] = { ...tasks[index], ...updates };
            localStorage.setItem('getitdone_tasks', JSON.stringify(tasks));
            
            // Update posted task status if status changed
            if (updates.status && updates.status !== oldTask.status) {
                this.updatePostedTaskStatus(oldTask.posterEmail, id, updates.status);
            }
            
            return tasks[index];
        }
        return null;
    }

    // Application Management
    getAllApplications() {
        const applications = localStorage.getItem('getitdone_applications');
        return applications ? JSON.parse(applications) : [];
    }

    getApplicationsByTaskId(taskId) {
        const applications = this.getAllApplications();
        return applications.filter(app => app.taskId === parseInt(taskId));
    }

    getApplicationsByHelperEmail(email) {
        const applications = this.getAllApplications();
        return applications.filter(app => app.helperEmail === email);
    }

    addApplication(applicationData) {
        const applications = this.getAllApplications();
        const newApplication = {
            id: this.getNextId(applications),
            ...applicationData,
            status: 'submitted',
            createdAt: new Date().toISOString()
        };
        applications.push(newApplication);
        localStorage.setItem('getitdone_applications', JSON.stringify(applications));
        return newApplication;
    }

    updateApplication(id, updates) {
        const applications = this.getAllApplications();
        const index = applications.findIndex(app => app.id === parseInt(id));
        if (index !== -1) {
            applications[index] = { ...applications[index], ...updates };
            localStorage.setItem('getitdone_applications', JSON.stringify(applications));
            return applications[index];
        }
        return null;
    }

    // User Management
    getAllUsers() {
        const users = localStorage.getItem('getitdone_users');
        return users ? JSON.parse(users) : [];
    }

    getUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(user => user.email === email);
    }

    getUserById(id) {
        const users = this.getAllUsers();
        return users.find(user => user.id === parseInt(id));
    }

    addUser(userData) {
        const users = this.getAllUsers();
        const newUser = {
            id: this.getNextId(users),
            ...userData,
            createdAt: new Date().toISOString(),
            isVerified: false
        };
        users.push(newUser);
        localStorage.setItem('getitdone_users', JSON.stringify(users));
        return newUser;
    }

    updateUser(id, updates) {
        const users = this.getAllUsers();
        const index = users.findIndex(user => user.id === parseInt(id));
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('getitdone_users', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    authenticateUser(email, password) {
        const user = this.getUserByEmail(email);
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    // Utility Methods
    getNextId(items) {
        if (items.length === 0) return 1;
        return Math.max(...items.map(item => item.id)) + 1;
    }

    // Location Infrastructure
    getUSColleges() {
        return [
            "University of Alabama - Tuscaloosa",
            "Auburn University - Auburn",
            "University of Alabama at Birmingham - Birmingham",
            "University of South Alabama - Mobile",
            "Troy University - Troy",
            "Jacksonville State University - Jacksonville",
            "University of North Alabama - Florence",
            "Alabama State University - Montgomery",
            "University of California - Los Angeles",
            "University of California - Berkeley",
            "Stanford University - Stanford",
            "University of Southern California - Los Angeles",
            "University of Texas - Austin",
            "Texas A&M University - College Station",
            "University of Florida - Gainesville",
            "Florida State University - Tallahassee",
            "University of Georgia - Athens",
            "Georgia Institute of Technology - Atlanta",
            "University of North Carolina - Chapel Hill",
            "Duke University - Durham",
            "North Carolina State University - Raleigh",
            "University of Virginia - Charlottesville",
            "Virginia Tech - Blacksburg",
            "University of Michigan - Ann Arbor",
            "Michigan State University - East Lansing",
            "Ohio State University - Columbus",
            "University of Illinois - Urbana-Champaign",
            "Northwestern University - Evanston",
            "University of Wisconsin - Madison",
            "University of Minnesota - Twin Cities",
            "University of Washington - Seattle",
            "University of Oregon - Eugene",
            "Oregon State University - Corvallis",
            "University of Colorado - Boulder",
            "Colorado State University - Fort Collins",
            "Arizona State University - Tempe",
            "University of Arizona - Tucson",
            "University of Utah - Salt Lake City",
            "Brigham Young University - Provo",
            "University of Nevada - Las Vegas",
            "University of New Mexico - Albuquerque",
            "Texas Tech University - Lubbock",
            "University of Houston - Houston",
            "Rice University - Houston",
            "Baylor University - Waco",
            "University of Oklahoma - Norman",
            "Oklahoma State University - Stillwater",
            "University of Kansas - Lawrence",
            "Kansas State University - Manhattan",
            "University of Missouri - Columbia",
            "Washington University in St. Louis - St. Louis",
            "University of Iowa - Iowa City",
            "Iowa State University - Ames",
            "University of Nebraska - Lincoln",
            "University of Arkansas - Fayetteville",
            "University of Tennessee - Knoxville",
            "Vanderbilt University - Nashville",
            "University of Kentucky - Lexington",
            "University of Louisville - Louisville",
            "West Virginia University - Morgantown",
            "University of Maryland - College Park",
            "Johns Hopkins University - Baltimore",
            "University of Delaware - Newark",
            "Rutgers University - New Brunswick",
            "Princeton University - Princeton",
            "University of Pennsylvania - Philadelphia",
            "Temple University - Philadelphia",
            "Penn State University - University Park",
            "Carnegie Mellon University - Pittsburgh",
            "University of Pittsburgh - Pittsburgh",
            "Syracuse University - Syracuse",
            "Cornell University - Ithaca",
            "University of Rochester - Rochester",
            "New York University - New York",
            "Columbia University - New York",
            "Yale University - New Haven",
            "University of Connecticut - Storrs",
            "Boston University - Boston",
            "Harvard University - Cambridge",
            "MIT - Cambridge",
            "Northeastern University - Boston",
            "University of Massachusetts - Amherst",
            "University of Vermont - Burlington",
            "University of New Hampshire - Durham",
            "University of Maine - Orono",
            "University of Rhode Island - Kingston",
            "Brown University - Providence"
        ];
    }

    getTasksByCampus(campus) {
        const tasks = this.getAllTasks();
        return tasks.filter(task => task.campus === campus);
    }

    getTasksByArea(campus, area) {
        const tasks = this.getAllTasks();
        return tasks.filter(task => task.campus === campus && task.area === area);
    }

    getTasksByJobType(jobType) {
        const tasks = this.getAllTasks();
        return tasks.filter(task => task.jobType === jobType);
    }

    getTasksNearLocation(lat, lng, radiusMiles = 5) {
        const tasks = this.getAllTasks();
        return tasks.filter(task => {
            if (!task.coordinates) return false;
            
            const distance = this.calculateDistance(
                lat, lng, 
                task.coordinates.lat, task.coordinates.lng
            );
            return distance <= radiusMiles;
        });
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI/180);
    }

    // Popular Tags
    getPopularTags() {
        return [
            "assembly", "pets", "errand", "moving", "tutoring", 
            "delivery", "cleaning", "tech", "printing", "study",
            "manual", "groceries", "walking", "home", "computer",
            "remote", "programming", "data entry"
        ];
    }

    // Search and Filter
    searchTasks(query, filters = {}) {
        let tasks = this.getAllTasks();

        // Text search
        if (query) {
            const searchTerm = query.toLowerCase();
            tasks = tasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm) ||
                task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Tag filter
        if (filters.tags && filters.tags.length > 0) {
            tasks = tasks.filter(task => 
                filters.tags.some(filterTag => task.tags.includes(filterTag))
            );
        }

        // Status filter
        if (filters.status && filters.status.length > 0) {
            tasks = tasks.filter(task => filters.status.includes(task.status));
        }

        // Job type filter (local/remote)
        if (filters.jobType && filters.jobType.length > 0) {
            tasks = tasks.filter(task => filters.jobType.includes(task.jobType));
        }

        // College filter
        if (filters.college && filters.college.length > 0) {
            tasks = tasks.filter(task => filters.college.includes(task.college));
        }

        // Location filter (legacy support)
        if (filters.location) {
            tasks = tasks.filter(task => 
                task.locationName.toLowerCase().includes(filters.location.toLowerCase()) ||
                task.locationType.toLowerCase().includes(filters.location.toLowerCase()) ||
                (task.college && task.college.toLowerCase().includes(filters.location.toLowerCase()))
            );
        }

        // Category filter
        if (filters.category) {
            tasks = tasks.filter(task => {
                // Map categories to task tags/types
                const categoryMapping = {
                    'academic': ['tutoring', 'academic', 'homework', 'essay', 'research', 'study'],
                    'household': ['cleaning', 'household', 'laundry', 'organizing', 'maintenance'],
                    'tech': ['tech', 'computer', 'software', 'website', 'programming', 'technical'],
                    'creative': ['creative', 'design', 'art', 'photography', 'video', 'writing'],
                    'delivery': ['delivery', 'pickup', 'shopping', 'errands', 'transport'],
                    'other': ['other', 'miscellaneous', 'general']
                };
                
                const categoryTags = categoryMapping[filters.category] || [];
                return categoryTags.some(tag => 
                    task.tags.some(taskTag => 
                        taskTag.toLowerCase().includes(tag.toLowerCase())
                    ) || 
                    task.title.toLowerCase().includes(filters.category.toLowerCase()) ||
                    task.description.toLowerCase().includes(filters.category.toLowerCase())
                );
            });
        }

        // Time filter
        if (filters.timeFilter) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const weekend = new Date(today);
            weekend.setDate(weekend.getDate() + (6 - today.getDay()));

            tasks = tasks.filter(task => {
                const taskDate = new Date(task.date);
                switch (filters.timeFilter) {
                    case 'today':
                        return taskDate.toDateString() === today.toDateString();
                    case 'tomorrow':
                        return taskDate.toDateString() === tomorrow.toDateString();
                    case 'weekend':
                        return taskDate >= weekend;
                    default:
                        return true;
                }
            });
        }

        return tasks;
    }

    // Sort tasks
    sortTasks(tasks, sortBy) {
        const sortedTasks = [...tasks];
        
        switch (sortBy) {
            case 'newest':
                return sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return sortedTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'deadline':
                return sortedTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'pay':
                return sortedTasks.sort((a, b) => b.payAmount - a.payAmount);
            case 'college':
                return sortedTasks.sort((a, b) => (a.college || '').localeCompare(b.college || ''));
            case 'jobType':
                return sortedTasks.sort((a, b) => (a.jobType || '').localeCompare(b.jobType || ''));
            case 'rating':
                return sortedTasks.sort((a, b) => {
                    const posterA = this.getUserByEmail(a.posterEmail);
                    const posterB = this.getUserByEmail(b.posterEmail);
                    return (posterB?.rating || 0) - (posterA?.rating || 0);
                });
            default:
                return sortedTasks;
        }
    }

    // Rating Management
    getAllRatings() {
        const ratings = localStorage.getItem('getitdone_ratings');
        return ratings ? JSON.parse(ratings) : [];
    }

    getRatingsByUserId(userId) {
        const ratings = this.getAllRatings();
        return ratings.filter(rating => rating.ratedUserId === parseInt(userId));
    }

    addRating(ratingData) {
        const ratings = this.getAllRatings();
        const newRating = {
            id: this.getNextId(ratings),
            ...ratingData,
            createdAt: new Date().toISOString()
        };
        ratings.push(newRating);
        localStorage.setItem('getitdone_ratings', JSON.stringify(ratings));
        
        // Update user's average rating
        this.updateUserRating(ratingData.ratedUserId);
        
        return newRating;
    }

    updateUserRating(userId) {
        const ratings = this.getRatingsByUserId(userId);
        if (ratings.length === 0) return;
        
        const averageRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
        const user = this.getUserById(userId);
        if (user) {
            user.rating = Math.round(averageRating * 10) / 10;
            user.totalRatings = ratings.length;
            this.updateUser(userId, user);
        }
    }

    // Message Management
    getAllMessages() {
        const messages = localStorage.getItem('getitdone_messages');
        return messages ? JSON.parse(messages) : [];
    }

    getMessagesBetweenUsers(user1Email, user2Email) {
        const messages = this.getAllMessages();
        return messages.filter(msg => 
            (msg.senderEmail === user1Email && msg.receiverEmail === user2Email) ||
            (msg.senderEmail === user2Email && msg.receiverEmail === user1Email)
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    getConversationsForUser(userEmail) {
        const messages = this.getAllMessages();
        const conversations = {};
        
        messages.forEach(msg => {
            const otherUser = msg.senderEmail === userEmail ? msg.receiverEmail : msg.senderEmail;
            if (!conversations[otherUser]) {
                conversations[otherUser] = {
                    otherUserEmail: otherUser,
                    lastMessage: msg,
                    unreadCount: 0
                };
            }
            
            if (msg.receiverEmail === userEmail && !msg.read) {
                conversations[otherUser].unreadCount++;
            }
            
            if (new Date(msg.createdAt) > new Date(conversations[otherUser].lastMessage.createdAt)) {
                conversations[otherUser].lastMessage = msg;
            }
        });
        
        return Object.values(conversations).sort((a, b) => 
            new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );
    }

    addMessage(messageData) {
        const messages = this.getAllMessages();
        const newMessage = {
            id: this.getNextId(messages),
            ...messageData,
            read: false,
            createdAt: new Date().toISOString()
        };
        messages.push(newMessage);
        localStorage.setItem('getitdone_messages', JSON.stringify(messages));
        
        // Create notification for receiver
        this.addNotification({
            userId: this.getUserByEmail(messageData.receiverEmail)?.id,
            type: 'message',
            title: 'New Message',
            message: `${messageData.senderName} sent you a message`,
            data: { conversationPartner: messageData.senderEmail }
        });
        
        return newMessage;
    }

    markMessagesAsRead(senderEmail, receiverEmail) {
        const messages = this.getAllMessages();
        const updatedMessages = messages.map(msg => {
            if (msg.senderEmail === senderEmail && msg.receiverEmail === receiverEmail && !msg.read) {
                return { ...msg, read: true };
            }
            return msg;
        });
        localStorage.setItem('getitdone_messages', JSON.stringify(updatedMessages));
    }

    // Notification Management
    getAllNotifications() {
        const notifications = localStorage.getItem('getitdone_notifications');
        return notifications ? JSON.parse(notifications) : [];
    }

    getNotificationsForUser(userId) {
        const notifications = this.getAllNotifications();
        return notifications.filter(notif => notif.userId === parseInt(userId))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    addNotification(notificationData) {
        const notifications = this.getAllNotifications();
        const newNotification = {
            id: this.getNextId(notifications),
            ...notificationData,
            read: false,
            createdAt: new Date().toISOString()
        };
        notifications.push(newNotification);
        localStorage.setItem('getitdone_notifications', JSON.stringify(notifications));
        return newNotification;
    }

    markNotificationAsRead(notificationId) {
        const notifications = this.getAllNotifications();
        const updatedNotifications = notifications.map(notif => {
            if (notif.id === parseInt(notificationId)) {
                return { ...notif, read: true };
            }
            return notif;
        });
        localStorage.setItem('getitdone_notifications', JSON.stringify(updatedNotifications));
    }

    markAllNotificationsAsRead(userId) {
        const notifications = this.getAllNotifications();
        const updatedNotifications = notifications.map(notif => {
            if (notif.userId === parseInt(userId) && !notif.read) {
                return { ...notif, read: true };
            }
            return notif;
        });
        localStorage.setItem('getitdone_notifications', JSON.stringify(updatedNotifications));
    }

    getUnreadNotificationCount(userId) {
        const notifications = this.getNotificationsForUser(userId);
        return notifications.filter(notif => !notif.read).length;
    }

    // Enhanced Search with Fuzzy Matching
    searchTasks(query, filters = {}) {
        let tasks = this.getAllTasks();

        // Enhanced text search with fuzzy matching
        if (query) {
            const searchTerm = query.toLowerCase().trim();
            tasks = tasks.filter(task => {
                const titleMatch = this.fuzzyMatch(task.title.toLowerCase(), searchTerm);
                const descMatch = this.fuzzyMatch(task.description.toLowerCase(), searchTerm);
                const tagMatch = task.tags.some(tag => this.fuzzyMatch(tag.toLowerCase(), searchTerm));
                const posterMatch = this.fuzzyMatch(task.posterName.toLowerCase(), searchTerm);
                
                return titleMatch || descMatch || tagMatch || posterMatch;
            });
        }

        // Apply filters (existing logic)
        if (filters.tags && filters.tags.length > 0) {
            tasks = tasks.filter(task => 
                filters.tags.some(filterTag => task.tags.includes(filterTag))
            );
        }

        if (filters.status && filters.status.length > 0) {
            tasks = tasks.filter(task => filters.status.includes(task.status));
        }

        if (filters.jobType && filters.jobType.length > 0) {
            tasks = tasks.filter(task => filters.jobType.includes(task.jobType));
        }

        if (filters.college && filters.college.length > 0) {
            tasks = tasks.filter(task => filters.college.includes(task.college));
        }

        if (filters.location) {
            tasks = tasks.filter(task => 
                task.locationName.toLowerCase().includes(filters.location.toLowerCase()) ||
                task.locationType.toLowerCase().includes(filters.location.toLowerCase()) ||
                (task.college && task.college.toLowerCase().includes(filters.location.toLowerCase()))
            );
        }

        if (filters.timeFilter) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const weekend = new Date(today);
            weekend.setDate(weekend.getDate() + (6 - today.getDay()));

            tasks = tasks.filter(task => {
                const taskDate = new Date(task.date);
                switch (filters.timeFilter) {
                    case 'today':
                        return taskDate.toDateString() === today.toDateString();
                    case 'tomorrow':
                        return taskDate.toDateString() === tomorrow.toDateString();
                    case 'weekend':
                        return taskDate >= weekend;
                    default:
                        return true;
                }
            });
        }

        // New filters
        if (filters.minRating) {
            tasks = tasks.filter(task => {
                const poster = this.getUserByEmail(task.posterEmail);
                return poster && poster.rating >= filters.minRating;
            });
        }

        if (filters.maxDistance && filters.userLocation) {
            tasks = tasks.filter(task => {
                if (task.jobType === 'remote') return true;
                if (!task.coordinates) return false;
                
                const distance = this.calculateDistance(
                    filters.userLocation.lat,
                    filters.userLocation.lng,
                    task.coordinates.lat,
                    task.coordinates.lng
                );
                return distance <= filters.maxDistance;
            });
        }

        if (filters.priceRange) {
            tasks = tasks.filter(task => {
                return task.payAmount >= filters.priceRange.min && 
                       task.payAmount <= filters.priceRange.max;
            });
        }

        return tasks;
    }

    // Fuzzy matching algorithm
    fuzzyMatch(text, pattern) {
        if (!pattern) return true;
        
        // Exact match
        if (text.includes(pattern)) return true;
        
        // Fuzzy match - allow for small differences
        let patternIndex = 0;
        for (let i = 0; i < text.length && patternIndex < pattern.length; i++) {
            if (text[i] === pattern[patternIndex]) {
                patternIndex++;
            }
        }
        
        return patternIndex === pattern.length;
    }

    // Task Completion Management
    markTaskAsCompleted(taskId, completionData) {
        const task = this.getTaskById(taskId);
        if (!task) return null;
        
        const updates = {
            status: 'completed',
            completedAt: new Date().toISOString(),
            completionNotes: completionData.notes,
            completionPhotos: completionData.photos || [],
            paymentConfirmed: completionData.paymentConfirmed || false
        };
        
        const updatedTask = this.updateTask(taskId, updates);
        
        // Create notification for poster
        const poster = this.getUserByEmail(task.posterEmail);
        if (poster) {
            this.addNotification({
                userId: poster.id,
                type: 'task_completed',
                title: 'Task Completed',
                message: `Your task "${task.title}" has been marked as completed`,
                data: { taskId: taskId }
            });
        }
        
        return updatedTask;
    }
}

// Initialize global data manager
const dataManager = new DataManager();

