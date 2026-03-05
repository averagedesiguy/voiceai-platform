"use client";

import Link from "next/link";
import {
  Phone,
  MessageSquare,
  Workflow,
  Zap,
  Shield,
  Code,
  ChevronRight,
  Play,
  Bot,
  Activity,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* ── Nav ───────────────────────────────────────────── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 48px",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(10, 10, 15, 0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={20} color="white" />
          </div>
          <span
            style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}
          >
            VoiceAI
          </span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <a href="#features" className="btn-ghost">
            Features
          </a>
          <a href="#pricing" className="btn-ghost">
            Pricing
          </a>
          <a href="#api" className="btn-ghost">
            API Docs
          </a>
          <Link href="/login" className="btn-secondary">
            Log In
          </Link>
          <Link href="/login?mode=register" className="btn-primary">
            Get Started <ChevronRight size={16} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        style={{
          padding: "120px 48px 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="animate-fade-in" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(108,92,231,0.1)",
              border: "1px solid rgba(108,92,231,0.2)",
              borderRadius: 20,
              padding: "6px 16px",
              marginBottom: 24,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent-light)",
            }}
          >
            <Activity size={14} /> Now in Public Beta
          </div>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 24,
              maxWidth: 800,
              margin: "0 auto 24px",
            }}
          >
            The AI Communication{" "}
            <span className="gradient-text">Platform</span> for Businesses
          </h1>
          <p
            style={{
              fontSize: 20,
              color: "var(--text-secondary)",
              maxWidth: 600,
              margin: "0 auto 40px",
              lineHeight: 1.6,
            }}
          >
            Build and deploy intelligent voice agents, chat bots, and workflow
            automations in minutes. One platform. Infinite possibilities.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Link href="/login?mode=register" className="btn-primary" style={{ padding: "14px 32px", fontSize: 16 }}>
              Start Building Free <ChevronRight size={18} />
            </Link>
            <button className="btn-secondary" style={{ padding: "14px 32px", fontSize: 16 }}>
              <Play size={18} /> Watch Demo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          className="animate-slide-up"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 60,
            marginTop: 80,
            paddingTop: 40,
            borderTop: "1px solid var(--border)",
          }}
        >
          {[
            { value: "10M+", label: "API Calls" },
            { value: "50K+", label: "Voice Agents" },
            { value: "<500ms", label: "Latency" },
            { value: "99.9%", label: "Uptime" },
          ].map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section
        id="features"
        style={{ padding: "80px 48px", maxWidth: 1200, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
            Everything You Need
          </h2>
          <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto" }}>
            A complete platform for building AI-powered communication at scale.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {[
            {
              icon: <Phone size={24} />,
              title: "AI Phone Calls",
              desc: "Deploy voice agents that make and receive calls with human-like conversations. Sub-500ms latency.",
              color: "#6c5ce7",
            },
            {
              icon: <MessageSquare size={24} />,
              title: "Chat Agents",
              desc: "Build intelligent chatbots with context awareness, memory, and tool calling capabilities.",
              color: "#00cec9",
            },
            {
              icon: <Workflow size={24} />,
              title: "Visual Workflows",
              desc: "Design conversation flows visually with our drag-and-drop builder. No code required.",
              color: "#fd79a8",
            },
            {
              icon: <Code size={24} />,
              title: "Developer APIs",
              desc: "RESTful APIs, WebSockets, webhooks, and SDKs in Python, Node.js, and more.",
              color: "#fdcb6e",
            },
            {
              icon: <Bot size={24} />,
              title: "Knowledge Base (RAG)",
              desc: "Upload documents and websites. Your agents answer questions from your data.",
              color: "#74b9ff",
            },
            {
              icon: <Shield size={24} />,
              title: "Enterprise Security",
              desc: "SOC 2, GDPR compliant. API key management, rate limiting, and audit logs.",
              color: "#00d68f",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="card"
              style={{ padding: 32, cursor: "default" }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${f.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: f.color,
                  marginBottom: 20,
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: "var(--text-primary)",
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Code Example ──────────────────────────────────── */}
      <section
        id="api"
        style={{
          padding: "80px 48px",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
            Build with a Few Lines of Code
          </h2>
          <p style={{ fontSize: 18, color: "var(--text-secondary)" }}>
            Integrate AI communication into your app in minutes.
          </p>
        </div>
        <div className="code-block" style={{ fontSize: 14, lineHeight: 1.8 }}>
          <div style={{ color: "var(--text-muted)", marginBottom: 8 }}>
            # Python SDK Example
          </div>
          <div>
            <span style={{ color: "#fd79a8" }}>from</span>{" "}
            <span style={{ color: "#a29bfe" }}>voiceai</span>{" "}
            <span style={{ color: "#fd79a8" }}>import</span> VoiceAI
          </div>
          <br />
          <div>
            client = VoiceAI(api_key=
            <span style={{ color: "#fdcb6e" }}>&quot;vai_your_key&quot;</span>)
          </div>
          <br />
          <div style={{ color: "var(--text-muted)" }}># Create an AI agent</div>
          <div>
            agent = client.agents.create(
          </div>
          <div style={{ paddingLeft: 24 }}>
            name=<span style={{ color: "#fdcb6e" }}>&quot;Sales Agent&quot;</span>,
          </div>
          <div style={{ paddingLeft: 24 }}>
            voice=<span style={{ color: "#fdcb6e" }}>&quot;nova&quot;</span>,
          </div>
          <div style={{ paddingLeft: 24 }}>
            model=<span style={{ color: "#fdcb6e" }}>&quot;gpt-4o&quot;</span>,
          </div>
          <div>)</div>
          <br />
          <div style={{ color: "var(--text-muted)" }}># Make a phone call</div>
          <div>
            call = client.calls.create(
          </div>
          <div style={{ paddingLeft: 24 }}>
            to=<span style={{ color: "#fdcb6e" }}>&quot;+44 7700 900000&quot;</span>,
          </div>
          <div style={{ paddingLeft: 24 }}>
            agent_id=agent.id,
          </div>
          <div>)</div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          padding: "80px 48px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ fontSize: 18, color: "var(--text-secondary)" }}>
            Start free. Scale as you grow.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {[
            {
              name: "Starter",
              price: "Free",
              desc: "Get started with AI agents",
              features: ["100 minutes/month", "2 agents", "Chat & voice", "Community support"],
              cta: "Start Free",
              highlight: false,
            },
            {
              name: "Pro",
              price: "$49",
              desc: "For growing businesses",
              features: [
                "5,000 minutes/month",
                "Unlimited agents",
                "Visual workflows",
                "Knowledge Base (RAG)",
                "Webhooks & API keys",
                "Priority support",
              ],
              cta: "Start Pro Trial",
              highlight: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              desc: "For large-scale operations",
              features: [
                "Unlimited minutes",
                "Custom models",
                "SLA guarantee",
                "Dedicated support",
                "SSO & SAML",
                "On-premise option",
              ],
              cta: "Contact Sales",
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className="card"
              style={{
                padding: 36,
                border: plan.highlight
                  ? "1px solid var(--accent)"
                  : undefined,
                boxShadow: plan.highlight ? "var(--shadow-glow)" : undefined,
                position: "relative",
                cursor: "default",
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--gradient-primary)",
                    color: "white",
                    padding: "4px 16px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                {plan.name}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginBottom: 16,
                }}
              >
                {plan.desc}
              </p>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  marginBottom: 4,
                }}
              >
                {plan.price}
                {plan.price !== "Free" && plan.price !== "Custom" && (
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 400,
                      color: "var(--text-muted)",
                    }}
                  >
                    /mo
                  </span>
                )}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  margin: "24px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: 14,
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ color: "var(--success)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={plan.highlight ? "btn-primary" : "btn-secondary"}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "40px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        <div>© 2026 VoiceAI Platform. All rights reserved.</div>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#" style={{ color: "var(--text-muted)" }}>
            Privacy
          </a>
          <a href="#" style={{ color: "var(--text-muted)" }}>
            Terms
          </a>
          <a href="#" style={{ color: "var(--text-muted)" }}>
            Status
          </a>
        </div>
      </footer>
    </div>
  );
}
