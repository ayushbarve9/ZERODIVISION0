import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity, Database, Server, CheckCircle2, Layers, Send } from 'lucide-react';

interface BackendHealth {
  status: string;
  service: string;
  uptime: number;
  timestamp: string;
  stats?: {
    issuesCount: number;
    clustersCount: number;
  };
}

export const BackendTelemetryView: React.FC = () => {
  const [healthData, setHealthData] = useState<BackendHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'tester'>('dashboard');
  const [testResponse, setTestResponse] = useState<string>('');
  const [testLoading, setTestLoading] = useState<boolean>(false);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:4000/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: BackendHealth = await res.json();
      setHealthData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend on port 4000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const runTestApi = async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      setTestLoading(true);
      setTestResponse(`Calling ${method} ${endpoint}...`);
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) {
        options.body = JSON.stringify(body);
      }
      const res = await fetch(`http://localhost:4000${endpoint}`, options);
      const json = await res.json();
      setTestResponse(JSON.stringify(json, null, 2));
      fetchHealth();
    } catch (err: any) {
      setTestResponse(`Error: ${err.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#EEE4DA] text-[#4D0E13] overflow-y-auto">
      {/* Module Sub-Header */}
      <div className="bg-[#4D0E13] border-b border-[#D8C4AC]/30 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#EEE4DA]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C8A49F] animate-ping" />
            <span className="font-mono text-[#EEE4DA] font-bold tracking-wider text-[11px]">CENTRAL BRAIN TELEMETRY</span>
          </div>
          <span className="text-[#D8C4AC]">|</span>
          <span className="text-[#D8C4AC] font-medium hidden md:inline">Spatial Duplicate Clustering (&lt;30m), YOLOv11 Prioritization & Socket.io Engine</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sub-view switcher */}
          <div className="flex items-center bg-[#3b0b0f] border border-[#D8C4AC]/30 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveSubTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                activeSubTab === 'dashboard' 
                  ? 'bg-[#C8A49F] text-[#4D0E13] font-bold shadow-md shadow-[#C8A49F]/20' 
                  : 'text-[#EEE4DA]/70 hover:text-[#EEE4DA]'
              }`}
            >
              Live Dashboard
            </button>
            <button
              onClick={() => setActiveSubTab('tester')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                activeSubTab === 'tester' 
                  ? 'bg-[#C8A49F] text-[#4D0E13] font-bold shadow-md shadow-[#C8A49F]/20' 
                  : 'text-[#EEE4DA]/70 hover:text-[#EEE4DA]'
              }`}
            >
              Interactive API Console
            </button>
          </div>

          <button
            onClick={fetchHealth}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3b0b0f] hover:bg-[#3b0b0f]/80 text-[#EEE4DA] border border-[#D8C4AC]/40 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C8A49F] ${loading ? 'animate-spin' : ''}`} />
            <span>Ping</span>
          </button>
        </div>
      </div>


      {/* Real-time Health Metrics Bar */}
      <div className="bg-[#FAF6F0] border-b border-[#D8C4AC] px-6 py-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-3 bg-[#D8C4AC]/25 border border-[#D8C4AC] p-3 rounded-xl shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#4D0E13] border border-[#D8C4AC]/40 flex items-center justify-center text-[#EEE4DA]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[#4D0E13]/70 text-[11px]">Backend Server</div>
            <div className="font-semibold text-[#4D0E13] font-mono">
              {error ? <span className="text-rose-600 font-bold">Unreachable</span> : <span className="text-emerald-700 font-bold">ONLINE (Port 4000)</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#D8C4AC]/25 border border-[#D8C4AC] p-3 rounded-xl shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#4D0E13] border border-[#D8C4AC]/40 flex items-center justify-center text-[#EEE4DA]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[#4D0E13]/70 text-[11px]">In-Memory Triage DB</div>
            <div className="font-semibold text-[#4D0E13] font-mono">
              {healthData?.stats ? `${healthData.stats.issuesCount} Issues Log` : '0 Issues'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#D8C4AC]/25 border border-[#D8C4AC] p-3 rounded-xl shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#4D0E13] border border-[#D8C4AC]/40 flex items-center justify-center text-[#EEE4DA]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[#4D0E13]/70 text-[11px]">Spatial Clusters (&lt;30m)</div>
            <div className="font-semibold text-[#4D0E13] font-mono">
              {healthData?.stats ? `${healthData.stats.clustersCount} Active Clusters` : '0 Clusters'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#D8C4AC]/25 border border-[#D8C4AC] p-3 rounded-xl shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#4D0E13] border border-[#D8C4AC]/40 flex items-center justify-center text-[#EEE4DA]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[#4D0E13]/70 text-[11px]">Uptime</div>
            <div className="font-semibold text-[#4D0E13] font-mono">
              {healthData?.uptime ? `${Math.floor(healthData.uptime)} seconds` : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {activeSubTab === 'dashboard' ? (
          <div className="w-full h-full min-h-[500px] bg-[#FAF6F0] border border-[#D8C4AC] rounded-xl overflow-hidden shadow-sm">
            <iframe
              src="http://localhost:4000"
              className="w-full h-full min-h-[650px] border-0"
              title="Module 2 Central Brain Dashboard"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions Panel */}
            <div className="bg-[#FAF6F0] border border-[#D8C4AC] rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#4D0E13] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#4D0E13]" />
                Live REST Endpoints Playground
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-white border border-[#D8C4AC] rounded-lg flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-[#4D0E13] text-[#EEE4DA] font-mono font-bold text-[11px] mr-2">GET</span>
                    <span className="font-mono text-xs text-[#4D0E13]">/health</span>
                    <div className="text-[11px] text-[#4D0E13]/70 mt-0.5">Ping system health and database statistics</div>
                  </div>
                  <button
                    onClick={() => runTestApi('/health', 'GET')}
                    disabled={testLoading}
                    className="px-3 py-1.5 rounded bg-[#C8A49F] hover:bg-[#ba938e] text-[#4D0E13] text-xs font-bold shadow-xs transition-colors"
                  >
                    Execute
                  </button>
                </div>

                <div className="p-3 bg-white border border-[#D8C4AC] rounded-lg flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-[#4D0E13] text-[#EEE4DA] font-mono font-bold text-[11px] mr-2">GET</span>
                    <span className="font-mono text-xs text-[#4D0E13]">/api/v1/issues/triage</span>
                    <div className="text-[11px] text-[#4D0E13]/70 mt-0.5">Fetch all ranked triage issues by multi-factor priority score</div>
                  </div>
                  <button
                    onClick={() => runTestApi('/api/v1/issues/triage', 'GET')}
                    disabled={testLoading}
                    className="px-3 py-1.5 rounded bg-[#C8A49F] hover:bg-[#ba938e] text-[#4D0E13] text-xs font-bold shadow-xs transition-colors"
                  >
                    Execute
                  </button>
                </div>

                <div className="p-3 bg-white border border-[#D8C4AC] rounded-lg flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-[#4D0E13] text-[#EEE4DA] font-mono font-bold text-[11px] mr-2">POST</span>
                    <span className="font-mono text-xs text-[#4D0E13]">/api/v1/issues/check-duplicate</span>
                    <div className="text-[11px] text-[#4D0E13]/70 mt-0.5">Test Haversine distance (&lt;30m) spatial pre-flight check</div>
                  </div>
                  <button
                    onClick={() =>
                      runTestApi('/api/v1/issues/check-duplicate', 'POST', {
                        latitude: 37.7749,
                        longitude: -122.4194,
                        category: 'pothole',
                        radiusMeters: 30,
                      })
                    }
                    disabled={testLoading}
                    className="px-3 py-1.5 rounded bg-[#C8A49F] hover:bg-[#ba938e] text-[#4D0E13] text-xs font-bold shadow-xs transition-colors"
                  >
                    Test 30m Check
                  </button>
                </div>

                <div className="p-3 bg-white border border-[#D8C4AC] rounded-lg flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-[#4D0E13] text-[#EEE4DA] font-mono font-bold text-[11px] mr-2">POST</span>
                    <span className="font-mono text-xs text-[#4D0E13]">/api/v1/issues/ingest</span>
                    <div className="text-[11px] text-[#4D0E13]/70 mt-0.5">Simulate citizen complaint ingestion with AI scoring & clustering</div>
                  </div>
                  <button
                    onClick={() =>
                      runTestApi('/api/v1/issues/ingest', 'POST', {
                        title: 'Severe Asphalt Fissure on Main St',
                        description: 'Deep road hazard observed impacting commuter lane.',
                        category: 'pothole',
                        citizenName: 'Citizen Audit Bot',
                        location: {
                          latitude: 37.77492,
                          longitude: -122.41941,
                          address: '100 Market St, Financial District',
                          district: 'Central Zone',
                        },
                      })
                    }
                    disabled={testLoading}
                    className="px-3 py-1.5 rounded bg-[#C8A49F] hover:bg-[#ba938e] text-[#4D0E13] text-xs font-bold shadow-xs transition-colors"
                  >
                    Ingest Sample
                  </button>
                </div>
              </div>
            </div>

            {/* Live Output Console */}
            <div className="bg-[#FAF6F0] border border-[#D8C4AC] rounded-xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#4D0E13] uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#4D0E13]" />
                  API Response Inspector
                </h3>
                {testResponse && (
                  <button
                    onClick={() => setTestResponse('')}
                    className="text-[11px] text-[#4D0E13]/60 hover:text-[#4D0E13] transition-colors"
                  >
                    Clear Output
                  </button>
                )}
              </div>

              <pre className="flex-1 p-4 bg-[#4D0E13] border border-[#D8C4AC]/40 rounded-lg font-mono text-xs text-[#EEE4DA] overflow-auto max-h-[420px] whitespace-pre-wrap shadow-inner">
                {testResponse || '// Click any "Execute" button on the left to inspect live REST responses'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
