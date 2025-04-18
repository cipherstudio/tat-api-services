#!/usr/bin/env ts-node
import { Command } from 'commander';
import { ModuleGenerator } from './generate-module';

// This script is a CLI wrapper for module generation functionality

const program = new Command();

program
  .name('generate')
  .description('NestJS module generator')
  .version('1.0.0');

program
  .command('module')
  .description('Generate a new module')
  .requiredOption('-n, --name <name>', 'Module name')
  .option('-p, --pagination', 'Include pagination support', false)
  .option('-a, --auth', 'Include authentication guards', false)
  .option(
    '-d, --dir <directory>',
    'Base directory for the module (if using default "src/modules", the module will be auto-registered in app.module.ts)',
    'src/modules',
  )
  .action(async (options) => {
    try {
      console.log(`Generating module: ${options.name}`);

      const generator = new ModuleGenerator({
        name: options.name,
        includePagination: options.pagination,
        includeAuth: options.auth,
        baseDir: options.dir,
      });

      await generator.generate();
    } catch (error) {
      console.error('Error generating module:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);

// If no arguments, show help
if (!process.argv.slice(2).length) {
  program.help();
}
