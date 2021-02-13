const settings = document.getElementsByClassName('setting') as HTMLCollectionOf<HTMLSpanElement>;

// eslint-disable-next-line no-restricted-syntax
for (const setting of settings) {
  const checkbox = setting.getElementsByTagName('input')[0];
  setting.onclick = (event) => {
    event.preventDefault();
    const value = checkbox.checked;
    const oppositeValue = !value;
    localStorage.setItem(setting.id, oppositeValue.toString());
    checkbox.checked = oppositeValue;
  };
  const value = localStorage.getItem(setting.id) === 'true' ?? false;
  checkbox.checked = value;
}
