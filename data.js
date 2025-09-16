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
                locationType: "Campus",
                locationName: "Riverside Apartments",
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
                locationType: "Campus",
                locationName: "Lakeside Apartments lobby",
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
                locationType: "Campus",
                locationName: "Hewson Hall",
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
                locationType: "Campus",
                locationName: "Hewson Hall",
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
                locationType: "Campus",
                locationName: "Meet at Student Center",
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
                payType: "flat",
                payAmount: 20,
                date: "2024-01-17",
                timeWindow: "3:00 PM - 5:00 PM",
                locationType: "Campus",
                locationName: "Campus View Apartments",
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
                locationType: "Campus",
                locationName: "Meet at Student Center",
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
                locationType: "Campus",
                locationName: "Library Study Room",
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
                locationType: "Campus",
                locationName: "Student Center",
                posterName: "Alex",
                posterEmail: "alex@example.com",
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
        return newTask;
    }

    updateTask(id, updates) {
        const tasks = this.getAllTasks();
        const index = tasks.findIndex(task => task.id === parseInt(id));
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            localStorage.setItem('getitdone_tasks', JSON.stringify(tasks));
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

    // Utility Methods
    getNextId(items) {
        if (items.length === 0) return 1;
        return Math.max(...items.map(item => item.id)) + 1;
    }

    // Popular Tags
    getPopularTags() {
        return [
            "assembly", "pets", "errand", "moving", "tutoring", 
            "delivery", "cleaning", "tech", "printing", "study",
            "manual", "groceries", "walking", "home", "computer"
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

        // Location filter
        if (filters.location) {
            tasks = tasks.filter(task => 
                task.locationName.toLowerCase().includes(filters.location.toLowerCase()) ||
                task.locationType.toLowerCase().includes(filters.location.toLowerCase())
            );
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
            default:
                return sortedTasks;
        }
    }
}

// Initialize global data manager
const dataManager = new DataManager();

