import type { ReactNode } from 'react';
import * as motion from 'motion/react-client';

export interface tabInterface {
  id: string;
  label: string;
  icon: ReactNode;
}

export function SectionTabs({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: tabInterface[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}) {
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <section className='w-full overflow-x-auto'>
      <div className='border-shNeutral-200 flex min-w-max items-center gap-1 border-b md:min-w-0 md:gap-3'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            title={tab.label}
            className={`focus-visible:ring-shAccent-500 focus-visible:ring-offset-shBackground relative flex shrink-0 cursor-pointer items-center gap-2 rounded-t-lg px-3 py-3 text-sm font-semibold transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:px-5 md:py-4 ${
              activeTab === tab.id
                ? 'text-shPrimary-800'
                : 'text-shNeutral-500 hover:text-shNeutral-900 hover:bg-white'
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className='size-5 shrink-0'>{tab.icon}</span>
            <span className='hidden md:inline'>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId='underline'
                className='bg-shPrimary-500 absolute right-0 bottom-0 left-0 h-0.5'
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
