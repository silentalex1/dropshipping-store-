const URL = "https://ttzjwmckjaidkaxemsph.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0emp3bWNramFpZGtheGVtc3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTMxMTQsImV4cCI6MjA4MjI4OTExNH0.tfmVC1JIRqQuutuzqwXxr45xe0yLuq90CxhGIPWpLdU";
const db = supabase.createClient(URL, ANON);

const products = [
    { id: 1, name: "Airpods", price: 15, img: "🎧" }
];

function App() {
    const [user, setUser] = React.useState(null);
    const [search, setSearch] = React.useState("");
    const [price, setPrice] = React.useState(115);
    const [authModal, setAuthModal] = React.useState(false);
    const [payModal, setPayModal] = React.useState(false);
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const searchRef = React.useRef(null);

    React.useEffect(() => {
        checkUser();
        const keys = (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', keys);
        return () => window.removeEventListener('keydown', keys);
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await db.auth.getSession();
        if (session) {
            const { data } = await db.from('profiles').select('username').eq('id', session.user.id).single();
            if (data) setUser(data.username);
        }
    };

    const handleJoin = async () => {
        if (username.length < 3) return alert("Pick a longer name.");
        
        const { data: check } = await db.from('profiles').select('username').eq('username', username).single();
        if (check) return alert("This name is taken.");

        const { data, error } = await db.auth.signUp({
            email: `${username}@realalex.com`,
            password: password
        });

        if (error) {
            alert(error.message);
        } else {
            await db.from('profiles').insert([{ id: data.user.id, username: username }]);
            setUser(username);
            setAuthModal(false);
        }
    };

    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) && p.price <= price
    );

    return (
        <div className="min-h-screen">
            <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 z-40 h-20">
                <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="text-xl font-black italic tracking-tighter">
                        realalex <span className="text-blue-600">reselling</span> <span className="text-green-500">store</span>
                    </div>
                    {user ? (
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-bold">Welcome <span className="text-blue-600">{user}</span></p>
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-xs">{user[0].toUpperCase()}</div>
                        </div>
                    ) : (
                        <button onClick={() => setAuthModal(true)} className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-all">
                            Create account
                        </button>
                    )}
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
                <div className="flex flex-col gap-6 mb-12">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your price range</p>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex items-center gap-2 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 min-w-[140px]">
                                <span className="text-xl font-bold text-gray-300">$</span>
                                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-transparent text-xl font-black outline-none" />
                            </div>
                            <input type="range" min="15" max="115" value={price} onChange={(e) => setPrice(e.target.value)} className="custom-range" />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search</p>
                        <div className="relative">
                            <input ref={searchRef} type="text" placeholder="Press ctrl+c to open search." value={search} onChange={(e) => setSearch(e.target.value)} 
                                className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-bold text-lg outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-50" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(p => (
                        <div key={p.id} className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group">
                            <div className="aspect-square bg-blue-50 rounded-[32px] flex items-center justify-center text-7xl mb-6 group-hover:scale-110 transition-transform">
                                {p.img}
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-xl font-black">{p.name}</h3>
                                    <p className="text-3xl font-black text-blue-600">${p.price}</p>
                                </div>
                                <button onClick={() => setPayModal(true)} className="bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-500 transition-colors">Buy</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="py-10 text-center">
                <p className="text-gray-400 text-sm font-bold">PS 'realalex' is just a buisness name that i'll be using.</p>
            </footer>

            {authModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-6 smooth-show">
                    <div className="bg-white w-full max-w-sm rounded-[40px] p-10 modal-pop relative">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-xl font-bold text-black">Create your <span className="bg-green-500 text-white px-3 py-1 rounded-xl">account</span></h2>
                            <button onClick={() => setAuthModal(false)} className="text-gray-300 hover:text-red-500">✕</button>
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Enter your username." onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-50 h-16 px-6 rounded-2xl border border-transparent outline-none focus:border-blue-500 font-bold" />
                            <input type="password" placeholder="Enter your password." onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 h-16 px-6 rounded-2xl border border-transparent outline-none focus:border-blue-500 font-bold" />
                            <button onClick={handleJoin} className="w-full bg-black text-white h-16 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all">Create account.</button>
                        </div>
                    </div>
                </div>
            )}

            {payModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-6 smooth-show">
                    <div className="bg-white w-full max-w-md rounded-[40px] p-10 modal-pop relative">
                        <button onClick={() => setPayModal(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500">✕</button>
                        <h2 className="text-2xl font-black mb-2">Checkout</h2>
                        <p className="text-gray-400 text-sm font-bold mb-8 italic">Paying for Airpods ($15)</p>
                        
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Card Holder</p>
                                <input type="text" placeholder="Name on card" className="w-full bg-gray-50 h-16 px-6 rounded-2xl border border-transparent outline-none focus:border-blue-500 font-bold" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Card Details</p>
                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-gray-50 h-16 px-6 rounded-2xl border border-transparent outline-none focus:border-blue-500 font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="MM / YY" className="w-full bg-gray-50 h-16 px-6 rounded-2xl border border-transparent outline-none focus:border-blue-500 font-bold" />
                                <input type="text" placeholder="CVC" className="w-full bg-gray-50 h-16 px-6 rounded-2xl border border-transparent outline-none focus:border-blue-500 font-bold" />
                            </div>
                            <button onClick={() => alert("Payment logic connects here.")} className="w-full bg-blue-600 text-white h-16 rounded-2xl font-black text-lg hover:bg-green-500 transition-all mt-4">Pay $15.00</button>
                            <p className="text-center text-[10px] font-bold text-gray-300 tracking-widest uppercase">Debit Cards Only</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
