ALTER TABLE "user" ALTER COLUMN "total_request_quota" SET DEFAULT 500;--> statement-breakpoint
ALTER TABLE "api_key" ADD COLUMN "youtube_request_count" integer DEFAULT 0 NOT NULL;