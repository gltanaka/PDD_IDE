import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CommandType } from './types';
import { COMMANDS } from './constants';
import { mockPrompts } from './data/mockPrompts';
import Tabs from './components/Tabs';
import CommandForm from './components/CommandForm';
import GeneratedCommand from './components/GeneratedCommand';
import Header from './components/Header';
import DependencyViewer from './components/DependencyViewer';
import ChangeModal from './components/ChangeModal';

type View = 'builder' | 'dependencies';

const App: React.FC = () => {
  const [activeCommand, setActiveCommand] = useState<CommandType>(CommandType.SCAFFOLD);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [view, setView] = useState<View>('dependencies');
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);

  const activeConfig = COMMANDS[activeCommand];

  useEffect(() => {
    // Reset form data when switching commands
    setFormData({});
  }, [activeCommand]);
  
  const generatedCommand = useMemo(() => {
    let command = `pdd ${activeCommand}`;
    const activeOptions = COMMANDS[activeCommand].options;
    let positionalArgs = '';

    // Ensure options are added in the order they are defined in constants.ts
    for (const option of activeOptions) {
        const key = option.name;
        const value = formData[key];
        if (value) {
            // For certain commands, some arguments are positional
            const isPositional = (
                (activeCommand === CommandType.GEN || 
                 activeCommand === CommandType.EXAMPLE || 
                 activeCommand === CommandType.VERIFY ||
                 activeCommand === CommandType.SPLIT ||
                 activeCommand === CommandType.AUTO_DEPS ||
                 activeCommand === CommandType.SYNC ||
                 activeCommand === CommandType.CHANGE
                ) && (key === 'prompt' || key === 'change-request')
            ) || (activeCommand === CommandType.CONFLICT && key === 'files');

            if (isPositional) {
                // For change-request, we need to wrap in quotes
                const positionalValue = (key === 'change-request') ? `"${value.replace(/"/g, '\\"')}"` : value;
                positionalArgs += ` ${positionalValue}`;
                continue;
            }
            // Escape double quotes within the value and wrap it in quotes if it contains spaces
            const sanitizedValue = value.includes(' ') ? `"${value.replace(/"/g, '\\"')}"` : value;
            command += ` --${key} ${sanitizedValue}`;
        }
    }
    
    command += positionalArgs;
    
    return command;
  }, [activeCommand, formData]);

  const handleRegenerateArchitecture = () => {
    setView('builder');
    setActiveCommand(CommandType.GEN);
    setFormData({
      'prompt': 'pdd/templates/architecture/architecture_json.prompt',
      'output-file': 'architecture.json',
      'env-file': 'PRD_FILE=docs/specs.md',
    });
  };

  const handleSetupCommandForPrompt = (command: CommandType, promptPath: string) => {
    setView('builder');
    setActiveCommand(command);
    setFormData({
      'prompt': promptPath,
    });
  };

  const handleSetupCommand = (command: CommandType) => {
    setView('builder');
    setActiveCommand(command);
    setFormData({});
  };
  
  const handleDetectChanges = async (changeRequest: string): Promise<string> => {
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      return Promise.reject(new Error("API key is not configured. This feature requires a valid API key."));
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const promptFilePaths = mockPrompts.map(p => p.id).join('\n');
    const systemInstruction = `You are an expert software architect. Your task is to identify which file is the most relevant to a given change request. The user will provide a change request and a list of available prompt files. Respond with ONLY the single, most relevant file path from the list provided. Do not add any explanation or formatting.`;
    
    const contents = `
Change Request: "${changeRequest}"

Available prompt files:
${promptFilePaths}

Which file is the most relevant to this change request?
    `.trim();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0,
        }
      });
      const suggestedFile = response.text.trim();

      // Basic validation to ensure the model returned a plausible file path
      if (mockPrompts.some(p => p.id === suggestedFile)) {
        return suggestedFile;
      } else {
        console.warn("Model returned a file path that doesn't exist in the mock data:", suggestedFile);
        // Fallback to the first prompt as a default for this demo
        return mockPrompts[0].id;
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return Promise.reject(new Error("Failed to get suggestion from the AI. Please check the console for details."));
    }
  };

  const handleProposeChange = (changeRequest: string) => {
    setIsChangeModalOpen(false);
    setView('builder');
    setActiveCommand(CommandType.CHANGE);
    setFormData({
      'change-request': changeRequest,
    });
  };


  return (
    <div className="min-h-screen">
      <Header currentView={view} onViewChange={setView} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'builder' ? (
          <div className="space-y-8">
            <Tabs activeCommand={activeCommand} onCommandChange={setActiveCommand} />
            <CommandForm 
              config={activeConfig} 
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        ) : (
          <DependencyViewer 
            onRegenerate={handleRegenerateArchitecture} 
            onSetupCommandForPrompt={handleSetupCommandForPrompt}
            onSetupCommand={handleSetupCommand}
            onProposeChange={() => setIsChangeModalOpen(true)}
          />
        )}
      </main>
      {view === 'builder' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <GeneratedCommand command={generatedCommand} />
        </div>
      )}
      {isChangeModalOpen && (
        <ChangeModal 
          onClose={() => setIsChangeModalOpen(false)} 
          onSubmit={handleProposeChange} 
          onDetect={handleDetectChanges}
        />
      )}
    </div>
  );
};

export default App;