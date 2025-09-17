import React, { useEffect, useRef, useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ---------- Types ----------
export interface Question {
    id: string;
    type: string;
    content: any;
}

export interface QuestionGroup {
    id: string;
    type: string;
    instruction: string;
    logic?: string;
    numberingStyle: 'numeric' | 'roman' | 'alphabetic'; // Added numbering style
    questions: Question[];
}

export interface Section {
    id: string;
    title: string;
    instruction: string;
    groups: QuestionGroup[];
}

// ---------- Utilities ----------
const uid = (prefix = '') => `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const LS_KEY = 'paper_generator_v2';

// Helper function to convert numbers to Roman numerals
const toRoman = (num: number): string => {
    const romanNumerals = [
        { value: 1000, symbol: 'M' },
        { value: 900, symbol: 'CM' },
        { value: 500, symbol: 'D' },
        { value: 400, symbol: 'CD' },
        { value: 100, symbol: 'C' },
        { value: 90, symbol: 'XC' },
        { value: 50, symbol: 'L' },
        { value: 40, symbol: 'XL' },
        { value: 10, symbol: 'X' },
        { value: 9, symbol: 'IX' },
        { value: 5, symbol: 'V' },
        { value: 4, symbol: 'IV' },
        { value: 1, symbol: 'I' }
    ];
    
    let result = '';
    for (const { value, symbol } of romanNumerals) {
        while (num >= value) {
            result += symbol;
            num -= value;
        }
    }
    return result;
};

// Helper function to convert numbers to alphabetic (A, B, C, ... AA, AB, etc.)
const toAlphabetic = (num: number): string => {
    let result = '';
    while (num > 0) {
        num--; // Adjust for 1-indexing
        result = String.fromCharCode(65 + (num % 26)) + result;
        num = Math.floor(num / 26);
    }
    return result || 'A';
};

// Format number based on style
const formatNumber = (num: number, style: 'numeric' | 'roman' | 'alphabetic'): string => {
    switch (style) {
        case 'roman':
            return toRoman(num);
        case 'alphabetic':
            return toAlphabetic(num);
        default:
            return num.toString();
    }
};

// ---------- Enhanced Rich Text Editor with Image Support ----------
const RichTextEditor: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    showMath?: boolean;
}> = ({ value, onChange, placeholder, rows = 3, showMath = true }) => {
    const [mode, setMode] = useState<'text' | 'math' | 'image'>('text');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target?.result as string;
            const imgTag = `<img src="${imageData}" alt="Uploaded image" style="max-width: 100%;" />`;
            
            if (mode === 'math') {
                // For math mode, insert at cursor position
                const textarea = document.activeElement as HTMLTextAreaElement;
                if (textarea && textarea.tagName === 'TEXTAREA') {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const newValue = value.substring(0, start) + imgTag + value.substring(end);
                    onChange(newValue);
                    
                    setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = start + imgTag.length;
                        textarea.focus();
                    }, 0);
                } else {
                    onChange(value + imgTag);
                }
            } else {
                // For text mode, just append
                onChange(value + imgTag);
            }
        };
        reader.readAsDataURL(file);
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            {showMath && (
                <div className="flex gap-2 mb-2">
                    <button
                        type="button"
                        onClick={() => setMode('text')}
                        className={`px-3 py-1 text-sm rounded ${
                            mode === 'text' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        Text
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('math')}
                        className={`px-3 py-1 text-sm rounded ${
                            mode === 'math' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        Math
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`px-3 py-1 text-sm rounded ${
                            mode === 'image' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        Insert Image
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            )}

            {mode === 'math' && showMath ? (
                <MathEditor
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={rows}
                />
            ) : (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={rows}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            )}
        </div>
    );
};

// ---------- Math Editor Component ----------
const MathEditor: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
}> = ({ value, onChange, placeholder, rows = 3, className = "" }) => {
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [showMathHelp, setShowMathHelp] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const insertMath = (symbol: string) => {
        const textarea = document.activeElement as HTMLTextAreaElement;
        if (textarea && textarea.tagName === 'TEXTAREA') {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = value.substring(0, start) + symbol + value.substring(end);
            onChange(newValue);
            
            // Set cursor position after the inserted symbol
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
                textarea.focus();
            }, 0);
        } else {
            onChange(value + symbol);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target?.result as string;
            const imgTag = `<img src="${imageData}" alt="Uploaded image" style="max-width: 100%;" />`;
            
            // Insert at cursor position
            const textarea = document.activeElement as HTMLTextAreaElement;
            if (textarea && textarea.tagName === 'TEXTAREA') {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue = value.substring(0, start) + imgTag + value.substring(end);
                onChange(newValue);
                
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + imgTag.length;
                    textarea.focus();
                }, 0);
            } else {
                onChange(value + imgTag);
            }
        };
        reader.readAsDataURL(file);
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const renderMathPreview = (text: string) => {
        // Simple math rendering for preview - replace common LaTeX patterns
        let rendered = text
            .replace(/\$\$([^$]+)\$\$/g, '<div class="math-block">$1</div>')
            .replace(/\$([^$]+)\$/g, '<span class="math-inline">$1</span>')
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<sup>$1</sup>/<sub>$2</sub>')
            .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
            .replace(/\\sum/g, '∑')
            .replace(/\\int/g, '∫')
            .replace(/\\alpha/g, 'α')
            .replace(/\\beta/g, 'β')
            .replace(/\\gamma/g, 'γ')
            .replace(/\\pi/g, 'π')
            .replace(/\\theta/g, 'θ')
            .replace(/\\infty/g, '∞')
            .replace(/\\leq/g, '≤')
            .replace(/\\geq/g, '≥')
            .replace(/\\neq/g, '≠')
            .replace(/\\pm/g, '±');

        return rendered;
    };

    const mathSymbols = [
        { symbol: '$x^2$', label: 'x²' },
        { symbol: '$\\frac{a}{b}$', label: 'a/b' },
        { symbol: '$\\sqrt{x}$', label: '√x' },
        { symbol: '$\\sum$', label: '∑' },
        { symbol: '$\\int$', label: '∫' },
        { symbol: '$\\pi$', label: 'π' },
        { symbol: '$\\alpha$', label: 'α' },
        { symbol: '$\\beta$', label: 'β' },
        { symbol: '$\\theta$', label: 'θ' },
        { symbol: '$\\infty$', label: '∞' },
        { symbol: '$\\leq$', label: '≤' },
        { symbol: '$\\geq$', label: '≥' },
        { symbol: '$\\pm$', label: '±' },
    ];

    return (
        <div className={`relative ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-1 flex-wrap">
                    {mathSymbols.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => insertMath(item.symbol)}
                            className="px-2 py-1 text-sm bg-white hover:bg-blue-50 border rounded transition-colors"
                            title={`Insert ${item.symbol}`}
                        >
                            {item.label}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-1 text-sm bg-white hover:bg-blue-50 border rounded transition-colors"
                        title="Insert Image"
                    >
                        Insert Image
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <button
                        type="button"
                        onClick={() => setShowMathHelp(!showMathHelp)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="Math Help"
                    >
                        ?
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                            isPreviewMode 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white border hover:bg-gray-50'
                        }`}
                    >
                        {isPreviewMode ? 'Edit' : 'Preview'}
                    </button>
                </div>
            </div>

            {/* Math Help Panel */}
            {showMathHelp && (
                <div className="mb-2 p-3 bg-blue-50 rounded-lg border text-sm">
                    <div className="font-medium text-blue-800 mb-2">Math Syntax Help:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><code>$x^2$</code> → x²</div>
                        <div><code>$x_1$</code> → x₁</div>
                        <div><code>$\frac{'{a}{b}'}$</code> → fraction</div>
                        <div><code>$\sqrt{'{x}'}$</code> → square root</div>
                        <div><code>$$...$$</code> → block formula</div>
                        <div><code>$...$</code> → inline formula</div>
                    </div>
                </div>
            )}

            {/* Editor/Preview */}
            {isPreviewMode ? (
                <div 
                    className="w-full p-3 rounded-lg border border-gray-300 bg-white min-h-[100px] math-preview"
                    style={{ minHeight: `${rows * 24}px` }}
                    dangerouslySetInnerHTML={{ __html: renderMathPreview(value) }}
                />
            ) : (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={rows}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
            )}

            <style jsx>{`
                .math-preview .math-block {
                    display: block;
                    text-align: center;
                    margin: 10px 0;
                    font-size: 1.2em;
                    background: #f8f9fa;
                    padding: 8px;
                    border-radius: 4px;
                }
                .math-preview .math-inline {
                    background: #e9ecef;
                    padding: 2px 4px;
                    border-radius: 3px;
                    font-family: 'Times New Roman', serif;
                }
            `}</style>
        </div>
    );
};

// ---------- Icons (Using Heroicons) ----------
const Icon = {
    Close: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
    Add: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>,
    Edit: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>,
    Delete: () =>  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
    Duplicate: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" /><path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" /></svg>,
    Drag: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>,
    Export: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
    Import: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>,
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>,
    Question: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
    ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
    ChevronUp: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>,
    Print: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>,
    Download: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
    Eye: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>,
};

// ---------- Small UI primitives (Modal & Toast) ----------
const Modal: React.FC<{ open: boolean; onClose: () => void; title?: string } & React.PropsWithChildren<{}>> = ({
    open,
    onClose,
    title,
    children,
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl p-6 border border-gray-200 max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                        <Icon.Close />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

const Confirm = ({ open, onConfirm, onCancel, message }: any) => (
    <Modal open={open} onClose={onCancel} title="Confirm Action">
        <p className="text-gray-700 mb-6 text-center">{message}</p>
        <div className="flex justify-center space-x-4">
            <button onClick={onCancel} className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-colors">Cancel</button>
            <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors">Delete</button>
        </div>
    </Modal>
);

// ---------- Sortable Section component ----------
const SortableSection: React.FC<{
    section: Section;
    index: number;
    onEdit: (s: Section) => void;
    onDelete: (id: string) => void;
    onAddGroup: (sectionId: string) => void;
    onEditGroup: (sectionId: string, group: QuestionGroup) => void;
    onDeleteGroup: (sectionId: string, groupId: string) => void;
    onDuplicateSection: (sectionId: string) => void;
}> = ({ section, index, onEdit, onDelete, onAddGroup, onEditGroup, onDeleteGroup, onDuplicateSection }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
    const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

    return (
        <div ref={setNodeRef} style={style} className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 cursor-grab" {...attributes} {...listeners}>
                        <div className="text-lg font-bold text-blue-600">{index + 1}.</div>
                        <div className="p-1 text-gray-400 hover:text-gray-600">
                            <Icon.Drag />
                        </div>
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => onEdit(section)}>
                        <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                        {section.instruction && <p className="text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: section.instruction.replace(/\$([^$]+)\$/g, '<em>$1</em>') }} />}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => onDuplicateSection(section.id)} className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-colors" title="Duplicate">
                        <Icon.Duplicate />
                    </button>
                    <button onClick={() => onEdit(section)} className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors" title="Edit">
                        <Icon.Edit />
                    </button>
                    <button onClick={() => onAddGroup(section.id)} className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors" title="Add Group">
                        <Icon.Add />
                    </button>
                    <button onClick={() => onDelete(section.id)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors" title="Delete">
                        <Icon.Delete />
                    </button>
                </div>
            </div>

            {/* Groups preview: small compact view with edit/delete */}
            <div className="mt-4 space-y-3">
                {section.groups.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                        No groups yet. Add a question group to this section.
                    </div>
                ) : (
                    section.groups.map((g, gi) => (
                        <div key={g.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start gap-3 border border-gray-200">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-green-700">{getGroupTitle(g.type)}</div>
                                {g.instruction && <div className="text-gray-600 text-sm mt-1" dangerouslySetInnerHTML={{ __html: g.instruction.replace(/\$([^$]+)\$/g, '<em>$1</em>') }} />}
                                <div className="text-gray-500 text-xs mt-2">Questions: {g.questions.length}</div>
                                <div className="text-gray-500 text-xs">Numbering: {g.numberingStyle}</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onEditGroup(section.id, g)} className="p-1.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors" title="Edit Group">
                                    <Icon.Edit />
                                </button>
                                <button onClick={() => onDeleteGroup(section.id, g.id)} className="p-1.5 rounded-md bg-red-100 hover:bg-red-200 text-red-700 transition-colors" title="Delete Group">
                                    <Icon.Delete />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ---------- Helper UI for titles ----------
const getGroupTitle = (type: string) => {
    const titles: Record<string, string> = {
        mcq: 'Multiple Choice Questions',
        'true-false': 'True / False',
        'fill-in-the-blanks': 'Fill in the Blanks',
        'short-question': 'Short Questions',
        'long-question': 'Long Questions',
        conditional: 'Conditional Questions',
        'para-question': 'Paragraph Questions',
    };
    return titles[type] || 'Untitled Group';
};

// ---------- Forms (Section / Group / Question) ----------
const SectionForm: React.FC<{
    open: boolean;
    onClose: () => void;
    onSubmit: (title: string, instruction: string, editingId?: string) => void;
    editing?: Section | null;
}> = ({ open, onClose, onSubmit, editing }) => {
    const [title, setTitle] = useState(editing?.title || '');
    const [instruction, setInstruction] = useState(editing?.instruction || '');

    useEffect(() => {
        setTitle(editing?.title || '');
        setInstruction(editing?.instruction || '');
    }, [editing]);

    const handle = (e: any) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit(title.trim(), instruction.trim(), editing?.id);
    };

    return (
        <Modal open={open} onClose={onClose} title={editing ? 'Edit Section' : 'Create New Section'}>
            <form onSubmit={handle} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <RichTextEditor
                        value={title}
                        onChange={setTitle}
                        placeholder="Enter section title..."
                        rows={2}
                        showMath={true}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (optional)</label>
                    <RichTextEditor
                        value={instruction}
                        onChange={setInstruction}
                        placeholder="Enter section instructions..."
                        rows={3}
                        showMath={true}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">{editing ? 'Save Changes' : 'Add Section'}</button>
                </div>
            </form>
        </Modal>
    );
};

const GroupForm: React.FC<{
    open: boolean;
    onClose: () => void;
    onSubmit: (type: string, instruction: string, numberingStyle: 'numeric' | 'roman' | 'alphabetic', logic?: string, editingId?: string) => void;
    sectionTitle?: string;
    editing?: QuestionGroup | null;
}> = ({ open, onClose, onSubmit, sectionTitle, editing }) => {
    const [type, setType] = useState(editing?.type || 'mcq');
    const [instruction, setInstruction] = useState(editing?.instruction || '');
    const [logic, setLogic] = useState(editing?.logic || 'OR');
    const [numberingStyle, setNumberingStyle] = useState<'numeric' | 'roman' | 'alphabetic'>(editing?.numberingStyle || 'numeric');

    useEffect(() => {
        setType(editing?.type || 'mcq');
        setInstruction(editing?.instruction || '');
        setLogic(editing?.logic || 'OR');
        setNumberingStyle(editing?.numberingStyle || 'numeric');
    }, [editing]);

    const handle = (e: any) => {
        e.preventDefault();
        onSubmit(type, instruction.trim(), numberingStyle, type === 'conditional' ? logic : undefined, editing?.id);
    };

    return (
        <Modal open={open} onClose={onClose} title={editing ? 'Edit Group' : `Add Group to ${sectionTitle || ''}`}>
            <form onSubmit={handle} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="mcq">Multiple Choice Questions</option>
                        <option value="true-false">True/False Questions</option>
                        <option value="fill-in-the-blanks">Fill in the Blanks</option>
                        <option value="short-question">Short Questions</option>
                        <option value="long-question">Long Questions</option>
                        <option value="conditional">Conditional Questions</option>
                        <option value="para-question">Paragraph Questions</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numbering Style</label>
                    <select
                        value={numberingStyle}
                        onChange={(e) => setNumberingStyle(e.target.value as 'numeric' | 'roman' | 'alphabetic')}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="numeric">Numeric (1, 2, 3)</option>
                        <option value="roman">Roman (I, II, III)</option>
                        <option value="alphabetic">Alphabetic (A, B, C)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (optional)</label>
                    <RichTextEditor
                        value={instruction}
                        onChange={setInstruction}
                        placeholder="Enter group instructions..."
                        rows={3}
                        showMath={true}
                    />
                </div>
                {type === 'conditional' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logic</label>
                        <select
                            value={logic}
                            onChange={(e) => setLogic(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="OR">OR (answer any one)</option>
                            <option value="AND">AND (answer all)</option>
                        </select>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">{editing ? 'Save Changes' : 'Add Group'}</button>
                </div>
            </form>
        </Modal>
    );
};

const QuestionForm: React.FC<{
    open: boolean;
    onClose: () => void;
    onSubmit: (question: Question, editingId?: string) => void;
    type: string;
    editing?: Question | null;
}> = ({ open, onClose, onSubmit, type, editing }) => {
    const [questionText, setQuestionText] = useState(editing?.content?.questionText || '');
    const [choices, setChoices] = useState<string[]>(editing?.content?.choices || ['', '']);
    const [correctAnswer, setCorrectAnswer] = useState<number>(editing?.content?.correctAnswer ?? 0);
    const [subQuestions, setSubQuestions] = useState<string[]>(editing?.content?.subQuestions || ['']);
    const [paraText, setParaText] = useState(editing?.content?.paraText || '');
    const [paraQuestions, setParaQuestions] = useState<string[]>(editing?.content?.paraQuestions || ['']);
    const [conditionalQuestions, setConditionalQuestions] = useState<string[]>(editing?.content?.conditionalQuestions || ['']);

    useEffect(() => {
        setQuestionText(editing?.content?.questionText || '');
        setChoices(editing?.content?.choices || ['', '']);
        setCorrectAnswer(editing?.content?.correctAnswer ?? 0);
        setSubQuestions(editing?.content?.subQuestions || ['']);
        setParaText(editing?.content?.paraText || '');
        setParaQuestions(editing?.content?.paraQuestions || ['']);
        setConditionalQuestions(editing?.content?.conditionalQuestions || ['']);
    }, [editing]);

    const reset = () => {
        setQuestionText('');
        setChoices(['', '']);
        setCorrectAnswer(0);
        setSubQuestions(['']);
        setParaText('');
        setParaQuestions(['']);
        setConditionalQuestions(['']);
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const content: any = {};
        if (type !== 'para-question' && type !== 'conditional') content.questionText = questionText;
        if (type === 'mcq') {
            content.choices = choices;
            content.correctAnswer = correctAnswer;
        } else if (type === 'true-false') {
            content.choices = ['True', 'False'];
            content.correctAnswer = correctAnswer;
        } else if (type === 'short-question' || type === 'long-question') {
            content.subQuestions = subQuestions.filter(Boolean);
        } else if (type === 'conditional') {
            content.conditionalQuestions = conditionalQuestions.filter(Boolean);
        } else if (type === 'para-question') {
            content.paraText = paraText;
            content.paraQuestions = paraQuestions.filter(Boolean);
        }

        const q: Question = { id: editing?.id || uid('q-'), type, content };
        onSubmit(q, editing?.id);
        reset();
    };

    // choice helpers
    const updateChoice = (i: number, v: string) => setChoices((s) => s.map((c, idx) => (idx === i ? v : c)));
    const addChoice = () => setChoices((s) => [...s, '']);
    const removeChoice = (i: number) => setChoices((s) => s.filter((_, idx) => idx !== i));

    // sub question helpers
    const updateSub = (i: number, v: string) => setSubQuestions((s) => s.map((x, idx) => (idx === i ? v : x)));
    const addSub = () => setSubQuestions((s) => [...s, '']);
    const removeSub = (i: number) => setSubQuestions((s) => s.filter((_, idx) => idx !== i));

    // paragraph helpers
    const updateParaQ = (i: number, v: string) => setParaQuestions((s) => s.map((x, idx) => (idx === i ? v : x)));
    const addParaQ = () => setParaQuestions((s) => [...s, '']);
    const removeParaQ = (i: number) => setParaQuestions((s) => s.filter((_, idx) => idx !== i));

    // conditional helpers
    const updateCond = (i: number, v: string) => setConditionalQuestions((s) => s.map((x, idx) => (idx === i ? v : x)));
    const addCond = () => setConditionalQuestions((s) => [...s, '']);
    const removeCond = (i: number) => setConditionalQuestions((s) => s.filter((_, idx) => idx !== i));

    return (
        <Modal open={open} onClose={onClose} title={editing ? 'Edit Question' : 'Add Question'}>
            <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-auto pr-2">
                {(type === 'mcq' || type === 'true-false' || type === 'fill-in-the-blanks' || type === 'short-question' || type === 'long-question') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                        <RichTextEditor
                            value={questionText}
                            onChange={setQuestionText}
                            placeholder="Enter your question..."
                            rows={3}
                            showMath={true}
                        />
                    </div>
                )}

                {type === 'mcq' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Choices</label>
                        <div className="space-y-3">
                            {choices.map((c, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <RichTextEditor
                                            value={c}
                                            onChange={(v) => updateChoice(i, v)}
                                            placeholder={`Choice ${String.fromCharCode(65 + i)}`}
                                            rows={2}
                                            showMath={true}
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                                        <input
                                            type="radio"
                                            checked={correctAnswer === i}
                                            onChange={() => setCorrectAnswer(i)}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        Correct
                                    </label>
                                    {choices.length > 2 && (
                                        <button type="button" onClick={() => removeChoice(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
                                            <Icon.Delete />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addChoice} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors">
                                <Icon.Add /> Add Choice
                            </button>
                        </div>
                    </div>
                )}

                {type === 'true-false' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">
                                <input type="radio" checked={correctAnswer === 0} onChange={() => setCorrectAnswer(0)} className="text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-700">True</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">
                                <input type="radio" checked={correctAnswer === 1} onChange={() => setCorrectAnswer(1)} className="text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-700">False</span>
                            </label>
                        </div>
                    </div>
                )}

                {(type === 'short-question' || type === 'long-question') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sub Questions (optional)</label>
                        <div className="space-y-3">
                            {subQuestions.map((s, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <RichTextEditor
                                            value={s}
                                            onChange={(v) => updateSub(i, v)}
                                            placeholder={`Sub-question ${i + 1}`}
                                            rows={2}
                                            showMath={true}
                                        />
                                    </div>
                                    {subQuestions.length > 1 && (
                                        <button type="button" onClick={() => removeSub(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
                                            <Icon.Delete />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addSub} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors">
                                <Icon.Add /> Add Sub-question
                            </button>
                        </div>
                    </div>
                )}

                {type === 'conditional' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Conditional Questions</label>
                        <div className="space-y-3">
                            {conditionalQuestions.map((c, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <RichTextEditor
                                            value={c}
                                            onChange={(v) => updateCond(i, v)}
                                            placeholder={`Conditional question ${i + 1}`}
                                            rows={2}
                                            showMath={true}
                                        />
                                    </div>
                                    {conditionalQuestions.length > 1 && (
                                        <button type="button" onClick={() => removeCond(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
                                            <Icon.Delete />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addCond} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors">
                                <Icon.Add /> Add Conditional Question
                            </button>
                        </div>
                    </div>
                )}

                {type === 'para-question' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph Text</label>
                            <RichTextEditor
                                value={paraText}
                                onChange={setParaText}
                                placeholder="Enter the paragraph text..."
                                rows={4}
                                showMath={true}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Questions based on the paragraph</label>
                            <div className="space-y-3">
                                {paraQuestions.map((pq, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="flex-1">
                                            <RichTextEditor
                                                value={pq}
                                                onChange={(v) => updateParaQ(i, v)}
                                                placeholder={`Question ${i + 1}`}
                                                rows={2}
                                                showMath={true}
                                            />
                                        </div>
                                        {paraQuestions.length > 1 && (
                                            <button type="button" onClick={() => removeParaQ(i)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors mt-2">
                                                <Icon.Delete />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={addParaQ} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors">
                                    <Icon.Add /> Add Question
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-colors">{editing ? 'Save Changes' : 'Add Question'}</button>
                </div>
            </form>
        </Modal>
    );
};

// ---------- Question Display Components ----------
const renderMathContent = (text: string) => {
    if (!text) return text;
    return text
        .replace(/\$\$([^$]+)\$\$/g, '<div style="text-align: center; margin: 10px 0; font-size: 1.2em; background: #f8f9fa; padding: 8px; border-radius: 4px;">$1</div>')
        .replace(/\$([^$]+)\$/g, '<span style="background: #e9ecef; padding: 2px 4px; border-radius: 3px; font-family: Times New Roman, serif;">$1</span>');
};

const MCQQuestion: React.FC<{ question: Question; questionNumber: string }> = ({ question, questionNumber }) => {
    return (
        <div className="mb-4">
            <div className="font-medium mb-3 text-gray-800">
                <span className="mr-2">{questionNumber}</span>
                <span dangerouslySetInnerHTML={{ __html: renderMathContent(question.content.questionText) }} />
            </div>
            <div className="ml-4 space-y-2">
                {question.content.choices.map((choice: string, idx: number) => (
                    <div key={idx} className="flex items-start">
                        <span className="mr-2 font-medium text-blue-600 mt-1">{String.fromCharCode(65 + idx)}.</span>
                        <span className="text-gray-700 flex-1" dangerouslySetInnerHTML={{ __html: renderMathContent(choice) }} />
                        {idx === question.content.correctAnswer && (
                            <span className="ml-2 text-green-600 text-sm flex items-center">
                                <Icon.Check className="h-4 w-4 mr-1" /> Correct
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const TrueFalseQuestion: React.FC<{ question: Question; questionNumber: string }> = ({ question, questionNumber }) => {
    return (
        <div className="mb-4">
            <div className="font-medium mb-3 text-gray-800">
                <span className="mr-2">{questionNumber}</span>
                <span dangerouslySetInnerHTML={{ __html: renderMathContent(question.content.questionText) }} />
            </div>
            <div className="ml-4 space-y-2">
                <div className="flex items-center">
                    <span className="mr-2 font-medium text-blue-600">A.</span>
                    <span className="text-gray-700">True</span>
                    {question.content.correctAnswer === 0 && (
                        <span className="ml-2 text-green-600 text-sm flex items-center">
                            <Icon.Check className="h-4 w-4 mr-1" /> Correct
                        </span>
                    )}
                </div>
                <div className="flex items-center">
                    <span className="mr-2 font-medium text-blue-600">B.</span>
                    <span className="text-gray-700">False</span>
                    {question.content.correctAnswer === 1 && (
                        <span className="ml-2 text-green-600 text-sm flex items-center">
                            <Icon.Check className="h-4 w-4 mr-1" /> Correct
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const FillInBlanksQuestion: React.FC<{ question: Question; questionNumber: string }> = ({ question, questionNumber }) => {
    return (
        <div className="mb-4">
            <div className="font-medium text-gray-800">
                <span className="mr-2">{questionNumber}</span>
                <span dangerouslySetInnerHTML={{ __html: renderMathContent(question.content.questionText) }} />
            </div>
        </div>
    );
};

const ShortLongQuestion: React.FC<{ question: Question; questionNumber: string }> = ({ question, questionNumber }) => {
    return (
        <div className="mb-4">
            {question.content.questionText && (
                <div className="font-medium mb-3 text-gray-800">
                    <span className="mr-2">{questionNumber}</span>
                    <span dangerouslySetInnerHTML={{ __html: renderMathContent(question.content.questionText) }} />
                </div>
            )}
            {question.content.subQuestions && question.content.subQuestions.length > 0 && (
                <div className="ml-4">
                    {question.content.subQuestions.map((subQ: string, idx: number) => (
                        <div key={idx} className="mb-2 text-gray-700">
                            <span className="mr-2">{question.content.questionText ? `${questionNumber}.${idx + 1}` : `${questionNumber}`}</span>
                            <span dangerouslySetInnerHTML={{ __html: renderMathContent(subQ) }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ConditionalQuestion: React.FC<{ question: Question; questionNumber: string; showOr: boolean }> = ({ question, questionNumber, showOr }) => {
    return (
        <div className="mb-4">
            {showOr && (
                <div className="text-center my-4">
                    <strong>OR</strong>
                </div>
            )}
            <div className="font-medium mb-3 text-gray-800">
                <span className="mr-2">{questionNumber}</span>
                Conditional Questions
            </div>
            <div className="ml-4">
                {question.content.conditionalQuestions.map((condQ: string, idx: number) => (
                    <div key={idx} className="mb-2 text-gray-700">
                        <span className="mr-2">{questionNumber}.{idx + 1}</span>
                        <span dangerouslySetInnerHTML={{ __html: renderMathContent(condQ) }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const ParaQuestion: React.FC<{ question: Question; questionNumber: string }> = ({ question, questionNumber }) => {
    return (
        <div className="mb-4 border-l-4 border-blue-200 pl-4 py-2 bg-blue-50 rounded-r-lg">
            <div className="italic mb-3 text-gray-700 font-medium">
                <span className="mr-2">{questionNumber}</span>
                <span dangerouslySetInnerHTML={{ __html: renderMathContent(question.content.paraText) }} />
            </div>
            <div className="ml-2">
                {question.content.paraQuestions.map((pq: string, idx: number) => (
                    <div key={idx} className="mb-2 text-gray-700">
                        <span className="mr-2">{questionNumber}.{idx + 1}</span>
                        <span dangerouslySetInnerHTML={{ __html: renderMathContent(pq) }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const QuestionDisplay: React.FC<{ question: Question; questionNumber: string; showOr?: boolean }> = ({ question, questionNumber, showOr = false }) => {
    switch (question.type) {
        case 'mcq':
            return <MCQQuestion question={question} questionNumber={questionNumber} />;
        case 'true-false':
            return <TrueFalseQuestion question={question} questionNumber={questionNumber} />;
        case 'fill-in-the-blanks':
            return <FillInBlanksQuestion question={question} questionNumber={questionNumber} />;
        case 'short-question':
        case 'long-question':
            return <ShortLongQuestion question={question} questionNumber={questionNumber} />;
        case 'conditional':
            return <ConditionalQuestion question={question} questionNumber={questionNumber} showOr={showOr} />;
        case 'para-question':
            return <ParaQuestion question={question} questionNumber={questionNumber} />;
        default:
            return <div className="mb-4 text-gray-800">
                <span className="mr-2">{questionNumber}</span>
                <span dangerouslySetInnerHTML={{ __html: renderMathContent(question.content.questionText) }} />
            </div>;
    }
};

// ---------- Paper View Component ----------
const PaperView: React.FC<{
    sections: Section[];
    onClose: () => void;
    onPrint: () => void;
    onDownloadPDF: () => void;
}> = ({ sections, onClose, onPrint, onDownloadPDF }) => {
    return (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
            <div className="max-w-4xl mx-auto">
                {/* Header with actions - hidden in print */}
                <div className="flex justify-between items-center p-6 border-b no-print">
                    <h1 className="text-3xl font-bold text-center text-gray-800">Paper Preview</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={onDownloadPDF}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                        >
                            <Icon.Download /> Download PDF
                        </button>
                        <button
                            onClick={onPrint}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                        >
                            <Icon.Print /> Print
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
                        >
                            <Icon.Close /> Close
                        </button>
                    </div>
                </div>

                {/* Paper content */}
                <div className="paper-content p-8 bg-white">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Exam Paper</h1>
                    
                    <div className="space-y-8">
                        {sections.map((section, sIndex) => {
                            let sectionQuestionCounter = 1; // Reset counter for each section
                            
                            return (
                                <div key={section.id} className="mb-8">
                                    <h2 className="text-xl font-bold mb-2 text-gray-800">
                                        {sIndex + 1}. <span dangerouslySetInnerHTML={{ __html: renderMathContent(section.title) }} />
                                    </h2>
                                    {section.instruction && (
                                        <p className="text-gray-600 mb-4 italic" dangerouslySetInnerHTML={{ __html: renderMathContent(section.instruction) }} />
                                    )}

                                    {section.groups.map((group, gIndex) => {
                                        const groupNumber = formatNumber(gIndex + 1, group.numberingStyle || 'numeric');
                                        
                                        return (
                                            <div key={group.id} className="mb-6 ml-4">
                                                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                                                    {groupNumber}. {getGroupTitle(group.type)}
                                                </h3>
                                                {group.instruction && (
                                                    <p className="text-gray-600 mb-3" dangerouslySetInnerHTML={{ __html: renderMathContent(group.instruction) }} />
                                                )}

                                                <div className="space-y-4 ml-4">
                                                    {group.questions.map((question, qIndex) => {
                                                        const questionNumber = `${groupNumber}.${qIndex + 1}`;
                                                        sectionQuestionCounter++;
                                                        
                                                        return (
                                                            <div key={question.id} className="mb-4">
                                                                <QuestionDisplay 
                                                                    question={question} 
                                                                    questionNumber={questionNumber} 
                                                                    showOr={group.type === 'conditional' && group.logic === 'OR' && qIndex > 0}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
                        <p>End of Paper</p>
                    </div>
                </div>
            </div>

            {/* Print-specific styles */}
            <style jsx>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    
                    .paper-content {
                        padding: 20px;
                        font-size: 14px;
                        line-height: 1.6;
                    }
                    
                    h1 {
                        font-size: 24px;
                        margin-bottom: 30px;
                    }
                    
                    h2 {
                        font-size: 20px;
                        margin-top: 25px;
                        margin-bottom: 15px;
                        page-break-after: avoid;
                    }
                    
                    h3 {
                        font-size: 18px;
                        margin-top: 20px;
                        margin-bottom: 10px;
                        page-break-after: avoid;
                    }
                    
                    .question-break {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
};

// ---------- Main Component ----------
const PaperGeneratorAdvanced: React.FC = () => {
    const [sections, setSections] = useState<Section[]>(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            
            // Ensure all groups have a numberingStyle property
            return parsed.map((section: Section) => ({
                ...section,
                groups: section.groups.map((group: QuestionGroup) => ({
                    ...group,
                    numberingStyle: group.numberingStyle || 'numeric'
                }))
            }));
        } catch {
            return [];
        }
    });

    // UI states
    const [sectionModalOpen, setSectionModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [currentSectionIdForGroup, setCurrentSectionIdForGroup] = useState<string | null>(null);
    const [editingGroup, setEditingGroup] = useState<QuestionGroup | null>(null);

    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [currentTypeForQuestion, setCurrentTypeForQuestion] = useState<string>('mcq');
    const [currentSectionIdForQuestion, setCurrentSectionIdForQuestion] = useState<string | null>(null);
    const [currentGroupIdForQuestion, setCurrentGroupIdForQuestion] = useState<string | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmPayload, setConfirmPayload] = useState<any>(null);

    const [search, setSearch] = useState('');
    const [showRawJson, setShowRawJson] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [paperViewOpen, setPaperViewOpen] = useState(false);

    // drag-n-drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );
    const [activeId, setActiveId] = useState<string | null>(null);

    // persist
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(sections));
    }, [sections]);

    // ---------- CRUD operations: Section ----------
    const handleAddOrEditSection = (title: string, instruction: string, editingId?: string) => {
        if (editingId) {
            setSections((s) => s.map((sec) => (sec.id === editingId ? { ...sec, title, instruction } : sec)));
            setEditingSection(null);
            setSectionModalOpen(false);
            return;
        }
        const newSec: Section = { id: uid('sec-'), title, instruction, groups: [] };
        setSections((s) => [...s, newSec]);
        setSectionModalOpen(false);
    };

    const handleDeleteSection = (sectionId: string) => {
        setSections((s) => s.filter((sec) => sec.id !== sectionId));
    };

    const handleDuplicateSection = (sectionId: string) => {
        const sec = sections.find((x) => x.id === sectionId);
        if (!sec) return;
        const clone: Section = { ...sec, id: uid('sec-'), title: sec.title + ' (copy)', groups: sec.groups.map((g) => ({ ...g, id: uid('g-'), questions: g.questions.map((q) => ({ ...q, id: uid('q-') })) })) };
        setSections((s) => [...s, clone]);
    };

    // ---------- CRUD operations: Group ----------
    const startAddGroup = (sectionId: string) => {
        setCurrentSectionIdForGroup(sectionId);
        setEditingGroup(null);
        setGroupModalOpen(true);
    };

    const handleAddOrEditGroup = (type: string, instruction: string, numberingStyle: 'numeric' | 'roman' | 'alphabetic', logic?: string, editingId?: string) => {
        if (!currentSectionIdForGroup) return;
        setSections((s) =>
            s.map((sec) => {
                if (sec.id !== currentSectionIdForGroup) return sec;
                if (editingId) {
                    return { ...sec, groups: sec.groups.map((g) => (g.id === editingId ? { ...g, type, instruction, logic, numberingStyle } : g)) };
                }
                const newGroup: QuestionGroup = { id: uid('g-'), type, instruction, logic, numberingStyle, questions: [] };
                return { ...sec, groups: [...sec.groups, newGroup] };
            })
        );
        setGroupModalOpen(false);
        setEditingGroup(null);
    };

    const handleDeleteGroup = (sectionId: string, groupId: string) => {
        setSections((s) => s.map((sec) => (sec.id === sectionId ? { ...sec, groups: sec.groups.filter((g) => g.id !== groupId) } : sec)));
    };

    // ---------- CRUD operations: Question ----------
    const startAddQuestion = (sectionId: string, groupId: string, type?: string) => {
        setCurrentSectionIdForQuestion(sectionId);
        setCurrentGroupIdForQuestion(groupId);
        setCurrentTypeForQuestion(type || 'mcq');
        setEditingQuestion(null);
        setQuestionModalOpen(true);
    };

    const handleAddOrEditQuestion = (question: Question, editingId?: string) => {
        if (!currentSectionIdForQuestion || !currentGroupIdForQuestion) return;
        setSections((s) =>
            s.map((sec) => {
                if (sec.id !== currentSectionIdForQuestion) return sec;
                return {
                    ...sec,
                    groups: sec.groups.map((g) => {
                        if (g.id !== currentGroupIdForQuestion) return g;
                        if (editingId) {
                            return { ...g, questions: g.questions.map((q) => (q.id === editingId ? question : q)) };
                        }
                        return { ...g, questions: [...g.questions, question] };
                    }),
                };
            })
        );
        setQuestionModalOpen(false);
    };

    const handleDeleteQuestion = (sectionId: string, groupId: string, questionId: string) => {
        setSections((s) =>
            s.map((sec) => {
                if (sec.id !== sectionId) return sec;
                return { ...sec, groups: sec.groups.map((g) => (g.id === groupId ? { ...g, questions: g.questions.filter((q) => q.id !== questionId) } : g)) };
            })
        );
    };

    // ---------- Edit helpers (open modals with data) ----------
    const openEditSection = (sec: Section) => {
        setEditingSection(sec);
        setSectionModalOpen(true);
    };

    const openEditGroup = (sectionId: string, group: QuestionGroup) => {
        setCurrentSectionIdForGroup(sectionId);
        setEditingGroup(group);
        setGroupModalOpen(true);
    };

    const openEditQuestion = (sectionId: string, groupId: string, question: Question) => {
        setCurrentSectionIdForQuestion(sectionId);
        setCurrentGroupIdForQuestion(groupId);
        setEditingQuestion(question);
        setQuestionModalOpen(true);
    };

    // ---------- Toggle section expansion ----------
    const toggleSectionExpansion = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // ---------- Confirm wrapper ----------
    const askConfirm = (payload: any) => {
        setConfirmPayload(payload);
        setConfirmOpen(true);
    };
    const runConfirmed = () => {
        if (!confirmPayload) return;
        const { type, payload } = confirmPayload;
        if (type === 'delete-section') handleDeleteSection(payload.sectionId);
        if (type === 'delete-group') handleDeleteGroup(payload.sectionId, payload.groupId);
        if (type === 'delete-question') handleDeleteQuestion(payload.sectionId, payload.groupId, payload.questionId);
        setConfirmOpen(false);
        setConfirmPayload(null);
    };

    // ---------- DnD for sections only ----------
    const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
    const handleDragEnd = (e: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = e;
        if (!over) return;
        if (active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // ---------- Export / Import ----------
    const exportJson = () => {
        const data = JSON.stringify(sections, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'paper.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importJson = (file: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(String(e.target?.result));
                if (Array.isArray(parsed)) {
                    // Ensure all groups have a numberingStyle property
                    const processed = parsed.map((section: Section) => ({
                        ...section,
                        groups: section.groups.map((group: QuestionGroup) => ({
                            ...group,
                            numberingStyle: group.numberingStyle || 'numeric'
                        }))
                    }));
                    setSections(processed);
                } else {
                    alert('Invalid format');
                }
            } catch (err) {
                alert('Failed to parse JSON');
            }
        };
        reader.readAsText(file);
    };

    // ---------- Paper View Functions ----------
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        // Create a new window with the paper content for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const paperContent = document.querySelector('.paper-content');
        if (!paperContent) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Exam Paper</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; padding: 20px; margin: 0; }
                        h1 { text-align: center; font-size: 24px; margin-bottom: 30px; }
                        h2 { font-size: 20px; margin-top: 30px; margin-bottom: 15px; page-break-after: avoid; }
                        h3 { font-size: 18px; margin-top: 25px; margin-bottom: 10px; page-break-after: avoid; }
                        p { margin-bottom: 10px; }
                        .question { margin-bottom: 15px; page-break-inside: avoid; }
                        .math-block { display: block; text-align: center; margin: 10px 0; font-size: 1.2em; background: #f8f9fa; padding: 8px; border-radius: 4px; }
                        .math-inline { background: #e9ecef; padding: 2px 4px; border-radius: 3px; font-family: 'Times New Roman', serif; }
                        @media print {
                            body { padding: 0; }
                            .page-break { page-break-after: always; }
                        }
                    </style>
                </head>
                <body>
                    ${paperContent.innerHTML}
                </body>
            </html>
        `);

        printWindow.document.close();

        // Wait for content to load then trigger print
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    // ---------- Search helper ----------
    const filteredSections = sections
        .map((sec) => ({ ...sec, groups: sec.groups.filter((g) => g.type.includes(search) || g.instruction?.includes(search) || search === '') }))
        .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.instruction?.toLowerCase().includes(search.toLowerCase()) || s.groups.length > 0 || search === '');

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Paper View */}
                {paperViewOpen && (
                    <PaperView
                        sections={sections}
                        onClose={() => setPaperViewOpen(false)}
                        onPrint={handlePrint}
                        onDownloadPDF={handleDownloadPDF}
                    />
                )}

                <header className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-700">Advanced Paper Generator</h1>
                            <p className="text-gray-600 mt-1">Create, organize, and manage your exam papers with math support</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon.Search />
                                </div>
                                <input
                                    placeholder="Search sections or groups..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button onClick={() => { setSectionModalOpen(true); setEditingSection(null); }} className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-colors">
                                <Icon.Add /> New Section
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-200">
                        <button onClick={() => setPaperViewOpen(true)} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium flex items-center gap-2 transition-colors">
                            <Icon.Eye /> Paper View
                        </button>
                        <button onClick={() => exportJson()} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2 transition-colors">
                            <Icon.Export /> Export
                        </button>
                        <label className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium flex items-center gap-2 transition-colors cursor-pointer">
                            <Icon.Import /> Import
                            <input type="file" accept="application/json" onChange={(e) => importJson(e.target.files?.[0] ?? null)} className="hidden" />
                        </label>
                        <button onClick={() => setShowRawJson((s) => !s)} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors">
                            {showRawJson ? 'Hide JSON' : 'Show JSON'}
                        </button>
                        <button onClick={() => { localStorage.removeItem(LS_KEY); setSections([]); }} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors">
                            Clear All
                        </button>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <section className="lg:col-span-3">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3 flex items-center gap-2">
                                <Icon.Question className="text-blue-600" /> Paper Structure
                            </h2>

                            {sections.length === 0 ? (
                                <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-xl">
                                    <div className="text-blue-600 mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium">No sections yet</p>
                                    <p className="mt-1">Create your first section to get started</p>
                                    <button onClick={() => { setSectionModalOpen(true); setEditingSection(null); }} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                                        Create Section
                                    </button>
                                </div>
                            ) : (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                                    <SortableContext items={sections.map((s) => s.id)}>
                                        {filteredSections.map((sec, i) => (
                                            <div key={sec.id}>
                                                <SortableSection
                                                    section={sec}
                                                    index={i}
                                                    onEdit={(s) => openEditSection(s)}
                                                    onDelete={(id) => askConfirm({ type: 'delete-section', payload: { sectionId: id } })}
                                                    onAddGroup={(id) => startAddGroup(id)}
                                                    onEditGroup={(sectionId, group) => openEditGroup(sectionId, group)}
                                                    onDeleteGroup={(sectionId, groupId) => askConfirm({ type: 'delete-group', payload: { sectionId, groupId } })}
                                                    onDuplicateSection={(id) => handleDuplicateSection(id)}
                                                />

                                                {/* Expandable section content */}
                                                <div className="mb-6">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-lg font-medium text-gray-800">Groups in {sec.title.replace(/<[^>]*>/g, '')}</h3>
                                                        <button
                                                            onClick={() => toggleSectionExpansion(sec.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                                        >
                                                            {expandedSections[sec.id] ? (
                                                                <>
                                                                    <Icon.ChevronUp /> Collapse
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Icon.ChevronDown /> Expand
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {expandedSections[sec.id] && sec.groups.map((g) => (
                                                        <div key={g.id} className="bg-gray-50 rounded-xl p-5 mb-5 border border-gray-200">
                                                            <div className="flex justify-between items-center mb-4 pb-3 border-b">
                                                                <div>
                                                                    <div className="text-md font-bold text-green-700">{getGroupTitle(g.type)}</div>
                                                                    {g.instruction && <div className="text-gray-600 text-sm mt-1" dangerouslySetInnerHTML={{ __html: renderMathContent(g.instruction) }} />}
                                                                    <div className="text-gray-500 text-xs mt-2">Numbering: {g.numberingStyle}</div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => openEditGroup(sec.id, g)} className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors" title="Edit Group">
                                                                        <Icon.Edit />
                                                                    </button>
                                                                    <button onClick={() => askConfirm({ type: 'delete-group', payload: { sectionId: sec.id, groupId: g.id } })} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors" title="Delete Group">
                                                                        <Icon.Delete />
                                                                    </button>
                                                                    <button onClick={() => startAddQuestion(sec.id, g.id, g.type)} className="px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium flex items-center gap-1 transition-colors">
                                                                        <Icon.Add /> Question
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="mt-4 space-y-4">
                                                                {g.questions.length === 0 ? (
                                                                    <div className="bg-white rounded-lg p-4 text-center text-gray-500 border border-dashed border-gray-300">
                                                                        No questions yet in this group.
                                                                    </div>
                                                                ) : (
                                                                    g.questions.map((q, qIndex) => (
                                                                        <div key={q.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                                            <div className="flex justify-between items-start mb-3">
                                                                                <div className="flex-1">
                                                                                    <QuestionDisplay question={q} questionNumber={`${qIndex + 1}`} />
                                                                                </div>
                                                                                <div className="flex gap-2 ml-4">
                                                                                    <button onClick={() => openEditQuestion(sec.id, g.id, q)} className="p-1.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors" title="Edit Question">
                                                                                        <Icon.Edit />
                                                                                    </button>
                                                                                    <button onClick={() => askConfirm({ type: 'delete-question', payload: { sectionId: sec.id, groupId: g.id, questionId: q.id } })} className="p-1.5 rounded-md bg-red-100 hover:bg-red-200 text-red-700 transition-colors" title="Delete Question">
                                                                                        <Icon.Delete />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Quick Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Sections</span>
                                    <span className="font-medium text-blue-600">{sections.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Groups</span>
                                    <span className="font-medium text-green-600">{sections.reduce((acc, sec) => acc + sec.groups.length, 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Questions</span>
                                    <span className="font-medium text-purple-600">{sections.reduce((acc, sec) => acc + sec.groups.reduce((acc2, grp) => acc2 + grp.questions.length, 0), 0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Math Editor Tips
                            </h3>
                            <ul className="text-gray-700 text-sm space-y-3">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Click math symbols in toolbar for quick insertion</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Toggle preview mode to see rendered math</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Use the "Insert Image" button to add images to your questions</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                General Tips
                            </h3>
                            <ul className="text-gray-700 text-sm space-y-3">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Drag sections to reorder them in your paper</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Click section titles to edit them directly</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Use search to quickly find content</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Export your paper to share or backup</span>
                                </li>
                            </ul>
                        </div>

                        {showRawJson && (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 overflow-hidden">
                                <h3 className="font-semibold text-gray-800 mb-3">Raw JSON Data</h3>
                                <div className="overflow-auto max-h-96 text-xs bg-gray-50 p-3 rounded-lg">
                                    <pre className="whitespace-pre-wrap">{JSON.stringify(sections, null, 2)}</pre>
                                </div>
                            </div>
                        )}
                    </aside>
                </main>

                {/* Modals & confirmations */}
                <SectionForm open={sectionModalOpen} onClose={() => { setSectionModalOpen(false); setEditingSection(null); }} onSubmit={handleAddOrEditSection} editing={editingSection} />
                <GroupForm open={groupModalOpen} onClose={() => { setGroupModalOpen(false); setEditingGroup(null); setCurrentSectionIdForGroup(null); }} onSubmit={handleAddOrEditGroup} sectionTitle={sections.find((s) => s.id === currentSectionIdForGroup)?.title} editing={editingGroup} />
                <QuestionForm open={questionModalOpen} onClose={() => { setQuestionModalOpen(false); setEditingQuestion(null); setCurrentSectionIdForQuestion(null); setCurrentGroupIdForQuestion(null); }} onSubmit={handleAddOrEditQuestion} type={currentTypeForQuestion} editing={editingQuestion} />

                <Confirm open={confirmOpen} onConfirm={runConfirmed} onCancel={() => setConfirmOpen(false)} message={
                    confirmPayload?.type === 'delete-section'
                        ? 'Delete this section and all its groups & questions? This cannot be undone.'
                        : confirmPayload?.type === 'delete-group'
                            ? 'Delete this group and all its questions?'
                            : 'Delete this question?'
                } />
            </div>
        </div>
    );
};

export default PaperGeneratorAdvanced;