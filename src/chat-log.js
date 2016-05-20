export default class {
  constructor(container) {
    this.container = document.getElementById(container);
  }

  printLine(text) {
    var textNode = document.createTextNode(text),
        line = document.createElement('p');
    line.appendChild(textNode);
    this.container.appendChild(line);
  }

  printMessage(data) {
    var uidNode = document.createTextNode(data.uid),
        msgNode = document.createTextNode(` ${data.message}`),
        span = document.createElement('span'),
        line = document.createElement('p');
    span.style.color = `#${data.uid}`;
    span.appendChild(uidNode);
    line.appendChild(span);
    line.appendChild(msgNode);
    this.container.appendChild(line);
  }
}
