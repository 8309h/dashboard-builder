CREATE DATABASE IF NOT EXISTS `dashboard_builder` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dashboard_builder`;

-- Layouts
CREATE TABLE IF NOT EXISTS `dashboard_layouts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `layout_name` VARCHAR(255) NOT NULL,
  `layout_json` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `dashboard_layouts` (`layout_name`, `layout_json`) VALUES
('Default Dashboard',
 '[
   {
     "id":"widget-1",
     "type":"text",
     "x":50,
     "y":50,
     "width":320,
     "height":180,
     "text":"<p><strong>Welcome</strong> to the dashboard builder prototype.</p>"
   },
   {
     "id":"widget-2",
     "type":"image",
     "x":400,
     "y":60,
     "width":320,
     "height":240,
     "imagePath":"/dashboard-builder/uploads/sample.jpg"
   },
   {
     "id":"widget-3",
     "type":"chart",
     "x":50,
     "y":260,
     "width":600,
     "height":400,
     "chartType":"bar",
     "chartData":[120,190,300,250,400]
   }
 ]'
);
