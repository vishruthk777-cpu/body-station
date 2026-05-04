import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Mobile Navigation Toggle
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

// Login / User State Handling
const loginBtn = document.getElementById('login-btn');
const userProfile = document.getElementById('user-profile');
const provider = new GoogleAuthProvider();

// Check if running via file:// protocol
if (window.location.protocol === 'file:') {
    alert("IMPORTANT: Firebase Authentication will NOT work if you open the HTML file directly. Please use a local server (like Live Server or 'npm run dev').");
}

loginBtn.addEventListener('click', async () => {
    if (auth.currentUser) {
        await signOut(auth);
    } else {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login Error:", error);
            if (error.code === 'auth/unauthorized-domain') {
                alert("🚨 FIREBASE SETUP REQUIRED:\n\nYour current domain (" + window.location.hostname + ") is not authorized for login.\n\n1. Go to Firebase Console > Authentication > Settings\n2. Click 'Authorized domains'\n3. Add '" + window.location.hostname + "' to the list.\n4. Refresh and try again!");
            } else if (error.code === 'auth/operation-not-allowed') {
                alert("🚨 GOOGLE AUTH NOT ENABLED:\n\nPlease enable the Google Sign-In provider in your Firebase Console (Authentication > Sign-in method).");
            } else {
                alert("Failed to login with Google: " + error.message);
            }
        }
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        userProfile.style.display = 'block';
        userProfile.innerText = `Hi, ${user.displayName.split(' ')[0]}`;
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        userProfile.style.display = 'none';
    }
});

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

// Sticky Navbar Background with scrolled class
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
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

// Contact Form handling — Separate WhatsApp & Email buttons
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    const msg = document.getElementById('form-message');
    const whatsappBtn = document.getElementById('send-whatsapp-btn');
    const emailBtn = document.getElementById('send-email-btn');

    // Validate inputs before sending
    function getFormData() {
        const name = document.getElementById('name').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        if (!name || !mobile) {
            msg.style.display = 'block';
            msg.style.color = '#ef4444';
            msg.innerText = "Please enter both your name and mobile number.";
            setTimeout(() => { msg.style.display = 'none'; }, 4000);
            return null;
        }
        return { name, mobile };
    }

    // Save lead to Firestore (shared by both buttons)
    async function saveLeadToFirestore(name, mobile, channel) {
        try {
            await addDoc(collection(db, "leads"), {
                name: name,
                mobile: mobile,
                source: 'landing_page',
                channel: channel,
                status: 'new',
                timestamp: serverTimestamp()
            });
        } catch (err) {
            console.warn("Firestore save failed (non-blocking):", err);
        }
    }

    // --- WhatsApp Button ---
    whatsappBtn.addEventListener('click', async () => {
        const data = getFormData();
        if (!data) return;

        const originalText = whatsappBtn.innerHTML;
        whatsappBtn.disabled = true;
        whatsappBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        await saveLeadToFirestore(data.name, data.mobile, 'whatsapp');

        const whatsappNumber = '919642767824';
        const whatsappMessage = `🏋️ *New Callback Request*%0A%0A👤 *Name:* ${encodeURIComponent(data.name)}%0A📱 *Mobile:* ${encodeURIComponent(data.mobile)}%0A📍 *Source:* Body Station Website%0A⏰ *Time:* ${encodeURIComponent(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))}`;
        window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${whatsappMessage}`, '_blank');

        msg.style.display = 'block';
        msg.style.color = '#34d399';
        msg.innerText = "✅ Sent via WhatsApp! We'll call you shortly.";
        contactForm.reset();
        whatsappBtn.disabled = false;
        whatsappBtn.innerHTML = originalText;
        setTimeout(() => { msg.style.display = 'none'; }, 5000);
    });

    // --- Email Button ---
    emailBtn.addEventListener('click', async () => {
        const data = getFormData();
        if (!data) return;

        const originalText = emailBtn.innerHTML;
        emailBtn.disabled = true;
        emailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        await saveLeadToFirestore(data.name, data.mobile, 'email');

        const ownerEmail = 'aqibhussain9833@gmail.com';
        const emailSubject = encodeURIComponent(`New Callback Request - ${data.name}`);
        const emailBody = encodeURIComponent(`New Callback Request from Body Station Website\n\nName: ${data.name}\nMobile: ${data.mobile}\nSource: Landing Page\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\nPlease contact the customer as soon as possible.`);
        window.open(`mailto:${ownerEmail}?subject=${emailSubject}&body=${emailBody}`, '_blank');

        msg.style.display = 'block';
        msg.style.color = '#34d399';
        msg.innerText = "✅ Email client opened! We'll call you shortly.";
        contactForm.reset();
        emailBtn.disabled = false;
        emailBtn.innerHTML = originalText;
        setTimeout(() => { msg.style.display = 'none'; }, 5000);
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
        response: "We have flexible plans to fit your journey! 💪<br>- <b>Basic:</b> ₹1200 / month<br>- <b>Standard:</b> ₹2500 / 3 months (Best Value!)<br>- <b>Pro:</b> ₹4000 / 6 months (Includes Trainer guidance)<br>- <b>Elite:</b> ₹7500 / 12 months (Full support & priority)<br>Which one fits your goal? Join now and start your transformation!"
    },
    {
        pattern: /(diet|food|eat|nutrition|meal|protein|carbs|fat)/i,
        response: "Nutrition is 70% of the game! 🥗 Our trainers provide expert diet advice tailored to your goals. Generally, we recommend high protein and consistent hydration. For a custom breakdown, our <b>Elite Plan</b> is perfect. Ready to eat clean and train mean?"
    },
    {
        pattern: /(time|timing|open|close|hour|morning|evening|sunday|schedule)/i,
        response: "We're here for your convenience! ⏰<br><b>Mon–Sat:</b> 5:00 AM – 10:00 AM & 5:00 PM – 10:00 PM<br><b>Sunday:</b> 6:00 AM – 10:00 AM (Evening: Closed for recovery).<br>When are you planning to visit?"
    },
    {
        pattern: /(weight loss|fat loss|lose weight|thin|slim|cardio|stamina)/i,
        response: "You can do it! For weight loss, I recommend our <b>3 or 6-month plans</b>. Our trainers will guide you through high-burn cardio and strength training to melt that fat away. Let's start your transformation! 🔥"
    },
    {
        pattern: /(muscle|gain|bulk|chest|biceps|weight|body building|size|grow)/i,
        response: "Time to get strong! 🏋️‍♂️ For muscle gain, our <b>6 or 12-month plans</b> are ideal for long-term growth. Our facility is fully equipped for heavy lifting and isolation. Let's build those gains!"
    },
    {
        pattern: /(trainer|coach|personal training|pt|guide|help|teach|support|motivation)/i,
        response: "We have 1–3 expert trainers ready to motivate you! They specialize in strength, weight loss, and diet guidance. You'll get the personal support needed to smash your limits. Want to train with the best?"
    },
    {
        pattern: /(owner|admin|database|firebase|system|private|security|password|email|staff|logic|internal)/i,
        response: "I'm here to help with gym services, plans, and fitness guidance. For that request, please contact the gym directly. 🤝"
    },
    {
        pattern: /(where|location|address|shadnagar|map|place|direction)/i,
        response: "We're conveniently located on the Main Road in Shadnagar! 📍 <a href='https://maps.app.goo.gl/AWBh5AUiCMBtF5bS7' target='_blank' rel='noopener noreferrer' style='color: var(--accent-color); font-weight: bold;'>View on Google Maps</a>. Hope to see you there soon!"
    },
    {
        pattern: /(hi|hello|hey|good morning|good evening|how are you|greet)/i,
        response: "Hi there! 👋 Welcome to Body Station. I'm your AI assistant, ready to help you hit your fitness goals. Ask me about our plans, timings, or for some quick tips!"
    },
    {
        pattern: /(instagram|social|ig|follow|photo|video)/i,
        response: "Join our community on Instagram for daily motivation and success stories! 📸 <a href='https://www.instagram.com/bodystationthefitnessclub?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' target='_blank' rel='noopener noreferrer' style='color: var(--accent-color); font-weight: bold;'>@bodystationthefitnessclub</a>"
    },
    {
        pattern: /(thank|thanks|appreciate|ok|great|awesome|cool)/i,
        response: "You're very welcome! Let's get to work. Feel free to visit us or join today! 🚀"
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
    let replyText = "I'm not fully sure about that, but I can certainly help with our **membership plans, gym timings, trainer info, or fitness tips**! Could you rephrase your question, or visit the gym for more details? 🏋️‍♂️";
    
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
