const SB_URL = 'YOUR_SUPABASE_URL';
const SB_KEY = 'YOUR_SUPABASE_ANON_KEY';
const sb = supabase.createClient(SB_URL, SB_KEY);

const items = [
    { id: 1, name: "Luxury Watch", price: 115, img: "⌚" },
    { id: 2, name: "Cotton Tee", price: 25, img: "👕" },
    { id: 3, name: "Air Pods", price: 95, img: "🎧" },
    { id: 4, name: "Sun Glasses", price: 45, img: "🕶️" },
    { id: 5, name: "Work Bag", price: 85, img: "💼" },
    { id: 6, name: "Smart Lamp", price: 55, img: "💡" },
    { id: 7, name: "Gold Ring", price: 105, img: "💍" },
    { id: 8, name: "Water Flask", price: 15, img: "🧴" }
];

const grid = document.getElementById('grid');
const sBar = document.getElementById('searchBar');
const pRange = document.getElementById('priceRange');
const pText = document.getElementById('priceText');
const authBox = document.getElementById('authBox');

function draw() {
    const term = sBar.value.toLowerCase();
    const limit = parseInt(pText.value);

    grid.innerHTML = items
        .filter(i => i.name.toLowerCase().includes(term) && i.price <= limit)
        .map(i => `
            <div class="card bg-white p-6 rounded-[40px] border-2 border-gray-50 shadow-sm hover:shadow-2xl hover:border-green-100">
                <div class="w-full aspect-square bg-[#fcfcfc] rounded-[30px] flex items-center justify-center text-6xl mb-6">
                    ${i.img}
                </div>
                <h3 class="font-black text-xl mb-1">${i.name}</h3>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-black text-green-500">$${i.price}</span>
                    <button class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all group">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                </div>
            </div>
        `).join('');
}

pRange.oninput = () => { pText.value = pRange.value; draw(); };
pText.oninput = () => { pRange.value = pText.value; draw(); };
sBar.oninput = () => draw();

window.onkeydown = (e) => {
    if (e.key.toLowerCase() === 'k' && document.activeElement !== sBar) {
        e.preventDefault();
        sBar.focus();
        window.scrollTo({ top: sBar.offsetTop - 100, behavior: 'smooth' });
    }
};

function showAuth() { authBox.classList.remove('hidden'); authBox.classList.add('active'); }
function hideAuth() { authBox.classList.add('hidden'); authBox.classList.remove('active'); }

async function handleAuth() {
    const user = document.getElementById('userIn').value;
    const pass = document.getElementById('passIn').value;
    const btn = document.getElementById('authBtn');

    if (user.length < 3 || pass.length < 6) return alert("Too short.");

    btn.innerText = "Checking...";
    
    const { data: exists } = await sb.from('profiles').select('username').eq('username', user).single();
    
    if (exists) {
        btn.innerText = "Create account.";
        return alert("Name taken.");
    }

    const { data, error } = await sb.auth.signUp({
        email: `${user}@store.com`,
        password: pass
    });

    if (error) {
        alert(error.message);
        btn.innerText = "Create account.";
    } else {
        await sb.from('profiles').insert([{ id: data.user.id, username: user }]);
        location.reload();
    }
}

async function checkUser() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        const { data } = await sb.from('profiles').select('username').eq('id', session.user.id).single();
        if (data) {
            document.getElementById('navAuth').innerHTML = `
                <div class="flex items-center gap-4">
                    <p class="font-bold">Welcome <span class="text-green-500">${data.username}</span></p>
                    <div class="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black">${data.username[0].toUpperCase()}</div>
                </div>
            `;
        }
    }
}

checkUser();
draw();
