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
import { SAMPLE_NODES, SAMPLE_EDGES } from "@/lib/sample-workflow";

export type WorkflowNodeData = {
  label: string;
  [key: string]: any; 
};

export type AppNode = Node<WorkflowNodeData>;

interface WorkflowState {
  nodes: AppNode[];
  edges: Edge[];
  selectedNodes: string[];
  executionStatus: Record<string, string>; 
  undoStack: { nodes: AppNode[]; edges: Edge[] }[];
  redoStack: { nodes: AppNode[]; edges: Edge[] }[];
  id: string | null;
  name: string;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
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
  undo: () => void;
  redo: () => void;
  saveStateToHistory: () => void;
  exportWorkflow: () => void;
  importWorkflow: (json: string) => void;
  setMetadata: (id: string | null, name: string) => void;
  loadRunResults: (runId: string) => Promise<void>;
  toggleLeftSidebar: (collapsed?: boolean) => void;
  toggleRightSidebar: (collapsed?: boolean) => void;
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
    leftSidebarCollapsed: false,
    rightSidebarCollapsed: false,

    onNodesChange: (changes) => {
      set((state) => {
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
      
      const newEdges = addEdge({ ...connection, animated: true, className: "stroke-indigo-500" }, get().edges);
      if (hasCycle(get().nodes, newEdges)) return;

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
        state.redoStack = []; 
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
      const workflow = { nodes: get().nodes, edges: get().edges };
      const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
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
              const outputVal = exec.output?.result;
              if (node.type === 'llmNode') {
                node.data = { ...node.data, output: outputVal };
              } else if (node.type === 'uploadImageNode' || node.type === 'cropNode' || node.type === 'extractFrameNode') {
                node.data = { ...node.data, imageUrl: outputVal };
              } else if (node.type === 'uploadVideoNode') {
                node.data = { ...node.data, videoUrl: outputVal };
              } else if (node.type === 'textNode') {
                node.data = { ...node.data, text: outputVal };
              }
            }
          });
        });
      } catch (err) {
        console.error("Load results failed", err);
      }
    },
    toggleLeftSidebar: (collapsed) => set((state) => { 
        state.leftSidebarCollapsed = collapsed !== undefined ? collapsed : !state.leftSidebarCollapsed;
    }),
    toggleRightSidebar: (collapsed) => set((state) => { 
        state.rightSidebarCollapsed = collapsed !== undefined ? collapsed : !state.rightSidebarCollapsed;
    }),
  }))
);
