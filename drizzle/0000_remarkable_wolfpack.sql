CREATE TABLE `cart_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_identifier` text NOT NULL,
	`property_id` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_identifier` text NOT NULL,
	`property_id` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`property_id` integer NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`property_id` integer NOT NULL,
	`buyer_name` text NOT NULL,
	`buyer_email` text NOT NULL,
	`buyer_phone` text NOT NULL,
	`buyer_address` text NOT NULL,
	`buyer_city` text NOT NULL,
	`buyer_state` text NOT NULL,
	`buyer_zip_code` text NOT NULL,
	`inquiry_type` text NOT NULL,
	`preferred_contact_time` text NOT NULL,
	`additional_notes` text,
	`order_status` text DEFAULT 'pending' NOT NULL,
	`total_value` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`location` text NOT NULL,
	`type` text NOT NULL,
	`bedrooms` integer NOT NULL,
	`bathrooms` integer NOT NULL,
	`area` integer NOT NULL,
	`images` text NOT NULL,
	`featured` integer DEFAULT false,
	`status` text DEFAULT 'available' NOT NULL,
	`amenities` text NOT NULL,
	`year_built` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
