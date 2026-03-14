import { useState } from 'react';
import ResumeUpload from '../components/ResumeUpload';

export default function Upload() {
  const [uploadedInfo, setUploadedInfo] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Upload Resume</h1>
        <p className="mt-1 text-slate-300">
          Upload your latest resume to trigger AI parsing and refresh your skill profile.
        </p>
      </div>

      <ResumeUpload onUploaded={setUploadedInfo} />

      {uploadedInfo && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-sm text-slate-200">
          <p className="font-semibold text-white">Latest upload</p>
          <p className="mt-2">File: {uploadedInfo.name}</p>
          <p>Size: {Math.round((uploadedInfo.size || 0) / 1024)} KB</p>
          <a
            href={uploadedInfo.webUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-blue-400 hover:text-blue-300"
          >
            Open in SharePoint
          </a>
        </div>
      )}
    </div>
  );
}
