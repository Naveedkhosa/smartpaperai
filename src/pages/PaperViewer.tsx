// src/pages/PaperViewer.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  Printer,
  ArrowLeft,
  Edit,
  Loader2,
  FileText,
} from "lucide-react";
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import TeacherSidebar from "@/components/TeacherSidebar";
import { ApiService } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

const PaperViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [paper, setPaper] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const getToken = () => token || localStorage.getItem("smartpaper_token");

  const fetchPaper = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.request(`/user/papers/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (response.status && response.data) {
        setPaper(response.data.paper);
      } else {
        throw new Error(response.message || "Failed to fetch paper");
      }
    } catch (error) {
      console.error("❌ Error fetching paper:", error);
      toast({
        title: "Error",
        description: "Failed to load paper",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const getQuestionNumber = (
    sectionIndex: number,
    groupIndex: number,
    questionIndex: number
  ) => {
    if (!paper) return 0;
    let count = 1;
    for (let s = 0; s < sectionIndex; s++) {
      for (let g = 0; g < paper.sections[s].section_groups.length; g++) {
        count += paper.sections[s].section_groups[g].questions.length;
      }
    }
    for (let g = 0; g < groupIndex; g++) {
      count += paper.sections[sectionIndex].section_groups[g].questions.length;
    }
    return count + questionIndex;
  };

  useEffect(() => {
    if (id) fetchPaper();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading paper...
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-slate-900">
        <FileText className="w-10 h-10 mr-2" /> Paper not found
      </div>
    );
  }

  return (
    <div className="flex font-[Times_New_Roman]">
      <style>
        {`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-area, .print-area * {
            visibility: visible !important;
          }
          .print-area {
            position: absolute !important;
            left: 0;
            top: 0;
            width: 210mm !important;
            min-height: 297mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20mm !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
        `}
      </style>

      {/* Sidebar hidden in print */}
      <div className="no-print">
        <TeacherSidebar />
      </div>

      <div className="flex-1 bg-slate-900 min-h-screen">
        {/* Top Controls (Not printed) */}
        <div className="no-print bg-white/10 p-4 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/teacher/papers")}
              className="p-2 rounded hover:bg-white/10 text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-white text-lg font-semibold">{paper.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 rounded flex items-center gap-1"
            >
              {isPrinting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Printer size={16} />
              )}
              Print
            </button>
            <button
              onClick={() => navigate(`/teacher/paper-builder/${paper.id}`)}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 rounded flex items-center gap-1"
            >
              <Edit size={16} /> Edit
            </button>
          </div>
        </div>

        {/* Printable Paper */}
        <div className="print-area bg-white text-black mx-auto my-8 w-[210mm] min-h-[297mm] shadow-xl p-10">
          {/* Header */}
          <div className="text-center border-b border-gray-400 pb-4 mb-6">
            <h1 className="text-2xl font-bold uppercase">{paper.title}</h1>
            <div className="text-[15px] mt-2">
              <span>
                <strong>Subject:</strong> {paper.subject?.name || "N/A"} &nbsp; | &nbsp;
              </span>
              <span>
                <strong>Class:</strong> {paper.student_class?.name || "N/A"} &nbsp; | &nbsp;
              </span>
              <span>
                <strong>Time:</strong> {paper.duration} Min &nbsp; | &nbsp;
              </span>
              <span>
                <strong>Total Marks:</strong> {paper.total_marks}
              </span>
            </div>
          </div>

          {/* Body */}
          {paper.sections.map((section: any, sIndex: number) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-lg font-bold underline mb-2">
                {section.title}
              </h2>
              {section.instructions && (
                <p className="mb-4 text-[15px] italic">{section.instructions}</p>
              )}

              {section.section_groups.map((group: any, gIndex: number) => (
                <div key={group.id}>
                  {group.instructions && (
                    <p className="font-semibold mb-3">{group.instructions}</p>
                  )}

                  {group.questions.map((question: any, qIndex: number) => {
                    const qNumber = getQuestionNumber(sIndex, gIndex, qIndex);
                    return (
                      <div key={question.id} className="mb-4">
                        <div className="flex justify-between items-start">
                          <p className="text-[16px] leading-snug">
                            <strong>Q{qNumber}.</strong> {question.question_text}
                          </p>
                          {question.marks > 0 && (
                            <span className="text-[14px] font-semibold text-gray-700">
                              ({question.marks})
                            </span>
                          )}
                        </div>

                        {/* MCQs */}
                        {group.question_type?.slug === "mcq" && (
                          <div className="ml-8 mt-2 grid grid-cols-2 gap-x-10 gap-y-1 text-[15px]">
                            {question.options.map((opt: any, i: number) => (
                              <div key={opt.id} className="flex items-center">
                                <span className="font-semibold mr-2">
                                  {String.fromCharCode(65 + i)}.
                                </span>
                                <span>{opt.option_text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}

          {/* Footer */}
          <div className="text-center border-t border-gray-400 pt-3 mt-6 text-sm italic">
            --- End of Paper --- <br />
            Best of luck to all students!
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperViewer;
