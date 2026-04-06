import { ArrowRight, Zap, Target, History } from "lucide-react";
import { SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const { userId } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000] text-white px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Content */}
      <div className="z-10 max-w-4xl text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111] border border-[#222] text-xs font-medium text-indigo-400 mb-8 animate-fade-in">
          <Zap className="w-3 h-3 fill-current" />
          Powered by Gemini 1.5 Pro & Trigger.dev v3
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-[#888] bg-clip-text text-transparent">
          NextFlow: Automate <br/>Media-Driven Workflows
        </h1>
        
        <p className="text-lg text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Unlock the full potential of multimodal AI with pixel-perfect Krea.ai visuals. 
          Connect your media, crop, extract, and generate professional marketing content in one unified flow.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          {userId ? (
            <button 
              onClick={onEnter}
              className="flex items-center gap-2 px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all transform hover:scale-105"
            >
              Enter Workspace <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
             <div className="flex items-center gap-2 px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 cursor-pointer">
               <SignInButton forceRedirectUrl="/" />
             </div>
          )}
          <a
            href="https://github.com/Sarthak816/NextFlow"
            target="_blank"
            className="flex items-center gap-2 px-8 py-3.5 bg-[#111] border border-[#222] text-white font-semibold rounded-full hover:bg-[#1a1a1a] transition-all"
          >
            Read Documentation
          </a>
        </div>
      </div>

      {/* Directional Flow Visualization */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="p-6 rounded-2xl bg-[#080808] border border-[#111] hover:border-[#222] transition-colors relative group">
          <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center text-blue-400 mb-4">
             <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">1. Input Media</h3>
          <p className="text-sm text-gray-400">Upload high-res images or videos directly via Transloadit. Pre-process them right on the canvas.</p>
          <div className="absolute top-1/2 -right-4 hidden md:block text-gray-600 animate-pulse group-hover:text-indigo-500 transition-colors">
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#080808] border border-[#111] hover:border-[#222] transition-colors relative group">
          <div className="w-10 h-10 rounded-lg bg-orange-900/30 flex items-center justify-center text-orange-400 mb-4">
             <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">2. Processing</h3>
          <p className="text-sm text-gray-400">Crop, Extract, and Transform. All tasks run in parallel using high-performance background workers.</p>
          <div className="absolute top-1/2 -right-4 hidden md:block text-gray-600 animate-pulse group-hover:text-indigo-500 transition-colors text-right">
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#080808] border border-[#111] hover:border-[#222] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center text-green-400 mb-4">
             <History className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">3. Outputs & History</h3>
          <p className="text-sm text-gray-400">Save every result. Review execution history per node and export workflows as production-ready JSON.</p>
        </div>
      </div>
    </div>
  );
}
