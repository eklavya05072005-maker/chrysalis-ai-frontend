import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { createProject, createPdfBlobFromText, DEMO_PROJECT } from '../services/api';
import {
  UploadCloud,
  FileText,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Loader2,
  FileCode,
  Type,
  Info,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

type InputMode = 'pdf' | 'text' | 'readme';

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readmeInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<InputMode>('pdf');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [readmeFile, setReadmeFile] = useState<File | null>(null);
  const [directText, setDirectText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [backendOffline, setBackendOffline] = useState(false);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetPdf(e.target.files[0]);
    }
  };

  const handlePdfDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetPdf(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetPdf = (f: File) => {
    setError(null);
    setBackendOffline(false);
    const isPdf = f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf';
    if (!isPdf) {
      setError('Invalid file format. Only PDF specification documents (.pdf) are accepted.');
      toast.error('Only PDF documents are accepted');
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (f.size > maxBytes) {
      setError('File exceeds 10MB maximum limit set by backend.');
      toast.error('File exceeds 10MB limit');
      return;
    }

    setPdfFile(f);
    if (!name) {
      const cleanName = f.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
    toast.success(`Attached PDF: ${f.name}`);
  };

  const handleReadmeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetReadme(e.target.files[0]);
    }
  };

  const validateAndSetReadme = (f: File) => {
    setError(null);
    setBackendOffline(false);
    const validExts = ['.md', '.txt', '.markdown'];
    const hasValidExt = validExts.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError('Only markdown (.md) and plain-text (.txt) files are supported.');
      toast.error('Invalid file type: .md or .txt required');
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (f.size > maxBytes) {
      setError('File exceeds 5MB size limit.');
      toast.error('File exceeds 5MB limit');
      return;
    }

    setReadmeFile(f);
    if (!name) {
      const cleanName = f.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Read content into preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDirectText(text || '');
    };
    reader.readAsText(f);
    toast.success(`Loaded text specification: ${f.name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBackendOffline(false);

    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    let fileToUpload: File | Blob | null = null;
    let fileNameToUse = 'specification.pdf';

    if (inputMode === 'pdf') {
      if (!pdfFile) {
        setError('Please attach a PDF requirements document.');
        return;
      }
      fileToUpload = pdfFile;
      fileNameToUse = pdfFile.name;
    } else if (inputMode === 'text') {
      if (!directText.trim() || directText.trim().length < 25) {
        setError('Please enter at least 25 characters describing your problem statement.');
        return;
      }
      // Wrap direct text into valid PDF bytes so current backend pypdf extraction succeeds
      fileToUpload = createPdfBlobFromText(directText.trim(), name.trim());
      fileNameToUse = `${name.toLowerCase().replace(/\s+/g, '_')}_statement.pdf`;
    } else if (inputMode === 'readme') {
      if (!readmeFile && !directText.trim()) {
        setError('Please upload a README (.md) or text (.txt) file.');
        return;
      }
      fileToUpload = createPdfBlobFromText(directText.trim(), name.trim());
      fileNameToUse = `${name.toLowerCase().replace(/\s+/g, '_')}_readme.pdf`;
    }

    if (!fileToUpload) {
      setError('Missing specification payload.');
      return;
    }

    setUploading(true);
    setProgress(20);

    const formData = new FormData();
    formData.append('name', name.trim());
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    formData.append('file', fileToUpload, fileNameToUse);

    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 15 : p));
    }, 200);

    try {
      const created = await createProject(formData);
      clearInterval(progressTimer);
      setProgress(100);
      toast.success('Project created and specification uploaded successfully!');
      setTimeout(() => {
        navigate(`/app/projects/${created.id}/requirements`);
      }, 500);
    } catch (err: any) {
      clearInterval(progressTimer);
      setProgress(0);
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to connect to backend server at http://localhost:8000.';
      setError(`API Request Failed: ${errorMsg}`);
      setBackendOffline(true);
      toast.error('API Error: Live project creation failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Specification Ingestion
          </div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">
            Create Agentic Transformation Project
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Provide your software requirements specification (SRS), architecture document, problem statement, or README.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            {backendOffline && (
              <div className="pt-2 border-t border-red-200 flex items-center justify-between">
                <span>
                  Start your FastAPI server at <code>http://localhost:8000</code> or explore the interactive demo project.
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/app/projects/${DEMO_PROJECT.id}/requirements`)}
                  className="font-semibold underline text-red-800 hover:text-red-950 ml-2"
                >
                  Open Demo Project →
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="surface-card p-6 space-y-6">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Autonomous E-Commerce Order Routing Assistant"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900">
              Objective & High-Level Scope (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Coordinates multi-step agent actions with ERP inventory routing"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Input Format Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900">
                Input Method <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                PDF, Direct Text, and README formats supported
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setInputMode('pdf')}
                className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  inputMode === 'pdf'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Document</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  inputMode === 'text'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Direct Text</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('readme')}
                className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  inputMode === 'readme'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>README / Markdown</span>
              </button>
            </div>
          </div>

          {/* Input Option 1: PDF Upload */}
          {inputMode === 'pdf' && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfChange}
                className="hidden"
              />
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handlePdfDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  pdfFile
                    ? 'border-indigo-400 bg-indigo-50/30'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto mb-3 text-indigo-600">
                  <UploadCloud className="w-6 h-6" />
                </div>

                {pdfFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-700">{pdfFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                    </p>
                    <span className="text-[11px] text-indigo-600 font-medium underline inline-block mt-2">
                      Click to replace document
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">
                      Drag & Drop your SRS / Architecture PDF here
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Accepts <code>.pdf</code> format up to 10MB
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Browse local files
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input Option 2: Direct Problem Statement */}
          {inputMode === 'text' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                <span>Pasted Problem Statement or Requirements Description</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {directText.length} characters (min 25)
                </span>
              </label>
              <textarea
                rows={8}
                value={directText}
                onChange={(e) => setDirectText(e.target.value)}
                placeholder="Describe your software system requirements, workflows, and constraints. Example:
- The system must autonomously ingest vendor shipment feeds.
- High-impact inventory adjustments require human sign-off.
- The system must interface with PostgreSQL and a third-party logistics REST API with rate limiting.
- Maximum latency allowed is 800ms."
                className="input-field font-mono text-xs leading-relaxed"
              />
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span>
                  Direct text is packaged into a standard specification stream compatible with backend requirements extraction.
                </span>
              </div>
            </div>
          )}

          {/* Input Option 3: README / Markdown Upload */}
          {inputMode === 'readme' && (
            <div className="space-y-3">
              <input
                ref={readmeInputRef}
                type="file"
                accept=".md,.txt,.markdown,text/plain,text/markdown"
                onChange={handleReadmeChange}
                className="hidden"
              />
              <div
                onClick={() => readmeInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  readmeFile
                    ? 'border-indigo-400 bg-indigo-50/30'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto mb-2 text-indigo-600">
                  <FileCode className="w-5 h-5" />
                </div>
                {readmeFile ? (
                  <div>
                    <p className="text-xs font-bold text-indigo-700">{readmeFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(readmeFile.size / 1024).toFixed(1)} KB • Loaded into text editor
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Select README.md or plain-text specification
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Accepts <code>.md</code>, <code>.txt</code> files up to 5MB
                    </p>
                  </div>
                )}
              </div>

              {directText && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    File Content Preview:
                  </label>
                  <textarea
                    rows={6}
                    value={directText}
                    onChange={(e) => setDirectText(e.target.value)}
                    className="input-field font-mono text-xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Ingesting specification...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Specification...</span>
                </>
              ) : (
                <>
                  <span>Create Project & Ingest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
