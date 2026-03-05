"use client";

import { useState, useCallback } from "react";
import {
    ReactFlow,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Background,
    Controls,
    MiniMap,
    Handle,
    Position,
    type Node,
    type Edge,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Save, Play, Workflow, X, MessageSquare, Brain, Globe, GitBranch, StopCircle } from "lucide-react";

// ── Custom Nodes ──────────────────────────────────────────

function StartNode({ data }: { data: any }) {
    return (
        <div style={{ background: "linear-gradient(135deg, #00d68f, #00b894)", borderRadius: 12, padding: "12px 24px", color: "white", fontWeight: 700, fontSize: 14, textAlign: "center", minWidth: 120 }}>
            <div style={{ marginBottom: 4 }}>▶ Start</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{data.label || "Entry point"}</div>
            <Handle type="source" position={Position.Bottom} style={{ background: "#00d68f", width: 10, height: 10, border: "2px solid white" }} />
        </div>
    );
}

function PromptNode({ data }: { data: any }) {
    return (
        <div style={{ background: "#1e1e2a", border: "1px solid rgba(108,92,231,0.3)", borderRadius: 12, padding: 16, minWidth: 180 }}>
            <Handle type="target" position={Position.Top} style={{ background: "#6c5ce7", width: 8, height: 8 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <MessageSquare size={14} color="#6c5ce7" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#a29bfe" }}>Prompt</span>
            </div>
            <div style={{ fontSize: 12, color: "#8888a0", lineHeight: 1.4 }}>{data.label || "Say something..."}</div>
            <Handle type="source" position={Position.Bottom} style={{ background: "#6c5ce7", width: 8, height: 8 }} />
        </div>
    );
}

function LLMNode({ data }: { data: any }) {
    return (
        <div style={{ background: "#1e1e2a", border: "1px solid rgba(0,206,201,0.3)", borderRadius: 12, padding: 16, minWidth: 180 }}>
            <Handle type="target" position={Position.Top} style={{ background: "#00cec9", width: 8, height: 8 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Brain size={14} color="#00cec9" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#00cec9" }}>LLM</span>
            </div>
            <div style={{ fontSize: 12, color: "#8888a0" }}>{data.label || "AI Response"}</div>
            <div style={{ fontSize: 10, color: "#555568", marginTop: 4 }}>Model: {data.model || "gpt-4o-mini"}</div>
            <Handle type="source" position={Position.Bottom} style={{ background: "#00cec9", width: 8, height: 8 }} />
        </div>
    );
}

function DecisionNode({ data }: { data: any }) {
    return (
        <div style={{ background: "#1e1e2a", border: "1px solid rgba(253,203,110,0.3)", borderRadius: 12, padding: 16, minWidth: 180 }}>
            <Handle type="target" position={Position.Top} style={{ background: "#fdcb6e", width: 8, height: 8 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <GitBranch size={14} color="#fdcb6e" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fdcb6e" }}>Decision</span>
            </div>
            <div style={{ fontSize: 12, color: "#8888a0" }}>{data.label || "Check condition"}</div>
            <Handle type="source" position={Position.Bottom} id="yes" style={{ background: "#00d68f", width: 8, height: 8, left: "30%" }} />
            <Handle type="source" position={Position.Bottom} id="no" style={{ background: "#ff4757", width: 8, height: 8, left: "70%" }} />
        </div>
    );
}

function ApiCallNode({ data }: { data: any }) {
    return (
        <div style={{ background: "#1e1e2a", border: "1px solid rgba(116,185,255,0.3)", borderRadius: 12, padding: 16, minWidth: 180 }}>
            <Handle type="target" position={Position.Top} style={{ background: "#74b9ff", width: 8, height: 8 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Globe size={14} color="#74b9ff" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#74b9ff" }}>API Call</span>
            </div>
            <div style={{ fontSize: 12, color: "#8888a0" }}>{data.label || "External request"}</div>
            <div style={{ fontSize: 10, color: "#555568", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{data.url || "GET /api/..."}</div>
            <Handle type="source" position={Position.Bottom} style={{ background: "#74b9ff", width: 8, height: 8 }} />
        </div>
    );
}

function EndNode({ data }: { data: any }) {
    return (
        <div style={{ background: "linear-gradient(135deg, #ff4757, #e17055)", borderRadius: 12, padding: "12px 24px", color: "white", fontWeight: 700, fontSize: 14, textAlign: "center", minWidth: 120 }}>
            <Handle type="target" position={Position.Top} style={{ background: "#ff4757", width: 10, height: 10, border: "2px solid white" }} />
            <div>■ End</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{data.label || "End flow"}</div>
        </div>
    );
}

const nodeTypes = {
    start: StartNode,
    prompt: PromptNode,
    llm: LLMNode,
    decision: DecisionNode,
    api_call: ApiCallNode,
    end: EndNode,
};

// ── Initial Flow ──────────────────────────────────────────

const initialNodes: Node[] = [
    { id: "1", type: "start", position: { x: 300, y: 50 }, data: { label: "Call begins" } },
    { id: "2", type: "prompt", position: { x: 280, y: 180 }, data: { label: "Hello! How can I help you today?" } },
    { id: "3", type: "llm", position: { x: 280, y: 320 }, data: { label: "Process user input", model: "gpt-4o-mini" } },
    { id: "4", type: "decision", position: { x: 280, y: 460 }, data: { label: "Needs booking?" } },
    { id: "5", type: "api_call", position: { x: 100, y: 600 }, data: { label: "Check calendar", url: "GET /calendar" } },
    { id: "6", type: "prompt", position: { x: 450, y: 600 }, data: { label: "Anything else I can help with?" } },
    { id: "7", type: "end", position: { x: 300, y: 740 }, data: { label: "End call" } },
];

const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#6c5ce7" } },
    { id: "e2-3", source: "2", target: "3", style: { stroke: "#00cec9" } },
    { id: "e3-4", source: "3", target: "4", style: { stroke: "#fdcb6e" } },
    { id: "e4-5", source: "4", sourceHandle: "yes", target: "5", label: "Yes", style: { stroke: "#00d68f" } },
    { id: "e4-6", source: "4", sourceHandle: "no", target: "6", label: "No", style: { stroke: "#ff4757" } },
    { id: "e5-7", source: "5", target: "7", style: { stroke: "#74b9ff" } },
    { id: "e6-7", source: "6", target: "7", style: { stroke: "#6c5ce7" } },
];

// ── Main Component ────────────────────────────────────────

export default function WorkflowsPage() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: "#6c5ce7" } }, eds)),
        []
    );

    const addNode = (type: string) => {
        const labels: Record<string, string> = {
            start: "New start",
            prompt: "Enter message...",
            llm: "AI Response",
            decision: "Check condition",
            api_call: "API Request",
            end: "End flow",
        };
        const newNode: Node = {
            id: String(Date.now()),
            type,
            position: { x: 300 + Math.random() * 100, y: 300 + Math.random() * 100 },
            data: { label: labels[type] || "New node" },
        };
        setNodes((prev) => [...prev, newNode]);
    };

    return (
        <div className="animate-fade-in" style={{ height: "calc(100vh - 64px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Workflow Builder</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                        Visually design conversation flows for your AI agents.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-secondary"><Save size={16} /> Save</button>
                    <button className="btn-primary"><Play size={16} /> Run</button>
                </div>
            </div>

            <div style={{ display: "flex", gap: 16, height: "calc(100% - 80px)" }}>
                {/* Node Palette */}
                <div className="card" style={{ width: 180, padding: 16, display: "flex", flexDirection: "column", gap: 8, height: "100%", overflow: "auto" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                        Add Nodes
                    </div>
                    {[
                        { type: "start", label: "Start", icon: <Play size={14} />, color: "#00d68f" },
                        { type: "prompt", label: "Prompt", icon: <MessageSquare size={14} />, color: "#6c5ce7" },
                        { type: "llm", label: "LLM", icon: <Brain size={14} />, color: "#00cec9" },
                        { type: "decision", label: "Decision", icon: <GitBranch size={14} />, color: "#fdcb6e" },
                        { type: "api_call", label: "API Call", icon: <Globe size={14} />, color: "#74b9ff" },
                        { type: "end", label: "End", icon: <StopCircle size={14} />, color: "#ff4757" },
                    ].map(({ type, label, icon, color }) => (
                        <button
                            key={type}
                            onClick={() => addNode(type)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 12px",
                                background: `${color}10`,
                                border: `1px solid ${color}30`,
                                borderRadius: 10,
                                color: color,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            {icon} {label}
                        </button>
                    ))}
                </div>

                {/* Flow Canvas */}
                <div style={{ flex: 1, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                        style={{ background: "#0d0d14" }}
                    >
                        <Background gap={20} size={1} color="rgba(255,255,255,0.03)" />
                        <Controls style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                        <MiniMap
                            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8 }}
                            nodeColor="#6c5ce7"
                            maskColor="rgba(0,0,0,0.7)"
                        />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}
