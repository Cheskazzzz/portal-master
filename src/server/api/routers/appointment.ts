import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "~/server/db";
import { appointments } from "~/server/db/schema";
import { eq, and, asc } from "drizzle-orm";

export const appointmentRouter = createTRPCRouter({
  // ---------------- GET ALL APPOINTMENTS ----------------
  getAppointments: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.userId;

    const userAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(asc(appointments.appointmentDate));

    return userAppointments;
  }),

  // ---------------- CREATE NEW APPOINTMENT ----------------
  createAppointment: protectedProcedure
    .input(
      z.object({
        date: z.string(),       // format: YYYY-MM-DD
        time: z.string(),       // format: HH:mm
        notes: z.string().optional(),
        title: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId;

      // 🔹 Combine date and time into ISO format string, then create Date
      const appointmentDate = new Date(`${input.date}T${input.time}:00`);
      
      // Validate the date
      if (isNaN(appointmentDate.getTime())) {
        throw new Error("Invalid date or time provided");
      }

      const newAppointment = await db
        .insert(appointments)
        .values({
          userId,
          title: input.title ?? "",
          appointmentDate,
          notes: input.notes ?? "",
        })
        .returning();

      return newAppointment[0];
    }),

  // ---------------- DELETE APPOINTMENT ----------------
  deleteAppointment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId;
      const { id } = input;

      await db
        .delete(appointments)
        .where(and(eq(appointments.id, id), eq(appointments.userId, userId)));

      return { success: true, id };
    }),
});
