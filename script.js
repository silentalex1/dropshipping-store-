const SB_URL = "https://ttzjwmckjaidkaxemsph.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0emp3bWNramFpZGtheGVtc3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTMxMTQsImV4cCI6MjA4MjI4OTExNH0.tfmVC1JIRqQuutuzqwXxr45xe0yLuq90CxhGIPWpLdU";
const db = supabase.createClient(SB_URL, SB_KEY);

const items = [
    { id: 1, name: "Airpods", price: 15, emoji: "🎧" }
];

const grid = document.getElementById('item-grid');
const sBar = document.getElementById('main-search');
const pBox = document.getElementById('price-box');
const pSlider = document.getElementById('price-slider');
const authM = document.getElementById('auth-modal');
const payM = document.getElementById('pay-modal');
const authZ = document.getElementById('auth-zone');

function render() {
    const term = sBar.value.toLowerCase();
    const max = parseInt(pBox.value);

    grid.innerHTML = items
        .filter(i => i.name.toLowerCase().includes(term) && i.price <= max)
        .map(i => `
            <div class="item-card bg-white p-8 rounded-[50px] border border-gray-100 shadow-sm flex flex-col items-center text-center group">
                <div class="w-full aspect-square bg-blue-50 rounded-[40px] flex items-center justify-center text-7xl mb-8 group-hover:scale-105 transition-transform duration-500">
                    ${i.emoji}
                </div>
                <h3 class="text-xl font-black mb-1">${i.name}</h3>
                <p class="text-3xl font-black text-blue-600 mb-6">$${i.price}</p>
                <button onclick="openPay()" class="w-full bg-black text-white py-5 rounded-3xl font-black hover:bg-green-500 transition-all">Buy Now</button>
            </div>
        `).join('');
}

pSlider.oninput = () => { pBox.value = pSlider.value; render(); };
pBox.oninput = () => { pSlider.value = pBox.value; render(); };
sBar.oninput = () => render();

window.onkeydown = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        sBar.focus();
        sBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

function openAuth() { authM.classList.add('modal-open'); document.body.style.overflow = 'hidden'; }
function closeAuth() { authM.classList.remove('modal-open'); document.body.style.overflow = 'auto'; }
function openPay() { payM.classList.add('modal-open'); }
function closePay() { payM.classList.remove('modal-open'); }

async function handleRegister() {
    const user = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    const btn = document.getElementById('reg-btn');

    if (user.length < 3 || pass.length < 6) return alert("Details too short.");

    btn.innerText = "Processing...";
    btn.disabled = true;

    const { data: exists } = await db.from('profiles').select('username').eq('username', user).single();
    if (exists) {
        btn.innerText = "Create account.";
        btn.disabled = false;
        return alert("Username unavailable.");
    }

    const { data, error } = await db.auth.signUp({
        email: `${user}@realalex.resell`,
        password: pass
    });

    if (error) {
        alert(error.message);
        btn.innerText = "Create account.";
        btn.disabled = false;
    } else {
        await db.from('profiles').insert([{ id: data.user.id, username: user }]);
        location.reload();
    }
}

async function checkSession() {
    const { data: { session } } = await db.auth.getSession();
    if (session) {
        const { data } = await db.from('profiles').select('username').eq('id', session.user.id).single();
        if (data) {
            authZ.innerHTML = `
                <div class="flex items-center gap-4 bg-gray-50 px-5 py-2 rounded-2xl border border-gray-100">
                    <p class="text-sm font-bold italic text-gray-500">Welcome <span class="text-black font-black not-italic">${data.username}</span></p>
                    <div class="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black text-xs">${data.username[0].toUpperCase()}</div>
                </div>
            `;
        }
    }
}

checkSession();
render();
