import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingScreen from "../components/LoadingScreen";
import { Trophy, GitBranch, FileText, Image as ImageIcon, Sparkles, Award, CheckCircle2, AlertTriangle, Lightbulb, ArrowLeft, ExternalLink, Calendar, Star, MessageSquare } from "lucide-react";

export default function ProjectDetails() {
  const { projectName } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [projectName]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/project/${encodeURIComponent(projectName)}`);
      if (res.data) {
        setProject(res.data);
      } else {
        setError("Project details not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch project details. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message={`Synthesizing evaluation report for "${projectName}"...`} />;
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-red-500/20 bg-red-950/15 rounded-2xl p-8 text-center my-6">
        <AlertTriangle className="w-12 h-12 text-red-500/80 mb-4" />
        <h3 className="text-lg font-semibold text-slate-100">Project Not Found</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-md">{error || "Could not find a project with that name."}</p>
        <div className="flex gap-4 mt-6">
          <Button asChild variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg">
            <Link to="/">Back to Leaderboard</Link>
          </Button>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
            <Link to="/submit">New Submission</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Score extracts
  const repoOverall = project.repo_evaluation?.scores?.overall_score ?? null;
  const pptOverall = project.ppt_evaluation?.overall_score ?? null;
  const uiOverall = project.ui_evaluation?.overall_score ?? null;

  // Radar axis computations
  const getAverage = (list) => {
    const valid = list.filter(v => v !== null && v !== undefined);
    return valid.length > 0 ? valid.reduce((s, v) => s + v, 0) / valid.length : 0;
  };

  const radarScores = {
    Repository: repoOverall ?? 0,
    Business: getAverage([
      project.ppt_evaluation?.business_impact ?? null,
      project.ppt_evaluation?.market_potential ?? null
    ]),
    Innovation: getAverage([
      project.ppt_evaluation?.innovation ?? null,
      project.repo_evaluation?.scores?.innovation_score ?? null
    ]),
    UI: getAverage([
      project.ui_evaluation?.visual_design ?? null,
      project.ui_evaluation?.user_experience ?? null
    ]),
    Technical: getAverage([
      project.repo_evaluation?.scores?.technical_quality_score ?? null,
      project.ppt_evaluation?.technical_complexity ?? null
    ])
  };

  // Badge Visual Styles
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

  // Verdict Visual Style
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

  // Aggregated lists
  const strengths = [
    ...(project.repo_evaluation?.strengths || []),
    ...(project.ppt_evaluation?.strengths || [])
  ];

  const weaknesses = [
    ...(project.repo_evaluation?.weaknesses || []),
    ...(project.ppt_evaluation?.weaknesses || [])
  ];

  const recommendations = [];
  if (project.repo_evaluation?.recommendation) {
    recommendations.push(project.repo_evaluation.recommendation);
  }
  if (project.ppt_evaluation?.recommendations) {
    if (Array.isArray(project.ppt_evaluation.recommendations)) {
      recommendations.push(...project.ppt_evaluation.recommendations);
    } else {
      recommendations.push(project.ppt_evaluation.recommendations);
    }
  }

  // Verdict explanations
  const getVerdictDescription = (verdict) => {
    switch (verdict) {
      case "Potential Winner":
        return "This project excels across code, design, and market feasibility. It represents the highest engineering quality and clear commercial viability, making it a leading contender for top tier ranking.";
      case "Strong Technical Project":
        return "Outstanding technical execution and architectural implementation. Code complexity, documentation, and tooling choices are highly professional, though UI aesthetic or presentation narrative could be polished further.";
      case "Solid Contender":
        return "A highly robust and complete submission. The project presents an effective solution with solid performance indicators across all categories. Minor polish in core features will elevate it significantly.";
      default:
        return "The project shows promise but requires key refinements. Focus on improving technical implementation, documentation, and polishing visual interfaces to meet hackathon benchmark standards.";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-900">
        <div className="flex items-center gap-4">
          <Button asChild size="icon" variant="outline" className="border-slate-800 hover:bg-slate-900 text-slate-400 rounded-xl">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>

          <div className="space-y-1 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{project.project_name}</h1>
              <Badge variant="outline" className={`font-semibold py-0.5 text-[10px] ${getBadgeStyle(project.badge)}`}>
                {project.badge || "Bronze"}
              </Badge>
              <Badge variant="outline" className={`font-semibold py-0.5 text-[9px] ${getVerdictStyle(project.verdict)}`}>
                {project.verdict || "Solid Contender"}
              </Badge>
            </div>
            
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Ranked #{project.rank ?? "—"} overall</span>
              <span>•</span>
              <Calendar className="w-3.5 h-3.5" />
              <span>Evaluated {new Date(project.last_updated).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </p>
          </div>
        </div>

        {project.repo_evaluation?.repo_url && (
          <Button asChild size="sm" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-900 rounded-lg w-full md:w-auto">
            <a href={project.repo_evaluation.repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 font-medium">
              <ExternalLink className="w-3.5 h-3.5" />
              Open Repository
            </a>
          </Button>
        )}
      </div>

      {/* Main Core Overview */}
      <section className="grid lg:grid-cols-3 gap-8">
        {/* Overall Score Circular Card */}
        <Card className="bg-slate-900 border-slate-900 relative overflow-hidden flex flex-col justify-between p-6 h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <CardHeader className="p-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Score</CardTitle>
            <CardDescription className="text-[10px] text-slate-500 mt-1">Weighted composite evaluation index</CardDescription>
          </CardHeader>
          
          <CardContent className="p-0 py-8 flex flex-col items-center justify-center">
            {/* Custom Circular Progress */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-950 stroke-[6] fill-none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-indigo-500 stroke-[6] fill-none transition-all duration-1000"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * (project.overall_score || 0)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-4xl font-black text-white">{project.overall_score?.toFixed(1) || "—"}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Index Score</span>
              </div>
            </div>
          </CardContent>

          <div className="border-t border-slate-950 pt-4 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Repo (40%)</span>
            <span>PPT (30%)</span>
            <span>UI/UX (30%)</span>
          </div>
        </Card>

        {/* Radar Chart Visualizer */}
        <Card className="bg-slate-900 border-slate-900 p-6 flex flex-col justify-between h-full">
          <CardHeader className="p-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Performance Dimensions</CardTitle>
            <CardDescription className="text-[10px] text-slate-500 mt-1">Holistic mapping across 5 score axes</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex items-center justify-center py-4">
            <RadarChart scores={radarScores} />
          </CardContent>
        </Card>

        {/* Verdict Callout Panel */}
        <Card className="bg-slate-900 border-2 border-indigo-500/10 p-6 flex flex-col justify-between h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <CardHeader className="p-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              JudgeLens Verdict
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 py-6 text-left">
            <Badge variant="outline" className={`font-extrabold text-xs py-1 px-3 ${getVerdictStyle(project.verdict)}`}>
              {project.verdict || "Solid Contender"}
            </Badge>
            <p className="mt-4 text-xs text-slate-300 leading-relaxed font-medium">
              {getVerdictDescription(project.verdict)}
            </p>
          </CardContent>

          <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase border-t border-slate-950 pt-4">
            AI Automated Judgement Report
          </div>
        </Card>
      </section>

      {/* Evaluation Sub-metric Cards */}
      <section className="grid md:grid-cols-3 gap-6">
        {/* Repo Card */}
        <Card className="bg-slate-900 border-slate-900/60 overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-4 border-b border-slate-950 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-0.5 text-left">
              <CardTitle className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                Repository Index
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-500">Source quality evaluation</CardDescription>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400">{repoOverall !== null ? repoOverall.toFixed(0) : "—"}</span>
              <span className="text-[10px] text-slate-500 font-semibold block">/100</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 flex-1">
            {project.repo_evaluation?.scores ? (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Technical Quality</span>
                    <span className="font-semibold text-slate-200">{project.repo_evaluation.scores.technical_quality_score ?? 0}</span>
                  </div>
                  <Progress value={project.repo_evaluation.scores.technical_quality_score ?? 0} className="h-1.5 bg-slate-950 rounded-full [&>div]:bg-emerald-450" />
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Documentation</span>
                    <span className="font-semibold text-slate-200">{project.repo_evaluation.scores.documentation_score ?? 0}</span>
                  </div>
                  <Progress value={project.repo_evaluation.scores.documentation_score ?? 0} className="h-1.5 bg-slate-950 rounded-full [&>div]:bg-emerald-450" />
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Project Completeness</span>
                    <span className="font-semibold text-slate-200">{project.repo_evaluation.scores.project_completeness_score ?? 0}</span>
                  </div>
                  <Progress value={project.repo_evaluation.scores.project_completeness_score ?? 0} className="h-1.5 bg-slate-950 rounded-full [&>div]:bg-emerald-450" />
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Innovation Score</span>
                    <span className="font-semibold text-slate-200">{project.repo_evaluation.scores.innovation_score ?? 0}</span>
                  </div>
                  <Progress value={project.repo_evaluation.scores.innovation_score ?? 0} className="h-1.5 bg-slate-950 rounded-full [&>div]:bg-emerald-450" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">Code evaluation pending</p>
            )}
          </CardContent>
        </Card>

        {/* PPT Card */}
        <Card className="bg-slate-900 border-slate-900/60 overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-4 border-b border-slate-950 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-0.5 text-left">
              <CardTitle className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                Pitch Deck Score
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-500">Business & pitch analysis</CardDescription>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-400">{pptOverall !== null ? pptOverall.toFixed(0) : "—"}</span>
              <span className="text-[10px] text-slate-500 font-semibold block">/100</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 flex-1">
            {project.ppt_evaluation ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-slate-400 font-medium block">Innovation</span>
                    <span className="text-sm font-bold text-slate-200">{project.ppt_evaluation.innovation}</span>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-slate-400 font-medium block">Tech Complexity</span>
                    <span className="text-sm font-bold text-slate-200">{project.ppt_evaluation.technical_complexity}</span>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-slate-400 font-medium block">Business Impact</span>
                    <span className="text-sm font-bold text-slate-200">{project.ppt_evaluation.business_impact}</span>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-slate-400 font-medium block">Market Potential</span>
                    <span className="text-sm font-bold text-slate-200">{project.ppt_evaluation.market_potential}</span>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-slate-400 font-medium block">Storytelling</span>
                    <span className="text-sm font-bold text-slate-200">{project.ppt_evaluation.storytelling}</span>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-slate-400 font-medium block">Presentation</span>
                    <span className="text-sm font-bold text-slate-200">{project.ppt_evaluation.presentation_quality}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">Presentation evaluation pending</p>
            )}
          </CardContent>
        </Card>

        {/* UI/UX Card */}
        <Card className="bg-slate-900 border-slate-900/60 overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-4 border-b border-slate-950 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-0.5 text-left">
              <CardTitle className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-violet-400" />
                UI/UX Aesthetics
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-500">Aesthetic design analysis</CardDescription>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-violet-400">{uiOverall !== null ? uiOverall.toFixed(0) : "—"}</span>
              <span className="text-[10px] text-slate-500 font-semibold block">/100</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 flex-1">
            {project.ui_evaluation ? (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Visual Design</span>
                    <span className="font-semibold text-slate-200">{project.ui_evaluation.visual_design}</span>
                  </div>
                  <Progress value={project.ui_evaluation.visual_design} className="h-1.5 bg-slate-950 rounded-full [&>div]:bg-violet-500" />
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">User Experience</span>
                    <span className="font-semibold text-slate-200">{project.ui_evaluation.user_experience}</span>
                  </div>
                  <Progress value={project.ui_evaluation.user_experience} className="h-1.5 bg-slate-950 rounded-full [&>div]:bg-violet-500" />
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Accessibility</span>
                    <span className="font-semibold text-slate-200">{project.ui_evaluation.accessibility}</span>
                  </div>
                  <Progress value={project.ui_evaluation.accessibility} className="h-1.5 bg-slate-950 rounded-full [&>div]:bg-violet-500" />
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Professionalism</span>
                    <span className="font-semibold text-slate-200">{project.ui_evaluation.professionalism}</span>
                  </div>
                  <Progress value={project.ui_evaluation.professionalism} className="h-1.5 bg-slate-950 rounded-full [&>div]:bg-violet-500" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">UI design evaluation pending</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Codebase Summary (if available) */}
      {project.repo_evaluation?.summary && (
        <Card className="bg-slate-900/40 border-slate-900/60 p-6 text-left">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evaluation Summary</h2>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {project.repo_evaluation.summary}
          </p>
        </Card>
      )}

      {/* Strengths & Weaknesses Panel */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="bg-slate-900 border-slate-900">
          <CardHeader className="pb-4 border-b border-slate-950">
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Strengths & Advantages
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {strengths.length > 0 ? (
              <ul className="space-y-3 text-left">
                {strengths.map((item, index) => (
                  <li key={index} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-400 select-none shrink-0 font-extrabold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic py-2 text-center">No key strengths reported</p>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="bg-slate-900 border-slate-900">
          <CardHeader className="pb-4 border-b border-slate-950">
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Weaknesses & Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {weaknesses.length > 0 ? (
              <ul className="space-y-3 text-left">
                {weaknesses.map((item, index) => (
                  <li key={index} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-550 select-none shrink-0 font-extrabold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic py-2 text-center">No critical weaknesses reported</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* UI Screenshot Visual Feedback (if any feedback is returned) */}
      {project.ui_evaluation?.feedback && project.ui_evaluation.feedback.length > 0 && (
        <Card className="bg-slate-900 border-slate-900">
          <CardHeader className="pb-4 border-b border-slate-950">
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              Visual Interface Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3 text-left">
              {project.ui_evaluation.feedback.map((item, index) => (
                <li key={index} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                  <span className="text-violet-450 select-none shrink-0 font-extrabold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Panel */}
      {recommendations.length > 0 && (
        <Card className="bg-slate-900 border-2 border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-4 border-b border-slate-950">
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-indigo-400 animate-pulse" />
              Strategic Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-left">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed shadow-sm">
                {rec}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Custom SVG Radar Chart Component (Dependency-free polar graph)
function RadarChart({ scores }) {
  const keys = Object.keys(scores);
  const data = Object.values(scores);
  
  const width = 300;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxVal = 100;
  const radius = 90; 
  
  const angles = keys.map((_, i) => i * (2 * Math.PI) / 5 - Math.PI / 2);
  
  const levels = [20, 40, 60, 80, 100];
  const gridPoints = levels.map(level => {
    return angles.map(angle => {
      const r = radius * (level / maxVal);
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  });

  const dataPoints = angles.map((angle, i) => {
    const score = data[i] || 0;
    const r = radius * (score / maxVal);
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  const labels = keys.map((key, i) => {
    const angle = angles[i];
    const r = radius + 22;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    
    let textAnchor = "middle";
    if (Math.cos(angle) > 0.1) textAnchor = "start";
    else if (Math.cos(angle) < -0.1) textAnchor = "end";
    
    return { name: key, x, y, textAnchor, score: data[i] };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[280px] mx-auto overflow-visible">
      {gridPoints.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="rgba(148, 163, 184, 0.08)"
          strokeWidth="1"
        />
      ))}
      
      {angles.map((angle, i) => {
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="rgba(148, 163, 184, 0.12)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        );
      })}

      {levels.map((level, i) => {
        const r = radius * (level / maxVal);
        const y = centerY - r;
        return (
          <text
            key={i}
            x={centerX}
            y={y + 3}
            className="text-[8px] fill-slate-600 font-bold select-none text-center"
            textAnchor="middle"
          >
            {level}
          </text>
        );
      })}

      <polygon
        points={dataPoints}
        fill="rgba(99, 102, 241, 0.12)"
        stroke="rgba(99, 102, 241, 0.8)"
        strokeWidth="2"
        className="drop-shadow-[0_0_6px_rgba(99,102,241,0.3)] animate-pulse"
      />

      {angles.map((angle, i) => {
        const score = data[i] || 0;
        const r = radius * (score / maxVal);
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3.5"
            className="fill-indigo-500 stroke-slate-950 stroke-2"
          />
        );
      })}

      {labels.map((label, i) => (
        <g key={i} className="select-none">
          <text
            x={label.x}
            y={label.y - 2}
            textAnchor={label.textAnchor}
            className="text-[9px] font-bold fill-slate-350"
          >
            {label.name}
          </text>
          <text
            x={label.x}
            y={label.y + 7}
            textAnchor={label.textAnchor}
            className="text-[9px] font-extrabold fill-indigo-400"
          >
            {label.score.toFixed(0)}
          </text>
        </g>
      ))}
    </svg>
  );
}