CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quoteId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`text` text NOT NULL,
	`speakerId` int,
	`speakerName` varchar(255),
	`videoUrl` varchar(512),
	`videoTitle` varchar(512),
	`topic` varchar(128),
	`source` varchar(255) DEFAULT 'School of Hard Knocks',
	`featured` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seeded_flag` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seededAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seeded_flag_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `speakers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`bio` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `speakers_id` PRIMARY KEY(`id`),
	CONSTRAINT `speakers_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
