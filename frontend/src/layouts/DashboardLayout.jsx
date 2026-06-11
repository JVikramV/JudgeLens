import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/20 selection:text-indigo-300">
      {/* Premium background radial mesh glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-slate-900/40 blur-[120px] pointer-events-none -z-10" />
      
      {/* Global grid layout texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none -z-10" />

      {/* Top sticky navbar */}
      <Navbar />

      {/* Main page content wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10">
        {children}
      </main>
      
      {/* Fine-tuned footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} JudgeLens. Built with Google Gemini AI for Hackathon Judging.</p>
          <div className="flex items-center gap-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-400">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
