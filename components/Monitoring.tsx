'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Activity, Wifi, HardDrive, Cpu, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Monitoring() {
  const devices = useStore((state) => state.devices);
  const [selectedDevice, setSelectedDevice] = useState(devices[0]?.id || '');

  const device = devices.find((d) => d.id === selectedDevice);

  const generateMetricData = (base: number, variance: number) => {
    return Array.from({ length: 30 }, (_, i) => ({
      time: `${i}m`,
      value: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance)),
    }));
  };

  const cpuData = generateMetricData(device?.cpu || 50, 20);
  const memoryData = generateMetricData(device?.memory || 60, 15);
  const networkData = generateMetricData(45, 30);
  const diskData = generateMetricData(35, 10);

  const interfaces = device
    ? Array.from({ length: device.interfaces }, (_, i) => ({
        id: `eth${i}`,
        name: `Ethernet${i}`,
        status: Math.random() > 0.1 ? 'up' : 'down',
        speed: ['1G', '10G', '40G', '100G'][Math.floor(Math.random() * 4)],
        inbound: Math.floor(Math.random() * 800) + 100,
        outbound: Math.floor(Math.random() * 600) + 50,
      }))
    : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Monitoring</h2>
        <p className="text-gray-400">Real-time device metrics and SNMP polling</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">Select Device</label>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="w-full md:w-96 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.ip})
            </option>
          ))}
        </select>
      </div>

      {device && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="CPU Usage"
              value={`${device.cpu}%`}
              icon={Cpu}
              color="blue"
              trend={device.cpu > 70 ? 'high' : 'normal'}
            />
            <MetricCard
              title="Memory Usage"
              value={`${device.memory}%`}
              icon={HardDrive}
              color="purple"
              trend={device.memory > 80 ? 'high' : 'normal'}
            />
            <MetricCard
              title="Uptime"
              value={formatUptime(device.uptime)}
              icon={Zap}
              color="green"
              trend="normal"
            />
            <MetricCard
              title="Interfaces"
              value={`${interfaces.filter((i) => i.status === 'up').length}/${interfaces.length}`}
              icon={Wifi}
              color="orange"
              trend="normal"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">CPU Usage (Last 30min)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cpuData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: any) => `${value.toFixed(1)}%`}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Memory Usage (Last 30min)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={memoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: any) => `${value.toFixed(1)}%`}
                  />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Network Traffic (Last 30min)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={networkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: any) => `${value.toFixed(1)} Mbps`}
                  />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Disk I/O (Last 30min)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={diskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: any) => `${value.toFixed(1)} MB/s`}
                  />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Network Interfaces</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Interface</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Speed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Inbound (Mbps)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Outbound (Mbps)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {interfaces.slice(0, 8).map((iface) => (
                    <tr key={iface.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm text-white">{iface.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            iface.status === 'up'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {iface.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{iface.speed}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{iface.inbound}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{iface.outbound}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
  trend: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    green: 'bg-green-500/10 text-green-500',
    orange: 'bg-orange-500/10 text-orange-500',
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend === 'high' && (
          <span className="text-xs text-yellow-500 font-medium">HIGH</span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
}
