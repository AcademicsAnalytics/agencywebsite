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
        const slider = document.querySelector('.hero-slider');
        const existingSlides = slider.querySelectorAll('.slide');
        
        if (existingSlides.length > 0) {
            // Use slides already in HTML so the first image is visible instantly
            this.slides = existingSlides;
            this.slides.forEach((slide, index) => {
                // Ensure only the first slide is active (visible), others hidden
                if (index === 0) slide.classList.add('active');
                else slide.classList.remove('active');
                // Preload each background image and switch to fallback if it fails
                const imagePath = slide.style.backgroundImage.slice(5, -2);
                const img = new Image();
                img.onerror = () => {
                    console.warn(`Failed to load image: ${imagePath}`);
                    slide.style.backgroundImage = "url('images/fallback.jpg')";
                };
                img.src = imagePath;
            });
        } else {
            // If no slides exist in HTML, create them dynamically (as fallback)
            for (let i = 1; i <= 7; i++) {
                const slide = document.createElement('div');
                slide.className = 'slide';
                const imagePath = `images/${i}.jpg`;
                slide.style.backgroundImage = `url('${imagePath}')`;
                // Set fallback on load error
                const img = new Image();
                img.onerror = () => {
                    console.warn(`Failed to load image: ${imagePath}`);
                    slide.style.backgroundImage = "url('images/fallback.jpg')";
                };
                img.src = imagePath;
                slider.appendChild(slide);
            }
            // Re-add the overlay on top of slides
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            slider.appendChild(overlay);
            // Update slides list and activate the first slide for display
            this.slides = slider.querySelectorAll('.slide');
            if (this.slides.length > 0) {
                this.slides[0].classList.add('active');
            }
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
        this.tooltip = null;
        this.hasShownInitialPopup = false;
        
        this.setupEventListeners();
        this.initializeChatbot();
    }

    initializeChatbot() {
        // Only show the chat icon initially, don't automatically open the chatbot
        this.chatIcon.style.display = 'flex';
        this.hasShownInitialPopup = false;
    }
    
    openWithAnimation() {
        // Reset any existing animation
        this.chatbot.style.animation = 'none';
        this.chatbot.offsetHeight; // Trigger reflow
        
        // Apply the thinking bubble animation
        this.chatbot.style.animation = 'thinkingBubble 1s ease-out forwards';
        this.chatbot.classList.add('active');
        
        // Add loading message
        this.addMessage('Laurent Agent', '<div class="loading-bubble"><span></span><span></span><span></span></div>');
        
        // Add welcome message after animation completes
        setTimeout(() => {
            // Clear the loading message
            this.messages.innerHTML = '';
            
            // Add the new welcome message
            this.addMessage('Laurent Agent', 'Hi there! I\'m Laurent Agent. Please type your preferred contact information (phone number and email address) to schedule an immediate appointment and get started. I\'m here to help you feel at home.');
            
            // Start inactivity timer
            this.startInactivityTimer();
        }, 3000);
    }
    
    startInactivityTimer() {
        // Clear any existing timers
        if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
        if (this.repromptTimer) clearInterval(this.repromptTimer);
        
        // Set 20 second inactivity timer
        this.inactivityTimer = setTimeout(() => {
            this.closeChatbot();
            this.startRepromptCycle();
        }, 20000);
    }
    
    closeChatbot() {
        this.chatbot.classList.remove('active');
        this.isReprompting = true;
    }
    
    startRepromptCycle() {
        // Clear any existing reprompt timer
        if (this.repromptTimer) clearInterval(this.repromptTimer);
        
        // Start 5 second reprompt cycle
        this.repromptTimer = setInterval(() => {
            this.showReprompt();
        }, 5000);
        
        // Show first reprompt immediately
        this.showReprompt();
    }
    
    showReprompt() {
        this.chatIcon.classList.add('pulse');
        this.showTooltip();
        
        setTimeout(() => {
            this.chatIcon.classList.remove('pulse');
            if (!this.chatIcon.matches(':hover')) {
                this.hideTooltip();
            }
        }, 3000);
    }

    setupEventListeners() {
        // Chat icon click event
        this.chatIcon.addEventListener('click', () => {
            if (this.isReprompting) {
                this.isReprompting = false;
                if (this.repromptTimer) clearInterval(this.repromptTimer);
            }
            this.toggleChatbot();
            if (this.chatbot.classList.contains('active') && this.messages.children.length === 0) {
                this.openWithAnimation();
            }
        });

        // Chat icon hover events
        this.chatIcon.addEventListener('mouseenter', () => {
            this.showTooltip();
        });

        this.chatIcon.addEventListener('mouseleave', () => {
            if (!this.isReprompting) {
                this.hideTooltip();
            }
        });
        
        // Close button click event
        this.toggleButton.addEventListener('click', () => {
            this.toggleChatbot();
            if (!this.chatbot.classList.contains('active')) {
                this.startRepromptCycle();
                this.showTooltip();
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
        
        // Close chatbot when switching pages
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.closeChatbot();
                this.startRepromptCycle();
            }
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
                    this.addMessage('Laurent Agent', 'You can reach us at (555) 123-4567 or email us at service@laurentagency.com. Would you like to schedule an appointment?');
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

    showTooltip() {
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'reprompt-tooltip';
            this.tooltip.textContent = 'Connect with Laurent Agent';
            this.chatIcon.appendChild(this.tooltip);
        }
        this.tooltip.style.display = 'block';
        
        // Force reflow to ensure animation plays
        this.tooltip.offsetHeight;
        this.tooltip.style.animation = 'none';
        this.tooltip.offsetHeight; // Trigger reflow
        this.tooltip.style.animation = 'fadeInOut 3s ease-in-out forwards';
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundSlider();
    new LaurentAgent();
});

// Checkout Page Functions
function getServiceDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('service');
    const serviceName = urlParams.get('name');
    const servicePrice = urlParams.get('price');
    
    if (serviceId && serviceName && servicePrice) {
        const serviceDetails = document.querySelector('.service-details');
        serviceDetails.innerHTML = `
            <div class="service-item">
                <h3>${serviceName}</h3>
                <p class="price">$${servicePrice}</p>
            </div>
        `;
        
        // Update price summary
        const subtotal = parseFloat(servicePrice);
        const discount = subtotal * 0.1; // 10% discount
        const total = subtotal - discount;
        
        document.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.discount').textContent = `-$${discount.toFixed(2)}`;
        document.querySelector('.total').textContent = `$${total.toFixed(2)}`;
    }
}

function handlePayment(event) {
    event.preventDefault();
    
    // Get form values
    const cardName = document.getElementById('cardName').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const email = document.getElementById('email').value;
    const terms = document.getElementById('terms').checked;
    
    // Basic validation
    if (!cardName || !cardNumber || !expiryDate || !cvv || !email || !terms) {
        alert('Please fill in all fields and accept the terms of service.');
        return;
    }
    
    // Validate card number (basic Luhn algorithm)
    if (!validateCardNumber(cardNumber)) {
        alert('Please enter a valid card number.');
        return;
    }
    
    // Validate expiry date
    if (!validateExpiryDate(expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY).');
        return;
    }
    
    // Validate CVV
    if (!validateCVV(cvv)) {
        alert('Please enter a valid CVV (3 or 4 digits).');
        return;
    }
    
    // Validate email
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Simulate payment processing
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    
    setTimeout(() => {
        // In a real implementation, this would be an API call to a payment processor
        alert('Payment processed successfully! You will receive a confirmation email shortly.');
        window.location.href = 'dashboard.html';
    }, 2000);
}

function validateCardNumber(number) {
    // Basic Luhn algorithm implementation
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost side
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return (sum % 10) === 0;
}

function validateExpiryDate(date) {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(date)) return false;
    
    const [month, year] = date.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(year) < currentYear) return false;
    if (parseInt(year) === currentYear && parseInt(month) < currentMonth) return false;
    
    return true;
}

function validateCVV(cvv) {
    return /^[0-9]{3,4}$/.test(cvv);
}

// Initialize checkout page
if (document.querySelector('.checkout-section')) {
    getServiceDetails();
    document.querySelector('form').addEventListener('submit', handlePayment);
} 