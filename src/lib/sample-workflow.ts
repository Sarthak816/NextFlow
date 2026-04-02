import type { AppNode } from "@/store/workflow-store";
import type { Edge } from "@xyflow/react";

export const SAMPLE_NODES: AppNode[] = [
  {
    id: "upload-image-1",
    type: "uploadImageNode",
    position: { x: 100, y: 100 },
    data: { label: "Upload Product Image", imageUrl: "https://picsum.photos/seed/headphones/400/300" },
  },
  {
    id: "crop-image-1",
    type: "cropImageNode",
    position: { x: 450, y: 100 },
    data: { label: "Crop Focus", width_percent: "80", height_percent: "80" },
  },
  {
    id: "text-sys-1",
    type: "textNode",
    position: { x: 100, y: 350 },
    data: { label: "System Prompt", text: "You are a professional marketing copywriter. Generate a compelling one-paragraph product description." },
  },
  {
    id: "text-user-1",
    type: "textNode",
    position: { x: 100, y: 550 },
    data: { label: "Product Details", text: "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design." },
  },
  {
    id: "llm-node-1",
    type: "llmNode",
    position: { x: 800, y: 350 },
    data: { label: "Generate Description", model: "gemini-1.5-pro", output: "Experience pure audio bliss with our new Wireless Bluetooth Headphones..." },
  },
  {
    id: "upload-video-1",
    type: "uploadVideoNode",
    position: { x: 100, y: 750 },
    data: { label: "Upload Demo Video", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  },
  {
    id: "extract-frame-1",
    type: "extractFrameNode",
    position: { x: 450, y: 750 },
    data: { label: "Extract Mid-Frame", timestamp: "50%" },
  },
  {
    id: "text-sys-2",
    type: "textNode",
    position: { x: 800, y: 700 },
    data: { label: "Social Media Manager", text: "You are a social media manager. Create a tweet-length marketing post based on the product image and video frame." },
  },
  {
    id: "llm-node-2",
    type: "llmNode",
    position: { x: 1200, y: 500 },
    data: { label: "Final Marketing Post", model: "gemini-1.5-flash", output: "Level up your audio game! 🎧 Our new Wireless Bluetooth Headphones feature noise cancellation and a 30-hour battery. Perfect for on-the-go! #AudioTech #WirelessAudio" },
  }
];

export const SAMPLE_EDGES: Edge[] = [
  // Branch A: Image -> Crop -> LLM#1
  { id: "e-img-crop", source: "upload-image-1", target: "crop-image-1", sourceHandle: "output", targetHandle: "image_url", animated: true, className: "stroke-indigo-500" },
  { id: "e-crop-llm1", source: "crop-image-1", target: "llm-node-1", sourceHandle: "output", targetHandle: "images", animated: true, className: "stroke-indigo-500" },
  { id: "e-sys-llm1", source: "text-sys-1", target: "llm-node-1", sourceHandle: "output", targetHandle: "system_prompt", animated: true, className: "stroke-indigo-500" },
  { id: "e-user-llm1", source: "text-user-1", target: "llm-node-1", sourceHandle: "output", targetHandle: "user_message", animated: true, className: "stroke-indigo-500" },
  
  // Branch B: Video -> Extract Frame -> LLM#2
  { id: "e-vid-extract", source: "upload-video-1", target: "extract-frame-1", sourceHandle: "output", targetHandle: "video_url", animated: true, className: "stroke-indigo-500" },
  
  // Convergence: Both Branches -> LLM#2
  { id: "e-llm1-llm2", source: "llm-node-1", target: "llm-node-2", sourceHandle: "output", targetHandle: "user_message", animated: true, className: "stroke-indigo-500" },
  { id: "e-sys2-llm2", source: "text-sys-2", target: "llm-node-2", sourceHandle: "output", targetHandle: "system_prompt", animated: true, className: "stroke-indigo-500" },
  { id: "e-crop-llm2", source: "crop-image-1", target: "llm-node-2", sourceHandle: "output", targetHandle: "images", animated: true, className: "stroke-indigo-500" },
  { id: "e-extract-llm2", source: "extract-frame-1", target: "llm-node-2", sourceHandle: "output", targetHandle: "images", animated: true, className: "stroke-indigo-500" },
];
