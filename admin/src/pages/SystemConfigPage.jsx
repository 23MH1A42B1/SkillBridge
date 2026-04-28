import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getSystemConfig, saveSystemConfig, logAdminAction } from '../services/adminService';
import { useAdminAuth } from '../auth/AdminAuthContext';

export default function SystemConfigPage() {
  const { admin } = useAdminAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState('');

  useEffect(() => {
    getSystemConfig().then(setConfig).catch(console.error).finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSystemConfig(config);
      await logAdminAction(admin.email, 'System config updated', { config });
      showToast('Configuration saved successfully!');
    } catch (e) {
      showToast('Error saving: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (key) => {
    setConfig(c => ({ ...c, features: { ...c.features, [key]: !c.features[key] } }));
  };

  const updateAI = (key, value) => {
    setConfig(c => ({ ...c, ai: { ...c.ai, [key]: value } }));
  };

  const updateMaintenance = (key, value) => {
    setConfig(c => ({ ...c, maintenance: { ...c.maintenance, [key]: value } }));
  };

  const updateLimits = (key, value) => {
    setConfig(c => ({ ...c, limits: { ...c.limits, [key]: Number(value) } }));
  };

  const updateBranding = (key, value) => {
    setConfig(c => ({ ...c, branding: { ...c.branding, [key]: value } }));
  };

  const triggerGlobalMatch = async () => {
    setSaving(true);
    try {
      const { pushLiveAnnouncement } = await import('../services/adminService');
      await pushLiveAnnouncement(admin.email, "🚀 New Job Match Run triggered! Checking for top matches for you...", "success");
      await logAdminAction(admin.email, 'Triggered Global Match Run');
      showToast('Global match run triggered via live announcement!');
    } catch (e) {
      showToast('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const FEATURE_LABELS = {
    interviewSimulator: { label: 'Interview Simulator', icon: '🎤', desc: 'AI-powered mock interview sessions' },
    aiResumeBuilder:    { label: 'AI Resume Builder',   icon: '📝', desc: 'AI-assisted resume creation' },
    smartSearch:        { label: 'Smart Search',         icon: '🔍', desc: 'AI semantic job search' },
    negotiator:         { label: 'Salary Negotiator',    icon: '💰', desc: 'AI salary negotiation coach' },
    emailAlerts:        { label: 'Email Alerts',         icon: '📧', desc: 'Job match email notifications' },
    careerReport:       { label: 'Career Report',        icon: '📊', desc: 'Executive career readiness report' },
    linkedInOptimizer:  { label: 'LinkedIn Optimizer',   icon: '🔗', desc: 'LinkedIn profile optimization' },
  };

  if (loading) return (
    <AdminLayout title="System Config" subtitle="Feature flags & settings">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="System Configuration" subtitle="Manage features, AI settings & limits">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in shadow-lg">
          ✓ {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Flags */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-purple-500/15 rounded-xl flex items-center justify-center text-lg">🚦</div>
            <div>
              <p className="text-white font-semibold">Feature Flags</p>
              <p className="text-slate-500 text-xs">Toggle platform features on/off globally</p>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(FEATURE_LABELS).map(([key, { label, icon, desc }]) => {
              const enabled = config.features?.[key] ?? true;
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:border-admin-border
                    ${enabled ? 'border-green-500/20 bg-green-500/5' : 'border-admin-border bg-admin-hover'}`}
                  onClick={() => toggleFeature(key)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className={`text-sm font-medium ${enabled ? 'text-white' : 'text-slate-400'}`}>{label}</p>
                      <p className="text-slate-500 text-[11px]">{desc}</p>
                    </div>
                  </div>
                  {/* Toggle */}
                  <div className={`w-11 h-6 rounded-full transition-all duration-200 flex items-center px-0.5 flex-shrink-0 ${enabled ? 'bg-green-500' : 'bg-admin-border'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-orange-500/15 rounded-xl flex items-center justify-center text-lg">🔧</div>
              <div>
                <p className="text-white font-semibold">Maintenance Mode</p>
                <p className="text-slate-500 text-xs">Show a maintenance banner to all users</p>
              </div>
            </div>
            <div
              className={`flex items-center justify-between p-4 rounded-xl border mb-4 cursor-pointer transition-all
                ${config.maintenance?.enabled ? 'border-orange-500/30 bg-orange-500/10' : 'border-admin-border bg-admin-hover'}`}
              onClick={() => updateMaintenance('enabled', !config.maintenance?.enabled)}
            >
              <span className={`text-sm font-medium ${config.maintenance?.enabled ? 'text-orange-300' : 'text-slate-400'}`}>
                {config.maintenance?.enabled ? '⚠️  Maintenance ON — users see banner' : 'Maintenance is OFF'}
              </span>
              <div className={`w-11 h-6 rounded-full transition-all duration-200 flex items-center px-0.5 flex-shrink-0 ${config.maintenance?.enabled ? 'bg-orange-500' : 'bg-admin-border'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${config.maintenance?.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
            <div>
              <label className="section-label mb-1.5 block">Maintenance Message</label>
              <textarea
                className="input-field resize-none text-xs"
                rows={3}
                value={config.maintenance?.message || ''}
                onChange={e => updateMaintenance('message', e.target.value)}
                id="maintenance-msg"
              />
            </div>
          </div>

          {/* AI Settings */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-blue-500/15 rounded-xl flex items-center justify-center text-lg">🤖</div>
              <div>
                <p className="text-white font-semibold">AI Settings</p>
                <p className="text-slate-500 text-xs">Groq model & generation config</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="section-label mb-1.5 block">Groq Model</label>
                <select
                  className="input-field"
                  value={config.ai?.model || 'llama-3.1-8b-instant'}
                  onChange={e => updateAI('model', e.target.value)}
                  id="ai-model"
                >
                  <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fast)</option>
                  <option value="llama-3.1-70b-versatile">llama-3.1-70b-versatile (Smart)</option>
                  <option value="llama3-8b-8192">llama3-8b-8192</option>
                  <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                </select>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Temperature: {config.ai?.temperature}</label>
                <input
                  type="range" min="0" max="1" step="0.05"
                  className="w-full accent-brand-500"
                  value={config.ai?.temperature || 0.2}
                  onChange={e => updateAI('temperature', parseFloat(e.target.value))}
                  id="ai-temp"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0 (Precise)</span><span>1 (Creative)</span>
                </div>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Max Tokens</label>
                <input
                  type="number"
                  className="input-field"
                  value={config.ai?.maxTokens || 4096}
                  onChange={e => updateAI('maxTokens', parseInt(e.target.value))}
                  min={512} max={32768} step={512}
                  id="ai-max-tokens"
                />
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-red-500/15 rounded-xl flex items-center justify-center text-lg">🚧</div>
              <div>
                <p className="text-white font-semibold">Rate Limits</p>
                <p className="text-slate-500 text-xs">Per-user usage limits</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="section-label mb-1.5 block">Daily AI Calls per User</label>
                <input
                  type="number"
                  className="input-field"
                  value={config.limits?.dailyAiCallsPerUser || 20}
                  onChange={e => updateLimits('dailyAiCallsPerUser', e.target.value)}
                  min={1} max={1000}
                  id="limit-ai-calls"
                />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Max Resumes per User</label>
                <input
                  type="number"
                  className="input-field"
                  value={config.limits?.maxResumesPerUser || 5}
                  onChange={e => updateLimits('maxResumesPerUser', e.target.value)}
                  min={1} max={50}
                  id="limit-resumes"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Branding */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-pink-500/15 rounded-xl flex items-center justify-center text-lg">🎨</div>
              <div>
                <p className="text-white font-semibold">Dynamic Branding</p>
                <p className="text-slate-500 text-xs">Real-time theme customization</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="section-label mb-1.5 block">Primary Brand Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    className="w-12 h-10 rounded-lg bg-transparent border border-admin-border cursor-pointer"
                    value={config.branding?.primaryColor || '#6366f1'}
                    onChange={e => updateBranding('primaryColor', e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field flex-1"
                    value={config.branding?.primaryColor || '#6366f1'}
                    onChange={e => updateBranding('primaryColor', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="section-label mb-1.5 block">Border Radius (px): {config.branding?.borderRadius || 16}</label>
                <input
                  type="range" min="0" max="32" step="2"
                  className="w-full accent-brand-500"
                  value={config.branding?.borderRadius || 16}
                  onChange={e => updateBranding('borderRadius', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Concierge Actions */}
          <div className="glass-card p-6 bg-brand-500/5 border-brand-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-brand-500/15 rounded-xl flex items-center justify-center text-lg">🪄</div>
              <div>
                <p className="text-white font-semibold">Concierge Actions</p>
                <p className="text-slate-500 text-xs">Trigger platform-wide AI events</p>
              </div>
            </div>
            <button
              onClick={triggerGlobalMatch}
              disabled={saving}
              className="w-full btn-secondary py-3 flex items-center justify-center gap-2 hover:bg-brand-500/10 hover:text-brand-400"
            >
              🚀 Trigger Global AI Match Run
            </button>
            <p className="text-[10px] text-slate-600 mt-2 text-center">
              This will notify all active users to refresh their matches.
            </p>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-8 py-3 text-base"
          id="save-config-btn"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            '💾 Save Configuration'
          )}
        </button>
      </div>
    </AdminLayout>
  );
}
