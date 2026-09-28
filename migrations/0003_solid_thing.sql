CREATE UNIQUE INDEX "scale_attendance_members_attendance_member_idx" ON "scale_attendance_members" USING btree ("scale_attendance_id","member_id");--> statement-breakpoint
CREATE INDEX "scale_attendance_members_scale_idx" ON "scale_attendance_members" USING btree ("scale_id");--> statement-breakpoint
CREATE INDEX "scale_attendance_members_member_idx" ON "scale_attendance_members" USING btree ("member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scale_attendances_scale_idx" ON "scale_attendances" USING btree ("scale_id");--> statement-breakpoint
CREATE INDEX "scale_attendances_church_status_idx" ON "scale_attendances" USING btree ("church_id","status");--> statement-breakpoint
CREATE INDEX "scale_generation_jobs_status_schedule_idx" ON "scale_generation_jobs" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "scale_generation_jobs_lease_idx" ON "scale_generation_jobs" USING btree ("lease_expires_at");--> statement-breakpoint
CREATE INDEX "scale_generation_jobs_church_idx" ON "scale_generation_jobs" USING btree ("church_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scale_members_scale_member_idx" ON "scale_members" USING btree ("scale_id","member_id");--> statement-breakpoint
CREATE INDEX "scale_members_member_idx" ON "scale_members" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "scale_members_scale_idx" ON "scale_members" USING btree ("scale_id");--> statement-breakpoint
CREATE INDEX "scales_church_status_idx" ON "scales" USING btree ("church_id","status");--> statement-breakpoint
CREATE INDEX "scales_church_service_idx" ON "scales" USING btree ("church_id","service_id");--> statement-breakpoint
CREATE INDEX "scales_church_ministry_idx" ON "scales" USING btree ("church_id","ministry_id");