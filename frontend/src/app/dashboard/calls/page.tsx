"use client";

import { useState } from "react";
import { Phone, Search, Filter, Clock, ChevronDown } from "lucide-react";

const mockCalls = [
    { id: "c1", agent: "Sales Agent", phone: "+44 7700 900123", direction: "outbound", status: "completed", duration: 222, sentiment: "positive", cost: 0.45, started_at: "2026-03-05T10:30:00Z", transcript: "AI: Hi there! I'm calling from VoiceAI about your inquiry.\nUser: Yes, I was looking at the Pro plan.\nAI: Great choice! The Pro plan includes 5000 minutes..." },
    { id: "c2", agent: "Support Bot", phone: "+44 7700 900456", direction: "inbound", status: "completed", duration: 318, sentiment: "neutral", cost: 0.62, started_at: "2026-03-05T09:15:00Z", transcript: "AI: Hello! Thank you for calling support. How can I help?\nUser: I'm having trouble with my API key.\nAI: I'd be happy to help with that..." },
    { id: "c3", agent: "Receptionist", phone: "+44 7700 900789", direction: "inbound", status: "completed", duration: 115, sentiment: "positive", cost: 0.22, started_at: "2026-03-05T08:45:00Z", transcript: "AI: Good morning! How may I direct your call?\nUser: I'd like to schedule an appointment.\nAI: Of course! Let me check our availability..." },
    { id: "c4", agent: "Sales Agent", phone: "+44 7700 900234", direction: "outbound", status: "failed", duration: 12, sentiment: "negative", cost: 0.02, started_at: "2026-03-04T16:30:00Z", transcript: "Call failed: No answer" },
    { id: "c5", agent: "Support Bot", phone: "+44 7700 900567", direction: "inbound", status: "completed", duration: 247, sentiment: "positive", cost: 0.48, started_at: "2026-03-04T14:20:00Z", transcript: "AI: Hello! How can I assist you today?\nUser: I need to upgrade my plan.\nAI: Absolutely! Let me walk you through the options..." },
    { id: "c6", agent: "Receptionist", phone: "+44 7700 900890", direction: "inbound", status: "completed", duration: 95, sentiment: "neutral", cost: 0.18, started_at: "2026-03-04T11:10:00Z", transcript: "AI: Good morning! How may I help you?\nUser: Can I speak to someone about billing?" },
];

export default function CallsPage() {
    const [selectedCall, setSelectedCall] = useState<typeof mockCalls[0] | null>(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const filteredCalls = mockCalls.filter((c) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (search && !c.agent.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
        return true;
    });

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

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
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Call Logs</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                    View and analyze all call activity across your agents.
                </p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input className="input" style={{ paddingLeft: 40 }} placeholder="Search by agent or phone number..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="select" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="in-progress">In Progress</option>
                </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selectedCall ? "1fr 400px" : "1fr", gap: 24 }}>
                {/* Calls Table */}
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Agent</th>
                                <th>Phone</th>
                                <th>Direction</th>
                                <th>Status</th>
                                <th>Duration</th>
                                <th>Sentiment</th>
                                <th>Cost</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCalls.map((call) => (
                                <tr key={call.id} onClick={() => setSelectedCall(call)} style={{ cursor: "pointer" }}>
                                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{call.agent}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{call.phone}</td>
                                    <td>
                                        <span className={`badge ${call.direction === "inbound" ? "badge-info" : "badge-neutral"}`}>
                                            {call.direction}
                                        </span>
                                    </td>
                                    <td><span className={`badge ${statusBadge[call.status]}`}>{call.status}</span></td>
                                    <td>{formatDuration(call.duration)}</td>
                                    <td>
                                        <span style={{ color: sentimentColors[call.sentiment], fontWeight: 600, fontSize: 13 }}>
                                            ● {call.sentiment}
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                                        ${call.cost.toFixed(2)}
                                    </td>
                                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                        {new Date(call.started_at).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Call Detail Panel */}
                {selectedCall && (
                    <div className="card animate-slide-in" style={{ padding: 24, height: "fit-content" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Call Details</h3>
                            <button className="btn-ghost" style={{ padding: 4 }} onClick={() => setSelectedCall(null)}>✕</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--text-muted)" }}>Agent</span>
                                <span style={{ fontWeight: 600 }}>{selectedCall.agent}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--text-muted)" }}>Phone</span>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{selectedCall.phone}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--text-muted)" }}>Duration</span>
                                <span>{formatDuration(selectedCall.duration)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--text-muted)" }}>Cost</span>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>${selectedCall.cost.toFixed(2)}</span>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Transcript</h4>
                            <div className="code-block" style={{ fontSize: 12, lineHeight: 1.8, maxHeight: 300, overflow: "auto", whiteSpace: "pre-wrap" }}>
                                {selectedCall.transcript}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
