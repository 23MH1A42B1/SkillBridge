import { useMemo, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { uploadResume } from '../services/resumeService';
import { getAzureObjectId } from '../services/userService';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];

function isValidResumeFile(file) {
  const lower = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  const hasValidMime = ACCEPTED_MIME_TYPES.includes(file.type);
  return hasValidExtension || hasValidMime;
}

export default function ResumeUpload({ onUploaded }) {
  const { instance, accounts } = useMsal();
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const account = instance.getActiveAccount() || accounts[0];
  const userId = useMemo(() => getAzureObjectId(account), [account]);

  function validateFile(file) {
    if (!file) {
      return 'Please choose a file first.';
    }

    if (!isValidResumeFile(file)) {
      return 'Only PDF and DOCX files are accepted.';
    }

    if (file.size > MAX_SIZE_BYTES) {
      return 'File size exceeds 10MB. Please upload a smaller file.';
    }

    return '';
  }

  function handleFileSelection(file) {
    setError('');
    const validationError = validateFile(file);
    if (validationError) {
      setSelectedFile(null);
      setStatus('error');
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setStatus('idle');
  }

  function onInputChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  }

  async function handleUpload() {
    if (!userId) {
      setStatus('error');
      setError('Unable to resolve your account. Please sign in again.');
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setStatus('error');
      setError(validationError);
      return;
    }

    setStatus('uploading');
    setError('');

    try {
      const uploaded = await uploadResume(userId, selectedFile);
      setStatus('done');
      if (typeof onUploaded === 'function') {
        onUploaded(uploaded);
      }
    } catch (uploadError) {
      setStatus('error');
      setError(uploadError.message || 'Upload failed. Please try again.');
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-800 p-6">
      <div
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
        className="rounded-lg border border-dashed border-slate-600 bg-slate-700/30 p-8 text-center"
      >
        <p className="text-sm text-slate-200">Drag and drop your resume here</p>
        <p className="mt-1 text-xs text-slate-400">Accepted: PDF, DOCX | Max size: 10MB</p>
        <label className="mt-4 inline-block cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
          Choose File
          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={onInputChange}
          />
        </label>
      </div>

      <div className="rounded-lg bg-slate-700/40 p-4 text-sm text-slate-200">
        <p className="font-medium">Selected file</p>
        <p className="mt-1 text-slate-300">{selectedFile ? selectedFile.name : 'No file selected yet.'}</p>
      </div>

      <button
        type="button"
        disabled={status === 'uploading' || !selectedFile}
        onClick={handleUpload}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'uploading' ? 'Uploading...' : 'Upload Resume'}
      </button>

      {status === 'done' && (
        <div className="rounded-lg border border-green-700 bg-green-900/30 p-4 text-sm text-green-200">
          Resume uploaded. AI is analyzing your skills - you will receive an email with your results shortly.
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-lg border border-red-700 bg-red-900/30 p-4 text-sm text-red-200">{error}</div>
      )}
    </div>
  );
}
