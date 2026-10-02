ALTER TABLE "scales" DROP CONSTRAINT "scales_church_id_churches_id_fk";
--> statement-breakpoint
DROP INDEX "scales_church_status_idx";--> statement-breakpoint
DROP INDEX "scales_church_service_idx";--> statement-breakpoint
DROP INDEX "scales_church_ministry_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "scales_service_ministry_idx" ON "scales" USING btree ("service_id","ministry_id") WHERE "scales"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "scales_ministry_idx" ON "scales" USING btree ("ministry_id");--> statement-breakpoint
ALTER TABLE "scales" DROP COLUMN "church_id";