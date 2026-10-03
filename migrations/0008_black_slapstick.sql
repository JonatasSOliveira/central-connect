ALTER TABLE "ministry_roles" ADD COLUMN "display_order" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
WITH ordered_roles AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "ministry_id"
      ORDER BY LOWER("name"), "id"
    )::integer AS "display_order"
  FROM "ministry_roles"
)
UPDATE "ministry_roles" AS roles
SET "display_order" = ordered_roles."display_order"
FROM ordered_roles
WHERE roles."id" = ordered_roles."id";--> statement-breakpoint
CREATE INDEX "ministry_roles_ministry_order_idx" ON "ministry_roles" USING btree ("ministry_id","display_order");
