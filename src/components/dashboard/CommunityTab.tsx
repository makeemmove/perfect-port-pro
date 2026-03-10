import LotteryWidget from './widgets/LotteryWidget';
import ObituariesWidget from './widgets/ObituariesWidget';

const CommunityTab = () => {
  return (
    <div className="space-y-4">
      <div className="text-center pt-2 pb-1">
        <h1 className="text-[22px] font-bold" style={{ color: '#111827' }}>Community</h1>
        <p className="text-[12px]" style={{ color: '#9ca3af' }}>Lottery results & local memorials</p>
      </div>
      <LotteryWidget />
      <ObituariesWidget />
    </div>
  );
};

export default CommunityTab;
