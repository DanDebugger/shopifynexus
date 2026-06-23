CREATE TABLE `buildComponent` (
	`id` varchar(255) NOT NULL,
	`templateId` varchar(255) NOT NULL,
	`productId` varchar(255) NOT NULL,
	`partType` varchar(50) NOT NULL,
	`performanceScore` int DEFAULT 0,
	CONSTRAINT `buildComponent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `buildHistoryLog` (
	`id` varchar(255) NOT NULL,
	`buildId` varchar(255) NOT NULL,
	`oldStatus` varchar(50),
	`newStatus` varchar(50) NOT NULL,
	`message` text,
	`timestamp` datetime,
	CONSTRAINT `buildHistoryLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `buildTemplate` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`baseTierScore` int DEFAULT 0,
	`createdAt` datetime,
	CONSTRAINT `buildTemplate_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerBuild` (
	`id` varchar(255) NOT NULL,
	`shop` varchar(255) NOT NULL,
	`customerId` varchar(255),
	`templateId` varchar(255) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'Pending',
	`totalScore` int DEFAULT 0,
	`createdAt` datetime,
	`updatedAt` datetime,
	CONSTRAINT `customerBuild_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`shop` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`isOnline` boolean NOT NULL DEFAULT false,
	`scope` varchar(1024),
	`expires` datetime,
	`accessToken` varchar(255) NOT NULL,
	`userId` bigint,
	`firstName` varchar(255),
	`lastName` varchar(255),
	`email` varchar(255),
	`accountOwner` boolean NOT NULL DEFAULT false,
	`locale` varchar(255),
	`collaborator` boolean DEFAULT false,
	`emailVerified` boolean DEFAULT false,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
