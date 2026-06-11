import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 mb-6 shadow-xl shadow-black/20">
        <AlertCircle className="w-8 h-8 text-indigo-400/80 animate-pulse" />
      </div>

      <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
        Page Not Found
      </h1>
      
      <p className="mt-3 text-sm text-slate-400 max-w-xs leading-relaxed">
        The page you are looking for does not exist or has been moved. Use the navigation to find your way back.
      </p>

      <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 font-semibold px-6 py-2.5 rounded-xl transition duration-200 mt-8">
        <Link to="/" className="flex items-center gap-2">
          <Compass className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}