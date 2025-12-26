import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CloudUpload, BarChart3 } from "lucide-react";

export default function Manage() {
  const { user } = useAuth();
  const [selectedPaper, setSelectedPaper] = useState("");

  const { data: classes } = useQuery({
    queryKey: ["/api/classes/teacher", user?.id],
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submission Upload */}
        <Card
          data-testid="submission-management"
          className="glassmorphism-strong border-white/30"
        >
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Submission Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-white font-semibold">
                Teacher-Managed Uploads
              </h4>
              <div className="glassmorphism p-4 rounded-lg">
                <p className="text-white/70 text-sm mb-4">
                  Upload student papers in bulk and assign them manually
                </p>
                <div className="space-y-3">
                  <Select value={selectedPaper} onValueChange={setSelectedPaper}>
                    <SelectTrigger
                      data-testid="select-upload-paper"
                      className="glass-input"
                    >
                      <SelectValue placeholder="Select corresponding paper" />
                    </SelectTrigger>
                    <SelectContent>
                      {recentPapers.map((paper) => (
                        <SelectItem
                          key={paper.id}
                          value={paper.id.toString()}
                        >
                          {paper.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                    <CloudUpload className="text-4xl text-emerald-300 mb-3 mx-auto" />
                    <p className="text-white/60 text-sm">
                      Drop multiple submission files here
                    </p>
                    <Button
                      data-testid="button-bulk-upload"
                      className="mt-3 bg-emerald-500 hover:bg-emerald-600"
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold">
                Generate Upload Links
              </h4>
              <div className="glassmorphism p-4 rounded-lg">
                <p className="text-white/70 text-sm mb-4">
                  Create unique links for students to submit directly
                </p>
                <div className="space-y-3">
                  <Select value={selectedPaper} onValueChange={setSelectedPaper}>
                    <SelectTrigger
                      data-testid="select-link-paper"
                      className="glass-input"
                    >
                      <SelectValue placeholder="Select paper for submissions" />
                    </SelectTrigger>
                    <SelectContent>
                      {recentPapers.map((paper) => (
                        <SelectItem
                          key={paper.id}
                          value={paper.id.toString()}
                        >
                          {paper.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    data-testid="button-generate-link"
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    Generate Upload Link
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card
          data-testid="teaching-analytics"
          className="glassmorphism-strong border-white/30"
        >
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Teaching Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="glassmorphism p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">
                  Class Performance
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Average Score</span>
                    <span className="text-emerald-300">84.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Completion Rate</span>
                    <span className="text-blue-300">92%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Top Performer</span>
                    <span className="text-yellow-300">
                      Sarah Mitchell
                    </span>
                  </div>
                </div>
              </div>

              <div className="glassmorphism p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  <div className="text-xs text-white/60">
                    • 23 submissions graded today
                  </div>
                  <div className="text-xs text-white/60">
                    • 4 new papers created this week
                  </div>
                  <div className="text-xs text-white/60">
                    • 156 students across 6 classes
                  </div>
                </div>
              </div>

              <Button
                data-testid="button-detailed-analytics"
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                <BarChart3 className="mr-2" size={16} />
                View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}