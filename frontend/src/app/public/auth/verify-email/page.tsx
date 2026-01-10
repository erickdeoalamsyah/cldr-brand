"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

type Status = "idle" | "loading" | "success" | "error";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    const verify = async () => {
      try {
        setStatus("loading");
        const res = await fetch(
          `${API_BASE}/auth/verify-email?token=${token}`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatus("error");
          setMessage(data.message || "Gagal verifikasi email.");
          return;
        }

        const user = data.data.user;
        const jwt = data.data.token;

        setAuth({
          user,
          token: jwt,
        });

        setStatus("success");
        setMessage("Email berhasil diverifikasi. Anda sudah login.");

        setTimeout(() => {
          if (user.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        }, 1500);
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Terjadi kesalahan saat verifikasi.");
      }
    };

    verify();
  }, [searchParams, setAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-xl font-semibold mb-3">Verifikasi Email</h1>

        {status === "loading" && (
          <p className="text-slate-300">Sedang memverifikasi email Anda...</p>
        )}

        {status === "success" && (
          <p className="text-emerald-400 font-medium">{message}</p>
        )}

        {status === "error" && (
          <p className="text-red-400 font-medium">{message}</p>
        )}

        {status === "idle" && (
          <p className="text-slate-300">
            Menyiapkan verifikasi email, mohon tunggu...
          </p>
        )}
      </div>
    </div>
  );
}
