
import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from './Icon';

interface GeneratedCommandProps {
  command: string;
}

const GeneratedCommand: React.FC<GeneratedCommandProps> = ({ command }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    if (command) {
      navigator.clipboard.writeText(command);
      setIsCopied(true);
    }
  };

  return (
    <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm py-4">
        <div className="relative bg-gray-800 rounded-lg p-4 shadow-lg ring-1 ring-white/10">
            <pre className="text-sm text-blue-300 whitespace-pre-wrap break-all pr-12">
                <code>{command}</code>
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 rounded-md bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                aria-label="Copy command"
            >
                {isCopied ? (
                <CheckIcon className="w-5 h-5 text-green-400" />
                ) : (
                <ClipboardIcon className="w-5 h-5 text-gray-400" />
                )}
            </button>
        </div>
    </div>
  );
};

export default GeneratedCommand;
