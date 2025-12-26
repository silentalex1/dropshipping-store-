const SB_URL = 'YOUR_SUPABASE_URL';
const SB_KEY = 'YOUR_SUPABASE_ANON_KEY';
const sb = supabase.createClient(SB_URL, SB_KEY);

const items = [
    { id: 1, name: "Luxury Watch", price: 115, icon: "⌚" },
    { id: 2, name: "Premium Tee", price: 25, icon: "👕" },
    { id: 3, name: "Sound Pods", price: 95, icon: "🎧" },
    { id: 4, name: "Dark Shades", price: 45, icon: "🕶️" },
    { id: 5, name: "Urban Pack", price: 85, icon: "💼" },
    { id: 6, name: "Soft Glow", price: 55, icon: "💡" },
    { id: 7, name: "Gold Band", price: 105, icon: "💍" },
    { id: 8, name: "Daily Bottle", price: 15, icon: "🧴" }
];

const grid = document.getElementById('grid');
const sBar = document.getElementById('searchBar');
const pRange = document.getElementById('priceRange');
const pText = document.getElementById('priceText');
const authBox = document.getElementById('authBox');
const authBtn = document.getElementById('authBtn');
const navAuth = document.getElementById('navAuth');

function render() {
    const term = sBar.value.toLowerCase();
    const limit = parseInt(pText.value) || 0;

    grid.innerHTML = items
        .filter(i => i.name.toLowerCase().includes(term) && i.price <= limit)
        .map(i => `
            <div class="product-card bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm hover:shadow-2xl hover:border-blue-100">
                <div class="w-full aspect-square bg-[#f8fafc] rounded-[32px] flex items-center justify-center text-6xl mb-6">
                    ${i.icon}
                </div>
                <h3 class="font-extrabold text-xl mb-1">${i.name}</h3>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-black text-blue-600">$${i.price}</span>
                    <button class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                </div>
            </div>
        `).join('');
}

pRange.oninput = () => { pText.value = pRange.value; render(); };
pText.oninput = () => { pRange.value = pText.value; render(); };
sBar.oninput = () => render();

window.onkeydown = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        sBar.focus();
        sBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

function showAuth() { 
    authBox.classList.remove('hidden'); 
    document.body.style.overflow = 'hidden';
}

function hideAuth() { 
    authBox.classList.add('hidden'); 
    document.body.style.overflow = 'auto';
}

async function handleAuth() {
    const user = document.getElementById('userIn').value.trim();
    const pass = document.getElementById('passIn').value.trim();

    if (user.length < 3) return alert("Username too short.");
    if (pass.length < 6) return alert("Password too short.");

    authBtn.innerText = "Working...";
    authBtn.disabled = true;

    const { data: check } = await sb.from('profiles').select('username').eq('username', user).single();
    
    if (check) {
        authBtn.innerText = "Create account.";
        authBtn.disabled = false;
        return alert("Name is taken.");
    }

    const { data, error } = await sb.auth.signUp({
        email: `${user}@store.com`,
        password: pass
    });

    if (error) {
        alert(error.message);
        authBtn.innerText = "Create account.";
        authBtn.disabled = false;
    } else {
        await sb.from('profiles').insert([{ id: data.user.id, username: user }]);
        location.reload();
    }
}

async function checkSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        const { data } = await sb.from('profiles').select('username').eq('id', session.user.id).single();
        if (data) {
            navAuth.innerHTML = `
                <div class="flex items-center gap-4">
                    <p class="font-bold text-sm">Welcome <span class="text-blue-600">${data.username}</span></p>
                    <div class="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black text-xs cursor-default">
                        ${data.username[0].toUpperCase()}
                    </div>
                </div>
            `;
        }
    }
}

checkSession();
render();
