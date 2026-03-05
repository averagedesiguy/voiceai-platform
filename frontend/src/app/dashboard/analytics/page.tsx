"use client";

import { BarChart3, TrendingUp, Clock, Phone } from "lucide-react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

const callsOverTime = [
    { date: "Feb 28", calls: 32, cost: 12.5 },
    { date: "Mar 1", calls: 45, cost: 18.2 },
    { date: "Mar 2", calls: 38, cost: 15.1 },
    { date: "Mar 3", calls: 52, cost: 21.3 },
    { date: "Mar 4", calls: 67, cost: 28.4 },
    { date: "Mar 5", calls: 41, cost: 16.8 },
    { date: "Mar 6", calls: 58, cost: 24.1 },
];

const sentimentData = [
    { name: "Positive", value: 65, color: "#00d68f" },
    { name: "Neutral", value: 25, color: "#fdcb6e" },
    { name: "Negative", value: 10, color: "#ff4757" },
];

const agentPerformance = [
    { agent: "Sales Agent", calls: 487, avgDuration: 185, successRate: 78 },
    { agent: "Support Bot", calls: 612, avgDuration: 247, successRate: 92 },
    { agent: "Receptionist", calls: 148, avgDuration: 95, successRate: 95 },
];

const latencyData = [
    { time: "00:00", latency: 380 },
    { time: "04:00", latency: 350 },
    { time: "08:00", latency: 420 },
    { time: "12:00", latency: 480 },
    { time: "16:00", latency: 510 },
    { time: "20:00", latency: 440 },
    { time: "24:00", latency: 390 },
];

export default function AnalyticsPage() {
    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Analytics</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                    Track performance, costs, and conversation quality across all agents.
                </p>
            </div>

            {/* Overview Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
                {[
                    { label: "Total Calls", value: "1,247", change: "+12.5%", icon: Phone, color: "#6c5ce7" },
                    { label: "Avg Duration", value: "3:05", change: "-4.2%", icon: Clock, color: "#00cec9" },
                    { label: "Success Rate", value: "88%", change: "+3.1%", icon: TrendingUp, color: "#00d68f" },
                    { label: "Total Spend", value: "$342.50", change: "+8.7%", icon: BarChart3, color: "#fd79a8" },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="stat-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
                                    <div style={{ fontSize: 26, fontWeight: 800 }}>{s.value}</div>
                                </div>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                                    <Icon size={18} />
                                </div>
                            </div>
                            <div style={{ marginTop: 10, fontSize: 12, color: s.change.startsWith("+") ? "var(--success)" : "var(--error)" }}>
                                {s.change} vs last period
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>
                {/* Calls Over Time */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Calls Over Time</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={callsOverTime}>
                            <defs>
                                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="date" tick={{ fill: "#555568", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                            <YAxis tick={{ fill: "#555568", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                            <Tooltip contentStyle={{ background: "#1e1e2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f0f0f5", fontSize: 13 }} />
                            <Area type="monotone" dataKey="calls" stroke="#6c5ce7" strokeWidth={2} fill="url(#colorCalls)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Sentiment Breakdown */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Sentiment Breakdown</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
                                {sentimentData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#1e1e2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f0f0f5", fontSize: 13 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
                        {sentimentData.map((s) => (
                            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                                <span style={{ color: "var(--text-secondary)" }}>{s.name} {s.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Latency Chart */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>AI Latency (ms)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={latencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" tick={{ fill: "#555568", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                            <YAxis tick={{ fill: "#555568", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                            <Tooltip contentStyle={{ background: "#1e1e2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f0f0f5", fontSize: 13 }} />
                            <Line type="monotone" dataKey="latency" stroke="#fdcb6e" strokeWidth={2} dot={{ fill: "#fdcb6e", r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Agent Performance Table */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Agent Performance</h3>
                    <div className="table-wrapper" style={{ border: "none" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Agent</th>
                                    <th>Calls</th>
                                    <th>Avg Duration</th>
                                    <th>Success</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agentPerformance.map((a) => (
                                    <tr key={a.agent}>
                                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{a.agent}</td>
                                        <td>{a.calls}</td>
                                        <td>{Math.floor(a.avgDuration / 60)}:{(a.avgDuration % 60).toString().padStart(2, "0")}</td>
                                        <td>
                                            <span style={{ color: a.successRate >= 90 ? "var(--success)" : a.successRate >= 70 ? "var(--warning)" : "var(--error)", fontWeight: 600 }}>
                                                {a.successRate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
