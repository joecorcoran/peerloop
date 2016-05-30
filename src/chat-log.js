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

  printMessage(attrs) {
    var clientNode = document.createTextNode(attrs.clientUid),
        textNode = document.createTextNode(` ${attrs.text}`),
        span = document.createElement('span'),
        line = document.createElement('p');
    span.style.color = `#${attrs.clientUid}`;
    span.appendChild(clientNode);
    line.appendChild(span);
    line.appendChild(textNode);
    this.container.appendChild(line);
  }
}
