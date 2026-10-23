import React, { useState } from 'react';
import type { GeneratedFile } from '../types';
import { FileCode, FileText, CheckCircle2, Download, Copy, Check, FolderTree } from 'lucide-react';
import { formatBytes } from '../utils';

interface FileTreeViewerProps {
  files: GeneratedFile[];
  projectId: string;
  onDownloadZip: () => void;
}

export const FileTreeViewer: React.FC<FileTreeViewerProps> = ({ files, onDownloadZip }) => {
  const [selectedFile, setSelectedFile] = useState<GeneratedFile>(files[0] || null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLanguageBadge = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'python':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'markdown':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'text':
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-semibold text-slate-900">Generated Project Artifacts</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-mono">
            {files.length} Files
          </span>
        </div>

        <button
          onClick={onDownloadZip}
          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Package ZIP</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
        {/* Left: File Tree List */}
        <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/60 p-2 space-y-1 overflow-y-auto max-h-[500px]">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Source Tree
          </div>

          {files.map((file) => {
            const isSelected = selectedFile?.id === file.id;
            return (
              <button
                key={file.id}
                type="button"
                onClick={() => setSelectedFile(file)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                  isSelected
                    ? 'bg-white border border-indigo-200 shadow-sm text-indigo-700 font-medium'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {file.language === 'python' ? (
                    <FileCode className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{file.relative_path}</span>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">
                  {formatBytes(file.file_size)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Code Viewer */}
        <div className="md:col-span-8 flex flex-col bg-white">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-slate-900">
                    {selectedFile.relative_path}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${getLanguageBadge(
                      selectedFile.language
                    )}`}
                  >
                    {selectedFile.language}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    AST Passed
                  </span>
                  {selectedFile.content && (
                    <button
                      onClick={handleCopyCode}
                      className="p-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600"
                      title="Copy file content"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 overflow-auto max-h-[460px] font-mono text-xs bg-slate-900 text-slate-100 rounded-b-xl flex-1">
                {selectedFile.content ? (
                  <pre className="leading-relaxed">
                    <code>{selectedFile.content}</code>
                  </pre>
                ) : (
                  <div className="p-8 text-center text-slate-400 font-sans">
                    <p className="font-semibold text-slate-200 mb-1">
                      File packaged on server
                    </p>
                    <p className="text-xs text-slate-400">
                      Download the full ZIP package to inspect the generated code in your IDE.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select a file to inspect its contents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
