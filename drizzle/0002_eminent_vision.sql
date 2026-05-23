ALTER TABLE `arrivageItems` MODIFY COLUMN `price` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `calculationHistory` MODIFY COLUMN `sourcePrice` varchar(20);--> statement-breakpoint
ALTER TABLE `calculationHistory` MODIFY COLUMN `calculatedPrice` varchar(20);--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `sourcePrice` varchar(20);--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `calculatedPrice` varchar(20);--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `finalPrice` varchar(20);