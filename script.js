const DB_URL = "https://ttzjwmckjaidkaxemsph.supabase.co";
const DB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0emp3bWNramFpZGtheGVtc3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTMxMTQsImV4cCI6MjA4MjI4OTExNH0.tfmVC1JIRqQuutuzqwXxr45xe0yLuq90CxhGIPWpLdU";
const db = supabase.createClient(DB_URL, DB_KEY);

const itemsList = [
    { id: 1, name: "Premium Watch", price: 115, icon: "⌚" },
    { id: 2, name: "Basic Tee", price: 15, icon: "👕" },
    { id: 3, name: "Studio Buds", price: 95, icon: "🎧" },
    { id: 4, name: "Black Shades", price: 45, icon: "🕶️" },
    { id: 5, name: "Travel Bag", price: 85, icon: "💼" },
    { id: 6, name: "Table Lamp", price: 55, icon: "💡" },
    { id: 7, name: "Gold Ring", price: 105, icon: "💍" },
    { id: 8, name: "Tech Pouch", price: 35, icon: "📦" }
];

function StoreApp() {
    const [budget, setBudget] = React.useState(115);
    const [find, setFind] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [user, setUser] = React.useState(null);
    const [nameIn, setNameIn] = React.useState("");
    const [passIn, setPassIn] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const searchRef = React.useRef(null);

    React.useEffect(() => {
        db.auth.getSession().then(({ data: { session } }) => {
            if (session) getProfile(session.user.id);
        });

        const keys = (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', keys);
        return () => window.removeEventListener('keydown', keys);
    }, []);

    async function getProfile(id) {
        const { data } = await db.from('profiles').select('username').eq('id', id).single();
        if (data) setUser(data.username);
    }

    async function signup() {
        if (!nameIn || !passIn) return;
        setLoading(true);

        const { data: taken } = await db.from('profiles').select('username').eq('username', nameIn).single();
        if (taken) {
            alert("Name is taken.");
            setLoading(false);
            return;
        }

        const { data, error } = await db.auth.signUp({
            email: `${nameIn}@realalex.store`,
            password: passIn
        });

        if (error) {
            alert(error.message);
        } else {
            await db.from('profiles').insert([{ id: data.user.id, username: nameIn }]);
            setUser(nameIn);
            setOpen(false);
        }
        setLoading(false);
    }

    const filtered = itemsList.filter(i => 
        i.price <= budget && 
        i.name.toLowerCase().includes(find.toLowerCase())
    );

    return (
        <div className="min-h-screen">
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-40">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="text-xl font-black tracking-tighter">
                        realalex <span className="text-blue-600">reselling</span> <span className="text-green-500">store</span>
                    </div>
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-sm">Welcome <span className="text-blue-600">{user}</span></span>
                            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xs">
                                {user[0].toUpperCase()}
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setOpen(true)} className="bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-all text-sm">
                            Create account
                        </button>
                    )}
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
                <div className="flex flex-col gap-6 mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Set Budget</p>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-2xl font-bold text-gray-300">$</span>
                                <input 
                                    type="number" 
                                    value={budget} 
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="text-4xl font-black w-full outline-none"
                                />
                            </div>
                            <input 
                                type="range" 
                                min="15" 
                                max="115" 
                                value={budget} 
                                onChange={(e) => setBudget(e.target.value)}
                            />
                        </div>

                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-g
