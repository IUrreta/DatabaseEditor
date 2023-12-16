const { Titlebar, TitlebarColor } = require("custom-electron-titlebar");
const path = require('path')

window.addEventListener('DOMContentLoaded', () => {
  const options = {
    backgroundColor: TitlebarColor.fromHex('#3f3c57'),
    icon: path.join(__dirname, "../assets/images/logoVector.png"),
    iconSize: 30,
    titleHorizontalAlignment: 'left'
  };
  new Titlebar(options);
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }
  let element = document.querySelector('.cet-menubar')
  element.parentNode.removeChild(element);

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
