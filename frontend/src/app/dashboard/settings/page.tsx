"use client";

import { useState } from "react";
import { Settings, User, Building, CreditCard, Bell, Shield, Save } from "lucide-react";

export default function SettingsPage() {
    const [profile, setProfile] = useState({
        full_name: "Ansar",
        email: "ansar@voiceai.com",
        company_name: "VoiceAI Ltd",
    });

    const [notifications, setNotifications] = useState({
        call_completed: true,
        call_failed: true,
        usage_alert: true,
        weekly_report: false,
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Settings</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                    Manage your account, billing, and platform preferences.
                </p>
            </div>

            <div style={{ maxWidth: 700, display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Profile */}
                <div className="card" style={{ padding: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <User size={18} color="var(--accent)" />
                        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Profile</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Full Name</label>
                            <input className="input" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Email</label>
                            <input className="input" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Company</label>
                            <input className="input" value={profile.company_name} onChange={(e) => setProfile({ ...profile, company_name: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="card" style={{ padding: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <Bell size={18} color="#fdcb6e" />
                        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Notifications</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {Object.entries(notifications).map(([key, val]) => (
                            <label key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                                    {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                                <div
                                    onClick={() => setNotifications({ ...notifications, [key]: !val })}
                                    style={{
                                        width: 44,
                                        height: 24,
                                        borderRadius: 12,
                                        background: val ? "var(--accent)" : "var(--bg-secondary)",
                                        border: `1px solid ${val ? "var(--accent)" : "var(--border)"}`,
                                        position: "relative",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <div style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        background: "white",
                                        position: "absolute",
                                        top: 2,
                                        left: val ? 22 : 2,
                                        transition: "left 0.2s",
                                    }} />
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Billing */}
                <div className="card" style={{ padding: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <CreditCard size={18} color="#00d68f" />
                        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Billing</h2>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "var(--bg-secondary)", borderRadius: 12, marginBottom: 16 }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Free Plan</div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>100 minutes/month • 2 agents</div>
                        </div>
                        <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }}>Upgrade</button>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        Usage this month: <strong style={{ color: "var(--text-secondary)" }}>42 / 100 minutes</strong>
                    </div>
                </div>

                {/* Save */}
                <button className="btn-primary" style={{ justifyContent: "center", padding: "12px 24px" }} onClick={handleSave}>
                    <Save size={16} /> {saved ? "Saved!" : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
