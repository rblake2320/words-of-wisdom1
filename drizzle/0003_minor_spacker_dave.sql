ALTER TABLE `quotes` ADD COLUMN IF NOT EXISTS `videoTimestamp` int;--> statement-breakpoint
ALTER TABLE `speakers` ADD COLUMN IF NOT EXISTS `socialLink` varchar(512);--> statement-breakpoint
ALTER TABLE `speakers` ADD COLUMN IF NOT EXISTS `businessLink` varchar(512);
