// Data management for GetItDone
// Using localStorage for persistence across sessions

class DataManager {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Check if data exists in localStorage, if not, seed it
        if (!localStorage.getItem('getitdone_users')) {
            this.seedSampleUsers();
        }
        if (!localStorage.getItem('getitdone_tasks')) {
            this.seedSampleData();
        }
        if (!localStorage.getItem('getitdone_messages')) {
            this.seedSampleMessages();
        }
        if (!localStorage.getItem('getitdone_notifications')) {
            this.seedSampleNotifications();
        }
        if (!localStorage.getItem('getitdone_applications')) {
            this.seedSampleApplications();
        }
        
        // Clean up any old email verification data
        this.cleanupEmailVerificationData();
    }

    cleanupEmailVerificationData() {
        // Remove old email verification data from localStorage
        localStorage.removeItem('getitdone_email_verifications');
        
        // Clean up any email verification fields from existing users
        const users = this.getAllUsers();
        let needsUpdate = false;
        
        users.forEach(user => {
            if (user.email_verified !== undefined || user.email_verification_token !== undefined) {
                delete user.email_verified;
                delete user.email_verification_token;
                needsUpdate = true;
            }
        });
        
        if (needsUpdate) {
            localStorage.setItem('getitdone_users', JSON.stringify(users));
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
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Apartment",
                locationName: "Riverside Apartments",
                address: "123 Riverside Dr, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2098, lng: -87.5692 },
                posterName: "Ally",
                posterEmail: "ally@example.com",
                status: "open",
                platformFee: Math.round(45 * 0.05 * 100) / 100,
                helperPayment: Math.round((45 - Math.round(45 * 0.05 * 100) / 100) * 100) / 100,
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
                status: "open",
                platformFee: Math.round(30 * 0.05 * 100) / 100,
                helperPayment: Math.round((30 - Math.round(30 * 0.05 * 100) / 100) * 100) / 100,
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
                title: "Walk my dog for 30 minutes",
                description: "Need someone to walk my golden retriever around campus for about 30 minutes. Dog is very friendly and well-trained.",
                tags: ["pets", "walking"],
                payType: "flat",
                payAmount: 18,
                date: "2024-01-17",
                timeWindow: "4:00 PM - 6:00 PM",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Campus",
                locationName: "Quad area",
                address: "University of Alabama Quad, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2098, lng: -87.5692 },
                posterName: "Emma",
                posterEmail: "emma@example.com",
                status: "open",
                platformFee: Math.round(50 * 0.05 * 100) / 100,
                helperPayment: Math.round((50 - Math.round(50 * 0.05 * 100) / 100) * 100) / 100,
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                title: "Help with Python homework",
                description: "Need tutoring help with Python programming concepts, specifically with loops and functions. Can meet on campus or online.",
                tags: ["tutoring", "programming", "academic"],
                payType: "hour",
                payAmount: 20,
                date: "2024-01-19",
                timeWindow: "7:00 PM - 9:00 PM",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Campus",
                locationName: "Gorgas Library",
                address: "711 Capstone Drive, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2074, lng: -87.5506 },
                posterName: "David",
                posterEmail: "david@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            },
            {
                id: 7,
                title: "Clean apartment before move-out",
                description: "Deep clean my 1-bedroom apartment including kitchen, bathroom, and living room. All cleaning supplies provided.",
                tags: ["cleaning", "household"],
                payType: "flat",
                payAmount: 75,
                date: "2024-01-20",
                timeWindow: "9:00 AM - 12:00 PM",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Apartment",
                locationName: "Crimson Apartments",
                address: "321 Crimson Way, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2156, lng: -87.5623 },
                posterName: "Lisa",
                posterEmail: "lisa@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            },
            {
                id: 8,
                title: "Grocery shopping and delivery",
                description: "Need someone to go to Publix and buy a specific list of groceries, then deliver them to my apartment. List will be provided.",
                tags: ["shopping", "delivery", "errands"],
                payType: "flat",
                payAmount: 35,
                date: "2024-01-21",
                timeWindow: "2:00 PM - 4:00 PM",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Store",
                locationName: "Publix Super Market",
                address: "1500 McFarland Blvd E, Tuscaloosa, AL 35404",
                coordinates: { lat: 33.2098, lng: -87.5692 },
                posterName: "Ryan",
                posterEmail: "ryan@example.com",
                status: "open",
                createdAt: new Date().toISOString()
            },
            {
                id: 9,
                title: "Fix computer virus issue",
                description: "My laptop is running very slowly and I suspect it has a virus. Need someone tech-savvy to diagnose and fix the issue.",
                tags: ["tech", "computer", "software"],
                payType: "flat",
                payAmount: 50,
                date: "2024-01-22",
                timeWindow: "6:00 PM - 8:00 PM",
                jobType: "local",
                college: "University of Alabama - Tuscaloosa",
                locationType: "Campus",
                locationName: "Student Center",
                address: "Student Center, University of Alabama, Tuscaloosa, AL 35401",
                coordinates: { lat: 33.2074, lng: -87.5506 },
                posterName: "Chris",
                posterEmail: "chris@example.com",
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

        localStorage.setItem('getitdone_tasks', JSON.stringify(sampleTasks));
    }

    seedSampleUsers() {
        const sampleUsers = [
            {
                id: 1,
                email: "test@example.com",
                name: "Test User",
                phone: "555-0123",
                password: "test123",
                bio: "This is a test account for demonstration purposes.",
                college: "University of Alabama - Tuscaloosa",
                year: "Senior",
                major: "Computer Science",
                skills: ["Programming", "Testing", "Web Development"],
                rating: 5.0,
                totalRatings: 1,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                email: "ally@example.com",
                name: "Ally",
                phone: "205-555-0101",
                password: "password123",
                bio: "I'm a college student who loves animals and helping others.",
                college: "University of Alabama - Tuscaloosa",
                year: "Junior",
                major: "Biology",
                skills: ["Animal Care", "Organization", "Communication"],
                rating: 4.8,
                totalRatings: 15,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                email: "jessica@example.com",
                name: "Jessica",
                phone: "205-555-0102",
                password: "password123",
                bio: "Engineering student who enjoys building and fixing things.",
                college: "University of Alabama - Tuscaloosa",
                year: "Senior",
                major: "Mechanical Engineering",
                skills: ["Assembly", "Problem Solving", "Time Management"],
                rating: 4.6,
                totalRatings: 8,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                email: "mike@example.com",
                name: "Mike",
                phone: "205-555-0103",
                password: "password123",
                bio: "Athletic student who can help with physical tasks.",
                college: "University of Alabama - Tuscaloosa",
                year: "Sophomore",
                major: "Kinesiology",
                skills: ["Manual Labor", "Teamwork", "Reliability"],
                rating: 4.7,
                totalRatings: 12,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            },
            {
                id: 4,
                email: "sarah@example.com",
                name: "Sarah",
                phone: "205-555-0104",
                password: "password123",
                bio: "Communications major who loves organizing events and projects.",
                college: "University of Alabama - Tuscaloosa",
                year: "Junior",
                major: "Communications",
                skills: ["Project Management", "Design", "Marketing"],
                rating: 4.5,
                totalRatings: 6,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            },
            {
                id: 5,
                email: "emma@example.com",
                name: "Emma",
                phone: "205-555-0105",
                password: "password123",
                bio: "Animal lover and outdoor enthusiast.",
                college: "University of Alabama - Tuscaloosa",
                year: "Freshman",
                major: "Environmental Science",
                skills: ["Animal Care", "Outdoor Activities", "Patience"],
                rating: 4.9,
                totalRatings: 20,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            },
            {
                id: 6,
                email: "david@example.com",
                name: "David",
                phone: "205-555-0106",
                password: "password123",
                bio: "Computer Science student who loves programming and teaching.",
                college: "University of Alabama - Tuscaloosa",
                year: "Senior",
                major: "Computer Science",
                skills: ["Programming", "Tutoring", "Problem Solving"],
                rating: 4.8,
                totalRatings: 25,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            },
            {
                id: 7,
                email: "lisa@example.com",
                name: "Lisa",
                phone: "205-555-0107",
                password: "password123",
                bio: "Organized and detail-oriented student.",
                college: "University of Alabama - Tuscaloosa",
                year: "Junior",
                major: "Business Administration",
                skills: ["Organization", "Cleaning", "Time Management"],
                rating: 4.6,
                totalRatings: 10,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            },
            {
                id: 8,
                email: "ryan@example.com",
                name: "Ryan",
                phone: "205-555-0108",
                password: "password123",
                bio: "Friendly and reliable student who loves helping others.",
                college: "University of Alabama - Tuscaloosa",
                year: "Sophomore",
                major: "Marketing",
                skills: ["Customer Service", "Shopping", "Delivery"],
                rating: 4.7,
                totalRatings: 14,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            },
            {
                id: 9,
                email: "chris@example.com",
                name: "Chris",
                phone: "205-555-0109",
                password: "password123",
                bio: "Tech-savvy student who can help with computer issues.",
                college: "University of Alabama - Tuscaloosa",
                year: "Senior",
                major: "Information Technology",
                skills: ["Computer Repair", "Software", "Troubleshooting"],
                rating: 4.8,
                totalRatings: 18,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            },
            {
                id: 10,
                email: "jordan@example.com",
                name: "Jordan",
                phone: "205-555-0110",
                password: "password123",
                bio: "Flexible and adaptable student who enjoys remote work.",
                college: "University of Alabama - Tuscaloosa",
                year: "Junior",
                major: "Psychology",
                skills: ["Online Tutoring", "Communication", "Flexibility"],
                rating: 4.5,
                totalRatings: 7,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            },
            {
                id: 11,
                email: "taylor@example.com",
                name: "Taylor",
                phone: "205-555-0111",
                password: "password123",
                bio: "Detail-oriented student who excels at data management.",
                college: "University of Alabama - Tuscaloosa",
                year: "Senior",
                major: "Statistics",
                skills: ["Data Entry", "Excel", "Attention to Detail"],
                rating: 4.9,
                totalRatings: 22,
                is_verified: true,
                profile_picture: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
                created_at: new Date().toISOString()
            }
        ];

        localStorage.setItem('getitdone_users', JSON.stringify(sampleUsers));
    }

    seedSampleMessages() {
        const sampleMessages = [
            {
                id: 1,
                senderEmail: "ally@example.com",
                senderName: "Ally",
                receiverEmail: "jessica@example.com",
                content: "Hi! I saw your task about assembling the futon. I'm really good with furniture assembly and would love to help!",
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                read: false
            },
            {
                id: 2,
                senderEmail: "jessica@example.com",
                senderName: "Jessica",
                receiverEmail: "ally@example.com",
                content: "That's great! I actually found someone already, but I'll keep you in mind for future tasks. Thanks for reaching out!",
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
                read: true
            },
            {
                id: 3,
                senderEmail: "david@example.com",
                senderName: "David",
                receiverEmail: "emma@example.com",
                content: "Hey Emma! I'm interested in helping with your dog walking task. I love dogs and have experience with golden retrievers.",
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
                read: false
            },
            {
                id: 4,
                senderEmail: "emma@example.com",
                senderName: "Emma",
                receiverEmail: "david@example.com",
                content: "Perfect! Max is super friendly and well-trained. When would you be available?",
                createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
                read: false
            },
            {
                id: 5,
                senderEmail: "david@example.com",
                senderName: "David",
                receiverEmail: "emma@example.com",
                content: "I'm free this afternoon around 4 PM. Does that work for you?",
                createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
                read: false
            }
        ];

        localStorage.setItem('getitdone_messages', JSON.stringify(sampleMessages));
    }

    seedSampleNotifications() {
        const sampleNotifications = [
            {
                id: 1,
                userId: 2, // Jessica
                type: 'new_application',
                title: 'New Application',
                message: 'Ally applied to your task "Assemble futon this afternoon"',
                data: { taskId: 2, applicationId: 1, helperEmail: 'ally@example.com' },
                read: false,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                userId: 5, // Emma
                type: 'new_message',
                title: 'New Message',
                message: 'David sent you a message: "Hey Emma! I\'m interested in helping with your dog walking task..."',
                data: { senderEmail: 'david@example.com', messageId: 3 },
                read: false,
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                userId: 1, // Ally
                type: 'application_accepted',
                title: 'Application Accepted!',
                message: 'Your application for "Dog Walking" has been accepted!',
                data: { taskId: 3, applicationId: 2 },
                read: false,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 4,
                userId: 6, // David
                type: 'new_message',
                title: 'New Message',
                message: 'Emma sent you a message: "Perfect! Max is super friendly and well-trained..."',
                data: { senderEmail: 'emma@example.com', messageId: 4 },
                read: true,
                createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
            },
            {
                id: 5,
                userId: 2, // Jessica
                type: 'task_created',
                title: 'Task Posted',
                message: 'Your task "Assemble futon this afternoon" has been posted successfully!',
                data: { taskId: 2 },
                read: true,
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            }
        ];

        localStorage.setItem('getitdone_notifications', JSON.stringify(sampleNotifications));
    }

    seedSampleApplications() {
        const sampleApplications = [
            {
                id: 1,
                taskId: 2, // Assemble futon task (Jessica's task)
                helperEmail: "ally@example.com",
                helperName: "Ally",
                phone: "555-0101",
                note: "Hi! I'm really good with furniture assembly and have helped assemble many pieces before. I have all the necessary tools and can get this done quickly and safely.",
                status: "submitted",
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
            },
            {
                id: 2,
                taskId: 3, // Moving help task (Emma's task)
                helperEmail: "david@example.com",
                helperName: "David",
                phone: "555-0106",
                note: "I'm strong and have helped with many moves before. I can help with heavy lifting and have a pickup truck if needed for transporting items.",
                status: "submitted",
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
            },
            {
                id: 3,
                taskId: 3, // Another application for moving help (Emma's task)
                helperEmail: "ally@example.com",
                helperName: "Ally",
                phone: "555-0101",
                note: "I'm strong and have helped with many moves before. I can help with heavy lifting and have a pickup truck if needed for transporting items.",
                status: "submitted",
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
            },
            {
                id: 4,
                taskId: 2, // Another application for futon assembly (Jessica's task)
                helperEmail: "david@example.com",
                helperName: "David",
                phone: "555-0106",
                note: "I'm handy with tools and have assembled furniture before. I can help with this futon assembly task.",
                status: "submitted",
                createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 minutes ago
            }
        ];

        localStorage.setItem('getitdone_applications', JSON.stringify(sampleApplications));
    }

    // User Management Methods
    authenticateUser(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user && user.password === password) {
            // Return user without password
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    addUser(userData) {
        const users = this.getAllUsers();
        
        // Check if user already exists
        const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        
        const newUser = {
            id: this.getNextUserId(),
            email: userData.email.toLowerCase(),
            name: userData.name,
            phone: userData.phone || '',
            password: userData.password,
            bio: userData.bio || '',
            college: userData.college || '',
            year: userData.year || '',
            major: userData.major || '',
            skills: userData.skills || [],
            rating: 0,
            totalRatings: 0,
            is_verified: false,
            profile_picture: null,
            created_at: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('getitdone_users', JSON.stringify(users));
        
        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    getUserByEmail(email) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
            // Return user without password
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    getAllUsers() {
        const usersJson = localStorage.getItem('getitdone_users');
        return usersJson ? JSON.parse(usersJson) : [];
    }

    getNextUserId() {
        const users = this.getAllUsers();
        return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    }

    // Task Management Methods
    getAllTasks() {
        const tasksJson = localStorage.getItem('getitdone_tasks');
        return tasksJson ? JSON.parse(tasksJson) : [];
    }

    getTaskById(id) {
        const tasks = this.getAllTasks();
        return tasks.find(task => task.id === parseInt(id));
    }

    addTask(taskData) {
        const tasks = this.getAllTasks();
        
        // Calculate platform fee and helper payment
        const platformFee = Math.round(taskData.payAmount * 0.05 * 100) / 100;
        const helperPayment = Math.round((taskData.payAmount - platformFee) * 100) / 100;
        
        const newTask = {
            id: this.getNextTaskId(),
            ...taskData,
            status: 'open',
            createdAt: new Date().toISOString(),
            platformFee: platformFee,
            helperPayment: helperPayment
        };
        
        tasks.push(newTask);
        localStorage.setItem('getitdone_tasks', JSON.stringify(tasks));
        
        // Create notification for task poster (confirmation)
        const poster = this.getUserByEmail(taskData.posterEmail);
        if (poster) {
            this.addNotification({
                userId: poster.id,
                type: 'task_created',
                title: 'Task Posted',
                message: `Your task "${taskData.title}" has been posted successfully!`,
                data: { taskId: newTask.id }
            });
        }
        
        return newTask;
    }

    updateTask(id, updates) {
        const tasks = this.getAllTasks();
        const taskIndex = tasks.findIndex(task => task.id === parseInt(id));
        
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
            localStorage.setItem('getitdone_tasks', JSON.stringify(tasks));
            return tasks[taskIndex];
        }
        return null;
    }

    deleteTask(id) {
        const tasks = this.getAllTasks();
        const filteredTasks = tasks.filter(task => task.id !== parseInt(id));
        
        if (filteredTasks.length !== tasks.length) {
            localStorage.setItem('getitdone_tasks', JSON.stringify(filteredTasks));
            return true;
        }
        return false;
    }

    getNextTaskId() {
        const tasks = this.getAllTasks();
        return tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    }

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
        
        // Apply filters
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
            tasks = tasks.filter(task => 
                filters.college.includes(task.college)
            );
        }
        
        if (filters.priceRange) {
            tasks = tasks.filter(task => 
                task.payAmount >= filters.priceRange.min && 
                task.payAmount <= filters.priceRange.max
            );
        }
        
        return tasks;
    }

    sortTasks(tasks, sortBy) {
        switch (sortBy) {
            case 'newest':
                return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'price_high':
                return tasks.sort((a, b) => b.payAmount - a.payAmount);
            case 'price_low':
                return tasks.sort((a, b) => a.payAmount - b.payAmount);
            case 'due_date':
                return tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
            default:
                return tasks;
        }
    }

    getPopularTags() {
        const tasks = this.getAllTasks();
        const tagCounts = {};
        
        tasks.forEach(task => {
            task.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        return Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([tag]) => tag);
    }

    getUSColleges() {
        return [
            "University of Alabama - Tuscaloosa",
            "Auburn University",
            "University of South Alabama",
            "Troy University",
            "Jacksonville State University",
            "University of North Alabama",
            "University of Montevallo",
            "Alabama State University",
            "Alabama A&M University",
            "University of West Alabama"
        ];
    }

    // Application Management Methods
    getAllApplications() {
        const applicationsJson = localStorage.getItem('getitdone_applications');
        return applicationsJson ? JSON.parse(applicationsJson) : [];
    }

    addApplication(applicationData) {
        const applications = this.getAllApplications();
        const newApplication = {
            id: this.getNextApplicationId(),
            ...applicationData,
            status: 'submitted',
            createdAt: new Date().toISOString()
        };
        
        applications.push(newApplication);
        localStorage.setItem('getitdone_applications', JSON.stringify(applications));
        
        // Create notification for task poster
        const task = this.getTaskById(applicationData.taskId);
        const poster = this.getUserByEmail(task.posterEmail);
        const helper = this.getUserByEmail(applicationData.helperEmail);
        
        if (poster && helper) {
            this.addNotification({
                userId: poster.id,
                type: 'new_application',
                title: 'New Application',
                message: `${helper.name} applied to your task "${task.title}"`,
                data: { 
                    taskId: task.id,
                    applicationId: newApplication.id,
                    helperEmail: applicationData.helperEmail
                }
            });
        }
        
        return newApplication;
    }

    getApplicationsByTaskId(taskId) {
        const applications = this.getAllApplications();
        return applications.filter(app => app.taskId === parseInt(taskId));
    }

    getApplicationsByHelperEmail(email) {
        const applications = this.getAllApplications();
        return applications.filter(app => app.helperEmail.toLowerCase() === email.toLowerCase());
    }

    getNextApplicationId() {
        const applications = this.getAllApplications();
        return applications.length > 0 ? Math.max(...applications.map(a => a.id)) + 1 : 1;
    }

    updateApplication(applicationId, updates) {
        const applications = this.getAllApplications();
        const applicationIndex = applications.findIndex(app => app.id === parseInt(applicationId));
        
        if (applicationIndex !== -1) {
            // Update the application with new data
            applications[applicationIndex] = { 
                ...applications[applicationIndex], 
                ...updates 
            };
            
            // Save back to localStorage
            localStorage.setItem('getitdone_applications', JSON.stringify(applications));
            
            return applications[applicationIndex];
        }
        
        return null;
    }

    acceptApplication(applicationId) {
        const applications = this.getAllApplications();
        const applicationIndex = applications.findIndex(app => app.id === parseInt(applicationId));
        
        if (applicationIndex !== -1) {
            applications[applicationIndex].status = 'accepted';
            applications[applicationIndex].acceptedAt = new Date().toISOString();
            localStorage.setItem('getitdone_applications', JSON.stringify(applications));
            
            // Create notification for helper
            const application = applications[applicationIndex];
            const task = this.getTaskById(application.taskId);
            const helper = this.getUserByEmail(application.helperEmail);
            
            if (helper && task) {
                this.addNotification({
                    userId: helper.id,
                    type: 'application_accepted',
                    title: 'Application Accepted!',
                    message: `Your application for "${task.title}" has been accepted!`,
                    data: { 
                        taskId: task.id,
                        applicationId: application.id
                    }
                });
            }
            
            return applications[applicationIndex];
        }
        
        return null;
    }

    rejectApplication(applicationId) {
        const applications = this.getAllApplications();
        const applicationIndex = applications.findIndex(app => app.id === parseInt(applicationId));
        
        if (applicationIndex !== -1) {
            applications[applicationIndex].status = 'rejected';
            applications[applicationIndex].rejectedAt = new Date().toISOString();
            localStorage.setItem('getitdone_applications', JSON.stringify(applications));
            
            // Create notification for helper
            const application = applications[applicationIndex];
            const task = this.getTaskById(application.taskId);
            const helper = this.getUserByEmail(application.helperEmail);
            
            if (helper && task) {
                this.addNotification({
                    userId: helper.id,
                    type: 'application_rejected',
                    title: 'Application Update',
                    message: `Your application for "${task.title}" was not selected this time.`,
                    data: { 
                        taskId: task.id,
                        applicationId: application.id
                    }
                });
            }
            
            return applications[applicationIndex];
        }
        
        return null;
    }

    // Message Management Methods
    getAllMessages() {
        const messagesJson = localStorage.getItem('getitdone_messages');
        return messagesJson ? JSON.parse(messagesJson) : [];
    }

    addMessage(messageData) {
        const messages = this.getAllMessages();
        const newMessage = {
            id: this.getNextMessageId(),
            ...messageData,
            createdAt: new Date().toISOString(),
            read: false
        };
        
        messages.push(newMessage);
        localStorage.setItem('getitdone_messages', JSON.stringify(messages));
        
        // Create notification for message receiver
        const receiver = this.getUserByEmail(messageData.receiverEmail);
        const sender = this.getUserByEmail(messageData.senderEmail);
        
        if (receiver && sender) {
            this.addNotification({
                userId: receiver.id,
                type: 'new_message',
                title: 'New Message',
                message: `${sender.name} sent you a message: "${messageData.content.substring(0, 50)}${messageData.content.length > 50 ? '...' : ''}"`,
                data: { 
                    senderEmail: messageData.senderEmail,
                    messageId: newMessage.id
                }
            });
        }
        
        return newMessage;
    }

    getMessagesBetweenUsers(user1Email, user2Email) {
        const messages = this.getAllMessages();
        return messages.filter(message => 
            (message.senderEmail.toLowerCase() === user1Email.toLowerCase() && 
             message.receiverEmail.toLowerCase() === user2Email.toLowerCase()) ||
            (message.senderEmail.toLowerCase() === user2Email.toLowerCase() && 
             message.receiverEmail.toLowerCase() === user1Email.toLowerCase())
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    markMessagesAsRead(otherUserEmail, currentUserEmail) {
        const messages = this.getAllMessages();
        const updatedMessages = messages.map(message => {
            if (message.senderEmail.toLowerCase() === otherUserEmail.toLowerCase() && 
                message.receiverEmail.toLowerCase() === currentUserEmail.toLowerCase()) {
                return { ...message, read: true };
            }
            return message;
        });
        
        localStorage.setItem('getitdone_messages', JSON.stringify(updatedMessages));
    }

    getConversationsForUser(userEmail) {
        const messages = this.getAllMessages();
        const conversations = {};
        
        messages.forEach(message => {
            const otherUser = message.senderEmail.toLowerCase() === userEmail.toLowerCase() 
                ? message.receiverEmail 
                : message.senderEmail;
            
            if (!conversations[otherUser]) {
                conversations[otherUser] = {
                    otherUserEmail: otherUser,
                    lastMessage: message,
                    unreadCount: 0
                };
            }
            
            if (message.createdAt > conversations[otherUser].lastMessage.createdAt) {
                conversations[otherUser].lastMessage = message;
            }
            
            if (!message.read && message.receiverEmail.toLowerCase() === userEmail.toLowerCase()) {
                conversations[otherUser].unreadCount++;
            }
        });
        
        return Object.values(conversations).sort((a, b) => 
            new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );
    }

    getNextMessageId() {
        const messages = this.getAllMessages();
        return messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;
    }

    // Notification Management Methods
    getAllNotifications() {
        const notificationsJson = localStorage.getItem('getitdone_notifications');
        return notificationsJson ? JSON.parse(notificationsJson) : [];
    }

    addNotification(notificationData) {
        const notifications = this.getAllNotifications();
        const newNotification = {
            id: this.getNextNotificationId(),
            ...notificationData,
            read: false,
            createdAt: new Date().toISOString()
        };
        
        notifications.push(newNotification);
        localStorage.setItem('getitdone_notifications', JSON.stringify(notifications));
        return newNotification;
    }

    getNotificationsForUser(userId) {
        const notifications = this.getAllNotifications();
        return notifications.filter(notification => notification.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    getUnreadNotificationCount(userId) {
        const notifications = this.getAllNotifications();
        return notifications.filter(notification => 
            notification.userId === userId && !notification.read
        ).length;
    }

    markNotificationAsRead(notificationId) {
        const notifications = this.getAllNotifications();
        const updatedNotifications = notifications.map(notification => {
            if (notification.id === notificationId) {
                return { ...notification, read: true };
            }
            return notification;
        });
        
        localStorage.setItem('getitdone_notifications', JSON.stringify(updatedNotifications));
    }

    markAllNotificationsAsRead(userId) {
        const notifications = this.getAllNotifications();
        const updatedNotifications = notifications.map(notification => {
            if (notification.userId === userId) {
                return { ...notification, read: true };
            }
            return notification;
        });
        
        localStorage.setItem('getitdone_notifications', JSON.stringify(updatedNotifications));
    }

    getNextNotificationId() {
        const notifications = this.getAllNotifications();
        return notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
    }

    // Task Completion Methods
    markTaskAsCompleted(taskId, completionData) {
        const task = this.updateTask(taskId, { 
            status: 'completed',
            completedAt: new Date().toISOString(),
            ...completionData
        });
        
        if (task) {
            // Create notification for task poster
            const poster = this.getUserByEmail(task.posterEmail);
            if (poster) {
                this.addNotification({
                    userId: poster.id,
                    type: 'task_completed',
                    title: 'Task Completed',
                    message: `Your task "${task.title}" has been marked as completed.`,
                    data: { taskId: task.id }
                });
            }
        }
        
        return task;
    }
}

// Create global instance
const dataManager = new DataManager();