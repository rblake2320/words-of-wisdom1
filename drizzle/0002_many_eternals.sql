DELETE f1 FROM `favorites` f1
INNER JOIN `favorites` f2
  ON f1.`userId` = f2.`userId` AND f1.`quoteId` = f2.`quoteId` AND f1.`id` > f2.`id`;--> statement-breakpoint
ALTER TABLE `favorites` ADD UNIQUE INDEX IF NOT EXISTS `favorites_user_quote_unique` (`userId`,`quoteId`);
