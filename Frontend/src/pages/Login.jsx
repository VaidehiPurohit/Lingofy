import { Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../apiConfig'

const Login = () => {
    const query = new URLSearchParams(window.location.search);
    const urlState = query.get('state');
    const navigate = useNavigate();

    const [state, setState] = useState(urlState || "login");
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState("");

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setAuthError(""); // Clear error when typing
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setAuthError("");
        
        try {
            const endpoint = state === "login" ? "/api/login" : "/api/signup";
            const bodyData = formData;
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Clear stale data from any previous user sessions
                localStorage.removeItem("lingofy_study_seconds");
                localStorage.removeItem("lingofy_streak");
                localStorage.removeItem("lingofy_level");
                localStorage.removeItem("lingofy_daily_goal");
                localStorage.removeItem("lingofy_avg_accuracy");

                if (state === "login") {
                    // Existing user logging in: assume they already bypassed or took the quiz
                    localStorage.setItem("lingofy_quiz_taken", "true");
                } else {
                    // Brand new user signing up: clear the flag to show the quiz
                    localStorage.removeItem("lingofy_quiz_taken");
                }

                // Save actual DB user ID and profile
                localStorage.setItem("lingofy_user", JSON.stringify(data.user));
                navigate("/dashboard");
            } else {
                setAuthError(data.error || "Authentication failed. Please try again.");
            }
        } catch (error) {
            console.error("Auth error:", error);
            setAuthError("Could not connect to the server. Please check your backend connection.");
        } finally {
            setIsLoading(false);
        }
    }

  return (
        <div className='relative flex items-center justify-center min-h-screen bg-indigo-50/50 overflow-hidden'>
            
            {/* Dynamic Background Orbs */}
            <div className='absolute inset-0 z-0 pointer-events-none overflow-hidden'>
                <div className='absolute -top-24 -left-24 w-96 h-96 bg-indigo-300/40 rounded-full blur-3xl animate-pulse mix-blend-multiply' />
                <div className='absolute top-1/4 -right-32 w-[500px] h-[500px] bg-purple-300/40 rounded-full blur-3xl animate-pulse mix-blend-multiply delay-700' />
                <div className='absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-3xl animate-pulse mix-blend-multiply delay-1000' />
            </div>

            <div className="z-10 w-full max-w-md px-6">
                <form
                    onSubmit={handleSubmit}
                    className="w-full text-center bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-indigo-100/50 rounded-3xl p-8 transition-all duration-500">
                    
                    <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 transform -rotate-6 group-hover:rotate-0 transition-transform">
                        <Lock className="text-white w-8 h-8" />
                    </div>

                    <h1 className="text-slate-800 text-3xl font-black tracking-tight">
                        {state === "login" ? "Welcome back" : "Join Lingofy"}
                    </h1>

                    <p className="text-slate-500 text-sm mt-3 font-medium">
                        {state === "login" ? "Enter your credentials to access your account" : "Create a new account to start learning"}
                    </p>

                    {authError && (
                        <div className="mt-6 flex items-start gap-2 bg-red-50 text-red-600 text-sm p-4 rounded-xl text-left border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <p className="font-medium">{authError}</p>
                        </div>
                    )}

                    <div className="mt-6 space-y-4">
                        {state !== "login" && (
                            <div className="flex items-center w-full bg-white/80 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/50 h-14 rounded-2xl overflow-hidden pl-5 gap-3 transition-all shadow-inner">
                                <User size={18} className="text-slate-400 shrink-0"/>
                                <input type="text" name="name" placeholder="Full Name" className="w-full bg-transparent text-slate-800 placeholder-slate-400 border-none outline-none font-medium h-full" value={formData.name} onChange={handleChange} required />
                            </div>
                        )}

                        <div className="flex items-center w-full bg-white/80 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/50 h-14 rounded-2xl overflow-hidden pl-5 gap-3 transition-all shadow-inner">
                            <Mail size={18} className="text-slate-400 shrink-0"/>
                            <input type="email" name="email" placeholder="Email Address" className="w-full bg-transparent text-slate-800 placeholder-slate-400 border-none outline-none font-medium h-full" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="flex items-center w-full bg-white/80 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/50 h-14 rounded-2xl overflow-hidden pl-5 gap-3 transition-all shadow-inner">
                            <Lock size={18} className="text-slate-400 shrink-0"/>
                            <input type="password" name="password" placeholder="Password" className="w-full bg-transparent text-slate-800 placeholder-slate-400 border-none outline-none font-medium h-full" value={formData.password} onChange={handleChange} required />
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="mt-8 relative group w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 overflow-hidden hover:bg-slate-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20" >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative text-white font-bold text-lg tracking-wide">
                            {isLoading ? "Authenticating..." : (state === "login" ? "Sign In" : "Create Account")}
                        </span>
                        {!isLoading && <ArrowRight size={20} className="relative text-white/70 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" />}
                    </button>

                    <div className="mt-8 pt-6 border-t border-slate-200/60">
                        <p className="text-slate-500 text-sm font-medium">
                            {state === "login" ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                type="button"
                                onClick={() => {
                                    setState(prev => prev === "login" ? "signup" : "login");
                                    setAuthError("");
                                }} 
                                className="text-indigo-600 font-bold hover:underline ml-2 transition-all" >
                                {state === "login" ? "Sign up now" : "Sign in instead"}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
  )
}

export default Login