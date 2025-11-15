
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
  },
  [CommandType.CRASH]: {
    name: CommandType.CRASH,
    description: "Get help fixing a crash using a stack trace or error log.",
    options: [
      { name: 'stack-trace', type: 'textarea', placeholder: 'Paste the full stack trace here...', description: 'The stack trace or error log from the crash.', required: true },
      { name: 'prompt', type: 'textarea', placeholder: 'e.g., ./prompts/components/button.prompt', description: 'The path to a `.prompt` file related to the crashing code.', required: false },
      { name: 'context-file', type: 'text', placeholder: 'e.g., ./src/components/Button.tsx', description: 'Relevant code file(s) to provide as context.' },
      { name: 'model', type: 'text', placeholder: 'e.g., gemini-2.5-pro', description: 'The model to use for generating the fix.' },
      { name: 'output-file', type: 'text', placeholder: 'e.g., ./src/components/Button.fixed.tsx', description: 'File to write the suggested fix to.' },
    ]
  },
  [CommandType.VERIFY]: {
    name: CommandType.VERIFY,
    description: "Verify that an example correctly implements the functionality described in a prompt.",
    options: [
      { name: 'prompt', type: 'textarea', placeholder: 'e.g., ./prompts/components/button.prompt', description: 'The path to a `.prompt` file that defines the component.', required: true },
      { name: 'example-file', type: 'text', placeholder: 'e.g., ./src/components/Button.example.tsx', description: 'The code file containing the example to verify.', required: true },
      { name: 'model', type: 'text', placeholder: 'e.g., gemini-2.5-pro', description: 'The model to use for verification.' },
    ]
  },
  [CommandType.FIX]: {
    name: CommandType.FIX,
    description: "Fix a failing test file using AI.",
    options: [
      { name: 'input-file', type: 'text', placeholder: 'e.g., ./src/utils/math.test.ts', description: 'The failing test file to fix.', required: true },
      { name: 'prompt', type: 'textarea', placeholder: 'e.g., The original prompt for the component being tested.', description: 'The prompt that describes the expected behavior.' },
      { name: 'model', type: 'text', placeholder: 'e.g., gemini-2.5-pro', description: 'The model to use for fixing the test.' },
    ]
  },
  [CommandType.SPLIT]: {
    name: CommandType.SPLIT,
    description: "Split a large prompt into smaller, more manageable prompts.",
    options: [
      { name: 'prompt', type: 'textarea', placeholder: 'e.g., ./prompts/full-stack-app.prompt', description: 'The path to the .prompt file to split.', required: true },
      { name: 'output-dir', type: 'text', placeholder: 'e.g., ./prompts/split/', description: 'Directory to save the new split prompts.' },
      { name: 'model', type: 'text', placeholder: 'e.g., gemini-2.5-pro', description: 'The model to use for the splitting process.' },
    ]
  },
  [CommandType.CONFLICT]: {
    name: CommandType.CONFLICT,
    description: "Check for conflicting instructions between prompts.",
    options: [
      { name: 'files', type: 'text', placeholder: 'e.g., ./prompts/a.prompt ./prompts/b.prompt', description: 'Optional: Specific prompt files to check. Checks all prompts if empty.' },
      { name: 'model', type: 'text', placeholder: 'e.g., gemini-2.5-pro', description: 'The model to use for conflict detection.' },
    ]
  }
};