
import React, { useState, useEffect, useMemo } from 'react';
import { PositionedNode } from './DependencyViewer';
import { ClipboardIcon, CheckIcon, SparklesIcon, LinkIcon, SyncIcon, DocumentArrowDownIcon, BugAntIcon } from './Icon';
import { CommandType, MockPrompt } from '../types';
import Tooltip from './Tooltip';

interface DevUnitModalProps {
  node: PositionedNode;
  onClose: () => void;
  onSetupCommandForPrompt: (command: CommandType, promptPath: string) => void;
  allPrompts: MockPrompt[];
  onReportBug: (promptPath: string) => void;
}

type Tab = 'prompt' | 'code' | 'example' | 'test';

const DevUnitModal: React.FC<DevUnitModalProps> = ({ node, onClose, onSetupCommandForPrompt, allPrompts, onReportBug }) => {
  const [activeTabs, setActiveTabs] = useState<Tab[]>(['prompt']);
  const [copiedTab, setCopiedTab] = useState<Tab | null>(null);
  const [isPreprocessedViewVisible, setIsPreprocessedViewVisible] = useState(false);

  const allTabs: Tab[] = ['prompt', 'code', 'example', 'test'];

  const preprocessPrompt = (promptId: string, allPromptsMap: Map<string, MockPrompt>, visited = new Set<string>()): string => {
    if (visited.has(promptId)) return `[Circular Dependency Detected: ${promptId}]`;
    visited.add(promptId);

    const prompt = allPromptsMap.get(promptId);
    if (!prompt) return `[Import not found: ${promptId}]`;

    let content = prompt.devUnit.prompt;
    const importRegex = /# Imports\n((?:- .+\n?)+)/;
    const importMatch = content.match(importRegex);

    if (importMatch) {
      const importBlock = importMatch[0];
      const importListStr = importMatch[1];
      const imports = importListStr.split('\n').filter(line => line.startsWith('- ')).map(line => line.substring(2).trim());
      
      const preprocessedImports = imports.map(imp => 
        `--- Start of import: ${imp} ---\n${preprocessPrompt(imp, allPromptsMap, new Set(visited))}\n--- End of import: ${imp} ---`
      ).join('\n\n');

      content = content.replace(importBlock, preprocessedImports);
    }
    return content.trim();
  };

  useEffect(() => {
    if (copiedTab) {
      const timer = setTimeout(() => setCopiedTab(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedTab]);

  const allPromptsMap = useMemo(() => new Map(allPrompts.map(p => [p.id, p])), [allPrompts]);

  const preprocessedContent = useMemo(() => {
    if (!isPreprocessedViewVisible) return '';
    return preprocessPrompt(node.id, allPromptsMap);
  }, [isPreprocessedViewVisible, node.id, allPromptsMap]);

  const handleCopy = (tab: Tab) => {
    const content = tab === 'prompt' && isPreprocessedViewVisible ? preprocessedContent : node.devUnit[tab];
    if (content) {
      navigator.clipboard.writeText(content);
      setCopiedTab(tab);
    }
  };

  const handleTabToggle = (tab: Tab) => {
    setActiveTabs(prev => {
      if (prev.includes(tab)) {
        if (prev.length === 1) return prev; // Don't allow removing the last tab
        return prev.filter(t => t !== tab);
      }
      return [...prev, tab];
    });
  };

  const tabButtonClasses = (tab: Tab) => `
    px-4 py-2 text-sm font-medium rounded-md transition-colors
    ${activeTabs.includes(tab)
      ? 'bg-blue-600 text-white'
      : 'text-gray-400 bg-gray-700/50 hover:bg-gray-700 hover:text-gray-200'
    }
  `;

  const renderPanelActions = (tab: Tab) => {
    const commonButtonClass = "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
    
    switch (tab) {
      case 'prompt':
        return (
          <>
            <Tooltip content="Modify code by applying changes from this prompt."><button onClick={() => onSetupCommandForPrompt(CommandType.GEN, node.path)} className={`${commonButtonClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`}><SparklesIcon className="w-4 h-4" /><span>Update</span></button></Tooltip>
            <Tooltip content="Automatically detect and add # Imports dependencies."><button onClick={() => onSetupCommandForPrompt(CommandType.AUTO_DEPS, node.path)} className={`${commonButtonClass} bg-teal-600 hover:bg-teal-700 focus:ring-teal-500`}><LinkIcon className="w-4 h-4" /><span>Auto-Deps</span></button></Tooltip>
            <Tooltip content={isPreprocessedViewVisible ? "Hide preprocessed view" : "Show resolved # Imports."}><button onClick={() => setIsPreprocessedViewVisible(p => !p)} className={`${commonButtonClass} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`}><DocumentArrowDownIcon className="w-4 h-4" /><span>{isPreprocessedViewVisible ? 'Hide' : 'Preprocess'}</span></button></Tooltip>
          </>
        );
      case 'code':
        return <Tooltip content="Regenerate this code from its prompt."><button onClick={() => onSetupCommandForPrompt(CommandType.GEN, node.path)} className={`${commonButtonClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`}><SparklesIcon className="w-4 h-4" /><span>Generate</span></button></Tooltip>;
      case 'example':
        return (
          <>
            <Tooltip content="Generate a usage example for this component."><button onClick={() => onSetupCommandForPrompt(CommandType.EXAMPLE, node.path)} className={`${commonButtonClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`}><SparklesIcon className="w-4 h-4" /><span>Create Example</span></button></Tooltip>
            <Tooltip content="Verify that an example implements the prompt's requirements."><button onClick={() => onSetupCommandForPrompt(CommandType.VERIFY, node.path)} className={`${commonButtonClass} bg-green-600 hover:bg-green-700 focus:ring-green-500`}><SparklesIcon className="w-4 h-4" /><span>Verify</span></button></Tooltip>
            <Tooltip content="Diagnose a crash using this prompt and a stack trace."><button onClick={() => onSetupCommandForPrompt(CommandType.CRASH, node.path)} className={`${commonButtonClass} bg-red-600 hover:bg-red-700 focus:ring-red-500`}><SparklesIcon className="w-4 h-4" /><span>Fix Crash</span></button></Tooltip>
          </>
        );
      case 'test':
        return (
          <>
            <Tooltip content="Generate a test file for this component."><button onClick={() => onSetupCommandForPrompt(CommandType.TEST, node.path)} className={`${commonButtonClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`}><SparklesIcon className="w-4 h-4" /><span>Generate Test</span></button></Tooltip>
            <Tooltip content="Fix a failing test file using this prompt."><button onClick={() => onSetupCommandForPrompt(CommandType.FIX, node.path)} className={`${commonButtonClass} bg-amber-600 hover:bg-amber-700 focus:ring-amber-500`}><SparklesIcon className="w-4 h-4" /><span>Fix Test</span></button></Tooltip>
            <Tooltip content="Describe a bug to generate a test case."><button onClick={() => onReportBug(node.path)} className={`${commonButtonClass} bg-red-600 hover:bg-red-700 focus:ring-red-500`}><BugAntIcon className="w-4 h-4" /><span>Report Bug</span></button></Tooltip>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-unit-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col ring-1 ring-white/10" 
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="min-w-0">
            <h2 id="dev-unit-title" className="text-lg font-semibold text-white truncate" title={node.path}>{node.label}</h2>
            <p className="text-sm text-gray-400 truncate">{node.path}</p>
          </div>
          <div className="flex items-center space-x-4 ml-4">
            <Tooltip content="Synchronize the dev unit (code, example, test) with this prompt.">
              <button
                onClick={() => onSetupCommandForPrompt(CommandType.SYNC, node.path)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-colors"
                aria-label="Sync dev unit with this prompt"
              >
                <SyncIcon className="w-4 h-4" />
                <span>Sync</span>
              </button>
            </Tooltip>
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
          </div>
        </header>

        <nav className="flex items-center space-x-2 px-4 py-3 border-b border-gray-700 flex-shrink-0">
          <span className="text-sm font-medium text-gray-400 mr-2">Views:</span>
          {allTabs.map(tab => (
            <button key={tab} onClick={() => handleTabToggle(tab)} className={tabButtonClasses(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        <main className="flex-grow p-4 overflow-hidden">
          <div className={`grid h-full gap-4 grid-cols-${activeTabs.length}`}>
            {activeTabs.map(tab => (
              <div key={tab} className="bg-gray-900/50 rounded-lg flex flex-col h-full overflow-hidden ring-1 ring-white/10">
                <header className="flex items-center justify-between p-2 pl-4 border-b border-gray-700 flex-shrink-0">
                  <h3 className="text-base font-semibold text-white capitalize">{tab}</h3>
                  <div className="flex items-center space-x-1">
                    {renderPanelActions(tab)}
                    <Tooltip content={copiedTab === tab ? 'Copied!' : 'Copy content'}>
                      <button onClick={() => handleCopy(tab)} className="p-2 rounded-md bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors" aria-label="Copy content">
                        {copiedTab === tab ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5 text-gray-400" />}
                      </button>
                    </Tooltip>
                  </div>
                </header>
                <div className="p-4 overflow-auto flex-grow">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap break-all h-full">
                    <code>{node.devUnit[tab]}</code>
                  </pre>
                   {tab === 'prompt' && isPreprocessedViewVisible && (
                    <div className="mt-4 animate-fade-in border-t border-gray-700 pt-4">
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Preprocessed Prompt</h4>
                      <pre className="bg-gray-900/80 rounded-md p-4 text-sm text-gray-200 whitespace-pre-wrap break-all border border-indigo-500/50">
                        <code>{preprocessedContent}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DevUnitModal;
