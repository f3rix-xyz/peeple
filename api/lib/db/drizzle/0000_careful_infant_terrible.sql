CREATE TABLE IF NOT EXISTS "peeple_api_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"likerEmail" varchar NOT NULL,
	"likedEmail" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "peeple_api_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user1id" varchar NOT NULL,
	"user2id" varchar NOT NULL,
	"matchedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "peeple_api_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"senderEmail" varchar NOT NULL,
	"receiverEmail" varchar NOT NULL,
	"content" text NOT NULL,
	"sentat" timestamp DEFAULT now() NOT NULL,
	"isread" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "peeple_api_pictures" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"url" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "peeple_api_profileimages" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"url" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"imageNo" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "peeple_api_userpreferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"userid" varchar NOT NULL,
	"agerange" jsonb,
	"genderpreference" jsonb,
	"relationshiptypepreference" jsonb,
	"maxdistance" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "peeple_api_users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"email" varchar NOT NULL,
	"location" varchar(255),
	"gender" varchar,
	"relationshiptype" varchar,
	"height" integer,
	"religion" varchar,
	"occupation_field" varchar(255),
	"occupation_area" varchar,
	"drink" varchar,
	"smoke" varchar,
	"bio" text,
	"date" integer,
	"month" integer,
	"year" integer,
	"subscription" varchar,
	"instaid" varchar,
	"phone" varchar,
	CONSTRAINT "peeple_api_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peeple_api_likes" ADD CONSTRAINT "peeple_api_likes_likerEmail_peeple_api_users_email_fk" FOREIGN KEY ("likerEmail") REFERENCES "public"."peeple_api_users"("email") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peeple_api_likes" ADD CONSTRAINT "peeple_api_likes_likedEmail_peeple_api_users_email_fk" FOREIGN KEY ("likedEmail") REFERENCES "public"."peeple_api_users"("email") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peeple_api_matches" ADD CONSTRAINT "peeple_api_matches_user1id_peeple_api_users_id_fk" FOREIGN KEY ("user1id") REFERENCES "public"."peeple_api_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peeple_api_matches" ADD CONSTRAINT "peeple_api_matches_user2id_peeple_api_users_id_fk" FOREIGN KEY ("user2id") REFERENCES "public"."peeple_api_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peeple_api_messages" ADD CONSTRAINT "peeple_api_messages_senderEmail_peeple_api_users_email_fk" FOREIGN KEY ("senderEmail") REFERENCES "public"."peeple_api_users"("email") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peeple_api_messages" ADD CONSTRAINT "peeple_api_messages_receiverEmail_peeple_api_users_email_fk" FOREIGN KEY ("receiverEmail") REFERENCES "public"."peeple_api_users"("email") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peeple_api_pictures" ADD CONSTRAINT "peeple_api_pictures_email_peeple_api_users_email_fk" FOREIGN KEY ("email") REFERENCES "public"."peeple_api_users"("email") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peeple_api_profileimages" ADD CONSTRAINT "peeple_api_profileimages_email_peeple_api_users_email_fk" FOREIGN KEY ("email") REFERENCES "public"."peeple_api_users"("email") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peeple_api_userpreferences" ADD CONSTRAINT "peeple_api_userpreferences_userid_peeple_api_users_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."peeple_api_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
