import { resolve as pathResolve } from 'path';
import { existsSync } from 'fs';

export async function resolve(specifier, context, defaultResolve) {
  let newSpecifier = specifier;
  if (specifier.startsWith('app/')) {
    newSpecifier = new URL(pathResolve('./', specifier), 'file://').href;
  }

  if (newSpecifier.startsWith('file://')) {
    let path = new URL(newSpecifier).pathname;
    if (!path.endsWith('.ts') && existsSync(path + '.ts')) {
      newSpecifier += '.ts';
    } else if (!path.endsWith('.tsx') && existsSync(path + '.tsx')) {
      newSpecifier += '.tsx';
    }
  }

  // Also resolve relative imports ending without .ts inside the test framework
  if (specifier.startsWith('.') && context.parentURL) {
    let parentPath = new URL(context.parentURL).pathname;
    let parentDir = parentPath.split('/').slice(0, -1).join('/');
    let targetPath = pathResolve(parentDir, specifier);

    if (!targetPath.endsWith('.ts') && existsSync(targetPath + '.ts')) {
       newSpecifier = new URL(targetPath + '.ts', 'file://').href;
    } else if (!targetPath.endsWith('.tsx') && existsSync(targetPath + '.tsx')) {
       newSpecifier = new URL(targetPath + '.tsx', 'file://').href;
    }
  }

  return defaultResolve(newSpecifier, context, defaultResolve);
}
