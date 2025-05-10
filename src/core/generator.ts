import fetch from 'node-fetch';
import OpenAI from 'openai';
import { Config } from '../config';

interface GenerateOptions {
  provider: 'ollama' | 'openai' | 'simple';
  model?: string;
  apiKey?: string;
}

const config = new Config();

const COMMIT_TYPES = [
  'feat', 'fix', 'docs', 'style', 'refactor',
  'perf', 'test', 'build', 'ci', 'chore'
];

const PROMPT_TEMPLATE = `
Analyze the following git diff and generate a concise, meaningful commit message following the Conventional Commits specification.
Focus on the main changes and their purpose.

Diff:
{diff}

Requirements:
1. Use one of these types: ${COMMIT_TYPES.join(', ')}
2. Format: <type>: <description>
3. Keep the description clear and concise
4. Use present tense, imperative mood
5. Focus on WHY and WHAT, not HOW
`;

async function generateWithOllama(diff: string, model: string): Promise<string> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model,
      prompt: PROMPT_TEMPLATE.replace('{diff}', diff),
      stream: false
    })
  });

  const data = await response.json();
  return data.response;
}

async function generateWithOpenAI(diff: string, apiKey: string): Promise<string> {
  const openai = new OpenAI({ apiKey });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates meaningful git commit messages following the Conventional Commits specification.'
      },
      {
        role: 'user',
        content: PROMPT_TEMPLATE.replace('{diff}', diff)
      }
    ]
  });

  return response.choices[0]?.message?.content || 'chore: update code';
}

interface FileAnalysis {
  path: string;
  addedLines: string[];
  removedLines: string[];
  modifiedLines: string[];
}

function analyzeFileChanges(diff: string): FileAnalysis[] {
  const files: FileAnalysis[] = [];
  let currentFile: FileAnalysis | null = null;
  
  const lines = diff.split('\n');
  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      if (currentFile) files.push(currentFile);
      currentFile = {
        path: line.split(' b/')[1],
        addedLines: [],
        removedLines: [],
        modifiedLines: []
      };
    } else if (currentFile) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        currentFile.addedLines.push(line.substring(1).trim());
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        currentFile.removedLines.push(line.substring(1).trim());
      } else if (line.startsWith(' ')) {
        currentFile.modifiedLines.push(line.substring(1).trim());
      }
    }
  }
  
  if (currentFile) files.push(currentFile);
  return files;
}

function inferScope(files: FileAnalysis[]): string {
  const paths = files.map(f => f.path);
  
  // Common scopes
  if (paths.some(p => p.includes('/api/') || p.includes('/routes/'))) return 'api';
  if (paths.some(p => p.includes('/ui/') || p.includes('/components/'))) return 'ui';
  if (paths.some(p => p.includes('/db/') || p.includes('/models/'))) return 'db';
  if (paths.some(p => p.includes('/auth/') || p.includes('security'))) return 'auth';
  if (paths.some(p => p.includes('/test/'))) return 'tests';
  if (paths.some(p => p.includes('/docs/'))) return 'docs';
  
  // Infer from file types
  if (paths.every(p => p.endsWith('.css') || p.endsWith('.scss'))) return 'styles';
  if (paths.every(p => p.endsWith('.test.ts') || p.endsWith('.spec.ts'))) return 'tests';
  if (paths.every(p => p.endsWith('.md'))) return 'docs';
  
  return '';
}

function inferType(files: FileAnalysis[]): string {
  const totalAdded = files.reduce((sum, f) => sum + f.addedLines.length, 0);
  const totalRemoved = files.reduce((sum, f) => sum + f.removedLines.length, 0);
  
  // Check file patterns
  const paths = files.map(f => f.path);
  const content = files.flatMap(f => [...f.addedLines, ...f.removedLines, ...f.modifiedLines]).join(' ');
  
  // Check for documentation changes
  const hasDocsChanges = paths.some(p => p.includes('/docs/') || p.endsWith('.md'));
  const isDocsOnly = hasDocsChanges && files.every(f => f.path.includes('/docs/') || f.path.endsWith('.md'));
  
  // Check for test changes
  const hasTestChanges = paths.some(p => p.includes('/tests/') || p.includes('.test.') || p.includes('.spec.'));
  const isTestOnly = hasTestChanges && files.every(f => f.path.includes('/tests/') || f.path.includes('.test.') || f.path.includes('.spec.'));
  
  // Check for route-related changes
  const hasRouteChanges = paths.some(p => p.includes('/routes/') || p.includes('Router'));
  const isRouteRefactor = hasRouteChanges && content.includes('router.') && files.length > 1;
  
  if (paths.some(p => p.includes('/test/') || p.endsWith('.test.ts') || p.endsWith('.spec.ts'))) {
    return 'test';
  }
  
  if (paths.some(p => p.endsWith('.md') || p.includes('README'))) {
    return 'docs';
  }
  
  if (paths.some(p => p.endsWith('.css') || p.endsWith('.scss'))) {
    return 'style';
  }
  
  if (paths.some(p => p.includes('package.json') || p.includes('package-lock.json'))) {
    return 'build';
  }
  
  // Check for documentation
  if (isDocsOnly) {
    return 'docs';
  }
  
  // Check for tests
  if (isTestOnly) {
    return 'test';
  }
  
  // Check for route refactoring
  if (isRouteRefactor) {
    return 'refactor';
  }
  
  // Check content patterns
  if (content.toLowerCase().includes('fix') || content.toLowerCase().includes('bug')) {
    return 'fix';
  }
  
  if (content.toLowerCase().includes('refactor') || content.toLowerCase().includes('cleanup')) {
    return 'refactor';
  }
  
  if (content.toLowerCase().includes('perf') || content.toLowerCase().includes('performance')) {
    return 'perf';
  }
  
  // Analyze changes
  if (totalAdded > totalRemoved * 2) {
    return 'feat';
  }
  
  if (totalRemoved > totalAdded * 2) {
    return 'refactor';
  }
  
  if (totalAdded > 0 || totalRemoved > 0) {
    return 'fix';
  }
  
  return 'chore';
}

function generateDescription(files: FileAnalysis[]): string {
  const totalAdded = files.reduce((sum, f) => sum + f.addedLines.length, 0);
  const totalRemoved = files.reduce((sum, f) => sum + f.removedLines.length, 0);
  
  const changes: string[] = [];
  
  // Check for documentation changes
  const hasDocsChanges = files.some(f => f.path.includes('/docs/') || f.path.endsWith('.md'));
  if (hasDocsChanges) {
    const docTypes = files
      .filter(f => f.path.includes('/docs/') || f.path.endsWith('.md'))
      .map(f => f.path.split('/').pop()?.replace('.md', ''))
      .filter(Boolean);
    changes.push(`add ${docTypes.join(', ')} documentation`);
  }
  
  // Check for test changes
  const hasTestChanges = files.some(f => f.path.includes('/tests/') || f.path.includes('.test.') || f.path.includes('.spec.'));
  if (hasTestChanges) {
    const testTypes = files
      .filter(f => f.path.includes('/tests/') || f.path.includes('.test.') || f.path.includes('.spec.'))
      .map(f => f.path.split('/').pop()?.replace('.test.js', '').replace('.spec.js', ''))
      .filter(Boolean);
    changes.push(`add tests for ${testTypes.join(', ')}`);
  }
  
  // Check for route refactoring
  const hasRouteChanges = files.some(f => f.path.includes('/routes/') || files.some(f => f.addedLines.join(' ').includes('router.')));
  if (hasRouteChanges && files.length > 1) {
    changes.push('move API routes to dedicated module');
  }
  
  return changes.length > 0 ? changes.join(' and ') : 'update code';
  
  // Try to find meaningful function or class names in added lines
  const codePatterns = [
    /(?:function|class|const|let|var)\s+([a-zA-Z][a-zA-Z0-9]*)\s*[({=]/,
    /(?:public|private|protected)\s+([a-zA-Z][a-zA-Z0-9]*)\s*[({]/,
    /(?:describe|it|test)\s*\(['"](.+?)['"]/ // Test descriptions
  ];
  
  for (const file of files) {
    for (const line of file.addedLines) {
      for (const pattern of codePatterns) {
        const match = line.match(pattern);
        const name = match?.[1];
        if (name) {
          if (file.path.includes('/test/')) {
            return `add tests for ${name}`;
          }
          return `add ${name}`;
        }
      }
    }
  }
  
  // Generate description based on changes
  const scope = inferScope(files);
  const paths = files.map(f => f.path);
  
  if (totalAdded > 0 && totalRemoved === 0) {
    if (paths.length === 1) {
      return `add ${paths[0].split('/').pop()}`;
    }
    return scope ? `add new ${scope} functionality` : 'add new functionality';
  }
  
  if (totalRemoved > 0 && totalAdded === 0) {
    if (paths.length === 1) {
      return `remove ${paths[0].split('/').pop()}`;
    }
    return scope ? `remove unused ${scope} code` : 'remove unused code';
  }
  
  if (totalAdded > 0 && totalRemoved > 0) {
    if (paths.length === 1) {
      return `update ${paths[0].split('/').pop()}`;
    }
    return scope ? `update ${scope} implementation` : 'update implementation';
  }
  
  return 'update code';
}

function generateSimpleCommitMessage(diff: string): string {
  const files = analyzeFileChanges(diff);
  const type = inferType(files);
  const scope = inferScope(files);
  const description = generateDescription(files);
  
  return scope ? `${type}(${scope}): ${description}` : `${type}: ${description}`;
}

export async function generateCommitMessage(
  diff: string,
  options: GenerateOptions
): Promise<string> {
  const provider = options.provider || config.get('provider') || 'simple';
  
  try {
    if (provider === 'simple') {
      return generateSimpleCommitMessage(diff);
    } else if (provider === 'ollama') {
      try {
        const model = options.model || config.get('model');
        return await generateWithOllama(diff, model);
      } catch (error) {
        console.warn('Ollama error, falling back to simple mode:', error);
        return generateSimpleCommitMessage(diff);
      }
    } else {
      try {
        const apiKey = options.apiKey || config.get('apiKey');
        if (!apiKey) {
          throw new Error('OpenAI API key is required');
        }
        return await generateWithOpenAI(diff, apiKey);
      } catch (error) {
        console.warn('OpenAI error, falling back to simple mode:', error);
        return generateSimpleCommitMessage(diff);
      }
    }
  } catch (error) {
    console.error('Error generating commit message:', error);
    return generateSimpleCommitMessage(diff);
  }
}
