interface BottomNavProps {
  activeTab: 'home' | 'eats' | 'events';
  onTabChange: (tab: 'home' | 'eats' | 'events') => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[22px] h-[22px]" strokeWidth={1.8}>
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[22px] h-[22px]" strokeWidth={1.8}>
          <path d="M3 2l1.5 14.5M7.5 2v6.5a3 3 0 0 0 6 0V2M21 2c0 7-3 10-3 10v9" />
        </svg>
      ),
    },
    {
      id: 'events' as const,
      label: 'Events',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[22px] h-[22px]" strokeWidth={1.8}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-[62px] flex-shrink-0 flex relative z-50"
         style={{
           background: 'rgba(10,12,20,0.97)',
           borderTop: '1px solid hsl(var(--glass-border))',
         }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex flex-col items-center justify-center gap-[3px] bg-transparent border-none cursor-pointer font-['Syne',sans-serif] text-[10px] font-bold tracking-[0.08em] uppercase transition-colors duration-200 ${
            activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
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
