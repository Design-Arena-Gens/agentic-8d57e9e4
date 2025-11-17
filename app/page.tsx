'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Devices from '@/components/Devices';
import Monitoring from '@/components/Monitoring';
import Compliance from '@/components/Compliance';
import Alerts from '@/components/Alerts';
import Scripting from '@/components/Scripting';
import Groups from '@/components/Groups';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'devices':
        return <Devices />;
      case 'monitoring':
        return <Monitoring />;
      case 'compliance':
        return <Compliance />;
      case 'alerts':
        return <Alerts />;
      case 'scripting':
        return <Scripting />;
      case 'groups':
        return <Groups />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
