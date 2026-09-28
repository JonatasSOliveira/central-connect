CREATE INDEX "service_templates_church_active_idx" ON "service_templates" USING btree ("church_id","is_active");--> statement-breakpoint
CREATE INDEX "service_templates_church_day_idx" ON "service_templates" USING btree ("church_id","day_of_week");--> statement-breakpoint
CREATE INDEX "services_church_date_idx" ON "services" USING btree ("church_id","date");--> statement-breakpoint
CREATE INDEX "services_church_template_date_idx" ON "services" USING btree ("church_id","service_template_id","date");