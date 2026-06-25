function attachDragHandler(el) {
      interact(el).draggable({
            allowFrom: '.page-element',
            ignoreFrom: 'input, textarea, select, [contenteditable]',
            listeners: {
                  move(evt) {
                        const target = evt.target;
                        const x0 = parseFloat(target.dataset.x || 0);
                        const y0 = parseFloat(target.dataset.y || 0);
                        const x = x0 + evt.dx;
                        const y = y0 + evt.dy;
                        target.style.transform = `translate(${x}px, ${y}px)`;
                        target.dataset.x = x;
                        target.dataset.y = y;
                  },
                  end() {
                        if (window?.pushHistory) window.pushHistory();
                  }
            }
      });
}

function attachResizeHandler(el) {
      interact(el).resizable({
            edges: { left: true, right: true, top: true, bottom: true },
            modifiers: [
                  interact.modifiers.restrictSize({
                        min: { width: 250, height: 160 }
                  })
            ],
            listeners: {
                  move(evt) {
                        const target = evt.target;
                        let x = parseFloat(target.dataset.x || 0);
                        let y = parseFloat(target.dataset.y || 0);
                        target.style.width = `${evt.rect.width}px`;
                        target.style.height = `${evt.rect.height}px`;
                        x += evt.deltaRect.left;
                        y += evt.deltaRect.top;
                        target.style.transform = `translate(${x}px, ${y}px)`;
                        target.dataset.x = x;
                        target.dataset.y = y;
                  },
                  end() {
                        if (window?.pushHistory) window.pushHistory();
                  }
            }
      });
}

function initializeWidgetInteractions(el) {
      attachDragHandler(el);
      attachResizeHandler(el);
}

window.attachDragHandler = attachDragHandler;
window.attachResizeHandler = attachResizeHandler;
window.initializeWidgetInteractions = initializeWidgetInteractions;