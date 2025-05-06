// Auth state management
const Auth = {
    isAuthenticated: false,
    user: null,

    init() {
        // Check if user is logged in
        const userData = localStorage.getItem('userData');
        if (userData) {
            this.user = JSON.parse(userData);
            this.isAuthenticated = true;
        }
        this.updateUI();
    },

    login(userData) {
        this.user = userData;
        this.isAuthenticated = true;
        localStorage.setItem('userData', JSON.stringify(userData));
        this.updateUI();
    },

    logout() {
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('userData');
        this.updateUI();
        window.location.href = 'index.html';
    },

    updateUI() {
        const profilePictures = document.querySelectorAll('#profilePicture');
        const profileUsernames = document.querySelectorAll('#profileUsername');
        const signInButtons = document.querySelectorAll('.cta-button[href="signin.html"]');
        const userProfiles = document.querySelectorAll('.user-profile');

        if (this.isAuthenticated && this.user) {
            // Update profile pictures
            profilePictures.forEach(pic => {
                pic.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.name)}&background=007bff&color=fff`;
            });

            // Update usernames
            profileUsernames.forEach(username => {
                username.textContent = this.user.name;
            });

            // Hide sign-in buttons and show user profile
            signInButtons.forEach(button => button.style.display = 'none');
            userProfiles.forEach(profile => profile.style.display = 'flex');
        } else {
            // Show sign-in buttons and hide user profile
            signInButtons.forEach(button => button.style.display = 'block');
            userProfiles.forEach(profile => profile.style.display = 'none');
        }
    }
};

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Handle sign out
function handleSignOut() {
    Auth.logout();
} 