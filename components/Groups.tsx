'use client';

import { useState } from 'react';
import { useStore, DeviceGroup } from '@/lib/store';
import { Layers, Plus, Edit2, Trash2, Server, Sparkles } from 'lucide-react';

export default function Groups() {
  const groups = useStore((state) => state.groups);
  const devices = useStore((state) => state.devices);
  const addGroup = useStore((state) => state.addGroup);
  const removeGroup = useStore((state) => state.removeGroup);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupType, setGroupType] = useState<'auto' | 'manual'>('auto');
  const [groupName, setGroupName] = useState('');
  const [criteriaField, setCriteriaField] = useState<'model' | 'version' | 'type' | 'name'>('model');
  const [criteriaOperator, setCriteriaOperator] = useState<'equals' | 'contains' | 'startsWith' | 'regex'>('contains');
  const [criteriaValue, setCriteriaValue] = useState('');

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

  const handleCreateGroup = () => {
    if (!groupName) return;

    let matchedDevices: string[] = [];

    if (groupType === 'auto' && criteriaValue) {
      matchedDevices = devices
        .filter((device) => {
          const fieldValue = device[criteriaField].toLowerCase();
          const testValue = criteriaValue.toLowerCase();

          switch (criteriaOperator) {
            case 'equals':
              return fieldValue === testValue;
            case 'contains':
              return fieldValue.includes(testValue);
            case 'startsWith':
              return fieldValue.startsWith(testValue);
            case 'regex':
              try {
                return new RegExp(criteriaValue, 'i').test(device[criteriaField]);
              } catch {
                return false;
              }
            default:
              return false;
          }
        })
        .map((d) => d.id);
    }

    const newGroup: DeviceGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      type: groupType,
      criteria:
        groupType === 'auto'
          ? {
              field: criteriaField,
              operator: criteriaOperator,
              value: criteriaValue,
            }
          : undefined,
      devices: matchedDevices,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    addGroup(newGroup);
    setShowCreateModal(false);
    setGroupName('');
    setCriteriaValue('');
  };

  const getDevicesByGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return [];
    return devices.filter((d) => group.devices.includes(d.id));
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Device Groups</h2>
          <p className="text-gray-400">Organize devices automatically or manually</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Groups Yet</h3>
          <p className="text-gray-400 mb-4">Create your first device group to organize your infrastructure</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const groupDevices = getDevicesByGroup(group.id);
            return (
              <div
                key={group.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${group.color}20`, color: group.color }}
                    >
                      {group.type === 'auto' ? (
                        <Sparkles className="w-5 h-5" />
                      ) : (
                        <Layers className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          group.type === 'auto'
                            ? 'bg-purple-500/10 text-purple-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {group.type === 'auto' ? 'Automatic' : 'Manual'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeGroup(group.id)}
                      className="p-2 hover:bg-gray-800 rounded text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {group.criteria && (
                  <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Criteria</div>
                    <div className="text-sm text-white font-mono">
                      {group.criteria.field} {group.criteria.operator} "{group.criteria.value}"
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Server className="w-4 h-4" />
                    <span>{groupDevices.length} devices</span>
                  </div>
                </div>

                {groupDevices.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="space-y-2">
                      {groupDevices.slice(0, 3).map((device) => (
                        <div key={device.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{device.name}</span>
                          <span className="text-gray-500">{device.ip}</span>
                        </div>
                      ))}
                      {groupDevices.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{groupDevices.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Create Device Group</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Production Routers"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Group Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGroupType('auto')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                      groupType === 'auto'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Automatic</div>
                  </button>
                  <button
                    onClick={() => setGroupType('manual')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                      groupType === 'manual'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Layers className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Manual</div>
                  </button>
                </div>
              </div>

              {groupType === 'auto' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Field</label>
                      <select
                        value={criteriaField}
                        onChange={(e) => setCriteriaField(e.target.value as any)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="model">Model</option>
                        <option value="version">Version</option>
                        <option value="type">Type</option>
                        <option value="name">Name</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Operator</label>
                      <select
                        value={criteriaOperator}
                        onChange={(e) => setCriteriaOperator(e.target.value as any)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="equals">Equals</option>
                        <option value="contains">Contains</option>
                        <option value="startsWith">Starts With</option>
                        <option value="regex">Regex</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Value</label>
                    <input
                      type="text"
                      value={criteriaValue}
                      onChange={(e) => setCriteriaValue(e.target.value)}
                      placeholder="e.g., Cisco"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {groupType === 'manual' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">
                    You can manually assign devices to this group after creation from the Devices page.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName || (groupType === 'auto' && !criteriaValue)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
