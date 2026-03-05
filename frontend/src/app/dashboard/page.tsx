"use client";

import { useEffect, useState } from "react";
import {
    Bot,
    Phone,
    Clock,
    DollarSign,
    Activity,
    TrendingUp,
    ArrowUpRight,
    Zap,
} from "lucide-react";

export default function DashboardOverview() {
    const [stats, setStats] = useState({
        total_agents: 3,
        active_agents: 2,
        total_calls: 1247,
        total_cost: 342.5,
        avg_call_duration_seconds: 185,
        avg_latency_ms: 420,
    });

    const recentCalls = [
        { id: 1, agent: "Sales Agent", phone: "+44 7700 900***", status: "completed", duration: "3:42", sentiment: "positive", time: "2 min ago" },
        { id: 2, agent: "Support Bot", phone: "+44 7700 901***", status: "completed", duration: "5:18", sentiment: "neutral", time: "15 min ago" },
        { id: 3, agent: "Receptionist", phone: "+44 7700 902***", status: "completed", duration: "1:55", sentiment: "positive", time: "1 hr ago" },
        { id: 4, agent: "Sales Agent", phone: "+44 7700 903***", status: "failed", duration: "0:12", sentiment: "negative", time: "2 hr ago" },
        { id: 5, agent: "Support Bot", phone: "+44 7700 904***", status: "completed", duration: "4:07", sentiment: "positive", time: "3 hr ago" },
    ];

    const statCards = [
        { label: "Total Calls", value: stats.total_calls.toLocaleString(), icon: Phone, change: "+12%", color: "#6c5ce7" },
        { label: "Active Agents", value: stats.active_agents, icon: Bot, change: `${stats.total_agents} total`, color: "#00cec9" },
        { label: "Avg Latency", value: `${stats.avg_latency_ms}ms`, icon: Activity, change: "-8%", color: "#fdcb6e" },
        { label: "Total Cost", value: `$${stats.total_cost.toFixed(2)}`, icon: DollarSign, change: "+5%", color: "#fd79a8" },
    ];

    const sentimentColors: Record<string, string> = {
        positive: "var(--success)",
        neutral: "var(--warning)",
        negative: "var(--error)",
    };

    const statusBadge: Record<string, string> = {
        completed: "badge-success",
        failed: "badge-error",
        "in-progress": "badge-warning",
        queued: "badge-info",
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                    Welcome back. Here&apos;s your platform overview.
                </p>
            </div>

            {/* Stat Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 20,
                    marginBottom: 32,
                }}
            >
                {statCards.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="stat-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8, fontWeight: 500 }}>
                                        {s.label}
                                    </div>
                                    <div style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</div>
                                </div>
                                <div
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 12,
                                        background: `${s.color}15`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: s.color,
                                    }}
                                >
                                    <Icon size={20} />
                                </div>
                            </div>
                            <div
                                style={{
                                    marginTop: 12,
                                    fontSize: 12,
                                    color: "var(--success)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <TrendingUp size={12} /> {s.change}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Calls + Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
                {/* Recent Calls */}
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                        Recent Calls
                    </h2>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Agent</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Duration</th>
                                    <th>Sentiment</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentCalls.map((call) => (
                                    <tr key={call.id}>
                                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                            {call.agent}
                                        </td>
                                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                                            {call.phone}
                                        </td>
                                        <td>
                                            <span className={`badge ${statusBadge[call.status] || "badge-neutral"}`}>
                                                {call.status}
                                            </span>
                                        </td>
                                        <td>{call.duration}</td>
                                        <td>
                                            <span style={{ color: sentimentColors[call.sentiment], fontWeight: 600, fontSize: 13 }}>
                                                ● {call.sentiment}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 13 }}>{call.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                        Quick Actions
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                            { label: "Create New Agent", icon: Bot, href: "/dashboard/agents", color: "#6c5ce7" },
                            { label: "Make a Test Call", icon: Phone, href: "/dashboard/calls", color: "#00cec9" },
                            { label: "Build Workflow", icon: Zap, href: "/dashboard/workflows", color: "#fd79a8" },
                            { label: "Generate API Key", icon: ArrowUpRight, href: "/dashboard/api-keys", color: "#fdcb6e" },
                        ].map((action) => {
                            const Icon = action.icon;
                            return (
                                <a
                                    key={action.label}
                                    href={action.href}
                                    className="card"
                                    style={{
                                        padding: "16px 20px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                        textDecoration: "none",
                                        color: "inherit",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            background: `${action.color}15`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: action.color,
                                        }}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: 14 }}>{action.label}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
