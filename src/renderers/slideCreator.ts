function filterClasses(element: HTMLElement, ...classesToFilter: string[]): string {
  // eslint-disable-next-line max-len
  return Array.from(element.classList).find((className) => (!classesToFilter.includes(className))) as string;
}

function getSelectedTextAsRange(): Range {
  const range = document.getSelection()?.getRangeAt(0);
  if (range) return range;
  return new Range();
}

// Chrome doesn't have support for document.execCommand('increaseFontSize');
// will change it later anyway, because we need font size selection.
function increaseFontSizeOfSelectedText() {
  const newNode = document.createElement('big');
  getSelectedTextAsRange().surroundContents(newNode);
}

function decreaseFontSizeOfSelectedText() {
  const newNode = document.createElement('small');
  getSelectedTextAsRange().surroundContents(newNode);
}

function onControlButtonClick(event: MouseEvent, buttonName: string) {
  event.preventDefault();
  switch (buttonName) {
    case 'font-increase':
      increaseFontSizeOfSelectedText();
      break;
    case 'font-decrease':
      decreaseFontSizeOfSelectedText();
      break;
    case 'font-bold':
      document.execCommand('bold');
      break;
    case 'font-italic':
      document.execCommand('italic');
      break;
    case 'font-underlined':
      document.execCommand('underline');
      break;
    case 'font-strikethrough':
      document.execCommand('strikeThrough');
      break;
    case 'insert-emoji':
      // eslint-disable-next-line no-alert
      alert('TO-DO!');
      break;
    case 'align-left':
      document.execCommand('justifyLeft');
      break;
    case 'align-center':
      document.execCommand('justifyCenter');
      break;
    case 'align-right':
      document.execCommand('justifyRight');
      break;
    default:
      break;
  }
}

const controlButtonsInHeader = document.getElementsByTagName('header')[0].getElementsByClassName('material-icons') as HTMLCollectionOf<HTMLElement>;

const controlButtons = new Map(Array.from(controlButtonsInHeader).map((element) => [filterClasses(element, 'material-icons'), element]));

controlButtons.forEach((button, buttonName) => {
  // eslint-disable-next-line no-param-reassign
  button.onclick = (event) => onControlButtonClick(event, buttonName);
});


function dragElement(element: HTMLElement) {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }

  function elementDrag(event: MouseEvent) {
    // eslint-disable-next-line no-param-reassign
    event = event || window.event;
    event.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - event.clientX;
    pos2 = pos4 - event.clientY;
    pos3 = event.clientX;
    pos4 = event.clientY;
    // set the element's new position:
    // eslint-disable-next-line no-param-reassign
    element.style.top = `${element.offsetTop - pos2}px`;
    // eslint-disable-next-line no-param-reassign
    element.style.left = `${element.offsetLeft - pos1}px`;
  }

  function dragMouseDown(event: MouseEvent) {
    // eslint-disable-next-line no-param-reassign
    event = event || window.event;
    event.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = event.clientX;
    pos4 = event.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  if (document.getElementById(`${element.id}header`)) {
    // if present, the header is where you move the DIV from:
    (document.getElementById(`${element.id}header`) as HTMLDivElement).onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    // eslint-disable-next-line no-param-reassign
    element.onmousedown = dragMouseDown;
  }
}

let selectedElement: HTMLElement;

document.onclick = (event) => {
  event.preventDefault();
  if (event.target) {
    selectedElement = (event.target as HTMLElement);
  }
};
