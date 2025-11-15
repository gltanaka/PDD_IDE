import React, { useState, useEffect, useMemo } from 'react';
import { CommandType } from './types';
import { COMMANDS } from './constants';
import Tabs from './components/Tabs';
import CommandForm from './components/CommandForm';
import GeneratedCommand from './components/GeneratedCommand';
import Header from './components/Header';
import DependencyViewer from './components/DependencyViewer';

type View = 'builder' | 'dependencies';

const App: React.FC = () => {
  const [activeCommand, setActiveCommand] = useState<CommandType>(CommandType.SCAFFOLD);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [view, setView] = useState<View>('dependencies');

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
                 activeCommand === CommandType.SYNC) && key === 'prompt'
            ) || (activeCommand === CommandType.CONFLICT && key === 'files');

            if (isPositional) {
                positionalArgs += ` ${value}`;
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
          />
        )}
      </main>
      {view === 'builder' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <GeneratedCommand command={generatedCommand} />
        </div>
      )}
    </div>
  );
};

export default App;