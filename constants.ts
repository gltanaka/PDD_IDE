
import { CommandConfig, CommandType } from './types';

export const COMMANDS: Record<CommandType, CommandConfig> = {
  [CommandType.SCAFFOLD]: {
    name: CommandType.SCAFFOLD,
    description: "Create a new project from a prompt or template.",
    options: [
      { name: 'prompt', type: 'textarea', placeholder: 'e.g., A React SPA with TypeScript and TailwindCSS', description: 'The main prompt describing the project to create.', required: true },
      { name: 'model', type: 'text', placeholder: 'e.g., gemini-2.5-pro', description: 'The model to use for generation.' },
      { name: 'dir', type: 'text', placeholder: 'e.g., ./my-new-app', description: 'The output directory for the new project.' },
      { name: 'template', type: 'text', placeholder: 'e.g., react-ts', description: 'An optional template to start from.' },
    ]
  },
  [CommandType.GEN]: {
    name: CommandType.GEN,
    description: "Generate new code or modify existing code.",
    options: [
      { name: 'prompt', type: 'textarea', placeholder: 'e.g., Create a button component... or ./prompts/button.prompt', description: 'The main prompt content, or a path to a `.prompt` file.', required: true },
      { name: 'model', type: 'text', placeholder: 'e.g., gemini-2.5-pro', description: 'The model to use for generation.' },
      { name: 'input-file', type: 'text', placeholder: 'e.g., ./src/components/Button.tsx', description: 'File(s) to use as input for modification.' },
      { name: 'output-file', type: 'text', placeholder: 'e.g., ./src/components/Button.tsx', description: 'File to write the generated code to.' },
      { name: 'context-file', type: 'text', placeholder: 'e.g., ./src/types.ts', description: 'Additional file(s) to provide as context.' },
      { name: 'env-file', type: 'text', placeholder: 'e.g., KEY=VALUE', description: 'Pass an environment variable to the prompt.' },
    ]
  },
  [CommandType.REVIEW]: {
    name: CommandType.REVIEW,
    description: "Review a file for improvements.",
    options: [
      { name: 'input-file', type: 'text', placeholder: 'e.g., ./src/services/api.ts', description: 'The file to be reviewed.', required: true },
      { name: 'prompt', type: 'textarea', placeholder: 'e.g., Check for performance issues and suggest improvements.', description: 'A specific prompt to guide the review.' },
      { name: 'model', type: 'text', placeholder: 'e.g., gemini-2.5-pro', description: 'The model to use for the review.' },
    ]
  },
  [CommandType.COMMIT]: {
    name: CommandType.COMMIT,
    description: "Generate a commit message based on staged changes.",
    options: [
      { name: 'prompt', type: 'textarea', placeholder: 'e.g., Use conventional commit format.', description: 'A specific prompt to guide the commit message generation.' },
      { name: 'model', type: 'text', placeholder: 'e.g., gemini-2.5-flash', description: 'The model to use for the commit message.' },
    ]
  },
  [CommandType.TEST]: {
    name: CommandType.TEST,
    description: "Generate tests for a specific file.",
    options: [
      { name: 'input-file', type: 'text', placeholder: 'e.g., ./src/utils/math.ts', description: 'The file to generate tests for.', required: true },
      { name: 'prompt', type: 'textarea', placeholder: 'e.g., Use Jest and cover all edge cases.', description: 'A specific prompt to guide the test generation.' },
      { name: 'model', type: 'text', placeholder: 'e.g., gemini-2.5-pro', description: 'The model to use for test generation.' },
    ]
  },
  [CommandType.EXAMPLE]: {
    name: CommandType.EXAMPLE,
    description: "Generate an example for a specific file or component.",
    options: [
      { name: 'prompt', type: 'textarea', placeholder: 'e.g., ./prompts/components/button.prompt', description: 'The path to a `.prompt` file to use for generating the example.', required: true },
      { name: 'model', type: 'text', placeholder: 'e.g., gemini-2.5-pro', description: 'The model to use for example generation.' },
      { name: 'input-file', type: 'text', placeholder: 'e.g., ./src/components/Button.tsx', description: 'The code file to generate an example for.' },
      { name: 'output-file', type: 'text', placeholder: 'e.g., ./src/components/Button.example.tsx', description: 'File to write the generated example to.' },
    ]
  }
};