interface BottomNavProps {
  activeTab: 'home' | 'eats' | 'events' | 'news';
  onTabChange: (tab: 'home' | 'eats' | 'events' | 'news') => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={1.6}>
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={1.6}>
          <path d="M11 2v6.5c0 1.38-1.12 2.5-2.5 2.5S6 9.88 6 8.5V2" />
          <path d="M8.5 2v6.5" />
          <path d="M8.5 11v11" />
        </svg>
      ),
    },
    {
      id: 'events' as const,
      label: 'Events',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={1.6}>
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={1.6}>
          <rect x="2" y="3" width="20" height="18" rx="2" />
          <path d="M7 7h6M7 11h10M7 15h8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-[60px] flex-shrink-0 flex relative z-50 bg-card border-t border-border/40">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 bg-transparent border-none cursor-pointer text-[10px] font-semibold tracking-wider uppercase transition-all duration-200 ${
            activeTab === tab.id
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
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
