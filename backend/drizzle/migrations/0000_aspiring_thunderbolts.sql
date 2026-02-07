CREATE TABLE `merchant_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`merchant_id` text NOT NULL,
	`payment_method_id` text,
	`payment_type` text NOT NULL,
	`qr_code_id` text,
	`nfc_nonce` text,
	`tip_amount` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `merchant_payments_transaction_id_unique` ON `merchant_payments` (`transaction_id`);--> statement-breakpoint
CREATE TABLE `merchants` (
	`id` text PRIMARY KEY NOT NULL,
	`business_name` text NOT NULL,
	`tap2_id` text NOT NULL,
	`business_type` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `merchants_tap2_id_unique` ON `merchants` (`tap2_id`);--> statement-breakpoint
CREATE TABLE `p2p_transfers` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`expires_at` integer NOT NULL,
	`completed_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `p2p_transfers_transaction_id_unique` ON `p2p_transfers` (`transaction_id`);--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text,
	`provider_id` text,
	`is_default` integer DEFAULT false NOT NULL,
	`last_four` text,
	`expiry_month` integer,
	`expiry_year` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	`merchant_id` text,
	`transaction_id` text,
	`expires_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_id` text NOT NULL,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`reference_id` text,
	`metadata` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`auth0_id` text,
	`kyc_verified` integer DEFAULT false NOT NULL,
	`kyc_verified_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_auth0_id_unique` ON `users` (`auth0_id`);--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wallets_user_id_unique` ON `wallets` (`user_id`);