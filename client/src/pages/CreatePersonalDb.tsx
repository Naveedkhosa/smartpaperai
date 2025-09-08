import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassmorphismLayout from "@/components/GlassmorphismLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  FileText,
  File,
  Image,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Edit3,
  ArrowLeft,
  BookOpen,
  Plus,
  Eye,
  Tag,
  GraduationCap,
  Bookmark,
  Globe,
  Lock,
} from "lucide-react";

export default function CreatePersonalDb() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    gradeLevel: "",
    visibility: "public",
    coverImage: null,
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove tag
  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    // Check file sizes (max 50MB)
    const oversizedFiles = files.filter(file => file.size > 50 * 1024 * 1024);

    if (oversizedFiles.length > 0) {
      setFileError("Some files exceed the 50MB limit");
      return;
    }

    setFileError("");
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  // Remove file
  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    // Check file sizes (max 50MB)
    const oversizedFiles = files.filter(file => file.size > 50 * 1024 * 1024);

    if (oversizedFiles.length > 0) {
      setFileError("Some files exceed the 50MB limit");
      return;
    }

    setFileError("");
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    if (file.type.includes("image")) return <Image size={18} className="text-blue-400" />;
    if (file.type.includes("pdf")) return <FileText size={18} className="text-red-400" />;
    if (file.type.includes("word")) return <FileText size={18} className="text-blue-500" />;
    if (file.type.includes("powerpoint") || file.type.includes("presentation")) return <FileText size={18} className="text-orange-500" />;
    if (file.type.includes("zip") || file.type.includes("compressed")) return <File size={18} className="text-yellow-400" />;
    return <File size={18} className="text-gray-400" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Custom select component to match our theme
  const CustomSelect = ({ value, onChange, options, placeholder, name }) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="glass-input w-full appearance-none focus:ring-2 focus:ring-emerald-400/50 transition-all bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/70">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );

  // Subjects and grade levels for select options
  const subjects = [
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "biology", label: "Biology" },
    { value: "english", label: "English" },
    { value: "history", label: "History" },
  ];

  const gradeLevels = [
    { value: "grade-9", label: "Grade 9" },
    { value: "grade-10", label: "Grade 10" },
    { value: "grade-11", label: "Grade 11" },
    { value: "grade-12", label: "Grade 12" },
    { value: "college", label: "College" },
  ];

  // Render step 1: Basic Info
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-5">
        <div>
          <Label className="block text-white/90 text-sm font-medium mb-2 flex items-center">
            <span className="bg-emerald-500/20 text-emerald-300 rounded-full p-1 mr-2">
              <Plus size={14} />
            </span>
            Title*
          </Label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="glass-input focus:ring-2 focus:ring-emerald-400/50 transition-all bg-white/5 border border-white/20 text-white placeholder-white/60"
            placeholder="Enter a descriptive title for your study material"
          />
        </div>

        <div>
          <Label className="block text-white/90 text-sm font-medium mb-2 flex items-center">
            <span className="bg-emerald-500/20 text-emerald-300 rounded-full p-1 mr-2">
              <Edit3 size={14} />
            </span>
            Description*
          </Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="glass-input min-h-[120px] focus:ring-2 focus:ring-emerald-400/50 transition-all bg-white/5 border border-white/20 text-white placeholder-white/60"
            placeholder="Provide a brief overview of what this study material covers"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label className="block text-white/90 text-sm font-medium mb-2 flex items-center">
              <span className="bg-emerald-500/20 text-emerald-300 rounded-full p-1 mr-2">
                <BookOpen size={14} />
              </span>
              Subject*
            </Label>
            <CustomSelect
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              options={subjects}
              placeholder="Select a subject"
            />
          </div>

          <div>
            <Label className="block text-white/90 text-sm font-medium mb-2 flex items-center">
              <span className="bg-emerald-500/20 text-emerald-300 rounded-full p-1 mr-2">
                <GraduationCap size={14} />
              </span>
              Grade Level*
            </Label>
            <CustomSelect
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleInputChange}
              options={gradeLevels}
              placeholder="Select a grade level"
            />
          </div>
        </div>

        <div>
          <Label className="block text-white/90 text-sm font-medium mb-2 flex items-center">
            <span className="bg-emerald-500/20 text-emerald-300 rounded-full p-1 mr-2">
              <Tag size={14} />
            </span>
            Tags
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                className="bg-emerald-500/20 text-emerald-300 flex items-center gap-1 py-1 px-2 rounded-full border border-emerald-500/30 transition-all hover:bg-emerald-500/30"
              >
                {tag}
                <X
                  size={12}
                  className="cursor-pointer hover:text-white"
                  onClick={() => removeTag(index)}
                />
              </Badge>
            ))}
          </div>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInput}
            className="glass-input focus:ring-2 focus:ring-emerald-400/50 transition-all bg-white/5 border border-white/20 text-white placeholder-white/60"
            placeholder="Add tags (press Enter after each tag)"
          />
          <p className="text-white/60 text-xs mt-2">
            Add relevant tags to help others find your material
          </p>
        </div>

        <div>
          <Label className="block text-white/90 text-sm font-medium mb-2 flex items-center">
            <span className="bg-emerald-500/20 text-emerald-300 rounded-full p-1 mr-2">
              <Eye size={14} />
            </span>
            Visibility
          </Label>
          <RadioGroup
            value={formData.visibility}
            onValueChange={(value) =>
              setFormData({ ...formData, visibility: value })
            }
            className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
          >
            <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-2 border border-white/10">
              <RadioGroupItem value="public" id="public" className="text-emerald-500 border-white/30 data-[state=checked]:bg-emerald-500" />
              <Label htmlFor="public" className="text-white cursor-pointer flex items-center">
                <Globe size={14} className="mr-1" />
                Public
              </Label>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-2 border border-white/10">
              <RadioGroupItem value="private" id="private" className="text-emerald-500 border-white/30 data-[state=checked]:bg-emerald-500" />
              <Label htmlFor="private" className="text-white cursor-pointer flex items-center">
                <Lock size={14} className="mr-1" />
                Private
              </Label>
            </div>
          </RadioGroup>
          <p className="text-white/60 text-xs mt-2">
            Public materials can be discovered and used by other teachers and students.
          </p>
        </div>

        <div>
          <Label className="block text-white/90 text-sm font-medium mb-2 flex items-center">
            <span className="bg-emerald-500/20 text-emerald-300 rounded-full p-1 mr-2">
              <Image size={14} />
            </span>
            Cover Image (Optional)
          </Label>
          <div className="border-2 border-dashed border-white/30 rounded-xl p-4 sm:p-6 text-center hover:border-emerald-400/50 transition-all duration-300 cursor-pointer bg-white/5">
            <Upload className="text-2xl sm:text-3xl text-emerald-300 mb-2 sm:mb-3 mx-auto" />
            <p className="text-white/70 text-sm mb-3 sm:mb-4">
              Drag and drop an image here, or
            </p>
            <label htmlFor="cover-upload" className="cursor-pointer">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 text-xs sm:text-sm">
                Browse Files
              </Button>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coverImage: e.target.files[0],
                  })
                }
              />
            </label>
            <p className="text-white/60 text-xs mt-2 sm:mt-3">
              Recommended size: 1200 x 800 pixels
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-white/10 gap-3 sm:gap-0">
        <Button
          onClick={() => navigate(-1)}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          onClick={() => setCurrentStep(2)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 order-1 sm:order-2"
        >
          Continue
          <ChevronRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );

  // Render step 2: Upload Files
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <span className="bg-emerald-500/20 text-emerald-300 rounded-full p-1 mr-2">
              <Upload size={16} />
            </span>
            Upload Study Materials
          </h3>
          <p className="text-white/70 text-sm">
            Upload one or more files for your study material. Supported formats include PDF, DOC, PPTX, JPG, PNG, and ZIP.
          </p>
        </div>

        <div
          className="border-2 border-dashed border-white/30 rounded-xl p-4 sm:p-8 text-center hover:border-emerald-400/50 transition-all duration-300 cursor-pointer bg-white/5"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="text-3xl sm:text-4xl text-emerald-300 mb-3 sm:mb-4 mx-auto" />
          <p className="text-white/70 text-sm mb-3 sm:mb-4">
            Drag and drop files here, or
          </p>
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 text-xs sm:text-sm">
              Browse Files
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <p className="text-white/60 text-xs mt-3 sm:mt-4">
            Maximum file size: 50MB
          </p>
          {fileError && (
            <p className="text-red-300 text-xs mt-2">{fileError}</p>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">
              Selected Files ({uploadedFiles.length})
            </h4>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="glassmorphism p-3 rounded-lg flex items-center justify-between hover:bg-white/10 transition-all bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div className="truncate max-w-[150px] sm:max-w-xs">
                    <p className="text-white text-sm truncate">{file.name}</p>
                    <p className="text-white/60 text-xs">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-300 hover:text-red-200 hover:bg-red-500/20 p-1 h-7 w-7 rounded-full flex-shrink-0"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-white/10 gap-3 sm:gap-0">
        <Button
          onClick={() => setCurrentStep(1)}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 order-2 sm:order-1"
        >
          <ChevronLeft size={16} className="mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep(3)}
          disabled={uploadedFiles.length === 0}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 disabled:opacity-50 order-1 sm:order-2"
        >
          Continue
          <ChevronRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );

  // Render step 3: Summary
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-5">
        <div className="glassmorphism p-4 sm:p-5 rounded-xl border border-white/10 bg-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="bg-emerald-500/20 text-emerald-300 rounded-full p-1 mr-2">
                <FileText size={16} />
              </span>
              Study Material Details
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(1)}
              className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20 flex items-center w-full sm:w-auto justify-center sm:justify-start"
            >
              <Edit3 size={14} className="mr-1" />
              Edit Details
            </Button>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-white/70 text-xs mb-1">Title</p>
              <p className="text-white font-medium">{formData.title}</p>
            </div>

            <div>
              <p className="text-white/70 text-xs mb-1">Description</p>
              <p className="text-white">{formData.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-white/70 text-xs mb-1">Subject</p>
                <p className="text-white font-medium capitalize">
                  {formData.subject.replace("-", " ")}
                </p>
              </div>

              <div>
                <p className="text-white/70 text-xs mb-1">Grade Level</p>
                <p className="text-white font-medium capitalize">
                  {formData.gradeLevel.replace("-", " ")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-white/70 text-xs mb-1">Visibility</p>
              <Badge className={`${formData.visibility === 'public' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'} capitalize flex items-center w-fit`}>
                {formData.visibility === 'public' ? <Globe size={12} className="mr-1" /> : <Lock size={12} className="mr-1" />}
                {formData.visibility}
              </Badge>
            </div>

            <div>
              <p className="text-white/70 text-xs mb-1">Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="bg-emerald-500/20 text-emerald-300 text-xs py-1 px-2 rounded-full flex items-center"
                  >
                    <Tag size={10} className="mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glassmorphism p-4 sm:p-5 rounded-xl border border-white/10 bg-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="bg-emerald-500/20 text-emerald-300 rounded-full p-1 mr-2">
                <File size={16} />
              </span>
              Uploaded Files
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(2)}
              className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20 flex items-center w-full sm:w-auto justify-center sm:justify-start"
            >
              <Edit3 size={14} className="mr-1" />
              Edit Files
            </Button>
          </div>

          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div className="truncate max-w-[120px] sm:max-w-xs">
                    <p className="text-white text-sm truncate">{file.name}</p>
                    <p className="text-white/60 text-xs">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 text-xs flex items-center">
                  <CheckCircle size={10} className="mr-1" />
                  Ready
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-white/10 gap-3 sm:gap-0">
        <Button
          onClick={() => setCurrentStep(2)}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 order-2 sm:order-1"
        >
          <ChevronLeft size={16} className="mr-2" />
          Back
        </Button>
        <Button
          onClick={() => {
            // Handle form submission here
            console.log("Form submitted:", { ...formData, tags, uploadedFiles });
            navigate("/teacher");
          }}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center order-1 sm:order-2"
        >
          <CheckCircle size={16} className="mr-2" />
          Create Study Material
        </Button>
      </div>
    </div>
  );

  return (
    <GlassmorphismLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="glassmorphism-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-white/10 shadow-lg bg-gradient-to-br from-white/10 to-white/5">
          <div className="flex items-center mb-3 sm:mb-4">
            <Button
              onClick={() => navigate(-1)}
              className="bg-white/10 hover:bg-white/20 p-2 mr-3 border border-white/20"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-sm sm:text-2xl font-bold text-white flex items-center">
                <BookOpen className="text-emerald-400 mr-2" size={20} />
                Create Study Material
              </h1>
              <p className="text-slate-200/80 text-xs sm:text-sm">
                Add your study materials to the personal database
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="glassmorphism-strong rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-white/10 shadow-lg bg-gradient-to-br from-white/10 to-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                    currentStep >= step
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {step}
                </div>
                <div
                  className={`ml-2 sm:ml-3 text-xs sm:text-sm font-medium ${
                    currentStep >= step ? "text-white" : "text-white/50"
                  }`}
                >
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Upload Files"}
                  {step === 3 && "Summary"}
                </div>
                {step < 3 && (
                  <div
                    className={`mx-2 sm:mx-4 sm:mx-6 w-8 sm:w-12 h-0.5 ${
                      currentStep > step 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                        : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="glassmorphism-strong border-white/20 shadow-lg bg-gradient-to-br from-white/10 to-white/5">
          <CardContent className="p-4 sm:p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </CardContent>
        </Card>
      </div>
    </GlassmorphismLayout>
  );
}