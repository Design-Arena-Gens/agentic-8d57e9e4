'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { AlertTriangle, Check, Bell, Filter, Clock, Server } from 'lucide-react';

export default function Alerts() {
  const alerts = useStore((state) => state.alerts);
  const acknowledgeAlert = useStore((state) => state.acknowledgeAlert);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (!showAcknowledged && alert.acknowledged) return false;
    if (filter !== 'all' && alert.severity !== filter) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && !a.acknowledged).length;
  const infoCount = alerts.filter((a) => a.severity === 'info' && !a.acknowledged).length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/50';
      case 'warning':
        return 'border-yellow-500/50';
      case 'info':
        return 'border-blue-500/50';
      default:
        return 'border-gray-500/50';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Alerts & Issues</h2>
          <p className="text-gray-400">Monitor and manage network alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            Configure
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AlertStatCard
          title="Critical"
          count={criticalCount}
          icon={AlertTriangle}
          color="red"
          active={filter === 'critical'}
          onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
        />
        <AlertStatCard
          title="Warning"
          count={warningCount}
          icon={AlertTriangle}
          color="yellow"
          active={filter === 'warning'}
          onClick={() => setFilter(filter === 'warning' ? 'all' : 'warning')}
        />
        <AlertStatCard
          title="Info"
          count={infoCount}
          icon={AlertTriangle}
          color="blue"
          active={filter === 'info'}
          onClick={() => setFilter(filter === 'info' ? 'all' : 'info')}
        />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            All Alerts
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showAcknowledged}
              onChange={(e) => setShowAcknowledged(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-800 border-gray-700"
            />
            Show Acknowledged
          </label>
        </div>
        <div className="text-sm text-gray-400">
          {filteredAlerts.length} alert(s)
        </div>
      </div>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Alerts</h3>
            <p className="text-gray-400">All systems are operating normally</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-gray-900 border-l-4 border-r border-t border-b border-gray-800 ${getSeverityBorder(
                alert.severity
              )} rounded-lg p-6 ${alert.acknowledged ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)} mt-2 animate-pulse`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                          alert.severity === 'critical'
                            ? 'bg-red-500/10 text-red-500'
                            : alert.severity === 'warning'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      {alert.acknowledged && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300">
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{alert.message}</h3>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <span>{alert.deviceName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AlertStatCard({
  title,
  count,
  icon: Icon,
  color,
  active,
  onClick,
}: {
  title: string;
  count: number;
  icon: any;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  const colorClasses = {
    red: 'bg-red-500/10 text-red-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    blue: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <button
      onClick={onClick}
      className={`bg-gray-900 border-2 rounded-lg p-6 text-left transition-colors ${
        active ? 'border-blue-500' : 'border-gray-800 hover:border-gray-700'
      }`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{count}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </button>
  );
}
