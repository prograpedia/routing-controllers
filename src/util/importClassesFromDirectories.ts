import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Loads all exported classes from the given directory.
 */
export async function importClassesFromDirectories(directories: string[], formats = ['.js', '.ts', '.tsx']): Promise<Function[]> {
  const glob = await import('glob');
  const loadFileClasses = function (exported: any, allLoaded: Function[]) {
    if (exported instanceof Function) {
      allLoaded.push(exported);
    } else if (exported instanceof Array) {
      exported.forEach((i: any) => loadFileClasses(i, allLoaded));
    } else if (exported instanceof Object || typeof exported === 'object') {
      Object.keys(exported).forEach(key => loadFileClasses(exported[key], allLoaded));
    }

    return allLoaded;
  };

  const allFiles = directories.reduce((allDirs, dir) => {
    // Replace \ with / for glob
    return allDirs.concat(glob.sync(path.normalize(dir).replace(/\\/g, '/')));
  }, [] as string[]);

  const dirs = await Promise.all(allFiles
    .filter(file => {
      const dtsExtension = file.substring(file.length - 5, file.length);
      return formats.indexOf(path.extname(file)) !== -1 && dtsExtension !== '.d.ts';
    })
    .map(async file => {
      // const mimetype = file.endsWith('.js') ? 'application/javascript' : 'application/typescript';
      // return await import(`data:${mimetype},` + encodeURIComponent(fs.readFileSync(file, 'utf8')));
      return await import(file);
    }));

  return loadFileClasses(dirs, []);
}
