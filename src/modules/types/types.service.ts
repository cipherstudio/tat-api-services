import { Injectable, OnModuleInit } from '@nestjs/common';
import { TypeDefinition } from './interfaces/type-definition.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

@Injectable()
export class TypesService implements OnModuleInit {
  private typeDefinitions: Record<string, TypeDefinition> = {};
  private modulesPath: string;

  constructor() {
    this.modulesPath = path.join(process.cwd(), 'src', 'modules');
  }

  async onModuleInit() {
    await this.scanModules();
  }

  private async scanModules() {
    const modules = await fs.promises.readdir(this.modulesPath);

    for (const moduleName of modules) {
      const modulePath = path.join(this.modulesPath, moduleName);
      const stat = await fs.promises.stat(modulePath);

      if (stat.isDirectory()) {
        await this.scanModuleDirectory(modulePath, moduleName);
      }
    }
  }

  private async scanModuleDirectory(modulePath: string, moduleName: string) {
    const directories = ['dto', 'entities', 'interfaces'];

    for (const dir of directories) {
      const dirPath = path.join(modulePath, dir);

      try {
        const files = await fs.promises.readdir(dirPath);

        for (const file of files) {
          if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
            await this.processTypeScriptFile(
              path.join(dirPath, file),
              moduleName,
              dir,
            );
          }
        }
      } catch (error) {
        // Directory might not exist, skip it
        continue;
      }
    }
  }

  private async processTypeScriptFile(
    filePath: string,
    moduleName: string,
    category: string,
  ) {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      fileContent,
      ts.ScriptTarget.Latest,
      true,
    );

    this.extractTypes(
      sourceFile,
      moduleName,
      category as 'dto' | 'entity' | 'interface',
      filePath,
    );
  }

  private extractTypes(
    sourceFile: ts.SourceFile,
    moduleName: string,
    category: 'dto' | 'entity' | 'interface',
    filePath: string,
  ) {
    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
        const name = node.name?.getText(sourceFile) || '';
        const properties: Record<string, any> = {};
        const imports: string[] = [];
        const extendedTypes: string[] = [];
        const decorators: string[] = [];

        // Extract properties
        node.members.forEach((member) => {
          if (
            ts.isPropertyDeclaration(member) ||
            ts.isPropertySignature(member)
          ) {
            const propName = member.name.getText(sourceFile);
            const type = member.type?.getText(sourceFile) || 'any';
            const isOptional = member.questionToken !== undefined;

            properties[propName] = {
              type,
              isOptional,
              description: this.extractJSDocDescription(member),
              validations: this.extractValidationDecorators(member),
            };
          }
        });

        // Extract decorators for class declarations
        if (ts.isClassDeclaration(node) && node.decorators) {
          node.decorators.forEach((decorator) => {
            decorators.push(decorator.getText(sourceFile));
          });
        }

        // Extract extends clauses
        if (node.heritageClauses) {
          node.heritageClauses.forEach((clause) => {
            if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
              clause.types.forEach((type) => {
                extendedTypes.push(type.getText(sourceFile));
              });
            }
          });
        }

        this.typeDefinitions[name] = {
          name,
          moduleName,
          category,
          properties,
          imports,
          extends: extendedTypes,
          decorators,
          filePath: path.relative(process.cwd(), filePath),
        };
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  private extractJSDocDescription(node: ts.Node): string | undefined {
    const jsDoc = ts.getJSDocTags(node);
    const descriptionTag = jsDoc.find(
      (tag) => tag.tagName.getText() === 'description',
    );
    return descriptionTag?.comment as string | undefined;
  }

  private extractValidationDecorators(node: ts.Node): Record<string, any> {
    const validations: Record<string, any> = {};

    if (ts.isPropertyDeclaration(node) && node.decorators) {
      node.decorators.forEach((decorator) => {
        const decoratorText = decorator.getText();
        const match = decoratorText.match(/@(\w+)\((.*)\)/);

        if (match) {
          const [, name, args] = match;
          try {
            validations[name] = args ? JSON.parse(args) : true;
          } catch {
            validations[name] = args;
          }
        }
      });
    }

    return validations;
  }

  async getAllTypes(): Promise<Record<string, TypeDefinition>> {
    return this.typeDefinitions;
  }

  async getModules(): Promise<string[]> {
    return Object.values(this.typeDefinitions)
      .map((def) => def.moduleName)
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  async getDtoTypes(): Promise<Record<string, TypeDefinition>> {
    return this.filterTypesByCategory('dto');
  }

  async getEntityTypes(): Promise<Record<string, TypeDefinition>> {
    return this.filterTypesByCategory('entity');
  }

  async getInterfaceTypes(): Promise<Record<string, TypeDefinition>> {
    return this.filterTypesByCategory('interface');
  }

  private filterTypesByCategory(
    category: 'dto' | 'entity' | 'interface',
  ): Record<string, TypeDefinition> {
    return Object.entries(this.typeDefinitions)
      .filter(([_, def]) => def.category === category)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  }
}
