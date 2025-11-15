import React, { useState, useEffect } from 'react';
import { PositionedNode } from './DependencyViewer';
import { ClipboardIcon, CheckIcon } from './Icon';

interface DevUnitModalProps {
  node: PositionedNode;
  onClose: () => void;
}

type Tab = 'prompt' | 'code' | 'example' | 'test';

const DevUnitModal: React.FC<DevUnitModalProps> = ({ node, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('prompt');
  const [isCopied, setIsCopied] = useState(false);

  const tabs: Tab[] = ['prompt', 'code', 'example', 'test'];
  const content = node.devUnit[activeTab];

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);
  
  // Reset copy state when tab changes
  useEffect(() => {
    setIsCopied(false);
  }, [activeTab]);


  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setIsCopied(true);
    }
  };

  const tabButtonClasses = (tab: Tab) => `
    px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
    ${activeTab === tab 
      ? 'bg-gray-700 text-white' 
      : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
    }
  `;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-unit-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col ring-1 ring-white/10" 
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="min-w-0">
            <h2 id="dev-unit-title" className="text-lg font-semibold text-white truncate" title={node.path}>{node.label}</h2>
            <p className="text-sm text-gray-400 truncate">{node.path}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <nav className="flex space-x-2 px-4 pt-2 border-b border-gray-700 flex-shrink-0">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={tabButtonClasses(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        <main className="p-4 overflow-y-auto relative">
          <button
            onClick={handleCopy}
            className="absolute top-6 right-6 p-2 rounded-md bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors"
            aria-label="Copy code"
          >
            {isCopied ? (
              <CheckIcon className="w-5 h-5 text-green-400" />
            ) : (
              <ClipboardIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <pre className="bg-gray-900/50 rounded-md p-4 text-sm text-gray-200 whitespace-pre-wrap break-all">
            <code>{content}</code>
          </pre>
        </main>
      </div>
    </div>
  );
};

export default DevUnitModal;