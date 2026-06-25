SQL schema and sample data

File: sql/schema.sql
- Creates database `dashboard_builder` and table `dashboard_layouts`.
- Inserts a sample layout containing text, image and chart widgets.

Import instructions
- Using phpMyAdmin: open `sql/schema.sql` and import.
- Using MySQL CLI on Windows (XAMPP):

```powershell
C:\xampp\mysql\bin\mysql.exe -u root < sql\schema.sql
```

Sample queries

- Get last saved layout:

```sql
SELECT layout_json FROM dashboard_layouts ORDER BY id DESC LIMIT 1;
```

- Delete all layouts (for testing):

```sql
TRUNCATE TABLE dashboard_layouts;
```
