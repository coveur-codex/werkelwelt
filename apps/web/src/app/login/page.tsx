"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, login, seedInitialAdminFromEnv } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter(); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  useEffect(()=>{ void seedInitialAdminFromEnv().then(()=>{ const user=getCurrentUser(); if(user) router.replace(user.role==="admin"?"/admin":"/parent"); }); },[router]);
  async function submit(event: React.FormEvent) { event.preventDefault(); setError(""); const user = await login(email,password); if(!user){ setError("E-Mail oder Passwort stimmt nicht."); return; } router.replace(user.role === "admin" ? "/admin" : "/parent"); }
  return <main className="page-shell"><section className="hero compact"><p className="eyebrow">Anmeldung</p><h1>Werkelwelt</h1><p>Bitte melde dich mit deinem Eltern- oder Admin-Konto an.</p></section><section className="work-card"><form className="task-form stacked" onSubmit={submit}><label>E-Mail<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required /></label><label>Passwort<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" required /></label>{error&&<p className="gentle-note" role="alert">{error}</p>}<button>Anmelden</button></form></section></main>;
}
