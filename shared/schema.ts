import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().$type<"admin" | "teacher" | "student">(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teacherId: varchar("teacher_id").references(() => users.id),
  subject: text("subject").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const papers = pgTable("papers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  classId: varchar("class_id").references(() => classes.id),
  teacherId: varchar("teacher_id").references(() => users.id),
  content: jsonb("content"), // Paper structure and questions
  totalMarks: integer("total_marks").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paperId: varchar("paper_id").references(() => papers.id),
  studentId: varchar("student_id").references(() => users.id),
  content: jsonb("content"), // Student answers
  filesUploaded: text("files_uploaded").array(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  isGraded: boolean("is_graded").default(false),
});

export const grades = pgTable("grades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").references(() => submissions.id),
  studentId: varchar("student_id").references(() => users.id),
  paperId: varchar("paper_id").references(() => papers.id),
  score: integer("score").notNull(),
  totalMarks: integer("total_marks").notNull(),
  feedback: text("feedback"),
  gradedAt: timestamp("graded_at").defaultNow(),
});

export const studyMaterials = pgTable("study_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  content: text("content"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
});

export const insertPaperSchema = createInsertSchema(papers).omit({
  id: true,
  createdAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
});

export const insertGradeSchema = createInsertSchema(grades).omit({
  id: true,
  gradedAt: true,
});

export const insertStudyMaterialSchema = createInsertSchema(studyMaterials).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Paper = typeof papers.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Grade = typeof grades.$inferSelect;
export type StudyMaterial = typeof studyMaterials.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertPaper = z.infer<typeof insertPaperSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type InsertStudyMaterial = z.infer<typeof insertStudyMaterialSchema>;
