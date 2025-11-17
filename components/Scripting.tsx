'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Play, Save, Trash2, Plus, Server, CheckSquare, FileCode, Terminal } from 'lucide-react';

export default function Scripting() {
  const devices = useStore((state) => state.devices);
  const selectedDevices = useStore((state) => state.selectedDevices);
  const toggleDeviceSelection = useStore((state) => state.toggleDeviceSelection);
  const setSelectedDevices = useStore((state) => state.setSelectedDevices);
  const scripts = useStore((state) => state.scripts);
  const addScript = useStore((state) => state.addScript);
  const updateScript = useStore((state) => state.updateScript);
  const removeScript = useStore((state) => state.removeScript);

  const [code, setCode] = useState('');
  const [currentScriptId, setCurrentScriptId] = useState<string | null>(null);
  const [scriptName, setScriptName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleExecute = async () => {
    if (!code.trim() || selectedDevices.length === 0) {
      setOutput((prev) => [...prev, '❌ Error: No code or devices selected']);
      return;
    }

    setExecuting(true);
    setOutput([]);
    setOutput((prev) => [...prev, `📡 Executing script on ${selectedDevices.length} device(s)...`, '']);

    for (const deviceId of selectedDevices) {
      const device = devices.find((d) => d.id === deviceId);
      if (!device) continue;

      setOutput((prev) => [
        ...prev,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `🖥️  Device: ${device.name} (${device.ip})`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setOutput((prev) => [...prev, `🔌 Connecting via SSH...`]);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setOutput((prev) => [...prev, `✅ Connected successfully`]);
      await new Promise((resolve) => setTimeout(resolve, 200));

      setOutput((prev) => [...prev, `⚙️  Executing Python script...`]);
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Simulate script output
      const mockOutputLines = [
        `>>> import sys`,
        `>>> print(f"Python {sys.version}")`,
        `Python 3.11.5`,
        `>>> # Device information`,
        `>>> hostname = "${device.name}"`,
        `>>> ip = "${device.ip}"`,
        `>>> print(f"Configuring {hostname} at {ip}")`,
        `Configuring ${device.name} at ${device.ip}`,
        `>>> # System metrics`,
        `>>> cpu_usage = ${device.cpu}`,
        `>>> memory_usage = ${device.memory}`,
        `>>> print(f"CPU: {cpu_usage}% | Memory: {memory_usage}%")`,
        `CPU: ${device.cpu}% | Memory: ${device.memory}%`,
      ];

      for (const line of mockOutputLines) {
        setOutput((prev) => [...prev, line]);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setOutput((prev) => [...prev, `✅ Script completed successfully`, '']);
    }

    setOutput((prev) => [...prev, `✨ All operations completed`, '']);
    setExecuting(false);
  };

  const handleSaveScript = () => {
    if (!scriptName.trim() || !code.trim()) return;

    if (currentScriptId) {
      updateScript(currentScriptId, {
        name: scriptName,
        code,
        lastModified: new Date().toISOString(),
      });
    } else {
      addScript({
        id: `script-${Date.now()}`,
        name: scriptName,
        code,
        language: 'python',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      });
    }

    setShowSaveModal(false);
    setScriptName('');
  };

  const handleLoadScript = (scriptId: string) => {
    const script = scripts.find((s) => s.id === scriptId);
    if (script) {
      setCode(script.code);
      setCurrentScriptId(script.id);
      setOutput([]);
    }
  };

  const handleNewScript = () => {
    setCode('# Write your Python script here\n# Selected devices will be available\n\nprint("Hello from NetObs Pro!")');
    setCurrentScriptId(null);
    setOutput([]);
  };

  useEffect(() => {
    if (code === '') {
      handleNewScript();
    }
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Scripting & Automation</h2>
        <p className="text-gray-400">Execute Python scripts on selected network devices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Saved Scripts</h3>
              <button
                onClick={handleNewScript}
                className="p-1 hover:bg-gray-800 rounded text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {scripts.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">No saved scripts</div>
              ) : (
                scripts.map((script) => (
                  <button
                    key={script.id}
                    onClick={() => handleLoadScript(script.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentScriptId === script.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileCode className="w-4 h-4" />
                      <span className="text-sm font-medium truncate">{script.name}</span>
                    </div>
                    <div className="text-xs opacity-70">
                      {new Date(script.lastModified).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Target Devices</h3>
              <button
                onClick={() => {
                  if (selectedDevices.length === devices.length) {
                    setSelectedDevices([]);
                  } else {
                    setSelectedDevices(devices.map((d) => d.id));
                  }
                }}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {selectedDevices.length === devices.length ? 'Clear All' : 'Select All'}
              </button>
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {devices.map((device) => (
                <label
                  key={device.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedDevices.includes(device.id)}
                    onChange={() => toggleDeviceSelection(device.id)}
                    className="w-4 h-4"
                  />
                  <Server className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{device.name}</div>
                    <div className="text-xs text-gray-500">{device.ip}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="text-sm text-gray-400">
                {selectedDevices.length} device(s) selected
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="border-b border-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Python Editor</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setScriptName('');
                    setShowSaveModal(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleExecute}
                  disabled={executing || selectedDevices.length === 0 || !code.trim()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  {executing ? 'Executing...' : 'Execute'}
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 p-4 bg-gray-950 text-gray-100 font-mono text-sm focus:outline-none resize-none"
              placeholder="# Write your Python script here..."
              spellCheck={false}
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="border-b border-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-green-400" />
                <h3 className="text-sm font-semibold text-white">Output Terminal</h3>
              </div>
              <button
                onClick={() => setOutput([])}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <div
              ref={terminalRef}
              className="h-96 p-4 bg-gray-950 overflow-y-auto font-mono text-sm"
            >
              {output.length === 0 ? (
                <div className="text-gray-600">Waiting for execution...</div>
              ) : (
                output.map((line, i) => (
                  <div key={i} className="text-gray-300 whitespace-pre-wrap">
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Save Script</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Script Name</label>
              <input
                type="text"
                value={scriptName}
                onChange={(e) => setScriptName(e.target.value)}
                placeholder="e.g., Backup Configuration"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScript}
                disabled={!scriptName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
