-- Create sliders table for carousel with video, countdown, and dynamic colors
CREATE TABLE `sliders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` text,
	`videoKey` varchar(255),
	`countdownEndTime` timestamp,
	`backgroundColor` varchar(7) DEFAULT '#FFC107' NOT NULL,
	`backgroundGradient` text,
	`isActive` tinyint DEFAULT 1 NOT NULL,
	`displayOrder` int DEFAULT 0 NOT NULL,
	`createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `sliders_id` PRIMARY KEY (`id`)
);
