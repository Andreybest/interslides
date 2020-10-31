type Slides = Map<number, string>;

const slidesLocal: Slides = new Map<number, string>();
const slidesRemote: Slides = new Map<number, string>();
let currentSlides = slidesLocal;
let currentMode: 'local' | 'remote' = 'local';
let currentSlideNumber = 0;

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
    case 'save':
      alert('TO-DO!');
      break;

    case 'text-add':
      createTextElement();
      break;
    case 'image-add':
      // TO-DO!
      alert('TO-DO!');
      break;
    case 'delete-element':
      deleteSelectedElement();
      break;

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

    case 'unordered-list':
      document.execCommand('insertunorderedlist');
      break;
    case 'ordered-list':
      document.execCommand('insertorderedlist');
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


const slideElement = document.getElementById('slide') as HTMLDivElement;

function initDragElement(element: HTMLElement) {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;

  function closeDragElement() {
    element.style.left = `${(Number.parseInt(element.style.left, 10) / slideElement.clientWidth) * 100}%`;
    element.style.top = `${(Number.parseInt(element.style.top, 10) / slideElement.clientHeight) * 100}%`;

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
  const mover = document.createElement('div');
  mover.className = 'mover';
  mover.contentEditable = 'false';
  element.appendChild(mover);
  mover.onmousedown = dragMouseDown;
}

function initResizeElement(initElement: HTMLElement) {
  const parentPopup = initElement;
  let element: HTMLElement | null = null;
  let startX: number;
  let startY: number;
  let startWidth: number;
  let startHeight: number;

  function doDrag(event: MouseEvent) {
    (element as HTMLElement).style.width = `${startWidth + event.clientX - startX}px`;
    (element as HTMLElement).style.height = `${startHeight + event.clientY - startY}px`;
  }

  function stopDrag() {
    element = element as HTMLElement;
    element.style.width = `${(element.clientWidth / slideElement.clientWidth) * 100}%`;
    element.style.height = `${(element.clientHeight / slideElement.clientHeight) * 100}%`;
    document.documentElement.removeEventListener('mousemove', doDrag, false);
    document.documentElement.removeEventListener('mouseup', stopDrag, false);
  }

  function initDrag(e: MouseEvent) {
    element = parentPopup;

    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(
      window.getComputedStyle(element).width,
      10,
    );
    startHeight = parseInt(
      window.getComputedStyle(element).height,
      10,
    );
    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);
  }

  const resizer = document.createElement('div');
  resizer.className = 'resizer';
  resizer.contentEditable = 'false';
  initElement.appendChild(resizer);
  resizer.onmousedown = initDrag;
}

let selectedElement: HTMLElement | undefined;

function removeControlElements(element: HTMLElement) {
  const [resizer, mover] = [element.getElementsByClassName('resizer')[0], element.getElementsByClassName('mover')[0]];
  element.removeChild(resizer);
  element.removeChild(mover);
  element.classList.remove('active');
}

function createTextElementInsideElement(): HTMLDivElement {
  const div = document.createElement('div');
  const span = document.createElement('span');
  span.style.fontSize = '3em';
  span.textContent = 'Simple Text';
  div.appendChild(span);
  return div;
}

function addOnClickEventToTextElement(textElement: HTMLElement) {
  // eslint-disable-next-line no-param-reassign
  textElement.onclick = (event) => {
    event.preventDefault();
    if (selectedElement !== textElement) {
      if (selectedElement) {
        removeControlElements(selectedElement);
      }
      saveSlideInformation(currentSlideNumber, currentSlides);
      redrawSlidePreviews(currentSlides, currentSlideNumber);
      initResizeElement(textElement);
      initDragElement(textElement);
      textElement.classList.add('active');
      selectedElement = textElement;
    }
  };
}

function createTextElement() {
  const element = document.createElement('div');
  element.className = 'element';
  element.style.top = '0%';
  element.style.left = '0%';
  element.style.width = '30%';
  element.style.height = '20%';
  const textContainer = document.createElement('div');
  textContainer.className = 'element-editor';
  textContainer.contentEditable = 'true';
  textContainer.appendChild(createTextElementInsideElement());
  element.appendChild(textContainer);
  slideElement.getElementsByClassName('slide-wrapper')[0].appendChild(element);
  addOnClickEventToTextElement(element);
}

function deleteSelectedElement() {
  if (selectedElement) {
    selectedElement.onclick = null;
    (selectedElement.getElementsByClassName('resizer')[0] as HTMLDivElement).onmousedown = null;
    (selectedElement.getElementsByClassName('mover')[0] as HTMLDivElement).onmousedown = null;
    slideElement.getElementsByClassName('slide-wrapper')[0].removeChild(selectedElement);
    selectedElement = undefined;
  }
}

// Called when person clicks on empty area on slide editor
slideElement.onclick = (event) => {
  event.preventDefault();
  if (selectedElement && event.target === slideElement) {
    removeControlElements(selectedElement);
    selectedElement = undefined;
    saveSlideInformation(currentSlideNumber, currentSlides);
    redrawSlidePreviews(currentSlides, currentSlideNumber);
  }
};

window.onresize = () => {
  slideElement.style.fontSize = `${slideElement.clientWidth / 100}px`;
  const slidePreviews = document.getElementsByClassName('slide-preview') as HTMLCollectionOf<HTMLDivElement>;
  // eslint-disable-next-line no-restricted-syntax
  for (const slidePreview of slidePreviews) {
    slidePreview.style.fontSize = `${slidePreview.clientWidth / 100}px`;
  }
};

function saveSlideInformation(slideNumber: number, slides: Slides) {
  const divManipulator = document.createElement('div');
  divManipulator.innerHTML = slideElement.innerHTML;
  const activeElements = divManipulator.getElementsByClassName('element active') as HTMLCollectionOf<HTMLElement>;
  if (activeElements.length > 0) removeControlElements(activeElements[0]);
  const elementEditors = divManipulator.getElementsByClassName('element-editor') as HTMLCollectionOf<HTMLElement>;
  // eslint-disable-next-line no-restricted-syntax
  for (const elementEditor of elementEditors) {
    elementEditor.contentEditable = 'false';
  }

  slides.set(slideNumber, divManipulator.innerHTML);
}

function changeActiveClassOnSlidePreviews(activeSlidePreview: HTMLElement) {
  // eslint-disable-next-line no-restricted-syntax
  for (const slide of document.getElementsByClassName('slide active') as HTMLCollectionOf<HTMLElement>) {
    slide.classList.remove('active');
  }
  activeSlidePreview.classList.add('active');
}

function addOnClickEventToSlidePreview(slides: Slides, slide: HTMLDivElement, slideNumber: number) {
  // eslint-disable-next-line no-param-reassign
  slide.onclick = (event) => {
    event.preventDefault();
    if (currentSlideNumber !== slideNumber) {
      saveSlideInformation(currentSlideNumber, slides);
      currentSlideNumber = slideNumber;
      clearSlideElement();
      fillSlideElementWithSavedSlideTags(slideNumber);
      redrawSlidePreviews(slides, slideNumber);
    }
  };
}

function redrawSlidePreviews(slides: Slides, activeSlideNumber: number) {
  const slidesContainer = document.getElementById('slides-container') as HTMLDivElement;
  slidesContainer.innerHTML = '';
  for (let i = 0; i < slides.size; i += 1) {
    const slide = document.createElement('div');
    slide.className = 'slide';

    const slideCount = document.createElement('div');
    slideCount.className = 'slide-count';
    // Started from 1 not from 0 (user-friendly)
    slideCount.textContent = (i + 1).toString();

    const slidePreviewWrapper = document.createElement('div');
    slidePreviewWrapper.className = 'slide-preview-wrapper';

    const slidePreview = document.createElement('div');
    slidePreview.className = 'slide-preview';
    slidePreview.id = `slide-preview-${i}`;
    slidePreview.innerHTML = slides.get(i) as string;

    slidePreviewWrapper.appendChild(slidePreview);
    slide.appendChild(slideCount);
    slide.appendChild(slidePreviewWrapper);
    slidesContainer.appendChild(slide);

    addOnClickEventToSlidePreview(slides, slide, i);

    slidePreview.style.fontSize = `${slidePreview.clientWidth / 100}px`;

    if (activeSlideNumber === i) slide.classList.add('active');
  }
}

function fillSlideElementWithSavedSlideTags(slideNumber: number) {
  const slideWrapper = slideElement.getElementsByClassName('slide-wrapper')[0];
  slideElement.removeChild(slideWrapper);
  slideElement.innerHTML = currentSlides.get(slideNumber) as string;
  // eslint-disable-next-line no-restricted-syntax
  for (const element of slideElement.getElementsByClassName('element') as HTMLCollectionOf<HTMLDivElement>) {
    addOnClickEventToTextElement(element);
    (element.getElementsByClassName('element-editor')[0] as HTMLDivElement).contentEditable = 'true';
  }
}

function clearSlideElement() {
  slideElement.innerHTML = '';
  const slideWrapper = document.createElement('div');
  slideWrapper.className = 'slide-wrapper';
  slideElement.appendChild(slideWrapper);
}

// Code for changing contents of individual preview, maybe will use in future, not sure.
/*
function updateSlideInformation(slideNumber: number) {
  const divManipulator = document.createElement('div');
  divManipulator.innerHTML = slideElement.innerHTML;
  const activeElements = divManipulator.getElementsByClassName('element active') as HTMLCollectionOf<HTMLElement>;
  if (activeElements.length > 0) removeControlElements(activeElements[0]);
  const elementEditors = divManipulator.getElementsByClassName('element-editor') as HTMLCollectionOf<HTMLElement>;
  // eslint-disable-next-line no-restricted-syntax
  for (const elementEditor of elementEditors) {
    elementEditor.contentEditable = 'false';
  }
  slidesLocal.set(slideNumber, divManipulator.innerHTML);
  const slidePreview = document.getElementById(`slide-preview-${slideNumber}`);
  if (slidePreview) slidePreview.innerHTML = divManipulator.innerHTML;
}
*/

function createSlide(slideNumber: number) {
  saveSlideInformation(currentSlideNumber, currentSlides);
  currentSlideNumber = slideNumber;

  clearSlideElement();
  createTextElement();
  saveSlideInformation(currentSlideNumber, slidesRemote);
  saveSlideInformation(currentSlideNumber, slidesLocal);

  redrawSlidePreviews(currentSlides, currentSlideNumber);
}

const LOCAL_ICON = 'computer';
const REMOTE_ICON = 'stay_current_landscape';

const changeLocalRemoteSlidesButton = document.getElementById('change-local-remote-slides') as HTMLDivElement;
changeLocalRemoteSlidesButton.onclick = (event) => {
  event.preventDefault();
  const iconElement = changeLocalRemoteSlidesButton.getElementsByClassName('material-icons')[0];
  if (currentMode === 'local') {
    saveSlideInformation(currentSlideNumber, currentSlides);
    clearSlideElement();
    currentMode = 'remote';
    currentSlides = slidesRemote;
    iconElement.textContent = REMOTE_ICON;
    redrawSlidePreviews(slidesRemote, currentSlideNumber);
    fillSlideElementWithSavedSlideTags(currentSlideNumber);
  } else {
    saveSlideInformation(currentSlideNumber, currentSlides);
    clearSlideElement();
    currentMode = 'local';
    currentSlides = slidesLocal;
    iconElement.textContent = LOCAL_ICON;
    redrawSlidePreviews(slidesLocal, currentSlideNumber);
    fillSlideElementWithSavedSlideTags(currentSlideNumber);
  }
}

const addSlideButton = document.getElementById('add-slide-button') as HTMLDivElement;
addSlideButton.onclick = (event) => {
  event.preventDefault();
  currentSlideNumber = (document.getElementById('slides-container') as HTMLDivElement).children.length;
  createSlide(currentSlideNumber);
};

createSlide(0);
