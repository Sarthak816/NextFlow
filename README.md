# NextFlow: Pixel-Perfect Krea.ai LLM Workflow Builder

NextFlow is a production-grade visual canvas for orchestrating complex LLM and media processing workflows. Built with **React Flow**, **Next.js 15**, and **Trigger.dev**, it mirrors the sophisticated dark aesthetic and parallel execution core of Krea.ai.

## 🚀 Key Features

- **Pixel-Perfect Canvas**: Sleek dark-mode interface with glassmorphic nodes, animated edges, and real-time execution glow effects.
- **Advanced Node Library**:
  - `TextNode`: Pure text input for prompts and data.
  - `UploadImageNode`: Integrated stylized image previewers.
  - `UploadVideoNode`: Stylized video previewers.
  - `LLMNode`: Multi-handle node supporting Google Gemini (Pro/Flash) for text and vision tasks.
  - `CropImageNode`: Parameter-driven image manipulation.
  - `ExtractFrameNode`: Video timestamp frame extraction.
- **DAG Execution Engine**:
  - **Cycle Detection**: Prevents infinite loops during design time.
  - **Parallel Processing**: Automatically calculates execution levels for concurrent node execution via Trigger.dev.
  - **Type Safety**: Enforced handle compatibility matrix (e.g., Image Output -> Image Input only).
- **Production Infrastructure**:
  - **Full-Stack**: Next.js 15 (App Router) + Tailwind CSS 4.
  - **Authentication**: Secure login/signup integration with Clerk.
  - **Database Persistence**: Persistent workflow state and run history using Prisma and Neon PostgreSQL.
  - **Background Jobs**: Heavy lifting (AI calls, media processing) handled asynchronously by Trigger.dev.

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Visuals**: @xyflow/react (React Flow), Tailwind CSS 4, Lucide React
- **Auth**: Clerk
- **AI**: Google Generative AI (Gemini)
- **Database**: Prisma + Neon (PostgreSQL)
- **Tasks**: Trigger.dev v3

## 🚦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd NextFlow
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Copy the keys from `.env.example` into a new `.env` file. You will need:
   - Neon PostgreSQL URL
   - Clerk API Keys
   - Google Gemini API Key
   - Trigger.dev Project ID and Secret

4. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Application**:
   Open two terminal windows:
   - **Terminal 1**: `npm run dev` (Starts frontend on :3000)
   - **Terminal 2**: `npx trigger.dev@latest dev` (Starts background worker)

6. **Go to [http://localhost:3000](http://localhost:3000)** and sign in!
