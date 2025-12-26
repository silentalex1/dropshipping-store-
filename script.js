const URL = "https://ttzjwmckjaidkaxemsph.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0emp3bWNramFpZGtheGVtc3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTMxMTQsImV4cCI6MjA4MjI4OTExNH0.tfmVC1JIRqQuutuzqwXxr45xe0yLuq90CxhGIPWpLdU";
const db = supabase.createClient(URL, KEY);

const products = [{ id: 1, name: "Airpods Pro", price: 15, icon: "🎧" }];

const grid = document.getElementById('product-list');
const searchBox = document.getElementById('search-input');
const pBox = document.getElementById('price-box');
const pSlider = document.getElementById('price-slider');
const mReg = document.getElementById('modal-reg');
const mPay = document.getElementById('modal-pay');
const authNav = document.getElementById('auth-ui');
const payContent = document.getElementById('pay-content');

let currentUser = null;

function updateGrid() {
    const term = searchBox.value.toLowerCase();
    const max = parseInt(pBox.value) || 0;

    grid.innerHTML = products
        .filter(p => p.name.toLowerCase().includes(term) && p.price <= max)
        .map(p => `
            <div class="product-item bg-white p-8 rounded-[45px] border border-gray-100 shadow-sm flex flex-col items-center">
                <div class="w-full aspect-square bg-blue-50 rounded-[35px] flex items-center justify-center text-7xl mb-8">
                    ${p.icon}
                </div>
                <h3 class="text-xl font-black mb-1">${p.name}</h3>
                <p class="text-2xl font-black text-blue-600 mb-8">$${p.price}</p>
                <button onclick="openPay()" class="w-full bg-black text-white py-5 rounded-3xl font-black hover:bg-green-500 transition-all">Buy Now</button>
            </div>
        `).join('');
}

pSlider.oninput = () => { pBox.value = pSlider.value; updateGrid(); };
pBox.oninput = () => { pSlider.value = pBox.value; updateGrid(); };
searchBox.oninput = () => updateGrid();

window.onkeydown = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        searchBox.focus();
    }
};

function openRegister() { mReg.classList.add('flex-center'); }
function closeRegister() { mReg.classList.remove('flex-center'); }
function openPay() { 
    if(!currentUser) return alert("Please create an account first.");
    mPay.classList.add('flex-center'); 
}
function closePay() { mPay.classList.remove('flex-center'); }

async function doRegister() {
    const user = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    const btn = document.getElementById('reg-btn');

    if (user.length < 3) return alert("Username too short.");
    if (pass.length < 6) return alert("Password too short.");

    btn.innerText = "Creating...";
    btn.disabled = true;

    const { data: check } = await db.from('profiles').select('username').eq('username', user).single();
    if (check) {
        btn.innerText = "Create account.";
        btn.disabled = false;
        return alert("Name taken.");
    }

    const { data, error } = await db.auth.signUp({
        email: `${user}@internal.store`,
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

function genCode() {
    return Math.random().toString(36).substring(2, 11).toUpperCase();
}

async function processOrder() {
    const btn = document.getElementById('pay-btn');
    const code = genCode();
    
    btn.innerText = "Verifying Card...";
    btn.disabled = true;

    const { data: { session } } = await db.auth.getSession();
    
    if (session) {
        await db.from('orders').insert([{
            user_id: session.user.id,
            order_code: code,
            item_name: "Airpods Pro"
        }]);
    }

    payContent.innerHTML = `
        <div class="text-center py-10">
            <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
            <h2 class="text-2xl font-black mb-2">Order Confirmed</h2>
            <p class="text-gray-500 font-medium mb-8">Thank you for ordering, your product number is:</p>
            <div class="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
                <span class="text-3xl font-black tracking-widest text-blue-600">${code}</span>
            </div>
            <button onclick="location.reload()" class="mt-10 w-full bg-black text-white h-16 rounded-3xl font-bold">Return to Store</button>
        </div>
    `;
}

async function checkUser() {
    const { data: { session } } = await db.auth.getSession();
    if (session) {
        const { data } = await db.from('profiles').select('username').eq('id', session.user.id).single();
        if (data) {
            currentUser = data.username;
            authNav.innerHTML = `
                <div class="flex items-center gap-4 bg-gray-50 pl-6 pr-2 py-2 rounded-2xl border border-gray-100">
                    <p class="text-sm font-bold">Welcome <span class="text-blue-600 font-black">${data.username}</span></p>
                    <div class="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black">${data.username[0].toUpperCase()}</div>
                </div>
            `;
        }
    }
}

checkUser();
updateGrid();
