import { 
  type User, 
  type Class,
  type Paper,
  type Submission,
  type Grade,
  type StudyMaterial,
  type InsertUser,
  type InsertClass,
  type InsertPaper,
  type InsertSubmission,
  type InsertGrade,
  type InsertStudyMaterial
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getUsersByRole(role: "admin" | "teacher" | "student"): Promise<User[]>;
  getAllUsers(): Promise<User[]>;

  // Class operations
  getClass(id: string): Promise<Class | undefined>;
  getClassesByTeacher(teacherId: string): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class | undefined>;
  deleteClass(id: string): Promise<boolean>;
  getAllClasses(): Promise<Class[]>;

  // Paper operations
  getPaper(id: string): Promise<Paper | undefined>;
  getPapersByTeacher(teacherId: string): Promise<Paper[]>;
  getPapersByClass(classId: string): Promise<Paper[]>;
  createPaper(paper: InsertPaper): Promise<Paper>;
  updatePaper(id: string, paper: Partial<InsertPaper>): Promise<Paper | undefined>;
  deletePaper(id: string): Promise<boolean>;

  // Submission operations
  getSubmission(id: string): Promise<Submission | undefined>;
  getSubmissionsByPaper(paperId: string): Promise<Submission[]>;
  getSubmissionsByStudent(studentId: string): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, submission: Partial<InsertSubmission>): Promise<Submission | undefined>;

  // Grade operations
  getGrade(id: string): Promise<Grade | undefined>;
  getGradesByStudent(studentId: string): Promise<Grade[]>;
  getGradesByPaper(paperId: string): Promise<Grade[]>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: string, grade: Partial<InsertGrade>): Promise<Grade | undefined>;

  // Study Material operations
  getStudyMaterial(id: string): Promise<StudyMaterial | undefined>;
  getStudyMaterialsBySubject(subject: string): Promise<StudyMaterial[]>;
  createStudyMaterial(material: InsertStudyMaterial): Promise<StudyMaterial>;
  updateStudyMaterial(id: string, material: Partial<InsertStudyMaterial>): Promise<StudyMaterial | undefined>;
  deleteStudyMaterial(id: string): Promise<boolean>;
  getAllStudyMaterials(): Promise<StudyMaterial[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private classes: Map<string, Class> = new Map();
  private papers: Map<string, Paper> = new Map();
  private submissions: Map<string, Submission> = new Map();
  private grades: Map<string, Grade> = new Map();
  private studyMaterials: Map<string, StudyMaterial> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: "admin123",
      email: "admin@smartpaper.ai",
      role: "admin",
      fullName: "System Administrator",
      createdAt: new Date(),
    };

    const teacherUser: User = {
      id: randomUUID(),
      username: "teacher1",
      password: "teacher123",
      email: "sarah.johnson@school.edu",
      role: "teacher",
      fullName: "Dr. Sarah Johnson",
      createdAt: new Date(),
    };

    const studentUser: User = {
      id: randomUUID(),
      username: "student1",
      password: "student123",
      email: "john.doe@student.edu",
      role: "student",
      fullName: "John Doe",
      createdAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(teacherUser.id, teacherUser);
    this.users.set(studentUser.id, studentUser);

    // Create sample classes
    const mathClass: Class = {
      id: randomUUID(),
      name: "Mathematics 9-A",
      teacherId: teacherUser.id,
      subject: "Mathematics",
      createdAt: new Date(),
    };

    this.classes.set(mathClass.id, mathClass);

    // Create sample papers
    const mathPaper: Paper = {
      id: randomUUID(),
      title: "Algebra Quiz - Chapter 3",
      subject: "Mathematics",
      classId: mathClass.id,
      teacherId: teacherUser.id,
      content: {
        questions: [
          { type: "mcq", question: "What is 2x + 3 = 7?", options: ["x=2", "x=3", "x=4"], answer: "x=2" },
          { type: "short", question: "Solve: 3x - 5 = 16", marks: 5 }
        ]
      },
      totalMarks: 25,
      createdAt: new Date(),
    };

    this.papers.set(mathPaper.id, mathPaper);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getUsersByRole(role: "admin" | "teacher" | "student"): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Class operations
  async getClass(id: string): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    return Array.from(this.classes.values()).filter(cls => cls.teacherId === teacherId);
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const id = randomUUID();
    const newClass: Class = { ...classData, id, createdAt: new Date() };
    this.classes.set(id, newClass);
    return newClass;
  }

  async updateClass(id: string, classData: Partial<InsertClass>): Promise<Class | undefined> {
    const cls = this.classes.get(id);
    if (!cls) return undefined;
    const updatedClass = { ...cls, ...classData };
    this.classes.set(id, updatedClass);
    return updatedClass;
  }

  async deleteClass(id: string): Promise<boolean> {
    return this.classes.delete(id);
  }

  async getAllClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  // Paper operations
  async getPaper(id: string): Promise<Paper | undefined> {
    return this.papers.get(id);
  }

  async getPapersByTeacher(teacherId: string): Promise<Paper[]> {
    return Array.from(this.papers.values()).filter(paper => paper.teacherId === teacherId);
  }

  async getPapersByClass(classId: string): Promise<Paper[]> {
    return Array.from(this.papers.values()).filter(paper => paper.classId === classId);
  }

  async createPaper(paper: InsertPaper): Promise<Paper> {
    const id = randomUUID();
    const newPaper: Paper = { ...paper, id, createdAt: new Date() };
    this.papers.set(id, newPaper);
    return newPaper;
  }

  async updatePaper(id: string, paper: Partial<InsertPaper>): Promise<Paper | undefined> {
    const existingPaper = this.papers.get(id);
    if (!existingPaper) return undefined;
    const updatedPaper = { ...existingPaper, ...paper };
    this.papers.set(id, updatedPaper);
    return updatedPaper;
  }

  async deletePaper(id: string): Promise<boolean> {
    return this.papers.delete(id);
  }

  // Submission operations
  async getSubmission(id: string): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async getSubmissionsByPaper(paperId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(sub => sub.paperId === paperId);
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(sub => sub.studentId === studentId);
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const id = randomUUID();
    const newSubmission: Submission = { 
      ...submission, 
      id, 
      submittedAt: new Date(),
      isGraded: false 
    };
    this.submissions.set(id, newSubmission);
    return newSubmission;
  }

  async updateSubmission(id: string, submission: Partial<InsertSubmission>): Promise<Submission | undefined> {
    const existing = this.submissions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...submission };
    this.submissions.set(id, updated);
    return updated;
  }

  // Grade operations
  async getGrade(id: string): Promise<Grade | undefined> {
    return this.grades.get(id);
  }

  async getGradesByStudent(studentId: string): Promise<Grade[]> {
    return Array.from(this.grades.values()).filter(grade => grade.studentId === studentId);
  }

  async getGradesByPaper(paperId: string): Promise<Grade[]> {
    return Array.from(this.grades.values()).filter(grade => grade.paperId === paperId);
  }

  async createGrade(grade: InsertGrade): Promise<Grade> {
    const id = randomUUID();
    const newGrade: Grade = { ...grade, id, gradedAt: new Date() };
    this.grades.set(id, newGrade);
    return newGrade;
  }

  async updateGrade(id: string, grade: Partial<InsertGrade>): Promise<Grade | undefined> {
    const existing = this.grades.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...grade };
    this.grades.set(id, updated);
    return updated;
  }

  // Study Material operations
  async getStudyMaterial(id: string): Promise<StudyMaterial | undefined> {
    return this.studyMaterials.get(id);
  }

  async getStudyMaterialsBySubject(subject: string): Promise<StudyMaterial[]> {
    return Array.from(this.studyMaterials.values()).filter(material => material.subject === subject);
  }

  async createStudyMaterial(material: InsertStudyMaterial): Promise<StudyMaterial> {
    const id = randomUUID();
    const newMaterial: StudyMaterial = { ...material, id, createdAt: new Date() };
    this.studyMaterials.set(id, newMaterial);
    return newMaterial;
  }

  async updateStudyMaterial(id: string, material: Partial<InsertStudyMaterial>): Promise<StudyMaterial | undefined> {
    const existing = this.studyMaterials.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...material };
    this.studyMaterials.set(id, updated);
    return updated;
  }

  async deleteStudyMaterial(id: string): Promise<boolean> {
    return this.studyMaterials.delete(id);
  }

  async getAllStudyMaterials(): Promise<StudyMaterial[]> {
    return Array.from(this.studyMaterials.values());
  }
}

export const storage = new MemStorage();
