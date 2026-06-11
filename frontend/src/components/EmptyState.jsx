import { Trophy, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function EmptyState({
  title = "No Projects Evaluated Yet",
  description = "Get started by submitting your first project. JudgeLens AI will analyze your repository, presentation slides, and user interface screenshots instantly.",
  actionText = "Submit Project",
  actionLink = "/submit"
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden my-6">
      {/* Background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 text-indigo-400 mb-6 shadow-xl shadow-black/20">
          <Trophy className="w-8 h-8 text-indigo-400/80" />
        </div>

        <h3 className="text-xl font-semibold text-slate-100 tracking-tight">
          {title}
        </h3>
        
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          {description}
        </p>

        {actionLink && (
          <div className="mt-8">
            <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-600/20 font-semibold px-6 py-2.5 rounded-xl transition duration-200">
              <Link to={actionLink} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {actionText}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
