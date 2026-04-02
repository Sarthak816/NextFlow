import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { hasCycle } from "@/lib/dag-utils";
import { type HandleDataType, isCompatible } from "@/lib/handle-types";
import { SAMPLE_NODES, SAMPLE_EDGES } from "@/lib/sample-workflow";

// We store node-specific data here.
export type WorkflowNodeData = {
  label: string;
  [key: string]: any; // Allow arbitrary data payload 
};

export type AppNode = Node<WorkflowNodeData>;

interface WorkflowState {
  nodes: AppNode[];
  edges: Edge[];
  selectedNodes: string[];
  executionStatus: Record<string, string>; // nodeId -> status
  undoStack: { nodes: AppNode[]; edges: Edge[] }[];
  redoStack: { nodes: AppNode[]; edges: Edge[] }[];
  id: string | null;
  name: string;
}

interface WorkflowActions {
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: AppNode) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  setExecutionStatus: (nodeId: string, status: string) => void;
  clearExecutionStatus: () => void;
  redo: () => void;
  saveStateToHistory: () => void;
  exportWorkflow: () => void;
  importWorkflow: (json: string) => void;
  setMetadata: (id: string | null, name: string) => void;
  loadRunResults: (runId: string) => Promise<void>;
}

export const useWorkflowStore = create<WorkflowState & WorkflowActions>()(
  immer((set, get) => ({
    nodes: SAMPLE_NODES,
    edges: SAMPLE_EDGES,
    selectedNodes: [],
    executionStatus: {},
    undoStack: [],
    redoStack: [],
    id: null,
    name: "New Workflow",

    onNodesChange: (changes) => {
      set((state) => {
        const hasAddOrRemove = changes.some(c => c.type === 'add' || c.type === 'remove');
        if (hasAddOrRemove) {
           // We might want to save to history before removing
        }
        state.nodes = applyNodeChanges(changes, state.nodes);
      });
    },
    onEdgesChange: (changes) => {
      set((state) => {
        state.edges = applyEdgeChanges(changes, state.edges);
      });
    },
    onConnect: (connection) => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (!source || !target || !sourceHandle || !targetHandle) return;

      const sourceNode = get().nodes.find(n => n.id === source);
      const targetNode = get().nodes.find(n => n.id === target);

      if (!sourceNode || !targetNode) return;

      // Type checking validation could go here if we extract the types from the IDs or a schema mapping.
      // For now, assume compatibility is checked at UI level or simplified here:
      
      const newEdges = addEdge({ ...connection, animated: true, className: "stroke-indigo-500" }, get().edges);

      if (hasCycle(get().nodes, newEdges)) {
        console.warn("Connection would create a cycle.");
        return; // Reject connection
      }

      get().saveStateToHistory();
      set((state) => {
        state.edges = newEdges;
      });
    },
    setNodes: (nodes) => set((state) => { state.nodes = nodes; }),
    setEdges: (edges) => set((state) => { state.edges = edges; }),
    addNode: (node) => {
      get().saveStateToHistory();
      set((state) => {
        state.nodes.push(node);
      });
    },
    updateNodeData: (nodeId, data) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (node) {
          node.data = { ...node.data, ...data };
        }
      });
    },
    setExecutionStatus: (nodeId, status) => {
      set((state) => {
        state.executionStatus[nodeId] = status;
      });
    },
    clearExecutionStatus: () => {
      set((state) => {
        state.executionStatus = {};
      });
    },
    saveStateToHistory: () => {
      set((state) => {
        state.undoStack.push({
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges)),
        });
        state.redoStack = []; // Clear redo on new action
      });
    },
    undo: () => {
      set((state) => {
        if (state.undoStack.length === 0) return;
        const prevState = state.undoStack.pop()!;
        state.redoStack.push({
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges)),
        });
        state.nodes = prevState.nodes;
        state.edges = prevState.edges;
      });
    },
    redo: () => {
      set((state) => {
        if (state.redoStack.length === 0) return;
        const nextState = state.redoStack.pop()!;
        state.undoStack.push({
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges)),
        });
        state.nodes = nextState.nodes;
        state.edges = nextState.edges;
      });
    },
    exportWorkflow: () => {
      const { nodes, edges } = get();
      const workflow = { nodes, edges };
      const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `workflow-${Date.now()}.json`;
      link.click();
    },
    importWorkflow: (json) => {
      try {
        const { nodes, edges } = JSON.parse(json);
        get().saveStateToHistory();
        set((state) => {
          state.nodes = nodes;
          state.edges = edges;
        });
      } catch (e) {
        console.error("Failed to import workflow", e);
      }
    },
    setMetadata: (id, name) => {
      set((state) => {
        state.id = id;
        state.name = name;
      });
    },
    loadRunResults: async (runId) => {
      try {
        const res = await fetch(`/api/workflows/runs/${runId}`);
        if (!res.ok) return;
        const run = await res.json();
        
        set((state) => {
          run.nodeExecutions.forEach((exec: any) => {
            const node = state.nodes.find(n => n.id === exec.nodeId);
            if (node) {
              node.data = { ...node.data, output: exec.output };
            }
          });
        });
      } catch (err) {
        console.error("Load results failed", err);
      }
    }
  }))
);
