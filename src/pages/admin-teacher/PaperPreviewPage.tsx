import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft, Loader2, FileText, Clock, BookOpen, Target } from 'lucide-react';
import { ApiService } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

const PaperPreviewPage = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [paper, setPaper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  // Fetch paper data from API
  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.request(`/user/papers/${paperId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status && response.data.paper) {
          setPaper(response.data.paper);
        } else {
          console.error('Failed to fetch paper:', response.message);
        }
      } catch (error) {
        console.error('Error fetching paper:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (paperId) {
      fetchPaper();
    }
  }, [paperId, token]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      const printContent = document.getElementById('paper-preview-content');
      if (!printContent) {
        console.error('Print content not found');
        setIsPrinting(false);
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups for printing');
        setIsPrinting(false);
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${paper?.title || 'Exam Paper'}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=1200, initial-scale=0.8">
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 0; 
              padding: 0;
              color: black;
              background: white;
              line-height: 1.3;
              font-size: 12pt;
              width: 100%;
              overflow-x: hidden;
              zoom: 0.9;
            }
            .print-area { 
              width: 100%; 
              max-width: 100%;
              min-height: 277mm;
              box-sizing: border-box;
            }
            .text-center { text-align: center; }
            .border-b { border-bottom: 1px solid #000; }
            .border-t { border-top: 1px solid #000; }
            .mb-4 { margin-bottom: 16px; }
            .mb-3 { margin-bottom: 12px; }
            .mb-2 { margin-bottom: 8px; }
            .mt-4 { margin-top: 16px; }
            .pb-3 { padding-bottom: 12px; }
            .pt-2 { padding-top: 8px; }
            .text-lg { font-size: 14pt; }
            .text-xl { font-size: 16pt; }
            .text-sm { font-size: 11pt; }
            .text-xs { font-size: 10pt; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .italic { font-style: italic; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr; }
            .gap-x-8 { column-gap: 32px; }
            .gap-y-1 { row-gap: 4px; }
            .ml-6 { margin-left: 24px; }
            .mt-2 { margin-top: 8px; }
            .mr-2 { margin-right: 8px; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .justify-between { justify-content: space-between; }
            .leading-tight { line-height: 1.25; }
            .bg-gray-50 { background-color: #f9fafb; }
            .border-l-4 { border-left-width: 4px; }
            .border-blue-500 { border-color: #3b82f6; }
            .rounded { border-radius: 2px; }
            .p-4 { padding: 16px; }
            .p-6 { padding: 24px; }
            .break-inside-avoid { break-inside: avoid; }
            .page-break-before { page-break-before: always; }
            .page-break-after { page-break-after: always; }
            .page-break-inside-avoid { page-break-inside: avoid; }
            * {
              box-sizing: border-box;
              max-width: 100%;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 0;
                width: 100%;
                font-size: 11pt;
                zoom: 1;
              }
              .print-area {
                width: 100%;
                margin: 0;
                padding: 0;
              }
              .no-break {
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .page-break { 
                page-break-before: always; 
              }
            }
          </style>
        </head>
        <body>
          <div class="print-area">
            ${printContent.innerHTML}
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          setIsPrinting(false);
        }, 500);
      };
    }, 500);
  };

  const handleDownload = () => {
    handlePrint();
  };

  // FIXED: Remove extra "0" - Only show marks when they are greater than 0
  const renderMarks = (marks) => {
    return Number(marks) > 0 ? `(${marks})` : '';
  };

  const getQuestionNumber = (sectionIndex, groupIndex, questionIndex) => {
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

  const renderQuestionContent = (question, group, qNumber) => {
    const questionType = group.question_type;
    const typeSlug = questionType?.slug;

    switch (typeSlug) {
      case 'true-false':
        return (
          <div className="mb-4 no-break">
            <div className="flex justify-between items-start gap-2 mb-2">
              <p className="text-sm sm:text-[16px] leading-tight flex-1">
                <strong>Q{qNumber}.</strong> {question.question_text}
              </p>
              {/* FIXED: Only render marks if they exist and are greater than 0 */}
              {Number(question.marks) > 0 && (
                <span className="text-xs sm:text-[14px] font-semibold text-gray-700 flex-shrink-0">
                  {renderMarks(question.marks)}
                </span>
              )}
            </div>
            <div className="ml-4 sm:ml-6 text-sm sm:text-[15px]">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">A.</span>
                  <span>True</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">B.</span>
                  <span>False</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'long-answer':
      case 'short-answer':
        return (
          <div className="mb-4 no-break">
            <div className="flex justify-between items-start gap-2 mb-2">
              <p className="text-sm sm:text-[16px] leading-tight flex-1">
                <strong>Q{qNumber}.</strong> {question.question_text}
              </p>
              {/* FIXED: Only render marks if they exist and are greater than 0 */}
              {Number(question.marks) > 0 && (
                <span className="text-xs sm:text-[14px] font-semibold text-gray-700 flex-shrink-0">
                  {renderMarks(question.marks)}
                </span>
              )}
            </div>
          </div>
        );

      case 'fill-in-blanks':
        return (
          <div className="mb-4 no-break">
            <div className="flex justify-between items-start gap-2 mb-2">
              <p className="text-sm sm:text-[16px] leading-tight flex-1">
                <strong>Q{qNumber}.</strong> {question.question_text}
              </p>
              {/* FIXED: Only render marks if they exist and are greater than 0 */}
              {Number(question.marks) > 0 && (
                <span className="text-xs sm:text-[14px] font-semibold text-gray-700 flex-shrink-0">
                  {renderMarks(question.marks)}
                </span>
              )}
            </div>
          </div>
        );

      case 'conditional':
        return (
          <div className="mb-4 no-break">
            <div className="flex justify-between items-start gap-2 mb-2">
              <p className="text-sm sm:text-[16px] leading-tight flex-1">
                <strong>Q{qNumber}.</strong> {question.question_text || group.instructions}
              </p>
              {/* FIXED: Only render marks if they exist and are greater than 0 */}
              {Number(question.marks) > 0 && (
                <span className="text-xs sm:text-[14px] font-semibold text-gray-700 flex-shrink-0">
                  {renderMarks(question.marks)}
                </span>
              )}
            </div>
            {/* FIXED: Handle sub-questions if they exist */}
            {question.sub_questions && question.sub_questions.map((subQ, subIndex) => (
              <div key={subQ.id} className="ml-4 sm:ml-8 mt-2">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm sm:text-[15px] leading-tight flex-1">
                    <strong>({subIndex + 1})</strong> {subQ.question_text}
                  </p>
                  {/* FIXED: Only render marks if they exist and are greater than 0 */}
                  {Number(subQ.marks) > 0 && (
                    <span className="text-xs sm:text-[14px] font-semibold text-gray-700 flex-shrink-0">
                      {renderMarks(subQ.marks)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'paragraph':
        return (
          <div className="mb-4 no-break">
            <div className="flex justify-between items-start gap-2 mb-2">
              <p className="text-sm sm:text-[16px] leading-tight flex-1">
                <strong>Q{qNumber}.</strong> Read the following passage and answer the questions below:
              </p>
              {/* FIXED: Only render marks if they exist and are greater than 0 */}
              {Number(question.marks) > 0 && (
                <span className="text-xs sm:text-[14px] font-semibold text-gray-700 flex-shrink-0">
                  {renderMarks(question.marks)}
                </span>
              )}
            </div>
            {question.paragraph_text && (
              <div className="ml-4 sm:ml-8 mb-3 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                <p className="text-sm sm:text-[15px] italic text-gray-700">
                  {question.paragraph_text}
                </p>
              </div>
            )}
            {/* FIXED: Handle sub-questions if they exist */}
            {question.sub_questions && question.sub_questions.map((subQ, subIndex) => (
              <div key={subQ.id} className="ml-4 sm:ml-8 mt-2">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm sm:text-[15px] leading-tight flex-1">
                    <strong>({subIndex + 1})</strong> {subQ.question_text}
                  </p>
                  {/* FIXED: Only render marks if they exist and are greater than 0 */}
                  {Number(subQ.marks) > 0 && (
                    <span className="text-xs sm:text-[14px] font-semibold text-gray-700 flex-shrink-0">
                      {renderMarks(subQ.marks)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="mb-4 no-break">
            <div className="flex justify-between items-start gap-2 mb-2">
              <p className="text-sm sm:text-[16px] leading-tight flex-1">
                <strong>Q{qNumber}.</strong> {question.question_text}
              </p>
              {/* FIXED: Only render marks if they exist and are greater than 0 */}
              {Number(question.marks) > 0 && (
                <span className="text-xs sm:text-[14px] font-semibold text-gray-700 flex-shrink-0">
                  {renderMarks(question.marks)}
                </span>
              )}
            </div>

            {questionType?.has_options && question.options && question.options.length > 0 && (
              <div className="ml-4 sm:ml-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-1 text-sm sm:text-[15px]">
                {question.options.map((opt, i) => (
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
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Paper Not Found</h2>
          <p className="text-gray-600 mb-4">The requested paper could not be loaded.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-x-auto">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{paper.title}</h1>
                  <p className="text-sm text-gray-600">Paper Preview</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Paper Info */}
              <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                  <BookOpen size={16} className="text-blue-600" />
                  <span className="font-medium">Class {paper.class_id}</span>
                </div>
                <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                  <Target size={16} className="text-green-600" />
                  <span className="font-medium">Subject {paper.subject_id}</span>
                </div>
                <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
                  <Clock size={16} className="text-orange-600" />
                  <span className="font-medium">{paper.duration} min</span>
                </div>
                <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full font-semibold text-purple-700">
                  {paper.total_marks} marks
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPrinting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Printer size={16} />
                  )}
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paper Content - FIXED: Mobile width and zoom issues */}
      <div className="w-full max-w-[1200px] mx-auto p-2 sm:p-4 md:p-6 print:max-w-none print:mx-0 print:p-0">
        <div 
          id="paper-preview-content" 
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-none print:rounded-none w-full min-w-0"
          style={{ 
            maxWidth: '100%',
            transform: 'scale(1)'
          }}
        >
          {/* Paper Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8 print:bg-white print:p-4">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">{paper.title}</h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm md:text-base text-gray-600">
                <div>
                  <strong>Class:</strong> {paper.class_id}
                </div>
                <div>
                  <strong>Subject:</strong> {paper.subject_id}
                </div>
                <div>
                  <strong>Time:</strong> {paper.duration} minutes
                </div>
                <div>
                  <strong>Total Marks:</strong> {paper.total_marks}
                </div>
              </div>
            </div>
          </div>

          {/* Paper Body */}
          <div className="p-4 sm:p-6 md:p-8 print:p-4">
            {paper.sections && paper.sections.length > 0 ? (
              paper.sections.map((section, sIndex) => (
                <div key={section.id} className="mb-6 last:mb-0 no-break">
                  {/* Section Header */}
                  <div className="border-b border-gray-300 pb-2 mb-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {section.title}
                    </h2>
                    {section.instructions && (
                      <p className="text-gray-600 mt-1 italic text-sm">{section.instructions}</p>
                    )}
                  </div>

                  {/* Section Groups */}
                  {section.section_groups && section.section_groups.map((group, gIndex) => (
                    <div key={group.id} className="mb-4 last:mb-0 no-break">
                      {/* Group Instructions */}
                      {group.instructions && group.instructions.trim() && (
                        <p className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                          {group.instructions}
                        </p>
                      )}

                      {/* Questions */}
                      {group.questions && group.questions.map((question, qIndex) => {
                        const qNumber = getQuestionNumber(sIndex, gIndex, qIndex);
                        return (
                          <div key={question.id} className="mb-4 last:mb-0 no-break">
                            {renderQuestionContent(question, group, qNumber)}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-2">No Sections Available</h3>
                <p className="text-gray-600 text-sm">This paper doesn't have any sections or questions yet.</p>
              </div>
            )}

            {/* Paper Footer */}
            <div className="border-t border-gray-200 pt-4 mt-6 text-center text-xs sm:text-sm text-gray-500 no-break">
              <p>--- End of Paper ---</p>
              <p className="mt-1">Best of luck to all students!</p>
            </div>
          </div>
        </div>

        {/* Mobile Paper Info */}
        <div className="sm:hidden mt-3 bg-white rounded-lg border border-gray-200 p-3 print:hidden">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-gray-400" />
              <span>Class {paper.class_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={14} className="text-gray-400" />
              <span>Subject {paper.subject_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <span>{paper.duration} min</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span>{paper.total_marks} marks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles and Mobile Fixes */}
      <style>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            zoom: 1 !important;
            transform: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:mx-0 {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .no-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        
        /* Mobile specific fixes */
        @media screen and (max-width: 768px) {
          #paper-preview-content {
            width: 100% !important;
            max-width: 100% !important;
            transform: none !important;
            zoom: 1 !important;
          }
          body {
            overflow-x: auto !important;
          }
          .min-h-screen {
            min-width: 100vw !important;
          }
        }
        
        /* Force desktop-like width on mobile with zoom out */
        @media screen and (max-width: 480px) {
          body {
            zoom: 0.85;
            -moz-transform: scale(0.85);
            -moz-transform-origin: 0 0;
          }
        }
        
        @media screen and (max-width: 375px) {
          body {
            zoom: 0.75;
            -moz-transform: scale(0.75);
            -moz-transform-origin: 0 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PaperPreviewPage;