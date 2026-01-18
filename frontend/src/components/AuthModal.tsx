"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation"; 
import { useCartStore } from "@/store/cart";
import { X, ArrowRight, Mail, Lock, User, Info, AlertCircle } from "lucide-react";

type Mode = "login" | "register" | "forgot" | "resend";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export function AuthModal({ open, onClose }: AuthModalProps) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const resetMessages = () => {
    setError(null);
    setMessage(null);
  };

  const handleSwitchMode = (m: Mode) => {
    resetMessages();
    setMode(m);
  };

  const handleClose = () => {
    resetMessages();
    setMode("login");
    setName("");
    setEmail("");
    setPassword("");
    onClose();
  };

  // Logic functions (doRegister, doLogin, etc. tetap sama seperti kode asli Anda)
  const doRegister = async () => {
    if (!API_BASE) return;
    resetMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Gagal registrasi.");
        return;
      }

      setMessage("Registrasi berhasil. Silakan cek email untuk verifikasi.");
      setMode("login");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  const doLogin = async () => {
    if (!API_BASE) return;
    resetMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Email atau password salah.");
        return;
      }

      const user = data.data.user;
      const token = data.data.token;

      setAuth({ user, token });
      setMessage("Login berhasil.");

      const syncAfterLogin = useCartStore.getState().syncAfterLogin;
      void syncAfterLogin(token);

      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      handleClose();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  const doResendVerification = async () => {
    if (!API_BASE) return;
    resetMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal mengirim ulang verifikasi.");
        return;
      }
      setMessage("Link verifikasi telah dikirim ulang ke email Anda.");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  const doForgotPassword = async () => {
    if (!API_BASE) return;
    resetMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal mengirim email reset password.");
        return;
      }
      setMessage("Link reset password telah dikirim ke email Anda.");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  const primaryAction = async () => {
    if (mode === "login") return doLogin();
    if (mode === "register") return doRegister();
    if (mode === "forgot") return doForgotPassword();
    if (mode === "resend") return doResendVerification();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[450px] overflow-hidden rounded-[2.5rem] ">
        
        {/* Header Area */}
        <div className="bg-black p-8 text-white relative">
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 rounded-full bg-white p-2 text-black transition-all hover:bg-zinc-500 hover:text-black"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
          
          <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter">
            {mode === "login" ? "Welcome Back" : mode === "register" ? "Join the Club" : "Security"}
          </h2>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            {mode === "login" && "Login to access your curations"}
            {mode === "register" && "Create your digital identity"}
            {mode === "forgot" && "Reset your access key"}
            {mode === "resend" && "Request new verification link"}
          </p>
        </div>

        {/* Form Area */}
        <div className="p-8 bg-white">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600 animate-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-600 animate-in slide-in-from-top-2">
              <Info size={16} />
              {message}
            </div>
          )}

          <div className="space-y-5">
            {mode === "register" && (
              <div className="group space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    type="text"
                    className="w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50 py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all focus:border-black focus:bg-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div className="group space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-black transition-colors" size={18} />
                <input
                  type="email"
                  className="w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50 py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all focus:border-black focus:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {(mode === "login" || mode === "register") && (
              <div className="group space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">Password</label>
                  {mode === "login" && (
                    <button type="button" onClick={() => handleSwitchMode("forgot")} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black underline">Forgot?</button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    type="password"
                    className="w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50 py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all focus:border-black focus:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  
                </div>
              </div>
            )}

            {mode === "login" && (
               <button
                type="button"
                onClick={() => handleSwitchMode("resend")}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
              >
                Resend verification email?
              </button>
            )}

            <button
              type="button"
              onClick={primaryAction}
              disabled={loading}
              className="group relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-black py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "login" ? "Login" : mode === "register" ? "Create Account" : "Submit Request"}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </button>

            {/* Switch Mode Footer */}
            <div className="mt-8 pt-6 text-center border-t border-zinc-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {mode === "login" ? "New to CLRD?" : mode === "register" ? "Already a member?" : "Back to"}
                {" "}
                <button
                  type="button"
                  onClick={() => handleSwitchMode(mode === "login" ? "register" : "login")}
                  className="text-black underline decoration-2 underline-offset-4 hover:bg-black hover:text-white px-1 transition-all"
                >
                  {mode === "login" ? "Create Account" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}