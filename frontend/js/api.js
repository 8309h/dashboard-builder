async function uploadImage(file) {
      const form = new FormData();
      form.append('image', file);
      try {
            const res = await fetch('../backend/api/upload-image.php', {
                  method: 'POST',
                  body: form
            });
            const json = await res.json();
            if (!res.ok) {
                  return { success: false, message: json?.message || 'Upload failed' };
            }
            return json;
      } catch (error) {
            console.error('uploadImage fetch error', error);
            return { success: false, message: 'Unable to reach upload endpoint' };
      }
}

async function saveLayout(layoutData) {
      const res = await fetch('../backend/api/save-layout.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(layoutData)
      });
      return res.json();
}

async function loadLayout() {
      try {
            const res = await fetch('../backend/api/get-layout.php');
            if (!res.ok) return { elements: [] };
            const data = await res.json();
            return data || { elements: [] };
      } catch (err) {
            console.error('loadLayout failed', err);
            return { elements: [] };
      }
}

window.uploadImage = uploadImage;
window.saveLayout = saveLayout;
window.loadLayout = loadLayout;