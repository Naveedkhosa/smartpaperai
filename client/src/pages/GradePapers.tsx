import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { CheckCircle, Target } from "lucide-react";

export default function GradePaper() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [gradingSettings, setGradingSettings] = useState({
    method: "conceptual",
    selectedPaper: "",
    sourceKey: "",
  });

  const { data: classes } = useQuery({
    queryKey: ["/api/classes/teacher", user?.id],
    enabled: !!user?.id,
  });

  const { data: papers } = useQuery({
    queryKey: ["/api/papers/teacher", user?.id],
    enabled: !!user?.id,
  });

  const recentPapers = [
    {
      id: 1,
      title: "Math Quiz - Algebra",
      class: "Class 9-A",
      submissions: 23,
      avgScore: "85%",
      status: "completed",
    },
    {
      id: 2,
      title: "English Essay - Literature",
      class: "Class 10-A",
      submissions: 18,
      avgScore: "78%",
      status: "active",
    },
    {
      id: 3,
      title: "Physics Test - Motion",
      class: "Class 10-B",
      submissions: 0,
      avgScore: "0%",
      status: "draft",
    },
  ];

  const pendingSubmissions = [
    {
      id: 1,
      title: "Physics Test - Chapter 5",
      class: "Class 10-B",
      submissions: 15,
      dueDate: "2 days",
    },
    {
      id: 2,
      title: "Chemistry Lab Report",
      class: "Class 9-A",
      submissions: 22,
      dueDate: "5 days",
    },
  ];

  const keyBooks = [
    {
      id: 1,
      title: "Mathematics Grade 10 - Chapter 1-5",
      subject: "Mathematics",
    },
    { id: 2, title: "Physics Fundamentals", subject: "Physics" },
    { id: 3, title: "Chemistry Basics", subject: "Chemistry" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card
        data-testid="grading-system"
        className="glassmorphism-strong border-white/30"
      >
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Automated Grading System
          </CardTitle>
          <p className="text-white/70">
            Grade submissions with AI-powered assessment
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grading Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Assessment Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="block text-white/80 text-sm font-medium mb-2">
                    Select Paper
                  </Label>
                  <Select
                    value={gradingSettings.selectedPaper}
                    onValueChange={(value) =>
                      setGradingSettings({
                        ...gradingSettings,
                        selectedPaper: value,
                      })
                    }
                  >
                    <SelectTrigger
                      data-testid="select-grading-paper"
                      className="glass-input"
                    >
                      <SelectValue placeholder="Choose paper to grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {recentPapers.map((paper) => (
                        <SelectItem
                          key={paper.id}
                          value={paper.id.toString()}
                        >
                          {paper.title} - {paper.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="block text-white/80 text-sm font-medium mb-2">
                    Source Key Material
                  </Label>
                  <Select
                    value={gradingSettings.sourceKey}
                    onValueChange={(value) =>
                      setGradingSettings({
                        ...gradingSettings,
                        sourceKey: value,
                      })
                    }
                  >
                    <SelectTrigger
                      data-testid="select-source-key"
                      className="glass-input"
                    >
                      <SelectValue placeholder="Select verification source" />
                    </SelectTrigger>
                    <SelectContent>
                      {keyBooks.map((book) => (
                        <SelectItem
                          key={book.id}
                          value={book.id.toString()}
                        >
                          {book.title} - {book.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="glassmorphism p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">
                    Assessment Methodology
                  </h4>
                  <RadioGroup
                    value={gradingSettings.method}
                    onValueChange={(value) =>
                      setGradingSettings({
                        ...gradingSettings,
                        method: value,
                      })
                    }
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem
                        data-testid="radio-literal-grading"
                        value="literal"
                        id="literal-grading"
                      />
                      <div>
                        <Label
                          htmlFor="literal-grading"
                          className="text-white font-medium cursor-pointer"
                        >
                          Literal Comparison
                        </Label>
                        <p className="text-white/60 text-xs">
                          Direct word-for-word comparison against answer
                          key
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem
                        data-testid="radio-conceptual-grading"
                        value="conceptual"
                        id="conceptual-grading"
                      />
                      <div>
                        <Label
                          htmlFor="conceptual-grading"
                          className="text-white font-medium cursor-pointer"
                        >
                          Conceptual Matching
                        </Label>
                        <p className="text-white/60 text-xs">
                          Context-aware assessment considering meaning and
                          understanding
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Pending Assessments
              </h3>
              <div className="space-y-3">
                {pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="glassmorphism p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-semibold">
                          {submission.title}
                        </h4>
                        <p className="text-white/60 text-sm">
                          {submission.class}
                        </p>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-300">
                        {submission.submissions} submissions
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-xs">
                        Due in {submission.dueDate}
                      </span>
                      <Button
                        data-testid={`button-start-grading-${submission.id}`}
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        Start Grading
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20">
            <Button
              data-testid="button-begin-paper-assessment"
              className="w-full btn-primary-professional py-4 text-sm sm:text-base"
            >
              <Target className="mr-2" size={16} />
              Begin Paper Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}