import { useState } from 'react';
import Ticker from '@/components/dashboard/Ticker';
import BottomNav from '@/components/dashboard/BottomNav';
import HomeTab from '@/components/dashboard/HomeTab';
import EatsTab from '@/components/dashboard/EatsTab';
import EventsTab from '@/components/dashboard/EventsTab';
import NewsTab from '@/components/dashboard/NewsTab';
import { useNews } from '@/hooks/useNews';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'eats' | 'events' | 'news'>('home');
  const { articles, isLoading, lastFetched, refetch } = useNews();

  return (
    <div className="flex flex-col h-[100dvh]">
      <Ticker />
      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'home' ? 'block' : 'hidden'}`}
             style={{ padding: '12px 16px 76px' }}>
          <HomeTab onNavigate={(tab) => setActiveTab(tab as any)} newsArticles={articles} onNewsClick={() => setActiveTab('news')} />
        </div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'eats' ? 'block' : 'hidden'}`}
             style={{ padding: '12px 16px 76px' }}>
          <EatsTab />
        </div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'events' ? 'block' : 'hidden'}`}
             style={{ padding: '12px 16px 76px' }}>
          <EventsTab />
        </div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'news' ? 'block' : 'hidden'}`}
             style={{ padding: '12px 16px 76px' }}>
          <NewsTab articles={articles} isLoading={isLoading} lastFetched={lastFetched} onRefresh={refetch} />
        </div>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
