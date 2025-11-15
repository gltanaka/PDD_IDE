
import React, { useState, useEffect } from 'react';
import { PositionedNode } from './DependencyViewer';
import { ClipboardIcon, CheckIcon, SparklesIcon } from './Icon';
import { CommandType } from '../types';
import Tooltip from './Tooltip';

interface DevUnitModalProps {
  node: PositionedNode;
  onClose: () => void;
  onSetupCommandForPrompt: (command: CommandType, promptPath: string) => void;
}

type Tab = 'prompt' | 'code' | 'example' | 'test';

const DevUnitModal: React.FC<DevUnitModalProps> = ({ node, onClose, onSetupCommandForPrompt }) => {
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
          <Tooltip content="Close">
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Tooltip>
        </header>

        <nav className="flex space-x-2 px-4 pt-2 border-b border-gray-700 flex-shrink-0">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={tabButtonClasses(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        <main className="p-4 overflow-y-auto relative">
          <div className="absolute top-6 right-6 flex items-center space-x-2">
            {activeTab === 'prompt' && (
              <Tooltip content="Modify code by applying changes from this prompt.">
                <button
                  onClick={() => onSetupCommandForPrompt(CommandType.GEN, node.path)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-blue-500 transition-colors"
                  aria-label="Update from this prompt"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Update</span>
                </button>
              </Tooltip>
            )}
            {activeTab === 'code' && (
              <Tooltip content="Regenerate this code from its prompt.">
                <button
                  onClick={() => onSetupCommandForPrompt(CommandType.GEN, node.path)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-blue-500 transition-colors"
                  aria-label="Regenerate code from this prompt"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Generate</span>
                </button>
              </Tooltip>
            )}
            {activeTab === 'example' && (
              <>
                <Tooltip content="Generate a usage example for this component.">
                  <button
                    onClick={() => onSetupCommandForPrompt(CommandType.EXAMPLE, node.path)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-blue-500 transition-colors"
                    aria-label="Create an example from this prompt"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>Create Example</span>
                  </button>
                </Tooltip>
                <Tooltip content="Verify that an example implements the prompt's requirements.">
                  <button
                    onClick={() => onSetupCommandForPrompt(CommandType.VERIFY, node.path)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-green-500 transition-colors"
                    aria-label="Verify functionality using this prompt"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>Verify</span>
                  </button>
                </Tooltip>
                <Tooltip content="Diagnose a crash using this prompt and a stack trace.">
                  <button
                    onClick={() => onSetupCommandForPrompt(CommandType.CRASH, node.path)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-red-500 transition-colors"
                    aria-label="Fix a crash using this prompt"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>Fix Crash</span>
                  </button>
                </Tooltip>
              </>
            )}
            {activeTab === 'test' && (
              <>
                <Tooltip content="Generate a test file for this component based on the prompt.">
                  <button
                    onClick={() => onSetupCommandForPrompt(CommandType.TEST, node.path)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-blue-500 transition-colors"
                    aria-label="Generate a test from this prompt"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>Generate Test</span>
                  </button>
                </Tooltip>
                <Tooltip content="Fix a failing test file using this prompt as context.">
                  <button
                    onClick={() => onSetupCommandForPrompt(CommandType.FIX, node.path)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-amber-500 transition-colors"
                    aria-label="Fix a test using this prompt"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>Fix Test</span>
                  </button>
                </Tooltip>
              </>
            )}
            <Tooltip content={isCopied ? 'Copied!' : 'Copy content to clipboard'}>
              <button
                onClick={handleCopy}
                className="p-2 rounded-md bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors"
                aria-label="Copy content"
              >
                {isCopied ? (
                  <CheckIcon className="w-5 h-5 text-green-400" />
                ) : (
                  <ClipboardIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </Tooltip>
          </div>
          <pre className="bg-gray-900/50 rounded-md p-4 text-sm text-gray-200 whitespace-pre-wrap break-all">
            <code>{content}</code>
          </pre>
        </main>
      </div>
    </div>
  );
};

export default DevUnitModal;
