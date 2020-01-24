import * as JSZip from 'jszip';
import { readFileSync, writeFileSync } from 'fs';
import * as mkdirp from 'mkdirp';
import { dirname } from 'path';

export default class Archive {
  archive: JSZip;

  public static localFileName = 'local.html';

  public static remoteFileName = 'remote.html';

  public async loadFile(fileURL: string) {
    const data = readFileSync(fileURL);
    const zip = await JSZip.loadAsync(data);
    if (Archive.checkForAllRequiredFiles(zip)) this.archive = zip;
    else throw new Error('File is corrupted');
  }

  private static checkForAllRequiredFiles(archive: JSZip): boolean {
    const requiredFiles = [this.localFileName, this.remoteFileName];
    const filtered = archive.filter((_path, file) => requiredFiles.includes(file.name));
    if (filtered.length === requiredFiles.length) return true;
    return false;
  }

  public async unpackToFolder(folderPath: string): Promise<void> {
    if (!this.archive) throw new Error('Archive wasn\'t selected');

    const keys = Object.keys(this.archive.files);
    for (let i = 0; i < keys.length; i += 1) {
      if (!this.archive.files[keys[i]].dir) {
        // eslint-disable-next-line no-await-in-loop
        const content = await this.archive.files[keys[i]].async('nodebuffer');
        mkdirp.sync(dirname(`${folderPath}/${this.archive.files[keys[i]].name}`));
        writeFileSync(`${folderPath}/${this.archive.files[keys[i]].name}`, content, { flag: 'w' });
      }
    }
  }
}
