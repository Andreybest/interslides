import { render } from 'mustache';
import { readFileSync, writeFileSync } from 'fs';

export default function fillHtmlFile(pathToHtmlFile: string, slides: Map<number, string>): void {
  let slidesString = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const slide of slides.values()) {
    slidesString += slide;
  }
  const renderedHTML = render(readFileSync(pathToHtmlFile).toString('utf-8'), {
    slides: slidesString,
  });

  writeFileSync(pathToHtmlFile, renderedHTML, { flag: 'w' });
}
