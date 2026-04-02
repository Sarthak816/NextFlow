import type { Node, Edge } from "@xyflow/react";

export interface ExecutionGroup {
  nodes: string[];
  level: number;
}

/**
 * Topological sort returning nodes level by level (parallel groups)
 */
export function getExecutionPlan(
  nodes: Node[],
  edges: Edge[],
  targetNodeIds?: string[]
): ExecutionGroup[] {
  const nodeIds = nodes.map((n) => n.id);
  const relevantIds = targetNodeIds ?? nodeIds;

  // Build adjacency and in-degree maps
  const inDegree: Record<string, number> = {};
  const dependsOn: Record<string, string[]> = {};
  const dependedBy: Record<string, string[]> = {};

  for (const id of relevantIds) {
    inDegree[id] = 0;
    dependsOn[id] = [];
    dependedBy[id] = [];
  }

  for (const edge of edges) {
    if (relevantIds.includes(edge.source) && relevantIds.includes(edge.target)) {
      inDegree[edge.target] = (inDegree[edge.target] ?? 0) + 1;
      dependsOn[edge.target].push(edge.source);
      dependedBy[edge.source].push(edge.target);
    }
  }

  // Kahn's algorithm with levels
  const groups: ExecutionGroup[] = [];
  let queue = relevantIds.filter((id) => inDegree[id] === 0);
  let level = 0;

  while (queue.length > 0) {
    groups.push({ nodes: [...queue], level });
    const nextQueue: string[] = [];
    for (const id of queue) {
      for (const dep of dependedBy[id] ?? []) {
        inDegree[dep]--;
        if (inDegree[dep] === 0) nextQueue.push(dep);
      }
    }
    queue = nextQueue;
    level++;
  }

  return groups;
}

/**
 * Detect cycles in the graph (for DAG validation)
 */
export function hasCycle(nodes: Node[], edges: Edge[]): boolean {
  const nodeIds = nodes.map((n) => n.id);
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const children: Record<string, string[]> = {};

  for (const id of nodeIds) children[id] = [];
  for (const e of edges) {
    if (children[e.source]) children[e.source].push(e.target);
  }

  function dfs(id: string): boolean {
    visited.add(id);
    inStack.add(id);
    for (const child of children[id] ?? []) {
      if (!visited.has(child)) {
        if (dfs(child)) return true;
      } else if (inStack.has(child)) {
        return true;
      }
    }
    inStack.delete(id);
    return false;
  }

  for (const id of nodeIds) {
    if (!visited.has(id)) {
      if (dfs(id)) return true;
    }
  }
  return false;
}

/**
 * Get all upstream node IDs for a given node
 */
export function getUpstreamNodeIds(
  nodeId: string,
  edges: Edge[]
): string[] {
  const upstream = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of edges) {
      if (edge.target === current && !upstream.has(edge.source)) {
        upstream.add(edge.source);
        queue.push(edge.source);
      }
    }
  }
  return [...upstream];
}

/**
 * Get edge handles that are connected TO a given node's input handles
 */
export function getConnectedInputHandles(
  nodeId: string,
  edges: Edge[]
): Set<string> {
  const connected = new Set<string>();
  for (const edge of edges) {
    if (edge.target === nodeId && edge.targetHandle) {
      connected.add(edge.targetHandle);
    }
  }
  return connected;
}
