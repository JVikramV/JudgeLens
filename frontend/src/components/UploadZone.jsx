import { useState, useRef } from "react";
import { UploadCloud, FileText, Image as ImageIcon, Trash2, Check } from "lucide-react";
import { Button } from "./ui/button";

export default function UploadZone({
  accept = "*",
  acceptLabel = "Any file",
  iconType = "file", // "file" or "image"
  onFileSelect,
  selectedFile,
  onFileClear
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Basic extension check if specified
      if (accept !== "*") {
        const extensions = accept.split(",").map(ext => ext.trim().toLowerCase());
        const fileExt = "." + file.name.split(".").pop().toLowerCase();
        if (!extensions.includes(fileExt) && !accept.includes(file.type)) {
          alert(`Invalid file format. Please upload a file matching: ${acceptLabel}`);
          return;
        }
      }
      onFileSelect(file);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`relative group flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 min-h-[140px] text-center ${
            isDragOver
              ? "border-indigo-500 bg-indigo-500/5"
              : "border-slate-800 bg-slate-900/10 hover:border-slate-700 hover:bg-slate-900/30"
          }`}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors shadow-sm mb-3">
            {iconType === "image" ? (
              <ImageIcon className="w-5 h-5" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
          </div>

          <p className="text-xs font-semibold text-slate-300">
            Drag & drop file or <span className="text-indigo-400 group-hover:underline">browse</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {acceptLabel} (Max. 25MB)
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between border border-indigo-500/20 bg-indigo-950/5 rounded-xl p-4 transition-all duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-500/20 text-indigo-400 shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold text-slate-200 truncate pr-4">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onFileClear();
            }}
            className="text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg h-8 w-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
