"""Workflow execution engine — traverses visual flow graphs."""

import uuid
from typing import Any
from app.services.ai_engine import ai_engine


class WorkflowEngine:
    """
    Executes visual conversation workflows built in the React Flow editor.
    Traverses a directed graph of nodes and executes each node's logic.

    Node types:
    - start: Entry point
    - prompt: Display a static message
    - llm: Query the AI engine
    - decision: Conditional branching
    - api_call: Make an external API request
    - end: Terminal node
    """

    async def execute(self, flow_data: dict, input_text: str, variables: dict) -> dict:
        """
        Execute a workflow from start to end.
        Returns: {"output": str, "steps": list[dict]}
        """
        nodes = {n["id"]: n for n in flow_data.get("nodes", [])}
        edges = flow_data.get("edges", [])
        steps = []
        output = ""

        # Build adjacency map (source -> list of edges)
        adj: dict[str, list[dict]] = {}
        for edge in edges:
            src = edge.get("source", "")
            adj.setdefault(src, []).append(edge)

        # Find start node
        start_node = None
        for node in nodes.values():
            if node.get("type") == "start" or node.get("data", {}).get("type") == "start":
                start_node = node
                break

        if not start_node:
            return {"output": "No start node found in workflow.", "steps": []}

        # Execute flow
        current_id = start_node["id"]
        context = {"input": input_text, "variables": variables, "history": []}
        max_steps = 50  # Safety limit

        for _ in range(max_steps):
            if current_id not in nodes:
                break

            node = nodes[current_id]
            node_type = node.get("type") or node.get("data", {}).get("type", "unknown")
            node_data = node.get("data", {})

            step_result = await self._execute_node(node_type, node_data, context)
            steps.append({
                "node_id": current_id,
                "type": node_type,
                "label": node_data.get("label", ""),
                "result": step_result.get("output", ""),
            })

            if step_result.get("output"):
                output = step_result["output"]
                context["history"].append(output)

            # End node
            if node_type == "end":
                break

            # Find next node
            outgoing = adj.get(current_id, [])
            if not outgoing:
                break

            # For decision nodes, pick the matching edge
            if node_type == "decision" and len(outgoing) > 1:
                current_id = self._pick_decision_edge(outgoing, step_result, nodes)
            else:
                current_id = outgoing[0].get("target", "")

        return {"output": output, "steps": steps}

    async def _execute_node(self, node_type: str, data: dict, context: dict) -> dict:
        """Execute a single workflow node."""
        if node_type == "start":
            return {"output": context["input"]}

        elif node_type == "prompt":
            text = data.get("text", data.get("label", ""))
            # Replace variables
            for key, value in context.get("variables", {}).items():
                text = text.replace(f"{{{{{key}}}}}", str(value))
            return {"output": text}

        elif node_type == "llm":
            prompt = data.get("prompt", "Respond to the user.")
            messages = [{"role": "user", "content": context["input"]}]
            if context.get("history"):
                messages = [{"role": "assistant", "content": h} for h in context["history"][-3:]] + messages

            result = await ai_engine.chat(
                messages=messages,
                model=data.get("model", "gpt-4o-mini"),
                system_prompt=prompt,
                temperature=data.get("temperature", 0.7),
            )
            return {"output": result["content"]}

        elif node_type == "decision":
            condition = data.get("condition", "")
            value = context.get("input", "")
            # Simple keyword matching for MVP
            return {"output": value, "match": condition.lower() in value.lower()}

        elif node_type == "api_call":
            import httpx
            url = data.get("url", "")
            method = data.get("method", "GET").upper()
            if url:
                try:
                    async with httpx.AsyncClient() as client:
                        resp = await client.request(method, url, timeout=10.0)
                        return {"output": resp.text[:1000]}
                except Exception as e:
                    return {"output": f"API call error: {str(e)}"}
            return {"output": "No URL configured"}

        elif node_type == "end":
            return {"output": context.get("history", [""])[-1] if context.get("history") else ""}

        return {"output": ""}

    def _pick_decision_edge(self, edges: list[dict], result: dict, nodes: dict) -> str:
        """Pick the appropriate edge based on decision result."""
        match = result.get("match", False)
        for edge in edges:
            label = edge.get("label", "").lower()
            if match and label in ("yes", "true", "match"):
                return edge["target"]
            if not match and label in ("no", "false", "nomatch", "default"):
                return edge["target"]
        # Default to first edge
        return edges[0]["target"]
