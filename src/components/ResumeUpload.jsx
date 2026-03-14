// src/components/ResumeUpload.jsx
// Phase 3 — Full AI parsing pipeline with progress steps UI.
// Replaces the old component which only uploaded the file.

import { useMemo, useRef, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { analyzeAndSave } from '../services/resumeService';
import { getAzureObjectId, getUserByUserId } from '../services/userService';

const MAX_SIZE  = 10 * 1024 * 1024; // 10 MB
const ACCEPTED  = ['.pdf', '.docx'];

const STEPS = [
  { id: 'upload',   label: 'Uploading to SharePoint',       icon: '☁️' },
  { id: 'extract',  label: 'Extracting resume text',        icon: '📄' },
  { id: 'ai',       label: 'AI analyzing skills & ATS',     icon: '🤖' },
  { id: 'save',     label: 'Saving to your skill profile',  icon: '💾' },
];

export default function ResumeUpload({ onUploaded }) {
  const { instance, accounts } = useMsal();
  const account  = instance.getActiveAccount() || accounts[0];
  const userId   = useMemo(() => getAzureObjectId(account), [account]);

  const [selectedFile, setSelectedFile]   = useState(null);
  const [dragOver, setDragOver]           = useState(false);
  const [phase, setPhase]                 = useState('idle'); // idle|validating|processing|done|error
  const [currentStep, setCurrentStep]     = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [result, setResult]               = useState(null);
  const [errorMsg, setErrorMsg]           = useState('');
  const [desiredRole, setDesiredRole]     = useState('');
  const inputRef = useRef();

  // ── file validation ──────────────────────────────────────

  function validateFile(file) {
    if (!file) return 'Please select a file.';
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED.includes(ext)) return 'Only PDF and DOCX files are accepted.';
    if (file.size > MAX_SIZE)    return 'File size exceeds 10 MB.';
    return '';
  }

  function handleFileSelect(file) {
    setErrorMsg('');
    setPhase('idle');
    setCompletedSteps([]);
    setCurrentStep(-1);
    setResult(null);
    const err = validateFile(file);
    if (err) { setErrorMsg(err); return; }
    setSelectedFile(file);
  }

  // ── upload + parse pipeline ──────────────────────────────

  async function handleSubmit() {
    if (!selectedFile || !userId) return;
    const err = validateFile(selectedFile);
    if (err) { setErrorMsg(err); return; }

    setPhase('processing');
    setErrorMsg('');
    setCompletedSteps([]);

    try {
      // Get desired role from user profile to improve AI matching
      let role = desiredRole;
      if (!role) {
        try {
          const profile = await getUserByUserId(userId);
          role = profile?.DesiredRole || '';
        } catch { /* skip */ }
      }

      // Step 1 — upload
      setCurrentStep(0);
      const uploadResult = await import('../services/resumeService').then(m =>
        m.uploadResume(userId, selectedFile)
      );
      setCompletedSteps(prev => [...prev, 0]);

      // Step 2 — extract text
      setCurrentStep(1);
      const resumeText = await import('../services/resumeService').then(m =>
        m.extractTextFromFile(selectedFile)
      );
      setCompletedSteps(prev => [...prev, 1]);

      // Step 3 — AI analysis
      setCurrentStep(2);
      const analysis = await import('../services/resumeService').then(m =>
        m.analyzeResumeWithAI(resumeText, role)
      );
      setCompletedSteps(prev => [...prev, 2]);

      // Step 4 — save to SharePoint
      setCurrentStep(3);
      const saved = await import('../services/resumeService').then(m =>
        m.saveUserSkills(userId, analysis, uploadResult.webUrl)
      );
      setCompletedSteps(prev => [...prev, 3]);

      setResult({ upload: uploadResult, analysis, saved });
      setPhase('done');
      if (typeof onUploaded === 'function') {
        onUploaded({ upload: uploadResult, analysis });
      }

    } catch (e) {
      console.error('[ResumeUpload]', e);
      setErrorMsg(e.message || 'An error occurred. Please try again.');
      setPhase('error');
      setCurrentStep(-1);
    }
  }

  // ── renders ──────────────────────────────────────────────

  if (phase === 'done' && result) {
    return <SuccessScreen result={result} onReset={() => {
      setPhase('idle');
      setSelectedFile(null);
      setResult(null);
      setCompletedSteps([]);
      setCurrentStep(-1);
    }} />;
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-800 p-6">

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files?.[0]); }}
        onClick={() => phase === 'idle' && inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition
          ${dragOver ? 'border-blue-400 bg-blue-900/20' : 'border-slate-600 bg-slate-700/30'}
          ${phase === 'processing' ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={e => handleFileSelect(e.target.files?.[0])}
        />
        <p className="text-2xl mb-2">📄</p>
        <p className="text-sm font-medium text-slate-200">
          {selectedFile ? selectedFile.name : 'Drag & drop or click to browse'}
        </p>
        <p className="mt-1 text-xs text-slate-400">PDF or DOCX — max 10 MB</p>
      </div>

      {/* Desired role input */}
      <div>
        <label className="block text-sm text-slate-300 mb-1">
          Target role <span className="text-slate-500">(optional — improves AI matching)</span>
        </label>
        <input
          type="text"
          value={desiredRole}
          onChange={e => setDesiredRole(e.target.value)}
          placeholder="e.g. Full Stack Developer, Data Analyst"
          disabled={phase === 'processing'}
          className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* Processing steps */}
      {phase === 'processing' && (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Processing your resume...
          </p>
          {STEPS.map((step, i) => {
            const done    = completedSteps.includes(i);
            const active  = currentStep === i;
            const pending = !done && !active;
            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0
                  ${done   ? 'bg-green-600 text-white' : ''}
                  ${active ? 'bg-blue-600 text-white animate-pulse' : ''}
                  ${pending ? 'bg-slate-700 text-slate-500' : ''}`}>
                  {done ? '✓' : active ? '⏳' : step.icon}
                </div>
                <span className={`text-sm
                  ${done   ? 'text-green-400 line-through' : ''}
                  ${active ? 'text-blue-300 font-medium' : ''}
                  ${pending ? 'text-slate-500' : ''}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="rounded-lg border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        disabled={!selectedFile || phase === 'processing'}
        onClick={handleSubmit}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white
          hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition"
      >
        {phase === 'processing' ? 'Analyzing...' : '🤖  Upload & Analyze with AI'}
      </button>

    </div>
  );
}

// ── Success screen ───────────────────────────────────────────

function SuccessScreen({ result, onReset }) {
  const { analysis, upload } = result;
  const gradeColor = {
    A: 'text-green-400',
    B: 'text-blue-400',
    C: 'text-yellow-400',
    D: 'text-orange-400',
    F: 'text-red-400',
  }[analysis.atsGrade] || 'text-slate-300';

  return (
    <div className="space-y-4 rounded-xl border border-green-700 bg-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-lg">✓</div>
        <div>
          <p className="font-semibold text-white">Resume analyzed successfully</p>
          <p className="text-xs text-slate-400">{upload.name}</p>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-900 border border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{analysis.profileScore}</p>
          <p className="text-xs text-slate-400 mt-1">Profile Score</p>
        </div>
        <div className="rounded-lg bg-slate-900 border border-slate-700 p-4 text-center">
          <p className={`text-3xl font-bold ${gradeColor}`}>
            {analysis.overallATSScore}
            <span className="text-lg ml-1">({analysis.atsGrade})</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">ATS Score</p>
        </div>
      </div>

      {/* ATS summary */}
      {analysis.atsSummary && (
        <p className="text-sm text-slate-300 bg-slate-900 rounded-lg p-3 border border-slate-700">
          {analysis.atsSummary}
        </p>
      )}

      {/* Skills found */}
      {analysis.technicalSkills?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Technical skills found ({analysis.technicalSkills.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.technicalSkills.map((s, i) => (
              <span key={i} className="rounded-full bg-blue-900/40 border border-blue-700 px-3 py-1 text-xs text-blue-300">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ATS sub-scores */}
      {analysis.atsSubScores && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">ATS breakdown</p>
          <div className="space-y-2">
            {Object.entries(analysis.atsSubScores).map(([key, val]) => {
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, s => s.toUpperCase());
              const color = val >= 80 ? 'bg-green-500' : val >= 60 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-36 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${val}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-300 w-8 text-right">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top improvements */}
      {analysis.improvements?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Top improvements</p>
          <div className="space-y-2">
            {analysis.improvements.slice(0, 3).map((imp, i) => (
              <div key={i} className="rounded-lg bg-slate-900 border border-slate-700 p-3">
                <span className={`text-xs font-semibold mr-2
                  ${imp.priority === 'Critical' ? 'text-red-400' :
                    imp.priority === 'Important' ? 'text-yellow-400' : 'text-slate-400'}`}>
                  {imp.priority}
                </span>
                <span className="text-xs text-slate-300">{imp.issue}</span>
                {imp.fix && <p className="text-xs text-slate-500 mt-1">→ {imp.fix}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SharePoint link */}
      <a
        href={upload.webUrl}
        target="_blank"
        rel="noreferrer"
        className="block text-center text-sm text-blue-400 hover:text-blue-300"
      >
        View file in SharePoint →
      </a>

      <button
        onClick={onReset}
        className="w-full rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
      >
        Upload another resume
      </button>
    </div>
  );
}
