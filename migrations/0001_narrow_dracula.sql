ALTER TABLE "users" ALTER COLUMN "firebase_uid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "phone_normalized" varchar(40);--> statement-breakpoint
CREATE INDEX "members_email_idx" ON "members" USING btree ("email");--> statement-breakpoint
CREATE INDEX "members_phone_normalized_idx" ON "members" USING btree ("phone_normalized");--> statement-breakpoint
CREATE INDEX "members_full_name_idx" ON "members" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "members_status_idx" ON "members" USING btree ("status");