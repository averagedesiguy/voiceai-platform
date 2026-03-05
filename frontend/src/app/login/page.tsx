"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Mail, Lock, User, Building } from "lucide-react";
import api from "@/lib/api";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isRegister, setIsRegister] = useState(searchParams.get("mode") === "register");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        email: "",
        password: "",
        full_name: "",
        company_name: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isRegister) {
                const res = await api.register(form);
                api.setToken(res.access_token);
            } else {
                const res = await api.login(form.email, form.password);
                api.setToken(res.access_token);
            }
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-primary)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background orbs */}
            <div
                style={{
                    position: "absolute",
                    top: "20%",
                    left: "20%",
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(108,92,231,0.08), transparent 70%)",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "10%",
                    right: "15%",
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(253,121,168,0.06), transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <div
                className="animate-slide-up"
                style={{
                    width: "100%",
                    maxWidth: 440,
                    padding: 40,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        marginBottom: 40,
                    }}
                >
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: "var(--gradient-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Zap size={24} color="white" />
                    </div>
                    <span style={{ fontSize: 24, fontWeight: 800 }}>VoiceAI</span>
                </div>

                {/* Card */}
                <div
                    className="glass-card"
                    style={{ padding: 36 }}
                >
                    <h1
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            marginBottom: 8,
                            textAlign: "center",
                        }}
                    >
                        {isRegister ? "Create your account" : "Welcome back"}
                    </h1>
                    <p
                        style={{
                            fontSize: 14,
                            color: "var(--text-secondary)",
                            textAlign: "center",
                            marginBottom: 28,
                        }}
                    >
                        {isRegister
                            ? "Start building AI agents in minutes"
                            : "Log in to your VoiceAI dashboard"}
                    </p>

                    {error && (
                        <div
                            style={{
                                background: "rgba(255,71,87,0.1)",
                                border: "1px solid rgba(255,71,87,0.2)",
                                borderRadius: 8,
                                padding: "10px 14px",
                                fontSize: 13,
                                color: "var(--error)",
                                marginBottom: 20,
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {isRegister && (
                            <>
                                <div style={{ position: "relative" }}>
                                    <User
                                        size={16}
                                        style={{
                                            position: "absolute",
                                            left: 14,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "var(--text-muted)",
                                        }}
                                    />
                                    <input
                                        className="input"
                                        style={{ paddingLeft: 40 }}
                                        placeholder="Full Name"
                                        value={form.full_name}
                                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ position: "relative" }}>
                                    <Building
                                        size={16}
                                        style={{
                                            position: "absolute",
                                            left: 14,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "var(--text-muted)",
                                        }}
                                    />
                                    <input
                                        className="input"
                                        style={{ paddingLeft: 40 }}
                                        placeholder="Company Name (optional)"
                                        value={form.company_name}
                                        onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        <div style={{ position: "relative" }}>
                            <Mail
                                size={16}
                                style={{
                                    position: "absolute",
                                    left: 14,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--text-muted)",
                                }}
                            />
                            <input
                                className="input"
                                style={{ paddingLeft: 40 }}
                                type="email"
                                placeholder="Email address"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div style={{ position: "relative" }}>
                            <Lock
                                size={16}
                                style={{
                                    position: "absolute",
                                    left: 14,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--text-muted)",
                                }}
                            />
                            <input
                                className="input"
                                style={{ paddingLeft: 40 }}
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                minLength={8}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{
                                width: "100%",
                                justifyContent: "center",
                                padding: "12px 24px",
                                marginTop: 8,
                                opacity: loading ? 0.7 : 1,
                            }}
                            disabled={loading}
                        >
                            {loading
                                ? "Please wait..."
                                : isRegister
                                    ? "Create Account"
                                    : "Log In"}
                        </button>
                    </form>

                    <div
                        style={{
                            textAlign: "center",
                            marginTop: 24,
                            fontSize: 14,
                            color: "var(--text-secondary)",
                        }}
                    >
                        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError("");
                            }}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--accent-light)",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 14,
                            }}
                        >
                            {isRegister ? "Log In" : "Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
                <div style={{ color: "var(--text-muted)" }}>Loading...</div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
