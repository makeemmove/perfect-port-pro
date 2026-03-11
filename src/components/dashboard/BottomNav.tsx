interface BottomNavProps {
  activeTab: 'home' | 'eats' | 'events' | 'news' | 'lottery' | 'obituaries';
  onTabChange: (tab: 'home' | 'eats' | 'events' | 'news' | 'lottery' | 'obituaries') => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      id: 'eats' as const,
      label: 'Eats',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M13 7v4c0 .8-.7 1.5-1.5 1.5S10 11.8 10 11V7" />
          <path d="M11.5 7v4" />
          <path d="M11.5 12.5v4.5" />
        </svg>
      ),
    },
    {
      id: 'events' as const,
      label: 'Events',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
      ),
    },
    {
      id: 'news' as const,
      label: 'News',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
          <rect x="2" y="3" width="20" height="18" rx="2" />
          <path d="M7 7h6M7 11h10M7 15h8" />
        </svg>
      ),
    },
    {
      id: 'lottery' as const,
      label: 'Lottery',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 9l2 2 4-4" />
          <circle cx="17" cy="15" r="1" />
          <circle cx="13" cy="15" r="1" />
          <circle cx="9" cy="15" r="1" />
        </svg>
      ),
    },
    {
      id: 'obituaries' as const,
      label: 'Obituaries',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 7h6" />
          <path d="M9 11h4" />
          <path d="M9 15h3" />
          <path d="M8 21c0-1.5 1-3 4-3s4 1.5 4 3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-[64px] flex-shrink-0 flex relative z-50 glass-card rounded-none border-x-0 border-b-0">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 ease-in-out active:scale-[0.98] ${
            activeTab === tab.id
              ? 'text-secondary'
              : 'text-primary'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
