const dashboard = document.getElementById('dashboard');
const fabricEl = document.getElementById('fabricCanvas');
const addTextBtn = document.getElementById('addTextBtn');
const addImageBtn = document.getElementById('addImageBtn');
const addChartBtn = document.getElementById('addChartBtn');
const previewBtn = document.getElementById('previewBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const propertyContent = document.getElementById('propertyContent');
const saveLayoutBtn = document.getElementById('saveLayoutBtn');
const newCreationBtn = document.getElementById('newCreationBtn');

let fabricCanvas;
let selectedObject = null;
let previewMode = false;
let undoStack = [];
let redoStack = [];
let isRestoringState = false;
let isDirty = false;
let currentLayoutId = null;
const defaultChartData = [120, 190, 300, 250, 400];

function setDirty(val) {
      isDirty = val;

      saveLayoutBtn.textContent =
            isDirty
                  ? "Save Layout *"
                  : "Save Layout";

      saveLayoutBtn.classList.toggle(
            "dirty",
            isDirty
      );
}

function markDirty() {
      if (!isDirty) setDirty(true);
}

const DEFAULT_DUMMY_LAYOUT = [
      {
            id: 'element-sample-text',
            type: 'text',
            x: 40,
            y: 40,
            width: 420,
            height: 120,
            content: 'Welcome to the Dashboard Builder — edit this text and save your layout!',
            styles: { fontSize: 18, color: '#0f172a', fontWeight: '600', textAlign: 'left' }
      },
      {
            id: 'element-sample-chart',
            type: 'chart',
            x: 40,
            y: 180,
            width: 600,
            height: 300,
            chartType: 'bar',
            chartData: [...defaultChartData]
      }
];

function initializeFabricCanvas() {
      fabricCanvas = new fabric.Canvas('fabricCanvas', {
            selection: true,
            preserveObjectStacking: true,
            backgroundColor: 'transparent'
      });

      resizeFabricCanvas();

      fabricCanvas.on('selection:created', onObjectSelected);
      fabricCanvas.on('selection:updated', onObjectSelected);
      fabricCanvas.on('selection:cleared', onSelectionCleared);
      fabricCanvas.on('object:modified', (event) => {
            const target = event.target;
            if (target?.elementType === 'chart') {
                  updateChartObject(target);
            }
            fabricCanvas.renderAll();
            if (!isRestoringState) pushHistory();
      });
      fabricCanvas.on('object:added', ({ target }) => {
            if (target?._restoring) return;
            fabricCanvas.renderAll();
            if (!isRestoringState) pushHistory();
      });
      // fabricCanvas.on('mouse:down', (event) => {
      //       if (event.target) {
      //             setSelectedObject(event.target);
      //       }
      // });
}

function resizeFabricCanvas() {
      const width = dashboard.clientWidth;
      const height = dashboard.clientHeight;
      fabricCanvas.setWidth(width);
      fabricCanvas.setHeight(height);
      fabricCanvas.calcOffset();
      fabricEl.width = width;
      fabricEl.height = height;
      fabricCanvas.renderAll();
}

function onObjectSelected(event) {

      selectedObject =
            event.selected?.[0] ||
            event.target ||
            null;

      renderPropertyPanel();
}

function onSelectionCleared() {
      selectedObject = null;
      renderPropertyPanel();
}

function setSelectedObject(object) {

    if (previewMode) return;

    if (!object) return;

    if (selectedObject === object) return;

    selectedObject = object;

    renderPropertyPanel();
}

function clearSelectedObject() {
      if (!selectedObject) return;
      fabricCanvas.discardActiveObject();
      selectedObject = null;
      renderPropertyPanel();
      fabricCanvas.requestRenderAll();
}


function createElementByType(type, x = null, y = null) {
      if (type === 'text') return createTextElement({
            id: `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            type: 'text',
            x: x ?? 50,
            y: y ?? 50,
            width: 320,
            height: 220,
            content: 'Add text',
            styles: {
                  fontSize: 16,
                  color: '#111827',
                  fontWeight: 'normal',
                  textAlign: 'left'
            }
      });
      if (type === 'image') return createImageElement({
            id: `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            type: 'image',
            x: x ?? 50,
            y: y ?? 50,
            width: 320,
            height: 260,
            imagePath: '',
            styles: { opacity: 1, borderRadius: '0' }
      });
      if (type === 'chart') return createChartElement({
            id: `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            type: 'chart',
            x: x ?? 50,
            y: y ?? 50,
            width: 500,
            height: 400,
            chartType: 'bar',
            chartData: [...defaultChartData]
      });
      return null;
}

function createTextElement(data) {
      const textbox = new fabric.Textbox(data.content || 'Add text', {
            left: data.x,
            top: data.y,
            width: data.width,
            height: data.height,
            fontSize: data.styles?.fontSize || 16,
            fill: data.styles?.color || '#111827',
            fontWeight: data.styles?.fontWeight || 'normal',
            textAlign: data.styles?.textAlign || 'left',
            editable: true,
            objectCaching: false,
            lockScalingFlip: true
      });
      textbox.elementType = 'text';
      textbox.elementId = data.id;
      fabricCanvas.add(textbox);
      fabricCanvas.setActiveObject(textbox);
      return textbox;
}

function createImageElement(data) {

      return new Promise((resolve) => {

            // If image already exists (loaded from DB)
            if (data.imagePath) {

                  fabric.Image.fromURL(
                        data.imagePath,
                        (img) => {

                              configureCanvasImage(img, data);

                              img.elementType = "image";
                              img.elementId = data.id;
                              img.imagePath = data.imagePath;
                              img.borderRadius = data.styles?.borderRadius || "0";

                              fabricCanvas.add(img);
                              fabricCanvas.setActiveObject(img);
                              fabricCanvas.requestRenderAll();

                              resolve(img);

                        },
                        {
                              crossOrigin: "anonymous"
                        }
                  );

                  return;
            }

            // Placeholder for new image
            const placeholder = new fabric.Rect({

                  width: 320,
                  height: 220,

                  fill: "#ffffff",

                  stroke: "#cbd5e1",
                  strokeDashArray: [6, 6],

                  rx: 10,
                  ry: 10,

                  originX: "center",
                  originY: "center"
            });

            const icon = new fabric.Text("📷", {

                  fontSize: 40,

                  originX: "center",
                  originY: "center",

                  top: -25,

                  fill: "#94a3b8"
            });

            const text = new fabric.Text("Click to upload image", {

                  fontSize: 16,

                  originX: "center",
                  originY: "center",

                  top: 25,

                  fill: "#64748b"
            });

            const group = new fabric.Group(
                  [placeholder, icon, text],
                  {

                        left: data.x,
                        top: data.y,

                        originX: "left",
                        originY: "top",

                        lockScalingFlip: true,

                        hasRotatingPoint: false
                  }
            );

            group.elementType = "image";
            group.elementId = data.id;
            group.imagePath = "";

            fabricCanvas.add(group);
            fabricCanvas.setActiveObject(group);
            fabricCanvas.requestRenderAll();

            resolve(group);
      });
}

function configureCanvasImage(img, data) {

      const targetWidth = data.width;
      const targetHeight = data.height;

      const originalWidth = img.width;
      const originalHeight = img.height;

      const scale = Math.min(
            targetWidth / originalWidth,
            targetHeight / originalHeight
      );

      img.set({

            left: data.x,
            top: data.y,

            originX: "left",
            originY: "top",

            scaleX: scale,
            scaleY: scale,

            opacity: data.styles?.opacity ?? 1,

            selectable: true,
            evented: true,

            hasControls: true,
            hasBorders: true,

            lockMovementX: false,
            lockMovementY: false,

            lockScalingFlip: true
      });

      img.setCoords();
}

function createChartElement(data) {
      return new Promise((resolve) => {
            const dataUrl = generateChartDataUrl(data.chartType, data.chartData || defaultChartData, data.width, data.height);
            fabric.Image.fromURL(dataUrl, (img) => {
                  img.set({
                        left: data.x,
                        top: data.y,
                        width: data.width,
                        height: data.height,
                        lockScalingFlip: true
                  });
                  img.scaleX = 1;
                  img.scaleY = 1;
                  img.elementType = 'chart';
                  img.elementId = data.id;
                  img.chartType = data.chartType || 'bar';
                  img.chartData = data.chartData || defaultChartData;
                                                      fabricCanvas.add(img);
                                                      fabricCanvas.setActiveObject(img);
                                                      resolve(img);
            }, { crossOrigin: 'anonymous' });
      });
}

function generateChartDataUrl(type, chartData, width, height) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext('2d');
      const labels = chartData.map((_, index) => `Item ${index + 1}`);
      const chart = new Chart(ctx, {
            type,
            data: {
                  labels,
                  datasets: [{
                        label: 'Dataset',
                        data: chartData,
                        backgroundColor: type === 'bar' ? '#3b82f6' : 'rgba(59, 130, 246, 0.5)',
                        borderColor: '#2563eb',
                        borderWidth: 2,
                        fill: type === 'line'
                  }]
            },
            options: {
                  responsive: false,
                  animation: false,
                  maintainAspectRatio: false,
                  scales: {
                        y: {
                              beginAtZero: true
                        }
                  }
            }
      });
      const dataUrl = tempCanvas.toDataURL('image/png');
      chart.destroy();
      return dataUrl;
}

function collectLayoutData() {
      return fabricCanvas.getObjects().map((object) => {
            if (object.elementType === 'text') return serializeTextElement(object);
            if (object.elementType === 'image') return serializeImageElement(object);
            if (object.elementType === 'chart') return serializeChartElement(object);
            return null;
      }).filter(Boolean);
}

function serializeTextElement(object) {
      return {
            id: object.elementId,
            type: 'text',
            content: object.text || '',
            x: object.left,
            y: object.top,
            width: object.width * object.scaleX,
            height: object.height * object.scaleY,
            styles: {
                  fontSize: object.fontSize,
                  color: object.fill,
                  fontWeight: object.fontWeight || 'normal',
                  textAlign: object.textAlign || 'left'
            }
      };
}

function serializeImageElement(object) {
      const displayWidth = object.width * object.scaleX;
      const displayHeight = object.height * object.scaleY;
      return {
            id: object.elementId,
            type: 'image',
            imagePath: object.imagePath || '',
            x: object.left,
            y: object.top,
            width: displayWidth,
            height: displayHeight,
            styles: {
                  opacity: object.opacity || 1,
                  borderRadius: object.borderRadius || object.styles?.borderRadius || '0'
            }
      };
}

function serializeChartElement(object) {
      const displayWidth = object.width * object.scaleX;
      const displayHeight = object.height * object.scaleY;
      return {
            id: object.elementId,
            type: 'chart',
            chartType: object.chartType || 'bar',
            chartData: object.chartData || defaultChartData,
            x: object.left,
            y: object.top,
            width: displayWidth,
            height: displayHeight
      };
}

function renderPropertyPanel() {
      propertyContent.innerHTML = '';
      if (!selectedObject) {
            propertyContent.innerHTML = '<p>Select an element to edit its properties.</p>';
            return;
      }

      const title = document.createElement('div');
      title.className = 'property-row';
      title.innerHTML = `<label>Element</label><div>${selectedObject.elementType.toUpperCase()} - ${selectedObject.elementId}</div>`;
      propertyContent.appendChild(title);

      if (selectedObject.elementType === 'text') {
            const textRow = document.createElement('div');
            textRow.className = 'property-row';
            textRow.innerHTML = `
                  <label>Text</label>
                  <textarea id="propertyTextContent" rows="4">${selectedObject.text || ''}</textarea>`;
            propertyContent.appendChild(textRow);

            const fontRow = document.createElement('div');
            fontRow.className = 'property-row';
            fontRow.innerHTML = `
                  <label>Font Size</label>
                  <select id="propertyFontSize">
                        <option value="12">12px</option>
                        <option value="14">14px</option>
                        <option value="16">16px</option>
                        <option value="18">18px</option>
                        <option value="20">20px</option>
                        <option value="24">24px</option>
                  </select>`;
            propertyContent.appendChild(fontRow);

            const colorRow = document.createElement('div');
            colorRow.className = 'property-row';
            colorRow.innerHTML = `
                  <label>Text Color</label>
                  <input id="propertyTextColor" type="color" value="${selectedObject.fill || '#111827'}">`;
            propertyContent.appendChild(colorRow);

            const fontSelect = document.getElementById('propertyFontSize');
            fontSelect.value = selectedObject.fontSize || '16';
            fontSelect.addEventListener('change', (event) => {
                  selectedObject.set('fontSize', parseInt(event.target.value, 10));
                  fabricCanvas.requestRenderAll();
                  if (!isRestoringState) pushHistory();
            });

            const colorInput = document.getElementById('propertyTextColor');
            colorInput.addEventListener('input', (event) => {
                  selectedObject.set('fill', event.target.value);
                  fabricCanvas.requestRenderAll();
                  if (!isRestoringState) pushHistory();
            });

            const textArea = document.getElementById('propertyTextContent');
            textArea.addEventListener('input', (event) => {
                  selectedObject.set('text', event.target.value);
                  fabricCanvas.requestRenderAll();
                  if (!isRestoringState) pushHistory();
            });
      }

      if (selectedObject.elementType === 'image') {
            const uploadRow = document.createElement('div');
            uploadRow.className = 'property-row';
            uploadRow.innerHTML = `
                  <label>Image</label>
                  <input id="propertyImageUpload" type="file" accept="image/*">`;
            propertyContent.appendChild(uploadRow);

            const opacityRow = document.createElement('div');
            opacityRow.className = 'property-row';
            opacityRow.innerHTML = `
                  <label>Opacity</label>
                  <input id="propertyImageOpacity" type="range" min="0.1" max="1" step="0.1" value="${selectedObject.opacity || 1}">
                  <span id="opacityValue">${selectedObject.opacity || 1}</span>`;
            propertyContent.appendChild(opacityRow);

            const uploadInput = document.getElementById('propertyImageUpload');
            uploadInput.addEventListener('change', async (event) => {
                  const file = event.target.files[0];
                  if (!file) return;
                  try {
                        const uploadResult = await uploadImage(file);
                        if (!uploadResult || !uploadResult.success) {
                              alert(uploadResult?.message || 'Image upload failed');
                              return;
                        }
                        replaceImageObject(selectedObject, uploadResult.path);
                  } catch (error) {
                        console.error('Image upload error', error);
                        alert('Image upload failed. Check console for details.');
                  }
            });

            const opacityInput = document.getElementById('propertyImageOpacity');
            const opacityValue = document.getElementById('opacityValue');
            opacityInput.addEventListener('input', (event) => {
                  const value = parseFloat(event.target.value);
                  opacityValue.textContent = value;
                  selectedObject.set('opacity', value);
                  fabricCanvas.requestRenderAll();
                  if (!isRestoringState) pushHistory();
            });
      }

      if (selectedObject.elementType === 'chart') {
            const typeRow = document.createElement('div');
            typeRow.className = 'property-row';
            typeRow.innerHTML = `
                  <label>Chart Type</label>
                  <select id="propertyChartType">
                        <option value="bar">Bar</option>
                        <option value="line">Line</option>
                  </select>`;
            propertyContent.appendChild(typeRow);

            const refreshRow = document.createElement('div');
            refreshRow.className = 'property-row';
            refreshRow.innerHTML = `<button id="propertyRefreshChart">Refresh Data</button>`;
            propertyContent.appendChild(refreshRow);

            const chartTypeSelect = document.getElementById('propertyChartType');
            chartTypeSelect.value = selectedObject.chartType || 'bar';
            chartTypeSelect.addEventListener('change', (event) => {
                  selectedObject.chartType = event.target.value;
                  updateChartObject(selectedObject);
                  if (!isRestoringState) pushHistory();
            });

            document.getElementById('propertyRefreshChart').addEventListener('click', () => {
                  selectedObject.chartData = Array.from({ length: 5 }, () => Math.floor(Math.random() * 500));
                  updateChartObject(selectedObject);
                  if (!isRestoringState) pushHistory();
            });
      }
}

function replaceImageObject(oldObject, imagePath) {

      fabric.Image.fromURL(
            imagePath,
            function (img) {

                  const targetWidth = oldObject.getScaledWidth();
                  const targetHeight = oldObject.getScaledHeight();

                  configureCanvasImage(img, {
                        x: oldObject.left,
                        y: oldObject.top,
                        width: targetWidth,
                        height: targetHeight,
                        styles: {
                              opacity: oldObject.opacity || 1
                        }
                  });

                  img.elementType = "image";
                  img.elementId = oldObject.elementId;
                  img.imagePath = imagePath;

                  // VERY IMPORTANT
                  img.set({

                        selectable: true,
                        evented: true,

                        hasControls: true,
                        hasBorders: true,

                        lockMovementX: false,
                        lockMovementY: false,

                        lockRotation: false,

                        perPixelTargetFind: true
                  });

                  fabricCanvas.remove(oldObject);

                  fabricCanvas.add(img);

                  img.setCoords();

                  fabricCanvas.setActiveObject(img);

                  fabricCanvas.requestRenderAll();

                  renderPropertyPanel();

                  pushHistory();

            },
            {
                  crossOrigin: "anonymous"
            }
      );
}

function updateChartObject(object) {
      const displayWidth = object.width * object.scaleX;
      const displayHeight = object.height * object.scaleY;
      const dataUrl = generateChartDataUrl(object.chartType, object.chartData || defaultChartData, displayWidth, displayHeight);
      object.setSrc(dataUrl, () => {
            fabricCanvas.requestRenderAll();
      });
}

function buildLayoutPayload() {
      return {
            elements: collectLayoutData()
      };
}

function updateHistoryButtons() {
      undoBtn.disabled = undoStack.length === 0;
      redoBtn.disabled = redoStack.length === 0;
}

function pushHistory() {
      if (isRestoringState) return;
      undoStack.push(collectLayoutData());
      if (undoStack.length > 50) undoStack.shift();
      redoStack = [];
      updateHistoryButtons();
      markDirty();
}

function clearDashboard() {
      selectedObject = null;
      propertyContent.innerHTML = '<p>Select an element to edit its properties.</p>';
      fabricCanvas.clear();
}

async function applyLayoutData(layoutData) {
      if (!Array.isArray(layoutData)) return;
      isRestoringState = true;
      clearDashboard();
      const promises = layoutData.map((element) => {
            if (element.type === 'text') return createTextElement(element);
            if (element.type === 'image') return createImageElement(element);
            if (element.type === 'chart') return createChartElement(element);
            return Promise.resolve();
      });
      await Promise.all(promises);
      isRestoringState = false;
      updateHistoryButtons();
}

async function handleSaveLayout() {
      const layoutData = buildLayoutPayload();
      if (currentLayoutId) {
            layoutData.layoutId = currentLayoutId;
      }
      const result = await saveLayout(layoutData);
      if (result && result.success) {
            currentLayoutId = result.layoutId || currentLayoutId;
            setDirty(false);
            alert('Layout saved successfully');
      } else {
            alert(result.message || 'Save failed');
      }
      return result;
}

function showUnsavedChangesModal() {
      return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                  <div class="modal-dialog">
                        <h2>Unsaved changes</h2>
                        <p>You have unsaved changes. Do you want to save before creating a new layout?</p>
                        <div class="modal-actions">
                              <button id="modalSaveContinue" class="primary">Save & Continue</button>
                              <button id="modalDiscard">Discard Changes</button>
                              <button id="modalCancel" class="secondary">Cancel</button>
                        </div>
                  </div>
            `;
            document.body.appendChild(modal);

            const cleanup = () => {
                  modal.remove();
            };

            modal.querySelector('#modalSaveContinue').addEventListener('click', () => {
                  cleanup();
                  resolve('save');
            });
            modal.querySelector('#modalDiscard').addEventListener('click', () => {
                  cleanup();
                  resolve('discard');
            });
            modal.querySelector('#modalCancel').addEventListener('click', () => {
                  cleanup();
                  resolve('cancel');
            });
      });
}

async function handleNewCreation() {
      if (isDirty) {
            const result = await showUnsavedChangesModal();
            if (result === 'cancel') return;
            if (result === 'save') {
                  const saveResult = await handleSaveLayout();
                  if (!saveResult?.success) return;
            }
      }
      clearDashboard();
      undoStack = [];
      redoStack = [];
      currentLayoutId = null;
      setDirty(false);
      updateHistoryButtons();
}

function togglePreviewMode() {
      previewMode = !previewMode;
      document.body.classList.toggle('preview-mode', previewMode);
      fabricCanvas.selection = !previewMode;
      fabricCanvas.getObjects().forEach((object) => {
            object.selectable = !previewMode;
      });
      fabricCanvas.requestRenderAll();
      previewBtn.textContent = previewMode ? 'Exit Preview' : 'Preview';
      if (previewMode) clearSelectedObject();
}


async function initializeDashboard() {
      initializeFabricCanvas();
      const savedLayout = await loadLayout();
      const layoutData = savedLayout?.elements ?? [];
      currentLayoutId = savedLayout?.layoutId ?? null;
      if (!Array.isArray(layoutData) || layoutData.length === 0) {
            await applyLayoutData(DEFAULT_DUMMY_LAYOUT);
            undoStack = [collectLayoutData()];
            updateHistoryButtons();
            setDirty(false);
            return;
      }
      isRestoringState = true;
      await applyLayoutData(layoutData);
      isRestoringState = false;
      undoStack = [collectLayoutData()];
      updateHistoryButtons();
      setDirty(false);
}

window.addEventListener('resize', resizeFabricCanvas);
window.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' && selectedObject && !previewMode) {
            fabricCanvas.remove(selectedObject);
            clearSelectedObject();
            if (!isRestoringState) pushHistory();
      }
      if (event.key === 'Escape') {
            clearSelectedObject();
      }
});

addTextBtn?.addEventListener('click', () => createElementByType('text'));
addImageBtn?.addEventListener('click', () => createElementByType('image'));
addChartBtn?.addEventListener('click', () => createElementByType('chart'));
newCreationBtn?.addEventListener('click', handleNewCreation);
previewBtn?.addEventListener('click', togglePreviewMode);
saveLayoutBtn?.addEventListener('click', handleSaveLayout);
undoBtn?.addEventListener('click', () => {
      if (undoStack.length === 0) return;
      redoStack.push(collectLayoutData());
      const state = undoStack.pop();
      isRestoringState = true;
      applyLayoutData(state).then(() => {
            isRestoringState = false;
            updateHistoryButtons();
      });
});
redoBtn?.addEventListener('click', () => {
      if (redoStack.length === 0) return;
      undoStack.push(collectLayoutData());
      const state = redoStack.pop();
      isRestoringState = true;
      applyLayoutData(state).then(() => {
            isRestoringState = false;
            updateHistoryButtons();
      });
});

window.onAddText = () => createElementByType('text');
window.onAddImage = () => createElementByType('image');
window.onAddChart = () => createElementByType('chart');

window.addEventListener('DOMContentLoaded', () => {
      renderPropertyPanel();
      initializeDashboard();
});