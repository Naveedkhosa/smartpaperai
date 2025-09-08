import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertClassSchema, insertPaperSchema, insertSubmissionSchema, insertGradeSchema, insertStudyMaterialSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Class routes
  app.get("/api/classes", async (req, res) => {
    try {
      const classes = await storage.getAllClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.get("/api/classes/teacher/:teacherId", async (req, res) => {
    try {
      const { teacherId } = req.params;
      const classes = await storage.getClassesByTeacher(teacherId);
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher's classes" });
    }
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const classData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(classData);
      res.json(newClass);
    } catch (error) {
      res.status(400).json({ message: "Failed to create class" });
    }
  });

  // Paper routes
  app.get("/api/papers/teacher/:teacherId", async (req, res) => {
    try {
      const { teacherId } = req.params;
      const papers = await storage.getPapersByTeacher(teacherId);
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher's papers" });
    }
  });

  app.post("/api/papers", async (req, res) => {
    try {
      const paperData = insertPaperSchema.parse(req.body);
      const paper = await storage.createPaper(paperData);
      res.json(paper);
    } catch (error) {
      res.status(400).json({ message: "Failed to create paper" });
    }
  });

  // Submission routes
  app.get("/api/submissions/student/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const submissions = await storage.getSubmissionsByStudent(studentId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student submissions" });
    }
  });

  app.get("/api/submissions/paper/:paperId", async (req, res) => {
    try {
      const { paperId } = req.params;
      const submissions = await storage.getSubmissionsByPaper(paperId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch paper submissions" });
    }
  });

  app.post("/api/submissions", async (req, res) => {
    try {
      const submissionData = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(submissionData);
      res.json(submission);
    } catch (error) {
      res.status(400).json({ message: "Failed to create submission" });
    }
  });

  // Grade routes
  app.get("/api/grades/student/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const grades = await storage.getGradesByStudent(studentId);
      res.json(grades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student grades" });
    }
  });

  app.post("/api/grades", async (req, res) => {
    try {
      const gradeData = insertGradeSchema.parse(req.body);
      const grade = await storage.createGrade(gradeData);
      res.json(grade);
    } catch (error) {
      res.status(400).json({ message: "Failed to create grade" });
    }
  });

  // Study Materials routes
  app.get("/api/study-materials", async (req, res) => {
    try {
      const materials = await storage.getAllStudyMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch study materials" });
    }
  });

  app.post("/api/study-materials", async (req, res) => {
    try {
      const materialData = insertStudyMaterialSchema.parse(req.body);
      const material = await storage.createStudyMaterial(materialData);
      res.json(material);
    } catch (error) {
      res.status(400).json({ message: "Failed to create study material" });
    }
  });

  // Statistics routes for admin dashboard
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const teachers = users.filter(u => u.role === "teacher");
      const students = users.filter(u => u.role === "student");
      const classes = await storage.getAllClasses();
      
      const stats = {
        totalUsers: users.length,
        activeTeachers: teachers.length,
        totalStudents: students.length,
        totalClasses: classes.length,
        papersGenerated: 0, // Will be calculated when papers are created
        submissionsGraded: 0 // Will be calculated when grades are created
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
