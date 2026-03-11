import { useState, useEffect } from 'react';
import Ticker from '@/components/dashboard/Ticker';
import BottomNav from '@/components/dashboard/BottomNav';
import HomeTab from '@/components/dashboard/HomeTab';
import EatsTab from '@/components/dashboard/EatsTab';
import EventsTab from '@/components/dashboard/EventsTab';
import NewsTab from '@/components/dashboard/NewsTab';
import LotteryTab from '@/components/dashboard/CommunityTab';
import ObituariesTab from '@/components/dashboard/ObituariesTab';
import { useNews } from '@/hooks/useNews';
import { fetchWeather, WeatherData } from '@/data/weather';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'eats' | 'events' | 'news' | 'lottery' | 'obituaries'>('home');
  const { articles, isLoading, lastFetched, refetch } = useNews();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchWeather().then(setWeather);
    const interval = setInterval(() => fetchWeather().then(setWeather), 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-[100dvh]">
      <Ticker weather={weather} />
      <div className="flex-1 overflow-hidden relative">
        {(['home', 'eats', 'events', 'news', 'lottery', 'obituaries'] as const).map(tab => (
          <div
            key={tab}
            className={`absolute inset-0 overflow-y-auto ${activeTab === tab ? 'block' : 'hidden'}`}
            style={{ padding: '4px 24px 84px' }}
          >
            <div className="max-w-lg mx-auto">
              {tab === 'home' && (
                <HomeTab
                  onNavigate={(t) => setActiveTab(t as any)}
                  newsArticles={articles}
                  onNewsClick={() => setActiveTab('news')}
                  weather={weather}
                  onLotteryClick={() => setActiveTab('lottery')}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              )}
              {tab === 'eats' && <EatsTab onBackToHome={() => setActiveTab('home')} />}
              {tab === 'events' && <EventsTab onBackToHome={() => setActiveTab('home')} />}
              {tab === 'news' && (
                <NewsTab
                  articles={articles}
                  isLoading={isLoading}
                  lastFetched={lastFetched}
                  onRefresh={refetch}
                  onBackToHome={() => setActiveTab('home')}
                />
              )}
              {tab === 'lottery' && <LotteryTab onBackToHome={() => setActiveTab('home')} />}
              {tab === 'obituaries' && <ObituariesTab onBackToHome={() => setActiveTab('home')} />}
            </div>
          </div>
        ))}
      </div>
      {!isMobile && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
};

export default Index;
