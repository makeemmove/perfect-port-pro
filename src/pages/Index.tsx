import { useState } from 'react';
import Ticker from '@/components/dashboard/Ticker';
import BottomNav from '@/components/dashboard/BottomNav';
import HomeTab from '@/components/dashboard/HomeTab';
import EatsTab from '@/components/dashboard/EatsTab';
import EventsTab from '@/components/dashboard/EventsTab';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'eats' | 'events'>('home');

  return (
    <div className="flex flex-col h-[100dvh]">
      <Ticker />
      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'home' ? 'block' : 'hidden'}`}
             style={{ padding: '18px 16px 76px' }}>
          <HomeTab />
        </div>
        <div className={`absolute inset-0 ${activeTab === 'eats' ? 'flex flex-col' : 'hidden'}`}>
          <EatsTab />
        </div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'events' ? 'block' : 'hidden'}`}
             style={{ padding: '18px 16px 76px' }}>
          <EventsTab />
        </div>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
