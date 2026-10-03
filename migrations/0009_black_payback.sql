ALTER TABLE "scales" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "scales" ADD COLUMN "published_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "scales" ADD CONSTRAINT "scales_published_by_user_id_users_id_fk" FOREIGN KEY ("published_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;