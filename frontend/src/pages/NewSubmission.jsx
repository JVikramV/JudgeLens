import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import UploadZone from "../components/UploadZone";
import { GitBranch, FileText, Image as ImageIcon, Sparkles, CheckCircle2, ChevronRight, Terminal, Loader2, AlertCircle, RefreshCw } from "lucide-react";

export default function NewSubmission() {
  const navigate = useNavigate();

  // Form states
  const [projectName, setProjectName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [pptFile, setPptFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Validation
  const [formErrors, setFormErrors] = useState({});

  // Submission Flow states
  const [status, setStatus] = useState("form"); // "form" | "evaluating" | "error"
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // 0: Repo, 1: PPT, 2: UI, 3: Completed
  const [logs, setLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const addLog = (message) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const validateForm = () => {
    const errors = {};
    if (!projectName.trim()) errors.projectName = "Project name is required";
    if (!repoUrl.trim()) {
      errors.repoUrl = "Repository URL is required";
    } else if (!repoUrl.startsWith("http://") && !repoUrl.startsWith("https://")) {
      errors.repoUrl = "Please enter a valid URL starting with https://";
    }
    if (!pptFile) errors.pptFile = "Pitch deck presentation is required";
    if (!imageFile) errors.imageFile = "Application UI screenshot is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setStatus("evaluating");
    setProgress(5);
    setCurrentStep(0);
    setLogs([]);
    setErrorMessage("");

    try {
      // --- Step 1: Codebase Evaluation ---
      addLog(`Initializing workspace for "${projectName}"...`);
      await new Promise(r => setTimeout(r, 1000));
      addLog(`Connecting to repository: ${repoUrl}...`);
      await new Promise(r => setTimeout(r, 800));
      addLog(`Running Static Analysis & evaluating codebase quality...`);
      setProgress(15);
      
      const repoRes = await api.get("/evaluate-repo", {
        params: {
          project_name: projectName,
          url: repoUrl
        }
      });
      
      addLog(`✓ Codebase evaluation completed successfully!`);
      addLog(`Documentation score: ${repoRes.data.analysis?.scores?.documentation_score}/100`);
      addLog(`Technical quality: ${repoRes.data.analysis?.scores?.technical_quality_score}/100`);
      setProgress(35);
      setCurrentStep(1);

      // --- Step 2: Pitch Deck Evaluation ---
      await new Promise(r => setTimeout(r, 600));
      addLog(`Uploading pitch deck slide presentation (.pptx)...`);
      addLog(`File name: ${pptFile.name} (${(pptFile.size / 1024 / 1024).toFixed(2)} MB)`);
      setProgress(45);

      const pptForm = new FormData();
      pptForm.append("file", pptFile);

      const pptRes = await api.post(
        `/evaluate-ppt?project_name=${encodeURIComponent(projectName)}`,
        pptForm,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      addLog(`✓ Presentation evaluation completed successfully!`);
      addLog(`Innovation score: ${pptRes.data.evaluation?.innovation}/100`);
      addLog(`Business impact: ${pptRes.data.evaluation?.business_impact}/100`);
      setProgress(70);
      setCurrentStep(2);

      // --- Step 3: UI/UX Screenshot Evaluation ---
      await new Promise(r => setTimeout(r, 600));
      addLog(`Uploading interface screenshot...`);
      addLog(`File name: ${imageFile.name} (${(imageFile.size / 1024 / 1024).toFixed(2)} MB)`);
      setProgress(80);

      const imageForm = new FormData();
      imageForm.append("file", imageFile);

      const uiRes = await api.post(
        `/evaluate-ui?project_name=${encodeURIComponent(projectName)}`,
        imageForm,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      addLog(`✓ UI screenshot evaluation completed successfully!`);
      addLog(`Visual Design score: ${uiRes.data.analysis?.visual_design}/100`);
      addLog(`User Experience score: ${uiRes.data.analysis?.user_experience}/100`);
      setProgress(95);
      
      await new Promise(r => setTimeout(r, 800));
      addLog(`Compiling overall evaluation metrics...`);
      setProgress(100);
      setCurrentStep(3);

      addLog(`Project fully judged! Redirecting to report...`);
      await new Promise(r => setTimeout(r, 1000));
      navigate(`/project/${projectName}`);

    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage(
        err.response?.data?.detail || 
        err.message || 
        "An unexpected error occurred during AI evaluation. Please verify server endpoints."
      );
      addLog(`❌ Error: Evaluation failed. Details: ${err.message}`);
    }
  };

  const handleReset = () => {
    setStatus("form");
    setProgress(0);
    setCurrentStep(0);
    setLogs([]);
  };

  // Scroll terminal logs to bottom automatically
  useEffect(() => {
    if (status === "evaluating") {
      const el = document.getElementById("terminal-logs");
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [logs, status]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-slate-900">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Evaluate New Project
        </h1>
        <p className="text-slate-400 text-sm">
          Submit your codebase repo link, pitch presentation slides, and a user interface mockup to begin analysis.
        </p>
      </div>

      {status === "form" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-slate-900/40 border-slate-900 backdrop-blur-sm shadow-xl shadow-black/10">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <label htmlFor="projectName" className="text-xs font-bold text-slate-300">
                  Project Name <span className="text-indigo-400">*</span>
                </label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    if (formErrors.projectName) setFormErrors(prev => ({ ...prev, projectName: null }));
                  }}
                  placeholder="e.g. JudgeLens"
                  className={`bg-slate-950 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/20 text-slate-100 ${
                    formErrors.projectName ? "border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-red-500/10" : ""
                  }`}
                />
                {formErrors.projectName && (
                  <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.projectName}
                  </p>
                )}
              </div>

              {/* GitHub Repo */}
              <div className="space-y-2">
                <label htmlFor="repoUrl" className="text-xs font-bold text-slate-300">
                  GitHub Repository URL <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <Input
                    id="repoUrl"
                    value={repoUrl}
                    onChange={(e) => {
                      setRepoUrl(e.target.value);
                      if (formErrors.repoUrl) setFormErrors(prev => ({ ...prev, repoUrl: null }));
                    }}
                    placeholder="https://github.com/username/repo"
                    className={`bg-slate-950 border-slate-800 pl-9 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/20 text-slate-100 ${
                      formErrors.repoUrl ? "border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-red-500/10" : ""
                    }`}
                  />
                </div>
                {formErrors.repoUrl && (
                  <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.repoUrl}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="bg-slate-900/40 border-slate-900 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Pitch Deck (PPTX)
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500">
                  Upload your slide presentation deck for business analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <UploadZone
                  accept=".pptx"
                  acceptLabel="Powerpoint Presentation (.pptx)"
                  iconType="file"
                  selectedFile={pptFile}
                  onFileSelect={(file) => {
                    setPptFile(file);
                    if (formErrors.pptFile) setFormErrors(prev => ({ ...prev, pptFile: null }));
                  }}
                  onFileClear={() => setPptFile(null)}
                />
                {formErrors.pptFile && (
                  <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.pptFile}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-900 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-violet-400" />
                  UI Screenshot
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500">
                  Upload a dashboard screenshot or wireframe mock
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <UploadZone
                  accept="image/png, image/jpeg, image/webp"
                  acceptLabel="Image formats (.png, .jpg, .webp)"
                  iconType="image"
                  selectedFile={imageFile}
                  onFileSelect={(file) => {
                    setImageFile(file);
                    if (formErrors.imageFile) setFormErrors(prev => ({ ...prev, imageFile: null }));
                  }}
                  onFileClear={() => setImageFile(null)}
                />
                {formErrors.imageFile && (
                  <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.imageFile}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form Action */}
          <div className="flex justify-end pt-4 border-t border-slate-900">
            <Button
              type="submit"
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/15 border-0 font-semibold px-8 py-3 rounded-xl transition duration-200 w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Evaluate Project
            </Button>
          </div>
        </form>
      )}

      {/* Evaluating Stage */}
      {status === "evaluating" && (
        <Card className="bg-slate-900/40 border-slate-900 backdrop-blur-sm py-10 px-6 sm:px-10">
          <CardContent className="space-y-8">
            <div className="text-center space-y-3">
              <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">AI Evaluation in Progress</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Please remain on this screen. Gemini is evaluating code structures, layouts, and slide content.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-indigo-400">Analyzing metrics</span>
                <span className="text-slate-300">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-slate-950 border border-slate-900 overflow-hidden rounded-full [&>div]:bg-indigo-500" />
            </div>

            {/* Steps indicator */}
            <div className="grid sm:grid-cols-3 gap-4 border-t border-b border-slate-900/60 py-6 max-w-xl mx-auto">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep > 0
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : currentStep === 0
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500"
                    : "bg-slate-950 text-slate-600 border border-slate-800"
                }`}>
                  {currentStep > 0 ? "✓" : "1"}
                </div>
                <div className="text-left">
                  <p className={`text-xs font-bold ${currentStep === 0 ? "text-slate-100" : "text-slate-500"}`}>Code Analysis</p>
                  <p className="text-[9px] text-slate-500">evaluate-repo</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep > 1
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : currentStep === 1
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500"
                    : "bg-slate-950 text-slate-600 border border-slate-800"
                }`}>
                  {currentStep > 1 ? "✓" : "2"}
                </div>
                <div className="text-left">
                  <p className={`text-xs font-bold ${currentStep === 1 ? "text-slate-100" : "text-slate-500"}`}>Pitch Deck</p>
                  <p className="text-[9px] text-slate-500">evaluate-ppt</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep > 2
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : currentStep === 2
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500"
                    : "bg-slate-950 text-slate-600 border border-slate-800"
                }`}>
                  {currentStep > 2 ? "✓" : "3"}
                </div>
                <div className="text-left">
                  <p className={`text-xs font-bold ${currentStep === 2 ? "text-slate-100" : "text-slate-500"}`}>UI screenshot</p>
                  <p className="text-[9px] text-slate-500">evaluate-ui</p>
                </div>
              </div>
            </div>

            {/* Terminal logs */}
            <div className="max-w-xl mx-auto space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Console Log</span>
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div
                id="terminal-logs"
                className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[10px] text-indigo-300/80 leading-relaxed overflow-y-auto h-32 select-all flex flex-col text-left space-y-1"
              >
                {logs.length === 0 && (
                  <span className="text-slate-600">Idle...</span>
                )}
                {logs.map((log, index) => (
                  <span key={index}>{log}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {status === "error" && (
        <Card className="bg-slate-900/40 border-red-500/20 backdrop-blur-sm py-10 px-6 sm:px-10 text-center">
          <CardContent className="space-y-6 max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">AI Evaluation Failed</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The judging engine encountered an issue while processing your project. This could be due to invalid inputs, missing fields, or network connection timeouts.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[10px] text-red-400/90 text-left overflow-x-auto whitespace-pre-wrap leading-normal">
              {errorMessage}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-900">
              <Button onClick={handleReset} variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-300 w-full rounded-lg">
                Back to Form
              </Button>
              <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-500 text-white w-full rounded-lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Process
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}