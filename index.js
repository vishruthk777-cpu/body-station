// Mobile Navigation Toggle
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Sticky Navbar Background
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(10, 10, 10, 0.95)';
        nav.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
    } else {
        nav.style.background = 'rgba(0, 0, 0, 0.8)';
        nav.style.boxShadow = 'none';
    }
});

// Scroll Animations
const scrollElements = document.querySelectorAll('.scroll-anim');

const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend);
};

const displayScrollElement = (element) => {
    element.classList.add('appear');
};

const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 1.15)) {
            displayScrollElement(el);
        }
    });
};

// Initial check
handleScrollAnimation();
window.addEventListener('scroll', () => {
    handleScrollAnimation();
});

// Number Counter Animation
const counters = document.querySelectorAll('.counter');
const speed = 200;

const runCounter = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                // Formatting for decimal numbers (e.g. 4.3)
                if (target % 1 !== 0) {
                    counter.innerText = (count + inc).toFixed(1);
                } else {
                    counter.innerText = Math.ceil(count + inc);
                }
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target;
            }
        };

        // Only run counter when in view
        if (elementInView(counter, 1)) {
            updateCount();
        }
    });
};

// Listen for scroll to run counter once
let counterRan = false;
window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.stats-section');
    if (statsSection && elementInView(statsSection, 1.2) && !counterRan) {
        runCounter();
        counterRan = true;
    }
});

// Contact Form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = document.getElementById('form-message');
        msg.style.display = 'block';
        contactForm.reset();
        setTimeout(() => {
            msg.style.display = 'none';
        }, 4000);
    });
}

// AI Chatbot Logic
const chatToggle = document.getElementById('chatbot-toggle');
const chatContainer = document.getElementById('chatbot-container');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat');
const chatMessages = document.getElementById('chatbot-messages');

// Toggle Chat
chatToggle.addEventListener('click', () => {
    chatContainer.classList.add('active');
});

closeChat.addEventListener('click', () => {
    chatContainer.classList.remove('active');
});

// Advanced Local NLP Engine (No API needed)
const intents = [
    {
        pattern: /(price|cost|fee|membership|plan|pay|charges|amount|package|subscribe)/i,
        response: "We have 3 plans designed for different goals:<br>- <b>Basic (₹999/mo):</b> Standard access to cardio & weights.<br>- <b>Standard (₹1499/mo):</b> Unlimited access, diet chart, and floor guidance.<br>- <b>Personal Training (₹2999/mo):</b> 1-on-1 sessions, custom nutrition, and weekly check-ins.<br>Which one sounds best for you?"
    },
    {
        pattern: /(diet|food|eat|nutrition|meal|protein|carbs|fat)/i,
        response: "Nutrition is 70% of fitness! If you're looking to bulk up, focus on a caloric surplus with high protein (chicken, paneer, eggs). For weight loss, maintain a calorie deficit. Our <b>Standard Plan (₹1499)</b> includes a basic diet chart, and our <b>PT Plan (₹2999)</b> gives you a fully customized weekly nutrition breakdown."
    },
    {
        pattern: /(time|timing|open|close|hour|morning|evening|sunday|schedule)/i,
        response: "We are open from <b>5:00 AM to 10:00 PM, Monday through Saturday</b>. The gym is closed on Sundays so our muscles (and trainers!) can recover."
    },
    {
        pattern: /(weight loss|fat loss|lose weight|thin|slim|cardio|stamina)/i,
        response: "Weight loss is absolutely achievable here! You'll want to combine intense cardio sessions (treadmills, ellipticals) with strength training to boost your metabolism, plus a strict diet. I highly recommend our Personal Training program for the fastest fat loss results."
    },
    {
        pattern: /(muscle|gain|bulk|chest|biceps|weight|body building|size|grow)/i,
        response: "To build serious muscle, you need progressive overload and proper protein intake. Body Station is fully equipped with heavy free weights, squat racks, and isolation machines to help you bulk up. Train hard and eat big!"
    },
    {
        pattern: /(trainer|coach|personal training|pt|guide|help|teach|support)/i,
        response: "Our certified personal trainers are here to push your limits safely. For ₹2999/mo, a dedicated coach will build your workout split, correct your form, monitor your diet, and ensure you hit your goals optimally."
    },
    {
        pattern: /(where|location|address|shadnagar|map|place|direction)/i,
        response: "We're located right on the Main Road in Shadnagar, Telangana 509216. You can scroll down to the bottom of this page to see us on Google Maps!"
    },
    {
        pattern: /(hi|hello|hey|good morning|good evening|how are you|greet)/i,
        response: "Hello there! 👋 I am the Body Station Virtual Assistant. What's on your mind today? I can help you with membership prices, gym timings, diet tips, or workout advice!"
    },
    {
        pattern: /(thank|thanks|appreciate|ok|great|awesome|cool)/i,
        response: "You're very welcome! Let me know if you have any other questions, or feel free to drop by the gym or call us at 9642767824 to get started."
    }
];

function triggerBotResponse(userText) {
    const text = userText.trim();
    if (!text) return;

    // Create AI bubble (typing indicator)
    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.classList.add('chat-msg', 'ai-msg');
    aiMsgDiv.innerHTML = `<p><i class="fas fa-circle-notch fa-spin"></i> Typing...</p>`;
    chatMessages.appendChild(aiMsgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Process Advanced Local NLP
    let replyText = "That's a great question! While my circuits are quite smart, my current logic is optimized specifically for Body Station. Could you rephrase your question to ask about our **plans, prices, diets, timings, or trainers**?";
    
    // Check intents via regex
    for (const intent of intents) {
        if (intent.pattern.test(text)) {
            replyText = intent.response;
            break;
        }
    }

    // Dynamic delay based on text length to simulate "AI reading & thinking"
    const delay = Math.max(800, Math.min(2500, replyText.length * 8));

    setTimeout(() => {
        aiMsgDiv.innerHTML = `<p>${replyText}</p>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, delay);
}

function handleUserMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    const div = document.createElement('div');
    div.classList.add('chat-msg', 'user-msg');
    div.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(div);

    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Trigger AI response
    triggerBotResponse(text);
}

sendChatBtn.addEventListener('click', handleUserMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserMessage();
    }
});
