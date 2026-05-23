CREATE TABLE `appSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `appSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `arrivageItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(255),
	`price` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`available` int DEFAULT 1,
	`imageUrl` text,
	`imageKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `arrivageItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calculationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`userId` int,
	`deviceId` varchar(255),
	`imageUrl` text,
	`imageKey` varchar(255),
	`productType` varchar(255),
	`productCategory` varchar(255),
	`sourcePrice` decimal(10,2),
	`calculatedPrice` decimal(10,2),
	`analysisData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calculationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`userId` int,
	`customerName` varchar(255),
	`customerPhone` varchar(20),
	`hasOrder` int DEFAULT 0,
	`messageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatConversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `chatConversations_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`imageUrl` text,
	`audioUrl` text,
	`fileUrl` text,
	`orderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackingCode` varchar(64) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(20),
	`customerEmail` varchar(320),
	`productType` varchar(255),
	`productCategory` varchar(255),
	`imageUrl` text,
	`imageKey` varchar(255),
	`sourceUrl` text,
	`sourcePrice` decimal(10,2),
	`calculatedPrice` decimal(10,2),
	`finalPrice` decimal(10,2),
	`quantity` int DEFAULT 1,
	`status` enum('new','processing','waiting_payment','shipped','arrived','completed','cancelled') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`customerNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_trackingCode_unique` UNIQUE(`trackingCode`)
);
