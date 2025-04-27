// Background Slider functionality
class BackgroundSlider {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.slideInterval = 5000; // Change slide every 5 seconds
        this.isTransitioning = false;
        
        this.loadImages();
        this.startSlider();
    }
    
    async loadImages() {
        try {
            // Define the image files explicitly to ensure they're loaded correctly
            const imageFiles = [
                'images/1.jpg',
                'images/2.webp',
                'images/3.jpg',
                'images/4.webp',
                'images/5.webp',
                'images/6.webp',
                'images/7.webp'
            ];
            
            // Clear existing slides
            const slider = document.querySelector('.hero-slider');
            slider.innerHTML = '';
            
            // Add new slides with error handling
            imageFiles.forEach(file => {
                const slide = document.createElement('div');
                slide.className = 'slide';
                slide.style.backgroundImage = `url('${file}')`;
                
                // Add error handling for background images
                const img = new Image();
                img.onerror = function() {
                    slide.style.backgroundImage = "url('images/fallback.jpg')";
                };
                img.src = file;
                
                slider.appendChild(slide);
            });
            
            // Add overlay
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            slider.appendChild(overlay);
            
            // Update slides reference
            this.slides = document.querySelectorAll('.slide');
            if (this.slides.length > 0) {
                this.slides[0].classList.add('active');
            }
        } catch (error) {
            console.error('Error loading images:', error);
        }
    }
    
    startSlider() {
        // Start the automatic slideshow
        setInterval(() => {
            if (!this.isTransitioning) {
                this.nextSlide();
            }
        }, this.slideInterval);
    }
    
    nextSlide() {
        this.isTransitioning = true;
        
        // Remove active class from current slide
        this.slides[this.currentSlide].classList.remove('active');
        
        // Move to next slide
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        
        // Add active class to new slide
        this.slides[this.currentSlide].classList.add('active');
        
        // Reset transition flag after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1500); // Match this with the CSS transition duration
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Chatbot functionality
class LaurentAgent {
    constructor() {
        this.chatbot = document.getElementById('chatbot');
        this.chatIcon = document.getElementById('chat-icon');
        this.messages = document.getElementById('chatbot-messages');
        this.input = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-message');
        this.toggleButton = document.getElementById('chatbot-toggle');
        this.userInfo = {
            name: null,
            email: null,
            phone: null,
            appointmentDate: null,
            appointmentTime: null
        };
        this.currentState = 'greeting';
        this.inactivityTimer = null;
        this.repromptTimer = null;
        this.isReprompting = false;
        
        this.setupEventListeners();
        this.initializeChatbot();
    }

    initializeChatbot() {
        // Wait 500ms before showing the chatbot with animation
        setTimeout(() => {
            this.openWithAnimation();
        }, 500);
    }
    
    openWithAnimation() {
        // Reset any existing animation
        this.chatbot.style.animation = 'none';
        this.chatbot.offsetHeight; // Trigger reflow
        
        // Apply the thinking bubble animation
        this.chatbot.style.animation = 'thinkingBubble 1s ease-out forwards';
        this.chatbot.classList.add('active');
        
        // Add welcome message after animation completes
        setTimeout(() => {
            this.addMessage('Laurent Agent', 'Hi there! I\'m Laurent Agent. Please type your information to schedule an immediate appointment and get started. I\'m here to help you feel at home.');
            
            // Start inactivity timer
            this.startInactivityTimer();
        }, 1000);
    }
    
    startInactivityTimer() {
        // Clear any existing timers
        if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
        if (this.repromptTimer) clearInterval(this.repromptTimer);
        
        // Set 30 second inactivity timer
        this.inactivityTimer = setTimeout(() => {
            this.closeChatbot();
            this.startRepromptCycle();
        }, 30000);
    }
    
    closeChatbot() {
        this.chatbot.classList.remove('active');
        this.isReprompting = true;
    }
    
    startRepromptCycle() {
        // Clear any existing reprompt timer
        if (this.repromptTimer) clearInterval(this.repromptTimer);
        
        // Start 20 second reprompt cycle
        this.repromptTimer = setInterval(() => {
            this.showReprompt();
        }, 20000);
        
        // Show first reprompt immediately
        this.showReprompt();
    }
    
    showReprompt() {
        // Add pulsing animation to chat icon
        this.chatIcon.classList.add('pulse');
        
        // Create and show reprompt tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'reprompt-tooltip';
        tooltip.textContent = 'Speak to our AI AGENT and schedule an appointment in minutes.';
        this.chatIcon.appendChild(tooltip);
        
        // Remove tooltip and animation after 3 seconds
        setTimeout(() => {
            this.chatIcon.classList.remove('pulse');
            if (tooltip.parentNode === this.chatIcon) {
                this.chatIcon.removeChild(tooltip);
            }
        }, 3000);
    }

    setupEventListeners() {
        // Chat icon click event
        this.chatIcon.addEventListener('click', () => {
            // If reprompting, reset the state
            if (this.isReprompting) {
                this.isReprompting = false;
                if (this.repromptTimer) clearInterval(this.repromptTimer);
            }
            
            this.toggleChatbot();
            if (this.chatbot.classList.contains('active') && this.messages.children.length === 0) {
                this.openWithAnimation();
            }
        });
        
        // Close button click event
        this.toggleButton.addEventListener('click', () => {
            this.toggleChatbot();
            if (!this.chatbot.classList.contains('active')) {
                this.startRepromptCycle();
            }
        });
        
        // Send button click event
        this.sendButton.addEventListener('click', () => {
            this.handleUserInput();
            this.resetInactivityTimer();
        });
        
        // Enter key press event
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
                this.resetInactivityTimer();
            }
        });
        
        // Input focus event
        this.input.addEventListener('focus', () => {
            this.resetInactivityTimer();
        });
    }
    
    resetInactivityTimer() {
        // Reset the inactivity timer when user interacts
        this.startInactivityTimer();
    }

    toggleChatbot() {
        this.chatbot.classList.toggle('active');
        if (this.chatbot.classList.contains('active')) {
            this.input.focus();
        }
    }

    startChat() {
        this.addMessage('Laurent Agent', 'Hello! Welcome to Laurent Agency. How can I assist you today?');
    }

    addMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender.toLowerCase().replace(' ', '-')}`;
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    handleUserInput() {
        const userMessage = this.input.value.trim();
        if (!userMessage) return;

        this.addMessage('You', userMessage);
        this.input.value = '';

        this.processUserInput(userMessage);
    }

    processUserInput(input) {
        const lowerInput = input.toLowerCase();

        switch (this.currentState) {
            case 'greeting':
                if (lowerInput.includes('quote') || lowerInput.includes('price')) {
                    this.addMessage('Laurent Agent', 'I\'d be happy to help you get a quote. Could you please tell me your name?');
                    this.currentState = 'collecting_name';
                } else if (lowerInput.includes('service') || lowerInput.includes('offer')) {
                    this.addMessage('Laurent Agent', 'We offer various insurance services including Auto, Home, Life, and Business insurance. Which type of insurance are you interested in?');
                } else if (lowerInput.includes('contact') || lowerInput.includes('reach')) {
                    this.addMessage('Laurent Agent', 'You can reach us at (555) 123-4567 or email us at info@laurentagency.com. Would you like to schedule an appointment?');
                    if (lowerInput.includes('yes') || lowerInput.includes('sure') || lowerInput.includes('appointment')) {
                        this.addMessage('Laurent Agent', 'Great! Could you please tell me your name?');
                        this.currentState = 'collecting_name';
                    }
                } else if (lowerInput.includes('appointment') || lowerInput.includes('schedule')) {
                    this.addMessage('Laurent Agent', 'I\'d be happy to help you schedule an appointment. Could you please tell me your name?');
                    this.currentState = 'collecting_name';
                } else {
                    this.addMessage('Laurent Agent', 'I can help you with quotes, information about our services, or scheduling an appointment. What would you like to know more about?');
                }
                break;

            case 'collecting_name':
                this.userInfo.name = input;
                this.addMessage('Laurent Agent', `Thank you, ${input}! Could you please provide your email address?`);
                this.currentState = 'collecting_email';
                break;

            case 'collecting_email':
                if (this.isValidEmail(input)) {
                    this.userInfo.email = input;
                    this.addMessage('Laurent Agent', 'Great! And finally, what\'s your phone number?');
                    this.currentState = 'collecting_phone';
                } else {
                    this.addMessage('Laurent Agent', 'That doesn\'t look like a valid email address. Please try again.');
                }
                break;

            case 'collecting_phone':
                this.userInfo.phone = input;
                this.addMessage('Laurent Agent', `Thank you for providing your information, ${this.userInfo.name}! Would you like to schedule an appointment? (Yes/No)`);
                this.currentState = 'asking_appointment';
                break;
                
            case 'asking_appointment':
                if (lowerInput.includes('yes') || lowerInput.includes('sure')) {
                    this.addMessage('Laurent Agent', 'Great! What date would you prefer for your appointment? (Please enter in MM/DD/YYYY format)');
                    this.currentState = 'collecting_date';
                } else {
                    this.addMessage('Laurent Agent', `Thank you for your interest, ${this.userInfo.name}! One of our agents will contact you shortly to discuss your insurance needs. Is there anything else you'd like to know?`);
                    this.currentState = 'greeting';
                }
                break;
                
            case 'collecting_date':
                if (this.isValidDate(input)) {
                    this.userInfo.appointmentDate = input;
                    this.addMessage('Laurent Agent', 'Perfect! What time would you prefer? (Please enter in HH:MM AM/PM format)');
                    this.currentState = 'collecting_time';
                } else {
                    this.addMessage('Laurent Agent', 'That doesn\'t look like a valid date. Please enter in MM/DD/YYYY format.');
                }
                break;
                
            case 'collecting_time':
                if (this.isValidTime(input)) {
                    this.userInfo.appointmentTime = input;
                    this.addMessage('Laurent Agent', `Great! I've scheduled your appointment for ${this.userInfo.appointmentDate} at ${this.userInfo.appointmentTime}. One of our agents will confirm this appointment with you shortly. Is there anything else you'd like to know?`);
                    this.currentState = 'greeting';
                } else {
                    this.addMessage('Laurent Agent', 'That doesn\'t look like a valid time. Please enter in HH:MM AM/PM format.');
                }
                break;
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    isValidDate(date) {
        return /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(date);
    }
    
    isValidTime(time) {
        return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/.test(time);
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundSlider();
    new LaurentAgent();
}); 