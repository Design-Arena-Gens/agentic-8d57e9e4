import { create } from 'zustand';

export interface Device {
  id: string;
  name: string;
  ip: string;
  type: string;
  model: string;
  version: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: string;
  uptime: number;
  cpu: number;
  memory: number;
  interfaces: number;
  groups: string[];
}

export interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  devices: string[];
  lastRun?: string;
  status?: 'passed' | 'failed' | 'warning';
  issues?: number;
}

export interface DeviceGroup {
  id: string;
  name: string;
  type: 'auto' | 'manual';
  criteria?: {
    field: 'model' | 'version' | 'type' | 'name';
    operator: 'equals' | 'contains' | 'startsWith' | 'regex';
    value: string;
  };
  devices: string[];
  color: string;
}

export interface Script {
  id: string;
  name: string;
  code: string;
  language: 'python' | 'bash';
  createdAt: string;
  lastModified: string;
}

interface Store {
  devices: Device[];
  alerts: Alert[];
  complianceChecks: ComplianceCheck[];
  groups: DeviceGroup[];
  scripts: Script[];
  selectedDevices: string[];
  addDevice: (device: Device) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  removeDevice: (id: string) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string) => void;
  addComplianceCheck: (check: ComplianceCheck) => void;
  updateComplianceCheck: (id: string, updates: Partial<ComplianceCheck>) => void;
  addGroup: (group: DeviceGroup) => void;
  updateGroup: (id: string, updates: Partial<DeviceGroup>) => void;
  removeGroup: (id: string) => void;
  addScript: (script: Script) => void;
  updateScript: (id: string, updates: Partial<Script>) => void;
  removeScript: (id: string) => void;
  setSelectedDevices: (deviceIds: string[]) => void;
  toggleDeviceSelection: (deviceId: string) => void;
}

// Mock data generation
const generateMockDevices = (): Device[] => {
  const models = ['Cisco ASR 9000', 'Juniper MX960', 'Arista 7500R', 'Cisco Nexus 9000', 'Juniper EX4300'];
  const versions = ['15.2.4', '16.3.1', '17.1.2', '18.0.1', '19.2.3'];
  const types = ['Router', 'Switch', 'Firewall'];

  return Array.from({ length: 25 }, (_, i) => ({
    id: `dev-${i + 1}`,
    name: `${types[i % 3]}-${String(i + 1).padStart(2, '0')}`,
    ip: `192.168.${Math.floor(i / 254)}.${(i % 254) + 1}`,
    type: types[i % 3],
    model: models[i % models.length],
    version: versions[i % versions.length],
    status: i % 7 === 0 ? 'offline' : i % 5 === 0 ? 'warning' : 'online',
    lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    uptime: Math.floor(Math.random() * 8640000),
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    interfaces: Math.floor(Math.random() * 48) + 8,
    groups: [],
  }));
};

const generateMockAlerts = (devices: Device[]): Alert[] => {
  const messages = [
    'High CPU usage detected',
    'Interface down',
    'Memory threshold exceeded',
    'Configuration drift detected',
    'SNMP timeout',
    'Unusual traffic pattern',
    'BGP neighbor down',
    'Link flapping detected',
  ];

  return Array.from({ length: 15 }, (_, i) => {
    const device = devices[Math.floor(Math.random() * devices.length)];
    return {
      id: `alert-${i + 1}`,
      deviceId: device.id,
      deviceName: device.name,
      severity: i % 3 === 0 ? 'critical' : i % 2 === 0 ? 'warning' : 'info',
      message: messages[i % messages.length],
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      acknowledged: i % 4 === 0,
    };
  });
};

const generateMockComplianceChecks = (): ComplianceCheck[] => [
  {
    id: 'comp-1',
    name: 'Password Policy',
    description: 'Ensure all devices have strong password policies configured',
    enabled: true,
    devices: [],
    lastRun: new Date(Date.now() - 7200000).toISOString(),
    status: 'failed',
    issues: 3,
  },
  {
    id: 'comp-2',
    name: 'NTP Configuration',
    description: 'Verify NTP is configured on all devices',
    enabled: true,
    devices: [],
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    status: 'passed',
    issues: 0,
  },
  {
    id: 'comp-3',
    name: 'SNMP Community Strings',
    description: 'Check for default or weak SNMP community strings',
    enabled: true,
    devices: [],
    lastRun: new Date(Date.now() - 10800000).toISOString(),
    status: 'warning',
    issues: 2,
  },
  {
    id: 'comp-4',
    name: 'SSH Version',
    description: 'Ensure SSH version 2 is enabled and version 1 is disabled',
    enabled: true,
    devices: [],
    lastRun: new Date(Date.now() - 14400000).toISOString(),
    status: 'passed',
    issues: 0,
  },
];

const mockDevices = generateMockDevices();

export const useStore = create<Store>((set) => ({
  devices: mockDevices,
  alerts: generateMockAlerts(mockDevices),
  complianceChecks: generateMockComplianceChecks(),
  groups: [],
  scripts: [],
  selectedDevices: [],

  addDevice: (device) =>
    set((state) => ({ devices: [...state.devices, device] })),

  updateDevice: (id, updates) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),

  removeDevice: (id) =>
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
    })),

  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts] })),

  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    })),

  addComplianceCheck: (check) =>
    set((state) => ({ complianceChecks: [...state.complianceChecks, check] })),

  updateComplianceCheck: (id, updates) =>
    set((state) => ({
      complianceChecks: state.complianceChecks.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  addGroup: (group) =>
    set((state) => ({ groups: [...state.groups, group] })),

  updateGroup: (id, updates) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),

  removeGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    })),

  addScript: (script) =>
    set((state) => ({ scripts: [...state.scripts, script] })),

  updateScript: (id, updates) =>
    set((state) => ({
      scripts: state.scripts.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  removeScript: (id) =>
    set((state) => ({
      scripts: state.scripts.filter((s) => s.id !== id),
    })),

  setSelectedDevices: (deviceIds) =>
    set({ selectedDevices: deviceIds }),

  toggleDeviceSelection: (deviceId) =>
    set((state) => ({
      selectedDevices: state.selectedDevices.includes(deviceId)
        ? state.selectedDevices.filter((id) => id !== deviceId)
        : [...state.selectedDevices, deviceId],
    })),
}));
