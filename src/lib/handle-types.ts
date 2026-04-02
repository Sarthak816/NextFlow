// Handle type definitions for type-safe connections between nodes
export type HandleDataType = "text" | "image" | "video" | "number";

export interface HandleCompatibility {
  [sourceType: string]: HandleDataType[];
}

// Which source types can connect to which target handle types
export const HANDLE_COMPATIBILITY: HandleCompatibility = {
  text: ["text", "number"],
  image: ["image"],
  video: ["video"],
  number: ["text", "number"],
};

export function isCompatible(
  sourceType: HandleDataType,
  targetType: HandleDataType
): boolean {
  return HANDLE_COMPATIBILITY[sourceType]?.includes(targetType) ?? false;
}

// Node type definitions
export type NodeType =
  | "textNode"
  | "uploadImageNode"
  | "uploadVideoNode"
  | "llmNode"
  | "cropImageNode"
  | "extractFrameNode";

export interface NodeHandleDefinition {
  id: string;
  label: string;
  type: HandleDataType;
  required?: boolean;
  multiple?: boolean;
}

export const NODE_INPUT_HANDLES: Record<NodeType, NodeHandleDefinition[]> = {
  textNode: [],
  uploadImageNode: [],
  uploadVideoNode: [],
  llmNode: [
    { id: "system_prompt", label: "System Prompt", type: "text", required: false },
    { id: "user_message", label: "User Message", type: "text", required: true },
    { id: "images", label: "Images", type: "image", required: false, multiple: true },
  ],
  cropImageNode: [
    { id: "image_url", label: "Image URL", type: "image", required: true },
    { id: "x_percent", label: "X %", type: "number", required: false },
    { id: "y_percent", label: "Y %", type: "number", required: false },
    { id: "width_percent", label: "Width %", type: "number", required: false },
    { id: "height_percent", label: "Height %", type: "number", required: false },
  ],
  extractFrameNode: [
    { id: "video_url", label: "Video URL", type: "video", required: true },
    { id: "timestamp", label: "Timestamp", type: "text", required: false },
  ],
};

export const NODE_OUTPUT_HANDLES: Record<NodeType, NodeHandleDefinition[]> = {
  textNode: [{ id: "output", label: "Text", type: "text" }],
  uploadImageNode: [{ id: "output", label: "Image URL", type: "image" }],
  uploadVideoNode: [{ id: "output", label: "Video URL", type: "video" }],
  llmNode: [{ id: "output", label: "Response", type: "text" }],
  cropImageNode: [{ id: "output", label: "Cropped Image", type: "image" }],
  extractFrameNode: [{ id: "output", label: "Frame Image", type: "image" }],
};
