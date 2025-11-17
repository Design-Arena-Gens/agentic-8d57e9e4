'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Shield, CheckCircle, XCircle, AlertTriangle, Play, Plus, Settings } from 'lucide-react';

export default function Compliance() {
  const complianceChecks = useStore((state) => state.complianceChecks);
  const devices = useStore((state) => state.devices);
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null);

  const totalChecks = complianceChecks.length;
  const passedChecks = complianceChecks.filter((c) => c.status === 'passed').length;
  const failedChecks = complianceChecks.filter((c) => c.status === 'failed').length;
  const totalIssues = complianceChecks.reduce((sum, c) => sum + (c.issues || 0), 0);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-500/10 text-green-500';
      case 'failed':
        return 'bg-red-500/10 text-red-500';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Policy Compliance</h2>
          <p className="text-gray-400">Monitor and enforce network security policies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          New Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Policies" value={totalChecks} icon={Shield} color="blue" />
        <StatCard title="Passed" value={passedChecks} icon={CheckCircle} color="green" />
        <StatCard title="Failed" value={failedChecks} icon={XCircle} color="red" />
        <StatCard title="Total Issues" value={totalIssues} icon={AlertTriangle} color="yellow" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {complianceChecks.map((check) => (
          <div key={check.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">{getStatusIcon(check.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{check.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(check.status)}`}>
                      {check.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{check.description}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-400">Last Run: </span>
                      <span className="text-white">
                        {check.lastRun ? new Date(check.lastRun).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    {check.issues !== undefined && (
                      <div>
                        <span className="text-gray-400">Issues: </span>
                        <span className={check.issues > 0 ? 'text-red-500 font-semibold' : 'text-green-500'}>
                          {check.issues}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">Devices: </span>
                      <span className="text-white">{check.devices.length || devices.length}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-800 rounded text-blue-400 hover:text-blue-300 transition-colors">
                  <Play className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {check.status === 'failed' && check.issues && check.issues > 0 && (
              <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-500 mb-2">Compliance Issues Detected</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• {check.issues} device(s) failed this compliance check</li>
                      <li>• Immediate remediation recommended</li>
                      <li>• Click "Run" to re-check after fixes</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Compliance Rules</h3>
        <div className="space-y-3">
          <RuleItem
            title="Password Complexity"
            description="Minimum 12 characters, mixed case, numbers, and symbols"
            severity="high"
          />
          <RuleItem
            title="Session Timeout"
            description="Automatic logout after 15 minutes of inactivity"
            severity="medium"
          />
          <RuleItem
            title="Logging Requirements"
            description="All administrative actions must be logged"
            severity="high"
          />
          <RuleItem
            title="Encryption Standards"
            description="TLS 1.2 or higher for all management interfaces"
            severity="high"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-red-500/10 text-red-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );
}

function RuleItem({
  title,
  description,
  severity,
}: {
  title: string;
  description: string;
  severity: string;
}) {
  const severityColors = {
    high: 'bg-red-500/10 text-red-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    low: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-white">{title}</h4>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColors[severity as keyof typeof severityColors]}`}>
            {severity.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}
