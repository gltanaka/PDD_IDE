export enum CommandType {
  SCAFFOLD = 'scaffold',
  GEN = 'gen',
  REVIEW = 'review',
  COMMIT = 'commit',
  TEST = 'test',
  EXAMPLE = 'example',
  CRASH = 'crash',
  VERIFY = 'verify',
  FIX = 'fix',
  SPLIT = 'split',
  CONFLICT = 'conflict',
  AUTO_DEPS = 'auto-deps',
}

export interface CommandOption {
  name: string;
  type: 'text' | 'textarea';
  placeholder: string;
  description: string;
  required?: boolean;
}

export interface CommandConfig {
  name: CommandType;
  description: string;
  options: CommandOption[];
}

export interface DevUnit {
  prompt: string;
  code: string;
  example: string;
  test: string;
}

export interface MockPrompt {
  id: string;
  includes: string[];
  devUnit: DevUnit;
}