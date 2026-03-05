"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Bot,
    Phone,
    Workflow,
    Brain,
    BarChart3,
    Key,
    Settings,
    Zap,
    LogOut,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/agents", label: "Agents", icon: Bot },
    { href: "/dashboard/calls", label: "Call Logs", icon: Phone },
    { href: "/dashboard/workflows", label: "Workflows", icon: Workflow },
    { href: "/dashboard/knowledge", label: "Knowledge Base", icon: Brain },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <aside className="sidebar">
                {/* Logo */}
                <div
                    style={{
                        padding: "20px 20px 28px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        borderBottom: "1px solid var(--border)",
                        marginBottom: 8,
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "var(--gradient-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Zap size={18} color="white" />
                    </div>
                    <span style={{ fontSize: 17, fontWeight: 800 }}>VoiceAI</span>
                </div>

                {/* Nav Links */}
                <nav style={{ flex: 1, padding: "8px 0" }}>
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${isActive ? "active" : ""}`}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div
                    style={{
                        padding: "16px 20px",
                        borderTop: "1px solid var(--border)",
                    }}
                >
                    <button
                        className="sidebar-link"
                        style={{
                            width: "100%",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            margin: 0,
                            padding: "10px 8px",
                        }}
                        onClick={() => {
                            if (typeof window !== "undefined") {
                                localStorage.removeItem("voiceai_token");
                                window.location.href = "/login";
                            }
                        }}
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    marginLeft: 260,
                    padding: "32px 40px",
                    minHeight: "100vh",
                    background: "var(--bg-primary)",
                }}
            >
                {children}
            </main>
        </div>
    );
}
