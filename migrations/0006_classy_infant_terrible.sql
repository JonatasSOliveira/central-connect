UPDATE "member_availabilities" AS availability
SET "days_of_week" = CASE
  WHEN availability."mode" = 'ALLOW_LIST' THEN availability."days_of_week"
  ELSE (
    SELECT COALESCE(
      jsonb_agg(to_jsonb(day_name) ORDER BY day_order),
      '[]'::jsonb
    )
    FROM (
      VALUES
        ('Sunday', 0),
        ('Monday', 1),
        ('Tuesday', 2),
        ('Wednesday', 3),
        ('Thursday', 4),
        ('Friday', 5),
        ('Saturday', 6)
    ) AS all_days(day_name, day_order)
    WHERE NOT (availability."days_of_week" ? all_days.day_name)
  )
END;

ALTER TABLE "member_availabilities" DROP COLUMN "mode";
