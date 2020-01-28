import { copy } from 'fs-extra';

export default async function copyFolder(fromFolderPath: string, toFolderPath: string) {
  await copy(fromFolderPath, toFolderPath);
}
