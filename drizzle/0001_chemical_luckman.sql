CREATE TABLE "portal_appointment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"appointmentDate" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"location" varchar(512),
	"notes" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "portal_appointment" ADD CONSTRAINT "portal_appointment_userId_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointment_user_idx" ON "portal_appointment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "appointment_date_idx" ON "portal_appointment" USING btree ("appointmentDate");--> statement-breakpoint
CREATE INDEX "appointment_status_idx" ON "portal_appointment" USING btree ("status");