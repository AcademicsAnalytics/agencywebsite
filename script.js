// Chatbot responses
const botResponses = {
    greeting: ["Hello! Welcome to Laurent Agency. How can I assist you today?", "Hi there! I'm here to help with your insurance needs."],
    services: ["We offer various insurance services including:\n- Auto Insurance\n- Home Insurance\n- Life Insurance\nWhat type of insurance are you interested in?"],
    appointment: ["I'd be happy to help you schedule an appointment. Please provide your preferred date and time, and I'll check our availability."],
    contact: ["You can reach us at:\nPhone: (555) 123-4567\nEmail: contact@laurentagency.com\nOr I can help you schedule an appointment!"],
    default: ["I'm not sure I understand. Could you please rephrase that?", "Would you like to know about our services or schedule an appointment?"],
    hours: ["Our office hours are:\nMonday-Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 2:00 PM\nSunday: Closed"],
    location: ["We are located at:\n123 Insurance Plaza\nNew York, NY 10001"],
};

// Chatbot logic
class Chatbot {
    constructor() {
        this.messages = [];
    }

    processMessage(message) {
        message = message.toLowerCase();
        
        if (message.includes('hi') || message.includes('hello')) {
            return this.getRandomResponse('greeting');
        } else if (message.includes('service') || message.includes('insurance') || message.includes('coverage')) {
            return this.getRandomResponse('services');
        } else if (message.includes('appointment') || message.includes('schedule') || message.includes('meet')) {
            return this.getRandomResponse('appointment');
        } else if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
            return this.getRandomResponse('contact');
        } else if (message.includes('hour') || message.includes('open')) {
            return this.getRandomResponse('hours');
        } else if (message.includes('location') || message.includes('address') || message.includes('where')) {
            return this.getRandomResponse('location');
        }
        
        return this.getRandomResponse('default');
    }

    getRandomResponse(type) {
        const responses = botResponses[type];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Blob animation
    const blob = document.querySelector('.blob');
    let lastScrollY = window.scrollY;
    let lastMouseX = window.innerWidth / 2;
    let lastMouseY = window.innerHeight / 2;
    let targetX = lastMouseX;
    let targetY = lastMouseY;

    // Update blob position on scroll and mouse move
    function updateBlobPosition() {
        const scrollDiff = window.scrollY - lastScrollY;
        targetY += scrollDiff;
        lastScrollY = window.scrollY;

        lastMouseX += (targetX - lastMouseX) * 0.1;
        lastMouseY += (targetY - lastMouseY) * 0.1;

        blob.style.left = `${lastMouseX}px`;
        blob.style.top = `${lastMouseY}px`;

        requestAnimationFrame(updateBlobPosition);
    }

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY + window.scrollY;
    });

    // Initialize blob position
    updateBlobPosition();

    // Animate feature cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    document.querySelectorAll('.feature-card').forEach((card) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        observer.observe(card);
    });

    // Chatbot initialization
    const chatbot = new Chatbot();
    const chatbotContainer = document.getElementById('chatbot');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');
    const chatToggle = document.getElementById('chat-toggle');
    const closeChat = document.getElementById('close-chat');

    // Toggle chat window
    chatToggle.addEventListener('click', () => {
        chatbotContainer.classList.add('active');
        if (chatMessages.children.length === 0) {
            addMessage('bot', chatbot.getRandomResponse('greeting'));
        }
    });

    closeChat.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
    });

    // Send message function
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage('user', message);
            chatInput.value = '';
            
            // Simulate typing delay
            setTimeout(() => {
                const response = chatbot.processMessage(message);
                addMessage('bot', response);
            }, 500);
        }
    }

    // Add message to chat
    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(type + '-message');
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Event listeners for sending messages
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
