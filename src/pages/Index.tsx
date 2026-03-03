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
        {(['home', 'eats', 'events', 'news'] as const).map(tab => (
          <div
            key={tab}
            className={`absolute inset-0 overflow-y-auto ${activeTab === tab ? 'block' : 'hidden'}`}
            style={{ padding: '16px 24px 84px' }}
          >
            <div className="max-w-lg mx-auto">
              {tab === 'home' && <HomeTab onNavigate={(t) => setActiveTab(t as any)} newsArticles={articles} onNewsClick={() => setActiveTab('news')} />}
              {tab === 'eats' && <EatsTab />}
              {tab === 'events' && <EventsTab />}
              {tab === 'news' && <NewsTab articles={articles} isLoading={isLoading} lastFetched={lastFetched} onRefresh={refetch} />}
            </div>
          </div>
        ))}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
