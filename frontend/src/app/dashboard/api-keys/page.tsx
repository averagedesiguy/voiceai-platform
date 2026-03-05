"use client";

import { useState } from "react";
import { Key, Plus, Copy, Trash2, Check, X, Code } from "lucide-react";

interface ApiKeyItem {
    id: string;
    name: string;
    key_prefix: string;
    permissions: string[];
    is_active: boolean;
    last_used: string | null;
    created_at: string;
}

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKeyItem[]>([
        { id: "1", name: "Production Key", key_prefix: "vai_aBcDeFgH", permissions: ["read", "write"], is_active: true, last_used: "2 hours ago", created_at: "2026-02-15" },
        { id: "2", name: "Staging Key", key_prefix: "vai_xYzAbCdE", permissions: ["read", "write"], is_active: true, last_used: "1 day ago", created_at: "2026-02-20" },
        { id: "3", name: "Read-Only Monitor", key_prefix: "vai_mNoPqRsT", permissions: ["read"], is_active: true, last_used: "5 min ago", created_at: "2026-03-01" },
    ]);

    const [showCreate, setShowCreate] = useState(false);
    const [newKey, setNewKey] = useState({ name: "", permissions: ["read", "write"] });
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCreate = () => {
        const fullKey = `vai_${Math.random().toString(36).substring(2, 34)}`;
        const newItem: ApiKeyItem = {
            id: String(Date.now()),
            name: newKey.name,
            key_prefix: fullKey.substring(0, 12),
            permissions: newKey.permissions,
            is_active: true,
            last_used: null,
            created_at: new Date().toISOString().split("T")[0],
        };
        setKeys((prev) => [newItem, ...prev]);
        setCreatedKey(fullKey);
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = (id: string) => {
        setKeys((prev) => prev.filter((k) => k.id !== id));
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>API Keys</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                        Manage API keys for programmatic access to the VoiceAI platform.
                    </p>
                </div>
                <button className="btn-primary" onClick={() => { setShowCreate(true); setCreatedKey(null); setNewKey({ name: "", permissions: ["read", "write"] }); }}>
                    <Plus size={18} /> Create API Key
                </button>
            </div>

            {/* Keys Table */}
            <div className="table-wrapper" style={{ marginBottom: 32 }}>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Key</th>
                            <th>Permissions</th>
                            <th>Status</th>
                            <th>Last Used</th>
                            <th>Created</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map((k) => (
                            <tr key={k.id}>
                                <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Key size={14} color="var(--accent)" />
                                        {k.name}
                                    </div>
                                </td>
                                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                                    {k.key_prefix}...
                                </td>
                                <td>
                                    {k.permissions.map((p) => (
                                        <span key={p} className="badge badge-info" style={{ marginRight: 4 }}>{p}</span>
                                    ))}
                                </td>
                                <td>
                                    <span className={`badge ${k.is_active ? "badge-success" : "badge-error"}`}>
                                        {k.is_active ? "active" : "revoked"}
                                    </span>
                                </td>
                                <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{k.last_used || "Never"}</td>
                                <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{k.created_at}</td>
                                <td>
                                    <button className="btn-ghost" style={{ padding: 6, color: "var(--error)" }} onClick={() => handleDelete(k.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Code Examples */}
            <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                    <Code size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
                    Quick Start
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    {[
                        {
                            lang: "Python",
                            code: `import requests\n\nheaders = {\n    "X-API-Key": "vai_your_key"\n}\n\n# Create an agent\nres = requests.post(\n    "http://localhost:8000/api/v1/agents",\n    headers=headers,\n    json={\n        "name": "My Agent",\n        "model": "gpt-4o-mini"\n    }\n)`,
                        },
                        {
                            lang: "Node.js",
                            code: `const response = await fetch(\n  "http://localhost:8000/api/v1/agents",\n  {\n    method: "POST",\n    headers: {\n      "X-API-Key": "vai_your_key",\n      "Content-Type": "application/json"\n    },\n    body: JSON.stringify({\n      name: "My Agent",\n      model: "gpt-4o-mini"\n    })\n  }\n);`,
                        },
                        {
                            lang: "cURL",
                            code: `curl -X POST \\\n  http://localhost:8000/api/v1/agents \\\n  -H "X-API-Key: vai_your_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "name": "My Agent",\n    "model": "gpt-4o-mini"\n  }'`,
                        },
                    ].map((ex) => (
                        <div key={ex.lang} className="card" style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-light)" }}>{ex.lang}</span>
                                <button
                                    className="btn-ghost"
                                    style={{ padding: 4, fontSize: 11 }}
                                    onClick={() => handleCopy(ex.code, ex.lang)}
                                >
                                    {copiedId === ex.lang ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                            </div>
                            <pre className="code-block" style={{ fontSize: 11, lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
                                {ex.code}
                            </pre>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        {!createdKey ? (
                            <>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                    <h2 style={{ fontSize: 20, fontWeight: 700 }}>Create API Key</h2>
                                    <button className="btn-ghost" onClick={() => setShowCreate(false)}><X size={20} /></button>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Key Name</label>
                                        <input className="input" placeholder="e.g. Production Key" value={newKey.name} onChange={(e) => setNewKey({ ...newKey, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Permissions</label>
                                        <div style={{ display: "flex", gap: 12 }}>
                                            {["read", "write"].map((perm) => (
                                                <label key={perm} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={newKey.permissions.includes(perm)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setNewKey({ ...newKey, permissions: [...newKey.permissions, perm] });
                                                            } else {
                                                                setNewKey({ ...newKey, permissions: newKey.permissions.filter((p) => p !== perm) });
                                                            }
                                                        }}
                                                    />
                                                    {perm}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <button className="btn-primary" style={{ justifyContent: "center" }} onClick={handleCreate}>
                                        Generate Key
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ textAlign: "center", padding: 20 }}>
                                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(0,214,143,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--success)" }}>
                                        <Check size={28} />
                                    </div>
                                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>API Key Created</h2>
                                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
                                        Copy this key now — it won&apos;t be shown again.
                                    </p>
                                    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                                        <input className="input" readOnly value={createdKey} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
                                        <button className="btn-primary" style={{ flexShrink: 0 }} onClick={() => handleCopy(createdKey, "created")}>
                                            {copiedId === "created" ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowCreate(false)}>
                                        Done
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
