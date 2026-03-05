"use client";

import { useState } from "react";
import { Bot, Plus, Edit, Trash2, MoreVertical, Phone, X } from "lucide-react";

const MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"];
const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

interface Agent {
    id: string;
    name: string;
    description: string;
    model: string;
    voice_id: string;
    status: string;
    total_calls: number;
    system_prompt: string;
    first_message: string;
}

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([
        { id: "1", name: "Sales Agent", description: "Handles outbound sales calls with warm, persuasive tone", model: "gpt-4o-mini", voice_id: "nova", status: "active", total_calls: 487, system_prompt: "You are a professional sales agent...", first_message: "Hi there! I'm calling from VoiceAI..." },
        { id: "2", name: "Support Bot", description: "Customer support with empathetic, solution-oriented approach", model: "gpt-4o", voice_id: "alloy", status: "active", total_calls: 612, system_prompt: "You are a helpful customer support agent...", first_message: "Hello! Thank you for calling. How can I help?" },
        { id: "3", name: "Receptionist", description: "Front-desk AI for scheduling and call routing", model: "gpt-4o-mini", voice_id: "shimmer", status: "paused", total_calls: 148, system_prompt: "You are a professional receptionist...", first_message: "Good morning! How may I direct your call?" },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        system_prompt: "You are a helpful AI assistant.",
        model: "gpt-4o-mini",
        voice_id: "alloy",
        first_message: "Hello! How can I help you today?",
    });

    const handleCreate = () => {
        setEditingAgent(null);
        setForm({
            name: "",
            description: "",
            system_prompt: "You are a helpful AI assistant.",
            model: "gpt-4o-mini",
            voice_id: "alloy",
            first_message: "Hello! How can I help you today?",
        });
        setShowModal(true);
    };

    const handleEdit = (agent: Agent) => {
        setEditingAgent(agent);
        setForm({
            name: agent.name,
            description: agent.description,
            system_prompt: agent.system_prompt,
            model: agent.model,
            voice_id: agent.voice_id,
            first_message: agent.first_message,
        });
        setShowModal(true);
    };

    const handleSave = () => {
        if (editingAgent) {
            setAgents((prev) =>
                prev.map((a) => (a.id === editingAgent.id ? { ...a, ...form } : a))
            );
        } else {
            const newAgent: Agent = {
                id: String(Date.now()),
                ...form,
                status: "active",
                total_calls: 0,
            };
            setAgents((prev) => [...prev, newAgent]);
        }
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        setAgents((prev) => prev.filter((a) => a.id !== id));
    };

    const statusColors: Record<string, string> = {
        active: "badge-success",
        paused: "badge-warning",
        archived: "badge-neutral",
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Agents</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                        Create and manage your AI voice & chat agents.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleCreate}>
                    <Plus size={18} /> Create Agent
                </button>
            </div>

            {/* Agent Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {agents.map((agent) => (
                    <div key={agent.id} className="card" style={{ padding: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: "rgba(108,92,231,0.12)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "var(--accent)",
                                    }}
                                >
                                    <Bot size={22} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{agent.name}</h3>
                                    <span className={`badge ${statusColors[agent.status]}`}>{agent.status}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 4 }}>
                                <button className="btn-ghost" style={{ padding: 6 }} onClick={() => handleEdit(agent)}>
                                    <Edit size={14} />
                                </button>
                                <button className="btn-ghost" style={{ padding: 6, color: "var(--error)" }} onClick={() => handleDelete(agent.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
                            {agent.description}
                        </p>
                        <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
                            <span>Model: <strong style={{ color: "var(--text-secondary)" }}>{agent.model}</strong></span>
                            <span>Voice: <strong style={{ color: "var(--text-secondary)" }}>{agent.voice_id}</strong></span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                <Phone size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                                {agent.total_calls} calls
                            </span>
                            <button className="btn-ghost" style={{ fontSize: 12, padding: "4px 12px" }}>
                                Test Agent →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                                {editingAgent ? "Edit Agent" : "Create New Agent"}
                            </h2>
                            <button className="btn-ghost" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                    Agent Name
                                </label>
                                <input className="input" placeholder="e.g. Sales Agent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>

                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                    Description
                                </label>
                                <input className="input" placeholder="What does this agent do?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>

                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                    System Prompt
                                </label>
                                <textarea className="input" rows={4} placeholder="Define the agent's personality and behavior..." value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })} />
                            </div>

                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                    First Message
                                </label>
                                <input className="input" placeholder="Agent's opening line" value={form.first_message} onChange={(e) => setForm({ ...form, first_message: e.target.value })} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                        Model
                                    </label>
                                    <select className="select" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
                                        {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                                        Voice
                                    </label>
                                    <select className="select" value={form.voice_id} onChange={(e) => setForm({ ...form, voice_id: e.target.value })}>
                                        {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                                <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={handleSave}>
                                    {editingAgent ? "Save Changes" : "Create Agent"}
                                </button>
                                <button className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
