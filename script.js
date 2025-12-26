const URL = "https://ttzjwmckjaidkaxemsph.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0emp3bWNramFpZGtheGVtc3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTMxMTQsImV4cCI6MjA4MjI4OTExNH0.tfmVC1JIRqQuutuzqwXxr45xe0yLuq90CxhGIPWpLdU";
const db = supabase.createClient(URL, KEY);

const products = [
    { id: 1, name: "Airpods Pro", price: 15, icon: "🎧" }
];

const grid = document.getElementById('product-list');
const searchBox = document.getElementById('search-input');
const pBox = document.getElementById('price-box');
const pSlider = document.getElementById('price-slider');
const mReg = document.getElementById('modal-reg');
const mPay = document.getElementById('modal-pay');
const authNav = document.getElementById('auth-ui');

function update() {
    const term = searchBox.value.toLowerCase();
    const max = parseInt(pBox.value);

    grid.innerHTML = products
        .filter(p => p.name.toLowerCase().includes(term) && p.price <= max)
        .map(p => `
            <div class="card-item bg-white p-8 rounded-[45px] border border-gray-100 shadow-sm flex flex-col items-center">
                <div class="w-full aspect-square bg-blue-50 rounded-[35px] flex items-center justify-center text-6xl mb-6">
                    ${p.icon}
                </div>
                <h3 class="text-xl font-black">${p.name}</h3>
                <p class="text-2xl font-black text-blue-600 mb-6">$${p.price}</p>
                <button onclick="openPay()" class="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-green-500 transition-all">Purchase</button>
            </div>
        `).join('');
}

pSlider.oninput = () => { pBox.value = pSlider.value; update(); };
pBox.oninput = () => { pSlider.value = pBox.value; update(); };
searchBox.oninput = () => update();

window.onkeydown = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        searchBox.focus();
    }
};

function openRegister() { mReg.classList.add('show-flex'); }
function closeRegister() { mReg.classList.remove('show-flex'); }
function openPay() { mPay.classList.add('show-flex'); }
function closePay() { mPay.classList.remove('show-flex'); }

async function doRegister() {
    const user = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    const btn = document.getElementById('reg-btn');

    if (user.length < 3 || pass.length < 6) return alert("Username (3+) and Password (6+) too short.");

    btn.innerText = "Processing...";
    btn.disabled = true;

    const { data: check } = await db.from('profiles').select('username').eq('username', user).single();
    if (check) {
        btn.innerText = "Create account.";
        btn.disabled = false;
        return alert("Username taken.");
    }

    const { data, error } = await db.auth.signUp({
        email: `${user}@realalex.store`,
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

async function checkUser() {
    const { data: { session } } = await db.auth.getSession();
    if (session) {
        const { data } = await db.from('profiles').select('username').eq('id', session.user.id).single();
        if (data) {
            authNav.innerHTML = `
                <div class="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                    <p class="text-sm font-bold text-gray-500">Welcome <span class="text-black font-black">${data.username}</span></p>
                    <div class="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-black text-[10px]">${data.username[0].toUpperCase()}</div>
                </div>
            `;
        }
    }
}

checkUser();
update();
