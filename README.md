# Dashboard Builder (Prototype)

A simple visual dashboard builder using vanilla JavaScript, Fabric.js, Chart.js, and PHP/MySQL.

This version is updated to:
- Keep only the `Add Text`, `Add Image`, and `Add Chart` buttons in the sidebar.
- Load the latest saved layout from the database on page refresh.
- Use a clean dummy layout when no saved layout exists.
- Save layout JSON as an `elements` array in the database.

Project structure

- frontend/
  - index.html
  - css/style.css
  - js/app.js
  - js/api.js
- backend/
  - config/db.php
  - api/upload-image.php
  - api/save-layout.php
  - api/get-layout.php
- uploads/ (image uploads)
- sql/schema.sql (SQL schema + sample data)

Features

- Add and position Text, Image, and Chart widgets on a single canvas page.
- Resize widgets and edit properties in the side panel.
- Save layout to MySQL and load the latest saved layout on refresh.
- Render charts using Chart.js and save chart metadata, not bitmap images.

Database schema

The `sql/schema.sql` file creates the `dashboard_builder` database and `dashboard_layouts` table.

```
CREATE TABLE dashboard_layouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  layout_name VARCHAR(255) NOT NULL,
  layout_json LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Setup (Windows + XAMPP)

1. Copy the project folder to XAMPP `htdocs`.

```powershell
# from repository root
# recommended: C:\xampp\htdocs\dashboard-builder
```

2. Import the database schema:

```powershell
C:\xampp\mysql\bin\mysql.exe -u root < sql\schema.sql
```

3. Confirm DB credentials in `backend/config/db.php`.

4. Make sure `uploads/` exists and is writable by Apache.

5. Start Apache and MySQL from XAMPP.

6. Open the app:

```
http://localhost/dashboard-builder/frontend/index.html
```

Usage

- Click `Add Text` to place a text block.
- Click `Add Image` to place an image placeholder, then upload an image from the properties panel.
- Click `Add Chart` to add a chart widget.
- Select a widget and use the property panel to update text, font size, color, image opacity, or chart type.
- Click `Save Layout` to persist the current page.
- Refresh the page to reload the latest saved layout from the database.

Quick tests

- Add a Text widget, edit the text, save, and refresh — the text should persist.
- Add an Image widget, upload an image, save, and refresh — the image path should persist.
- Add a Chart widget, save, and refresh — the chart should re-render with stored chart data.

API endpoints

- `backend/api/upload-image.php`
  - accepts `multipart/form-data` with `image`
  - returns JSON `{ success: true, path: '/dashboard-builder/uploads/<file>' }`
- `backend/api/save-layout.php`
  - accepts POST JSON with `{ elements: [...] }`
  - saves the latest layout to the database
- `backend/api/get-layout.php`
  - returns the latest saved layout JSON

Notes

- The frontend uses relative API paths from `frontend/js/api.js`.
- Saved layout JSON is stored as an `elements` array, not raw DOM or widget chrome.
- If there is no saved layout, the app loads a friendly default starter layout.

Output

![Output](screenshot/Screenshot%202026-06-25%20174910.png)
