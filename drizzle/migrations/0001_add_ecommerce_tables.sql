-- Create categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text,
  `imageUrl` text,
  `icon` varchar(64),
  `displayOrder` int DEFAULT 0 NOT NULL,
  `active` tinyint DEFAULT 1 NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS `products` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `categoryId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text,
  `priceTnd` int NOT NULL,
  `priceEur` int,
  `originalPrice` int,
  `discount` int DEFAULT 0,
  `imageUrl` text,
  `images` json DEFAULT '[]',
  `platform` enum('shein','aliexpress','temu','local') DEFAULT 'local',
  `platformLink` text,
  `stock` int DEFAULT 0 NOT NULL,
  `rating` decimal(3,2) DEFAULT 0,
  `reviewCount` int DEFAULT 0,
  `active` tinyint DEFAULT 1 NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`)
);

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `productId` int NOT NULL,
  `userId` int,
  `customerName` varchar(255),
  `rating` int NOT NULL,
  `comment` text,
  `imageUrl` text,
  `verified` tinyint DEFAULT 0 NOT NULL,
  `helpful` int DEFAULT 0,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`)
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int,
  `sessionId` varchar(128),
  `productId` int NOT NULL,
  `quantity` int DEFAULT 1 NOT NULL,
  `addedAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`)
);

-- Create product_orders table
CREATE TABLE IF NOT EXISTS `product_orders` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int,
  `orderNumber` varchar(64) NOT NULL UNIQUE,
  `totalPrice` int NOT NULL,
  `paymentMethod` varchar(64) DEFAULT 'image_upload',
  `paymentProofUrl` text,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `shippingAddress` text,
  `gouvernorat` varchar(128),
  `customerNotes` text,
  `adminNotes` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create product_order_items table
CREATE TABLE IF NOT EXISTS `product_order_items` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `orderId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int DEFAULT 1 NOT NULL,
  `pricePerUnit` int NOT NULL,
  `totalPrice` int NOT NULL,
  FOREIGN KEY (`orderId`) REFERENCES `product_orders`(`id`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`)
);

-- Create custom_orders table
CREATE TABLE IF NOT EXISTS `custom_orders` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int,
  `orderNumber` varchar(64) NOT NULL UNIQUE,
  `description` text,
  `image1Url` text,
  `image2Url` text,
  `image3Url` text,
  `image4Url` text,
  `link1` text,
  `link2` text,
  `estimatedPrice` int,
  `finalPrice` int,
  `paymentProofUrl` text,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `shippingAddress` text,
  `gouvernorat` varchar(128),
  `customerNotes` text,
  `adminNotes` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON `products`(`categoryId`);
CREATE INDEX idx_products_active ON `products`(`active`);
CREATE INDEX idx_cart_user ON `cart_items`(`userId`);
CREATE INDEX idx_cart_session ON `cart_items`(`sessionId`);
CREATE INDEX idx_orders_user ON `product_orders`(`userId`);
CREATE INDEX idx_orders_status ON `product_orders`(`status`);
CREATE INDEX idx_custom_orders_user ON `custom_orders`(`userId`);
CREATE INDEX idx_custom_orders_status ON `custom_orders`(`status`);
