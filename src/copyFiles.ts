import { copy } from 'fs-extra';

export default async function copyFiles(...filePaths: [fromFilePath: string, toFilePath: string][]) {
  for (const [fromFilePath, toFilePath] of filePaths) {
    await copy(fromFilePath, toFilePath);
  }
}
