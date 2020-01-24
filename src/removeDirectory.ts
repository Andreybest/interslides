import {
  existsSync, readdirSync, statSync, unlinkSync, rmdirSync,
} from 'fs';
import { join } from 'path';

export default function removeDirectory(dirPath: string): void {
  if (!existsSync(dirPath)) {
    return;
  }

  const list = readdirSync(dirPath);
  for (let i = 0; i < list.length; i += 1) {
    const filename = join(dirPath, list[i]);

    if (filename === '.' || filename === '..') {
      // ignore current and parent directory
    } else if (statSync(filename).isDirectory()) {
      removeDirectory(filename);
    } else {
      unlinkSync(filename);
    }
  }

  rmdirSync(dirPath);
}
