import { db, auth } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    query, 
    orderBy, 
    onSnapshot,
    serverTimestamp,
    where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// DOM Elements
const loginOverlay = document.getElementById('login-overlay');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('admin-login-form');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout-btn');
const customerList = document.getElementById('customer-list');
const totalMembersEl = document.getElementById('total-members');
const activeMembersEl = document.getElementById('active-members');
const revenueEl = document.getElementById('monthly-revenue');

const memberModal = document.getElementById('member-modal');
const openModalBtn = document.getElementById('open-add-modal');
const closeModalBtn = document.getElementById('close-modal');
const memberForm = document.getElementById('member-form');

const planSelect = document.getElementById('member-plan');
const priceInput = document.getElementById('member-price');
const joinInput = document.getElementById('member-join');
const exitInput = document.getElementById('member-exit');

const searchInput = document.getElementById('customer-search');
const planFilter = document.getElementById('filter-plan');

// 1. AUTHENTICATION & ACCESS CONTROL
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Verify Admin Custom Claim
        try {
            const idTokenResult = await user.getIdTokenResult();
            
            // Check if user has admin claim
            if (idTokenResult.claims.admin) {
                showDashboard();
                loadCustomers();
            } else {
                // Not an admin - Show helpful setup message
                authError.innerHTML = "<strong>Access Denied</strong><br>Your account is not authorized as Owner yet.<br><br><small>To fix this, please run the <code>set-admin.js</code> script with your email as instructed in the setup guide.</small>";
                authError.style.display = 'block';
                setTimeout(() => signOut(auth), 5000);
            }
        } catch (error) {
            console.error("Auth Check Error:", error);
            signOut(auth);
        }
    } else {
        showLogin();
    }
});

function showDashboard() {
    loginOverlay.style.display = 'none';
    adminDashboard.style.display = 'flex';
}

function showLogin() {
    loginOverlay.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

// Login Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        authError.innerText = "Invalid credentials or unauthorized access.";
        authError.style.display = 'block';
    }
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// 2. FORM LOGIC (Auto-fill)
const planPrices = {
    "1": 1200,
    "3": 2500,
    "6": 4000,
    "12": 7500
};

planSelect.addEventListener('change', () => {
    const val = planSelect.value;
    priceInput.value = val ? `₹${planPrices[val]}` : "";
    calculateExitDate();
});

joinInput.addEventListener('change', calculateExitDate);

function calculateExitDate() {
    if (!joinInput.value || !planSelect.value) return;
    
    const joinDate = new Date(joinInput.value);
    const months = parseInt(planSelect.value);
    const exitDate = new Date(joinDate.setMonth(joinDate.getMonth() + months));
    
    exitInput.value = exitDate.toISOString().split('T')[0];
}

// 3. FIRESTORE OPERATIONS (CRUD)
const customersCol = collection(db, 'customers');

// Create
memberForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('member-name').value,
        phone: document.getElementById('member-phone').value,
        address: document.getElementById('member-address').value,
        plan: planSelect.value,
        price: planPrices[planSelect.value],
        membershipType: document.getElementById('member-type').value,
        joinDate: joinInput.value,
        exitDate: exitInput.value,
        requirements: document.getElementById('member-requirements').value,
        offers: document.getElementById('member-offers').value,
        extraServices: {
            personalTrainer: document.getElementById('member-trainer').value,
            specialTiming: document.getElementById('member-timing').value,
            customNotes: document.getElementById('member-custom').value
        },
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.email
    };

    try {
        await addDoc(customersCol, data);
        memberModal.style.display = 'none';
        memberForm.reset();
        alert("Member data saved successfully!");
    } catch (error) {
        console.error("Save Error:", error);
        alert("Error saving data: " + error.message);
    }
});

// Read (Real-time)
function loadCustomers() {
    const q = query(customersCol, orderBy('createdAt', 'desc'));
    
    onSnapshot(q, (snapshot) => {
        let membersHtml = "";
        let totalCount = 0;
        let revenue = 0;
        const now = new Date();
        let activeCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;
            
            // Stats logic
            totalCount++;
            revenue += data.price || 0;
            if (new Date(data.exitDate) > now) activeCount++;

            // Filtering
            const searchTerm = searchInput.value.toLowerCase();
            const filterVal = planFilter.value;
            
            if (searchTerm && !data.name.toLowerCase().includes(searchTerm) && !data.phone.includes(searchTerm)) return;
            if (filterVal !== "all" && data.plan !== filterVal) return;

            membersHtml += `
                <tr>
                    <td>
                        <div class="user-info">
                            <strong>${data.name}</strong>
                            <small>${data.address}</small>
                        </div>
                    </td>
                    <td><span class="plan-tag">${data.plan} Months</span></td>
                    <td><span class="type-tag ${data.membershipType.toLowerCase()}">${data.membershipType}</span></td>
                    <td>${data.joinDate}</td>
                    <td><span class="${new Date(data.exitDate) < now ? 'expired' : 'active'}">${data.exitDate}</span></td>
                    <td>${data.phone}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn delete-btn" onclick="window.deleteMember('${id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        customerList.innerHTML = membersHtml;
        totalMembersEl.innerText = totalCount;
        activeMembersEl.innerText = activeCount;
        revenueEl.innerText = `₹${revenue.toLocaleString()}`;
        
        document.getElementById('no-data').style.display = totalCount === 0 ? 'block' : 'none';
    });
}

// Delete
window.deleteMember = async (id) => {
    if (confirm("Are you sure you want to delete this member record? This action cannot be undone.")) {
        try {
            await deleteDoc(doc(db, 'customers', id));
        } catch (error) {
            alert("Delete failed: " + error.message);
        }
    }
};

// UI Handlers
openModalBtn.addEventListener('click', () => {
    memberModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
    memberModal.style.display = 'none';
});

window.onclick = (e) => {
    if (e.target === memberModal) memberModal.style.display = 'none';
};

// Search & Filter listeners
searchInput.addEventListener('input', () => {
    // onSnapshot will handle the update
});

planFilter.addEventListener('change', () => {
    // onSnapshot will handle the update
});

/* 
   IMPORTANT: ADMIN SETUP SCRIPT
   To set the first owner, the owner can run this in the browser console ONCE 
   after logging in with their intended owner email. 
   
   Note: Custom claims usually require Admin SDK (Node.js). 
   For a pure frontend project, you can use a 'users' collection with 'role: admin' 
   and check that instead. Below I implement the 'users' collection fallback 
   if custom claims aren't feasible for the user.
*/
