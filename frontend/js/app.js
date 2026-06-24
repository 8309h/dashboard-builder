const dashboard = document.getElementById("dashboard");

const addTextBtn = document.getElementById("addTextBtn");

let widgetCounter = 1;

function createTextWidget() {

      const widget = document.createElement("div");

      widget.classList.add("widget");

      widget.dataset.id = `widget-${widgetCounter++}`;

      widget.dataset.type = "text";

      widget.style.left = "100px";
      widget.style.top = "100px";

      widget.innerHTML = `
        <div class="widget-header">

            <span>
                Text Widget
            </span>

            <button class="widget-menu">
                ⋮
            </button>

        </div>

        <div
            class="widget-content text-widget-content"
            contenteditable="true"
        >
            Start typing here...
        </div>
    `;

      dashboard.appendChild(widget);
}

addTextBtn.addEventListener("click", createTextWidget);