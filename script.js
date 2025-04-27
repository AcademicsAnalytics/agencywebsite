// Background Slider functionality
class BackgroundSlider {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.slideInterval = 5000; // Change slide every 5 seconds
        this.isTransitioning = false;
        
        this.startSlider();
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
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Chat icon click event
        this.chatIcon.addEventListener('click', () => {
            this.toggleChatbot();
            if (this.chatbot.classList.contains('active') && this.messages.children.length === 0) {
                this.startChat();
            }
        });
        
        // Close button click event
        this.toggleButton.addEventListener('click', () => this.toggleChatbot());
        
        // Send button click event
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        
        // Enter key press event
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
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

// Initialize both the slider and chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const backgroundSlider = new BackgroundSlider();
    const chatbot = new LaurentAgent();
}); 