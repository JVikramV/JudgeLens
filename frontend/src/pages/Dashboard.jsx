import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import { Trophy, GitBranch, FileText, Image as ImageIcon, Sparkles, Award, BarChart3, TrendingUp, ArrowRight, Star, Clock, Calendar, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leaderboard");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard data. Please check if backend client is running.");
    } finally {
      setLoading(false);
    }
  };

  // Format date relatively (Stripe/Vercel style)
  const formatRelativeTime = (isoString) => {
    if (!isoString) return "—";
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (e) {
      return "—";
    }
  };

  // Badge Visual Styles (Stripe/Linear style)
  const getBadgeStyle = (badgeName) => {
    switch (badgeName) {
      case "Platinum":
        return "border-slate-300/40 text-slate-100 bg-gradient-to-r from-slate-200/10 to-slate-400/10 shadow-[0_0_12px_-3px_rgba(203,213,225,0.4)]";
      case "Gold":
        return "border-amber-500/40 text-amber-400 bg-amber-500/5 shadow-[0_0_12px_-3px_rgba(245,158,11,0.25)]";
      case "Silver":
        return "border-slate-400/30 text-slate-300 bg-slate-400/5";
      case "Bronze":
        return "border-amber-700/30 text-amber-600 bg-amber-700/5";
      default:
        return "border-red-500/20 text-red-400 bg-red-500/5";
    }
  };

  // Verdict Style
  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case "Potential Winner":
        return "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
      case "Strong Technical Project":
        return "border-indigo-500/20 bg-indigo-500/5 text-indigo-400";
      case "Solid Contender":
        return "border-violet-500/20 bg-violet-500/5 text-violet-400";
      default:
        return "border-amber-500/20 bg-amber-500/5 text-amber-400";
    }
  };

  // Compute statistics
  const totalProjects = projects.length;
  const highestScore = totalProjects > 0 ? Math.max(...projects.map(p => p.overall_score || 0)) : 0;
  const averageScore = totalProjects > 0 
    ? (projects.reduce((sum, p) => sum + (p.overall_score || 0), 0) / totalProjects) 
    : 0;
  
  // Calculate evaluations executed today
  const evaluationsToday = projects.filter(p => {
    if (!p.last_updated) return false;
    const todayStr = new Date().toDateString();
    const projectStr = new Date(p.last_updated).toDateString();
    return todayStr === projectStr;
  }).length;

  // Podium Positions (1st, 2nd, 3rd)
  const podiumProjects = {
    first: projects[0] || null,
    second: projects[1] || null,
    third: projects[2] || null
  };

  if (loading) {
    return <LoadingScreen message="Retrieving hackathon leaderboard..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-red-500/20 bg-red-950/15 rounded-2xl p-8 text-center my-6">
        <Award className="w-12 h-12 text-red-500/80 mb-4" />
        <h3 className="text-lg font-semibold text-slate-100">Unable to Sync Data</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-md">{error}</p>
        <Button onClick={fetchLeaderboard} className="mt-6 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-lg px-4 py-2">
          Retry Sync
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-900">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Judging Engine Active
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Hackathon Leaderboard
          </h1>
          <p className="text-slate-400 max-w-xl text-sm md:text-base leading-relaxed">
            JudgeLens evaluates submissions based on three main dimensions: structural codebase quality, pitch deck coherence, and user interface aesthetics.
          </p>
        </div>

        <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 border-0 rounded-xl px-6 py-3 font-semibold transition duration-200 w-full md:w-auto">
          <Link to="/submit" className="flex items-center justify-center gap-2">
            <PlusIcon className="w-4 h-4" />
            New Submission
          </Link>
        </Button>
      </section>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Statistics Grid */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900/40 border-slate-900 backdrop-blur-sm relative overflow-hidden group hover:border-slate-800/80 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Submissions</span>
                <BarChart3 className="w-4 h-4 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-white">{totalProjects}</div>
                <p className="text-xs text-slate-500 mt-1">Evaluated projects</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-900 backdrop-blur-sm relative overflow-hidden group hover:border-slate-800/80 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Score</span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-white">{averageScore.toFixed(1)}<span className="text-sm font-medium text-slate-500">/100</span></div>
                <p className="text-xs text-slate-500 mt-1">Mean overall project index</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-900 backdrop-blur-sm relative overflow-hidden group hover:border-slate-800/80 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Highest Score</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-white">{highestScore.toFixed(1)}<span className="text-sm font-medium text-slate-500">/100</span></div>
                <p className="text-xs text-slate-500 mt-1">Leading project benchmark</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-900 backdrop-blur-sm relative overflow-hidden group hover:border-slate-800/80 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Evaluations Today</span>
                <Clock className="w-4 h-4 text-emerald-450" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-white">{evaluationsToday}</div>
                <p className="text-xs text-slate-500 mt-1">AI evaluations run today</p>
              </CardContent>
            </Card>
          </section>

          {/* Podium section for Top 3 */}
          <section className="relative py-8 px-6 rounded-2xl bg-slate-900/20 border border-slate-900 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-lg font-bold text-slate-200 mb-8 flex items-center gap-2 tracking-tight">
              <Award className="w-5 h-5 text-indigo-400" />
              Top Ranked Projects
            </h2>

            <div className="grid md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
              {/* 2nd Place */}
              <div className="order-2 md:order-1 flex flex-col items-center">
                {podiumProjects.second ? (
                  <Link to={`/project/${podiumProjects.second.project_name}`} className="w-full group">
                    <div className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-t-2xl p-6 text-center shadow-xl transition-all duration-300 relative group-hover:border-slate-700/60 group-hover:-translate-y-1">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold mx-auto mb-3 shadow-inner">
                        🥈
                      </div>
                      <h3 className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                        {podiumProjects.second.project_name}
                      </h3>
                      <div className="mt-2 text-2xl font-black text-slate-300">
                        {podiumProjects.second.overall_score?.toFixed(1)}
                      </div>
                      
                      <div className="mt-4 flex justify-center gap-2">
                        <Badge variant="outline" className={`font-semibold text-[9px] ${getBadgeStyle(podiumProjects.second.badge)}`}>
                          {podiumProjects.second.badge}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-slate-950/20 border border-dashed border-slate-800/40 rounded-t-2xl p-6 text-center w-full min-h-[160px] flex items-center justify-center text-slate-600 text-xs">
                    Slot Available
                  </div>
                )}
                <div className="w-full bg-slate-900/80 border-t border-slate-800 py-3 text-center text-xs font-bold text-slate-400 rounded-b-xl shadow-inner">
                  2ND PLACE
                </div>
              </div>

              {/* 1st Place */}
              <div className="order-1 md:order-2 flex flex-col items-center md:-translate-y-4">
                {podiumProjects.first ? (
                  <Link to={`/project/${podiumProjects.first.project_name}`} className="w-full group">
                    <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-t-2xl p-8 text-center shadow-2xl relative overflow-hidden group-hover:border-indigo-500/50 group-hover:-translate-y-1 transition-all duration-300">
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-indigo-600" />
                      
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold mx-auto mb-3 shadow-lg shadow-amber-500/5 relative animate-pulse">
                        👑
                      </div>
                      
                      <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors truncate">
                        {podiumProjects.first.project_name}
                      </h3>
                      <div className="mt-2 text-4xl font-extrabold text-indigo-400">
                        {podiumProjects.first.overall_score?.toFixed(1)}
                      </div>
                      
                      <div className="mt-5 flex justify-center gap-2">
                        <Badge variant="outline" className={`font-semibold text-[9px] ${getBadgeStyle(podiumProjects.first.badge)}`}>
                          {podiumProjects.first.badge}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-slate-950/20 border border-dashed border-slate-800/40 rounded-t-2xl p-8 text-center w-full min-h-[200px] flex items-center justify-center text-slate-600 text-xs">
                    Slot Available
                  </div>
                )}
                <div className="w-full bg-indigo-950/30 border-t border-indigo-500/20 py-4 text-center text-xs font-black text-indigo-400 rounded-b-xl shadow-inner tracking-wider">
                  🥇 CHAMPION
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3 flex flex-col items-center">
                {podiumProjects.third ? (
                  <Link to={`/project/${podiumProjects.third.project_name}`} className="w-full group">
                    <div className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-t-2xl p-6 text-center shadow-xl transition-all duration-300 relative group-hover:border-slate-700/60 group-hover:-translate-y-1">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold mx-auto mb-3 shadow-inner">
                        🥉
                      </div>
                      <h3 className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                        {podiumProjects.third.project_name}
                      </h3>
                      <div className="mt-2 text-2xl font-black text-slate-300">
                        {podiumProjects.third.overall_score?.toFixed(1)}
                      </div>
                      
                      <div className="mt-4 flex justify-center gap-2">
                        <Badge variant="outline" className={`font-semibold text-[9px] ${getBadgeStyle(podiumProjects.third.badge)}`}>
                          {podiumProjects.third.badge}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-slate-950/20 border border-dashed border-slate-800/40 rounded-t-2xl p-6 text-center w-full min-h-[160px] flex items-center justify-center text-slate-600 text-xs">
                    Slot Available
                  </div>
                )}
                <div className="w-full bg-slate-900/80 border-t border-slate-800 py-3 text-center text-xs font-bold text-slate-400 rounded-b-xl shadow-inner">
                  3RD PLACE
                </div>
              </div>
            </div>
          </section>

          {/* Leaderboard Table section */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Standing</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ranked hackathon entries</p>
            </div>

            <Card className="bg-slate-900/30 border-slate-900 backdrop-blur-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-900/50 border-b border-slate-900">
                  <TableRow className="hover:bg-transparent border-slate-900">
                    <TableHead className="w-[80px] text-center text-slate-400 font-semibold py-4">Rank</TableHead>
                    <TableHead className="text-slate-400 font-semibold">Project</TableHead>
                    <TableHead className="text-center text-slate-400 font-semibold">Badge</TableHead>
                    <TableHead className="text-right text-slate-400 font-semibold pr-6">Overall Score</TableHead>
                    <TableHead className="text-center text-slate-400 font-semibold">Last Evaluated</TableHead>
                    <TableHead className="text-center text-slate-400 font-semibold">Status</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project, index) => {
                    const projectRank = project.rank || (index + 1);
                    return (
                      <TableRow key={project.project_name} className="border-b border-slate-900/60 hover:bg-slate-900/40 group transition-colors">
                        <TableCell className="text-center py-4 font-bold text-slate-400">
                          {projectRank === 1 ? "🥇" : projectRank === 2 ? "🥈" : projectRank === 3 ? "🥉" : `#${projectRank}`}
                        </TableCell>
                        
                        <TableCell className="font-semibold text-slate-200">
                          <Link to={`/project/${project.project_name}`} className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                            {project.project_name}
                          </Link>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`font-semibold text-[10px] py-0.5 ${getBadgeStyle(project.badge)}`}>
                            {project.badge || "Bronze"}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-right font-black text-white text-sm pr-6">
                          {project.overall_score?.toFixed(1)}
                        </TableCell>
                        
                        <TableCell className="text-center text-xs text-slate-400 font-medium">
                          {formatRelativeTime(project.last_updated)}
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`font-semibold text-[9px] py-0.5 ${getVerdictStyle(project.verdict)}`}>
                            {project.verdict || "Needs Refinement"}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-center pr-4">
                          <Link to={`/project/${project.project_name}`}>
                            <Button size="icon-xs" variant="ghost" className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-400 transition-all hover:translate-x-0.5">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function PlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}