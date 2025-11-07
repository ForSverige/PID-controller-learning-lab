
import React, { useState } from 'react';
import LearnTab from './components/LearnTab';
import TuneTab from './components/TuneTab';
import { BookOpenIcon, CogIcon } from './components/Icons';

type Tab = 'learn' | 'tune';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('learn');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'learn':
        return <LearnTab />;
      case 'tune':
        return <TuneTab />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center justify-center gap-2 px-4 py-3 text-sm sm:text-base font-bold rounded-t-lg transition-all duration-300 w-full sm:w-auto
        ${activeTab === tabName
          ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-600'
          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
        }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-800 text-white shadow-lg p-4 sm:p-6">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">🎓 PID Controller Learning Lab</h1>
          <p className="text-slate-300 mt-1">An interactive simulator to master Proportional-Integral-Derivative control.</p>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row border-b border-slate-300">
          <TabButton tabName="learn" label="Learn: Build Your PID" icon={<BookOpenIcon />} />
          <TabButton tabName="tune" label="Tune: Beat Baseline" icon={<CogIcon />} />
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-b-lg shadow-lg">
          {renderTabContent()}
        </div>
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>💡 <b>PID Guide:</b> <b>P</b>=Speed/Response | <b>I</b>=Accuracy/Error | <b>D</b>=Smoothness/Damping</p>
      </footer>
    </div>
  );
};

export default App;
