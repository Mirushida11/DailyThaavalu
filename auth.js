// Authentication System for Schedule Planner
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.getUsersFromStorage();
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
    }

    // Get users from localStorage
    getUsersFromStorage() {
        return JSON.parse(localStorage.getItem('schedulePlannerUsers')) || [];
    }

    // Save users to localStorage
    saveUsersToStorage() {
        localStorage.setItem('schedulePlannerUsers', JSON.stringify(this.users));
    }

    // Check if user is authenticated
    checkAuthentication() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            this.currentUser = currentUser;
            this.showMainApp();
        } else {
            this.showAuthScreen();
        }
    }

    // Show authentication screen
    showAuthScreen() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
        this.showLoginScreen();
    }

    // Show main application
    showMainApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('user-name').textContent = this.currentUser.name;
        
        // Initialize the main app
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    }

    // Show login screen
    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('signup-screen').classList.add('hidden');
        document.getElementById('login-email').focus();
    }

    // Show signup screen
    showSignupScreen() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('signup-screen').classList.remove('hidden');
        document.getElementById('signup-name').focus();
    }

    // Setup event listeners
    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form
        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Toggle between login and signup
        document.getElementById('show-signup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupScreen();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginScreen();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Demo account buttons
        document.querySelectorAll('.demo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.getAttribute('data-email');
                const password = btn.getAttribute('data-password');
                this.fillDemoCredentials(email, password);
            });
        });

        // Toggle password visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.togglePasswordVisibility(e.target);
            });
        });

        // Password strength indicator
        document.getElementById('signup-password')?.addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });
    }

    // Handle login
    handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showToast('Please fill in all fields', 'warning');
            return;
        }

        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showMainApp();
            this.showToast(`Welcome back, ${user.name}!`, 'success');
        } else {
            this.showToast('Invalid email or password', 'danger');
        }
    }

    // Handle signup
    handleSignup() {
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.showToast('Please fill in all fields', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'danger');
            return;
        }

        if (password.length < 6) {
            this.showToast('Password must be at least 6 characters long', 'warning');
            return;
        }

        if (!document.getElementById('signup-terms').checked) {
            this.showToast('Please accept the terms and conditions', 'warning');
            return;
        }

        // Check if user already exists
        if (this.users.find(u => u.email === email)) {
            this.showToast('An account with this email already exists', 'danger');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString(),
            tasks: [] // Initialize empty tasks array
        };

        this.users.push(newUser);
        this.saveUsersToStorage();

        // Auto-login the new user
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.showMainApp();
        this.showToast(`Account created successfully! Welcome, ${name}!`, 'success');
    }

    // Handle logout
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.showAuthScreen();
            this.showToast('You have been logged out', 'info');
        }
    }

    // Fill demo credentials
    fillDemoCredentials(email, password) {
        // Create demo accounts if they don't exist
        const demoUsers = [
            {
                id: 'demo1',
                name: 'Demo User',
                email: 'user@demo.com',
                password: 'demo123',
                createdAt: new Date().toISOString(),
                tasks: [
                    {
                        id: 1,
                        text: 'Morning meditation',
                        time: 7,
                        duration: 30,
                        completed: false,
                        created: new Date().toISOString()
                    },
                    {
                        id: 2,
                        text: 'Work on project',
                        time: 9,
                        duration: 120,
                        completed: false,
                        created: new Date().toISOString()
                    }
                ]
            },
            {
                id: 'demo2',
                name: 'Test User',
                email: 'test@demo.com',
                password: 'test123',
                createdAt: new Date().toISOString(),
                tasks: []
            }
        ];

        // Add demo users if they don't exist
        demoUsers.forEach(demoUser => {
            if (!this.users.find(u => u.email === demoUser.email)) {
                this.users.push(demoUser);
            }
        });
        this.saveUsersToStorage();

        // Fill the form
        document.getElementById('login-email').value = email;
        document.getElementById('login-password').value = password;
        this.showToast('Demo credentials filled! Click Sign In to continue.', 'info');
    }

    // Toggle password visibility
    togglePasswordVisibility(button) {
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const isPassword = input.type === 'password';
        
        input.type = isPassword ? 'text' : 'password';
        button.textContent = isPassword ? '🙈' : '👁️';
    }

    // Update password strength indicator
    updatePasswordStrength(password) {
        let strength = 0;
        let text = '';
        let className = '';

        if (password.length >= 6) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;

        switch (strength) {
            case 0:
            case 1:
                text = 'Weak';
                className = 'strength-weak';
                break;
            case 2:
            case 3:
                text = 'Medium';
                className = 'strength-medium';
                break;
            case 4:
                text = 'Strong';
                className = 'strength-strong';
                break;
        }

        // Update UI if elements exist
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        if (strengthBar && strengthText) {
            strengthBar.className = `strength-bar ${className}`;
            strengthText.textContent = text;
        }
    }

    // Get current user's tasks
    getCurrentUserTasks() {
        if (!this.currentUser) return [];
        
        const user = this.users.find(u => u.email === this.currentUser.email);
        return user ? user.tasks : [];
    }

    // Save tasks for current user
    saveCurrentUserTasks(tasks) {
        if (!this.currentUser) return;
        
        const userIndex = this.users.findIndex(u => u.email === this.currentUser.email);
        if (userIndex !== -1) {
            this.users[userIndex].tasks = tasks;
            this.saveUsersToStorage();
            
            // Update current user data
            this.currentUser.tasks = tasks;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    // Utility function to show toast notifications
    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});