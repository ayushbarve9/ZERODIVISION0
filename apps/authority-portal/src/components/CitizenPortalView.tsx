import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export const CitizenPortalView: React.FC = () => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#EEE4DA] text-[#4D0E13]">
      {/* Sleek Minimal Utility Bar */}
      <div className="bg-[#4D0E13] border-b border-[#D8C4AC]/30 px-6 py-2 flex items-center justify-between gap-3 text-xs text-[#EEE4DA]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#C8A49F] animate-pulse" />
          <span className="text-[#EEE4DA] font-mono font-bold tracking-wider text-[11px]">
            COMMON GROUND INTAKE
          </span>
          <span className="text-[#D8C4AC]">|</span>
          <span className="text-[#D8C4AC] hidden sm:inline">
            Public Issue Intake & Neighborhood Signals
          </span>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3b0b0f] hover:bg-[#3b0b0f]/80 text-[#EEE4DA] border border-[#D8C4AC]/40 text-xs font-semibold transition-colors"
          title="Reload Citizen Portal"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C8A49F] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload View</span>
        </button>
      </div>

      {/* Embedded Viewport Frame */}
      <div className="flex-1 relative bg-[#EEE4DA]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#EEE4DA]/90 z-10 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-[#D8C4AC] border-t-[#C8A49F] rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono text-[#4D0E13]">Initializing Citizen Portal...</p>
            <p className="text-[11px] text-[#4D0E13]/70 mt-1">Community Intake & Transparency Hub</p>
          </div>
        )}

        <iframe
          key={iframeKey}
          src="http://localhost:3001"
          title="Common Ground Citizen Portal"
          className="w-full h-full border-none"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};
