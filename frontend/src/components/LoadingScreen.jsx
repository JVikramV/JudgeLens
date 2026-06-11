import { Loader2, Sparkles } from "lucide-react";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl relative overflow-hidden select-none">
      {/* Decorative gradient blur background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center z-10">
        <div className="relative mb-6">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md animate-pulse duration-1000" />
          
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-950 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-8 h-8 animate-pulse text-indigo-400" />
          </div>
          
          <Loader2 className="absolute -bottom-1 -right-1 w-6 h-6 text-indigo-500 animate-spin" />
        </div>

        <h3 className="text-lg font-semibold text-slate-100 tracking-wide">
          JudgeLens
        </h3>
        <p className="mt-2 text-sm text-slate-400 font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}
