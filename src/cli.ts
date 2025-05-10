#!/usr/bin/env node

import { program } from 'commander';
import { generateCommitMessage } from './core/generator';
import { GitService } from './services/git';
import { Config } from './config';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

const git = new GitService();
const config = new Config();

program
  .name('cmg')
  .description('AI-powered commit message generator')
  .version('1.0.0');

program
  .command('commit [files...]')
  .description('Generate commit message and commit changes')
  .option('-m, --message <message>', 'Use a custom commit message')
  .option('-p, --provider <provider>', 'AI provider (ollama/openai)')
  .option('-i, --interactive', 'Interactive mode')
  .action(async (files: string[], options) => {
    const spinner = ora('Analyzing changes...').start();
    
    try {
      // Stage files if provided
      if (files.length > 0) {
        await git.stageFiles(files);
      }

      // Get diff of staged changes
      const diff = await git.getStagedDiff();
      
      if (!diff) {
        spinner.fail('No staged changes found');
        return;
      }

      spinner.text = 'Generating commit message...';
      
      // Generate commit message
      const message = options.message || await generateCommitMessage(diff, {
        provider: options.provider || config.get('provider'),
        model: config.get('model'),
        apiKey: config.get('apiKey')
      });

      spinner.stop();

      // Interactive mode
      if (options.interactive) {
        const { confirmed, editedMessage } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: `Commit message:\n\n${message}\n\nDo you want to use this message?`,
            default: true
          },
          {
            type: 'editor',
            name: 'editedMessage',
            message: 'Edit the commit message:',
            default: message,
            when: (answers) => !answers.confirmed
          }
        ]);

        if (!confirmed && !editedMessage) {
          console.log(chalk.yellow('Commit aborted'));
          return;
        }

        await git.commit(confirmed ? message : editedMessage);
      } else {
        await git.commit(message);
      }

      console.log(chalk.green('✨ Successfully committed changes!'));
    } catch (error) {
      spinner.fail('Error: ' + (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Configure commit-genius-js')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select AI provider:',
        choices: ['ollama', 'openai']
      },
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter OpenAI API key:',
        when: (answers) => answers.provider === 'openai'
      },
      {
        type: 'input',
        name: 'model',
        message: 'Enter Ollama model name:',
        default: 'codellama',
        when: (answers) => answers.provider === 'ollama'
      }
    ]);

    config.set(answers);
    console.log(chalk.green('Configuration saved successfully!'));
  });

program.parse();
