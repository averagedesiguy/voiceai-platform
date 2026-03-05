"use client";

import { useState } from "react";
import { Brain, Upload, Search, File, Trash2, Plus, X } from "lucide-react";

interface KnowledgeBase {
    id: string;
    name: string;
    description: string;
    document_count: number;
    total_chunks: number;
    status: string;
}

export default function KnowledgePage() {
    const [kbs, setKbs] = useState<KnowledgeBase[]>([
        { id: "1", name: "Product Documentation", description: "Complete product docs and guides", document_count: 12, total_chunks: 340, status: "ready" },
        { id: "2", name: "FAQ Database", description: "Frequently asked questions and answers", document_count: 8, total_chunks: 156, status: "ready" },
        { id: "3", name: "Sales Playbook", description: "Sales scripts and objection handling", document_count: 5, total_chunks: 89, status: "processing" },
    ]);

    const [showCreate, setShowCreate] = useState(false);
    const [newKb, setNewKb] = useState({ name: "", description: "" });
    const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const handleCreate = () => {
        if (!newKb.name) return;
        setKbs((prev) => [
            ...prev,
            {
                id: String(Date.now()),
                name: newKb.name,
                description: newKb.description,
                document_count: 0,
                total_chunks: 0,
                status: "ready",
            },
        ]);
        setNewKb({ name: "", description: "" });
        setShowCreate(false);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Knowledge Base</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                        Upload documents to give your agents contextual knowledge (RAG).
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreate(true)}>
                    <Plus size={18} /> Create Knowledge Base
                </button>
            </div>

            {/* KB Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {kbs.map((kb) => (
                    <div
                        key={kb.id}
                        className="card"
                        style={{ padding: 24, cursor: "pointer" }}
                        onClick={() => setSelectedKb(kb)}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    background: "rgba(0,206,201,0.12)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#00cec9",
                                }}
                            >
                                <Brain size={22} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{kb.name}</h3>
                                <span className={`badge ${kb.status === "ready" ? "badge-success" : "badge-warning"}`}>
                                    {kb.status}
                                </span>
                            </div>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>{kb.description}</p>
                        <div style={{ display: "flex", gap: 20, fontSize: 13, color: "var(--text-muted)" }}>
                            <span><File size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />{kb.document_count} docs</span>
                            <span>{kb.total_chunks} chunks</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upload & Search Panel */}
            {selectedKb && (
                <div style={{ marginTop: 32 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{selectedKb.name}</h2>
                        <button className="btn-ghost" onClick={() => setSelectedKb(null)}>
                            <X size={18} /> Close
                        </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {/* Upload */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Upload Documents</h3>
                            <div
                                style={{
                                    border: "2px dashed var(--border)",
                                    borderRadius: 12,
                                    padding: 40,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                            >
                                <Upload size={32} color="var(--text-muted)" />
                                <p style={{ color: "var(--text-secondary)", marginTop: 12, fontSize: 14 }}>
                                    Drag &amp; drop files here, or click to browse
                                </p>
                                <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
                                    Supports PDF, DOCX, TXT, MD, CSV
                                </p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Test Query</h3>
                            <div style={{ position: "relative", marginBottom: 16 }}>
                                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input
                                    className="input"
                                    style={{ paddingLeft: 40 }}
                                    placeholder="Ask a question to test retrieval..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                                <Search size={16} /> Search Knowledge Base
                            </button>
                            {searchQuery && (
                                <div style={{ marginTop: 16, padding: 16, background: "var(--bg-secondary)", borderRadius: 8, fontSize: 13, color: "var(--text-muted)" }}>
                                    Vector search results will appear here when the embedding service is configured.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Create Knowledge Base</h2>
                            <button className="btn-ghost" onClick={() => setShowCreate(false)}><X size={20} /></button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Name</label>
                                <input className="input" placeholder="e.g. Product Documentation" value={newKb.name} onChange={(e) => setNewKb({ ...newKb, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Description</label>
                                <textarea className="input" rows={3} placeholder="What knowledge does this contain?" value={newKb.description} onChange={(e) => setNewKb({ ...newKb, description: e.target.value })} />
                            </div>
                            <button className="btn-primary" style={{ justifyContent: "center" }} onClick={handleCreate}>Create Knowledge Base</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
