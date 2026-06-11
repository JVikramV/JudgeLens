import { Link, useLocation } from "react-router-dom";
import { Sparkles, Trophy, Plus, Compass } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
            <Sparkles className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-xl bg-indigo-500/5 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-200 transition-colors">
            Judge<span className="text-indigo-400 font-extrabold">Lens</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isActive("/")
                ? "text-indigo-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>
          <Link
            to="/submit"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isActive("/submit")
                ? "text-indigo-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-4 h-4" />
            Submit Project
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <Button asChild size="sm" variant={location.pathname === "/submit" ? "outline" : "default"} className={`rounded-lg ${
            location.pathname === "/submit"
              ? "border-slate-800 text-slate-300 hover:text-slate-100"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15"
          }`}>
            <Link to="/submit" className="flex items-center gap-1.5 font-medium">
              <Plus className="w-3.5 h-3.5" />
              New Project
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
