import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../auth/AuthContext';
import { getPendingEmailAlerts, sendJobMatchEmail, generateJobMatchEmailHTML } from '../services/emailService';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function EmailAlerts() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Tab Data
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [emailHistory, setEmailHistory] = useState([]);
  const [previewHtml, setPreviewHtml] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingEmailAlerts(60);
      setPendingAlerts(data);
      if(data.length > 0 && data[0].matches.length > 0) {
         setPreviewHtml(generateJobMatchEmailHTML(data[0].profile?.fullName || 'Candidate', data[0].matches));
      }
    } catch (e) {
      setErrorMsg('Failed to load pending alerts.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'emailLogs'), orderBy('sentAt', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      setEmailHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      setErrorMsg('Failed to load email history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(!user) return;
    setErrorMsg('');
    if(activeTab === 'pending' || activeTab === 'preview') {
      fetchPending();
    } else if(activeTab === 'history') {
      fetchHistory();
    }
  }, [user, activeTab]);

  const handleSendMyAlerts = async () => {
    const myAlerts = pendingAlerts.find(a => a.userId === user.uid);
    if (!myAlerts || myAlerts.matches.length === 0) {
      alert("You have no pending high-match alerts.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await sendJobMatchEmail(user.uid, user.email, myAlerts.profile?.fullName, myAlerts.matches);
      alert(`Email dispatch ${res.status}!`);
      await fetchPending();
    } catch (e) {
      alert("Failed to trigger email via Power Automate.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkSend = async () => {
    if(pendingAlerts.length === 0) return;
    setActionLoading(true);
    try {
      for(const group of pendingAlerts) {
        if(group.matches.length > 0) {
          await sendJobMatchEmail(group.userId, group.profile?.email || 'admin@mock.com', group.profile?.fullName || 'User', group.matches);
        }
      }
      alert(`Dispatched ${pendingAlerts.length} emails.`);
      await fetchPending();
    } catch (e) {
      alert("Bulk send encountered errors.");
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: 'pending', name: 'Pending Alerts' },
    { id: 'preview', name: 'Email Preview' },
    { id: 'history', name: 'Email History' },
    { id: 'admin', name: 'Admin Dashboard' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Email Alerts HQ</h1>
          <p className="text-gray-500 mt-2">Manage automated job match notifications powered by Azure Power Automate.</p>
        </div>

        {/* Custom Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={` whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {errorMsg && <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg">{errorMsg}</div>}

        {/* Tab Contents */}
        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'pending' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Your Pending Matches</h3>
                  <button onClick={handleSendMyAlerts} disabled={actionLoading} className="btn-primary">
                    {actionLoading ? 'Sending...' : 'Send My Email Now'}
                  </button>
                </div>
                
                {(() => {
                  const myAlert = pendingAlerts.find(a => a.userId === user.uid);
                  if(!myAlert || myAlert.matches.length === 0) return <p className="text-gray-500 italic py-8 text-center text-lg">No unsent job matches for you currently.</p>;
                  return (
                    <div className="space-y-4">
                      {myAlert.matches.map(m => (
                        <div key={m.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div>
                            <p className="font-bold text-gray-900">{m.jobTitle}</p>
                            <p className="text-sm text-gray-500">{m.company}</p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 font-bold rounded-lg text-sm">{m.matchScore}% Match</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[500px]">
                <h3 className="text-lg font-bold mb-6">HTML Email Preview Generator</h3>
                {previewHtml ? (
                  <div className="border-4 border-gray-100 rounded-xl overflow-hidden p-0 max-w-2xl mx-auto shadow-inner bg-gray-100">
                    <iframe 
                      title="email-preview"
                      srcDoc={previewHtml}
                      className="w-full min-h-[600px] border-none bg-white"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-center italic mt-12">Generate pending matches first to see a preview.</p>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date / Time</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Recipient</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Volume</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm h-64">
                    {emailHistory.length === 0 ? (
                       <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No logs found</td></tr>
                    ) : emailHistory.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(log.sentAt).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{log.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{log.jobCount} Jobs</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.status.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-100/50">
                  <h3 className="text-xl font-bold text-indigo-900 mb-2">Mass Dispatch Alerts</h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Trigger the Power Automate webhook for all {pendingAlerts.length} users who have pending jobs stacked in the queue.
                  </p>
                  <button onClick={handleBulkSend} disabled={actionLoading || pendingAlerts.length === 0} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg">
                    {actionLoading ? 'Processing Webhooks...' : `Trigger All Pending Emails (${pendingAlerts.length} Users)`}
                  </button>
                </div>
                
                <div className="bg-gray-800 text-white p-6 rounded-2xl border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🔌 Power Automate Webhook Config</h3>
                  <div className="space-y-4 font-mono text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto text-green-400">
                    <p>POST {import.meta.env.VITE_PA_JOB_MATCH_URL || 'UNDEFINED_WEBHOOK_URL'}</p>
                    <p>{"{"}</p>
                    <p>  "to": "string",</p>
                    <p>  "subject": "string",</p>
                    <p>  "htmlBody": "html_string",</p>
                    <p>  "candidateName": "string",</p>
                    <p>  "matchCount": "number"</p>
                    <p>{"}"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
