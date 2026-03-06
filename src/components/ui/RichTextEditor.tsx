import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Youtube } from '@tiptap/extension-youtube';
import { Node, mergeAttributes } from '@tiptap/core';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Pilcrow,
  Upload,
  X,
  Loader2,
  Table as TableIcon,
  Youtube as YoutubeIcon,
  FileText,
  Plus,
  MoreHorizontal,
  Video,
  File,
} from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { uploadService } from '../../services';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

// Custom PDF Embed Extension
const PdfEmbed = Node.create({
  name: 'pdfEmbed',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      title: { default: 'PDF Document' },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-pdf-embed]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-pdf-embed': '',
        class: 'pdf-embed my-4 border border-gray-200 rounded-lg overflow-hidden',
      }),
      [
        'div',
        { class: 'flex items-center gap-3 p-4 bg-gray-50' },
        ['span', { class: 'text-red-500' }, '📄'],
        ['span', { class: 'font-medium text-gray-900' }, HTMLAttributes.title || 'PDF Document'],
      ],
      [
        'iframe',
        {
          src: HTMLAttributes.src,
          class: 'w-full h-96 border-t border-gray-200',
          frameborder: '0',
        },
      ],
    ];
  },
});

// Custom File Attachment Extension
const FileAttachment = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      fileName: { default: 'File' },
      fileSize: { default: '' },
      fileType: { default: '' },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-file-attachment]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        'data-file-attachment': '',
        href: HTMLAttributes.src,
        target: '_blank',
        class: 'file-attachment flex items-center gap-3 p-4 my-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors no-underline',
      }),
      ['span', { class: 'text-2xl' }, '📎'],
      [
        'div',
        { class: 'flex-1' },
        ['div', { class: 'font-medium text-gray-900' }, HTMLAttributes.fileName],
        ['div', { class: 'text-sm text-gray-500' }, HTMLAttributes.fileSize || 'Download'],
      ],
      ['span', { class: 'text-primary-600' }, '↓'],
    ];
  },
});

// Custom Video Embed Extension
const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-video-embed]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-video-embed': '',
        class: 'video-embed my-4 rounded-lg overflow-hidden',
      }),
      [
        'video',
        {
          src: HTMLAttributes.src,
          controls: 'true',
          class: 'w-full',
        },
      ],
    ];
  },
});

const MenuButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-all duration-200 ${isActive
        ? 'bg-primary-100 text-primary-700 shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

const MenuDivider = () => <div className="w-px h-6 bg-gray-200 mx-1" />;

// Insert Block Menu Component
const InsertBlockMenu = ({
  isOpen,
  onClose,
  onSelect,
  position,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
  position: { top: number; left: number };
}) => {
  if (!isOpen) return null;

  const blocks = [
    { type: 'heading1', icon: Heading1, label: 'Heading 1', description: 'Large section heading' },
    { type: 'heading2', icon: Heading2, label: 'Heading 2', description: 'Medium section heading' },
    { type: 'heading3', icon: Heading3, label: 'Heading 3', description: 'Small section heading' },
    { type: 'bulletList', icon: List, label: 'Bullet List', description: 'Create a bulleted list' },
    { type: 'orderedList', icon: ListOrdered, label: 'Numbered List', description: 'Create a numbered list' },
    { type: 'blockquote', icon: Quote, label: 'Quote', description: 'Capture a quote' },
    { type: 'codeBlock', icon: Code, label: 'Code Block', description: 'Display code with syntax highlighting' },
    { type: 'divider', icon: Minus, label: 'Divider', description: 'Visual separator line' },
    { type: 'image', icon: ImageIcon, label: 'Image', description: 'Upload or embed an image' },
    { type: 'video', icon: Video, label: 'Video', description: 'Upload a video file' },
    { type: 'youtube', icon: YoutubeIcon, label: 'YouTube', description: 'Embed a YouTube video' },
    { type: 'table', icon: TableIcon, label: 'Table', description: 'Add a table' },
    { type: 'pdf', icon: FileText, label: 'PDF Embed', description: 'Embed a PDF document' },
    { type: 'file', icon: File, label: 'File Attachment', description: 'Attach a downloadable file' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 w-72 max-h-96 overflow-y-auto"
        style={{ top: position.top, left: position.left }}
      >
        <div className="p-2">
          <p className="text-xs font-medium text-gray-500 px-2 py-1">INSERT BLOCK</p>
          {blocks.map((block) => (
            <button
              key={block.type}
              onClick={() => {
                onSelect(block.type);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="p-2 bg-gray-100 rounded-lg">
                <block.icon size={18} className="text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{block.label}</div>
                <div className="text-xs text-gray-500">{block.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

// Media Upload Modal
const MediaUploadModal = ({
  isOpen,
  onClose,
  type,
  onInsert,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: 'image' | 'video' | 'pdf' | 'file' | 'youtube';
  onInsert: (data: any) => void;
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptType = () => {
    switch (type) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      case 'pdf': return 'application/pdf';
      case 'file': return '*/*';
      default: return '*/*';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'image': return 'Insert Image';
      case 'video': return 'Insert Video';
      case 'pdf': return 'Embed PDF';
      case 'file': return 'Attach File';
      case 'youtube': return 'Embed YouTube Video';
      default: return 'Insert Media';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const folder = type === 'image' ? 'conformation' : type === 'video' ? 'videos' : 'files';
      const result = await uploadService.uploadFile(file, folder);
      onInsert({
        src: result.url,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileType: file.type,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlInsert = () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    onInsert({
      src: url.trim(),
      fileName: fileName || 'File',
    });
    handleClose();
  };

  const handleClose = () => {
    setUrl('');
    setFileName('');
    setError(null);
    setMode('upload');
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={20} />
          </button>
        </div>

        {type === 'youtube' ? (
          <div className="space-y-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlInsert()}
            />
            <button
              type="button"
              onClick={handleUrlInsert}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Embed Video
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${mode === 'upload'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Upload size={16} />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${mode === 'url'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <LinkIcon size={16} />
                URL
              </button>
            </div>

            {mode === 'upload' ? (
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${uploading
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={getAcceptType()}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    <span className="text-sm text-primary-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-400">
                      {type === 'image' && 'JPG, PNG, GIF, WebP (max 5MB)'}
                      {type === 'video' && 'MP4, WebM (max 100MB)'}
                      {type === 'pdf' && 'PDF files (max 20MB)'}
                      {type === 'file' && 'Any file type (max 50MB)'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {(type === 'file' || type === 'pdf') && (
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="File name (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                )}
                <button
                  type="button"
                  onClick={handleUrlInsert}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Insert
                </button>
              </div>
            )}
          </>
        )}

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};

// Table Menu Component
const TableMenu = ({ editor }: { editor: Editor }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!editor.isActive('table')) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
        title="Table options"
      >
        <MoreHorizontal size={16} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-40">
            <button
              onClick={() => { editor.chain().focus().addColumnAfter().run(); setIsOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
            >
              Add column after
            </button>
            <button
              onClick={() => { editor.chain().focus().addColumnBefore().run(); setIsOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
            >
              Add column before
            </button>
            <button
              onClick={() => { editor.chain().focus().deleteColumn().run(); setIsOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 text-red-600"
            >
              Delete column
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => { editor.chain().focus().addRowAfter().run(); setIsOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
            >
              Add row after
            </button>
            <button
              onClick={() => { editor.chain().focus().addRowBefore().run(); setIsOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
            >
              Add row before
            </button>
            <button
              onClick={() => { editor.chain().focus().deleteRow().run(); setIsOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 text-red-600"
            >
              Delete row
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => { editor.chain().focus().deleteTable().run(); setIsOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 text-red-600"
            >
              Delete table
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const MenuBar = ({
  editor,
  onInsertBlock,
}: {
  editor: Editor | null;
  onInsertBlock: (type: string) => void;
}) => {
  const [insertMenuOpen, setInsertMenuOpen] = useState(false);
  const [insertMenuPos, setInsertMenuPos] = useState({ top: 0, left: 0 });
  const insertBtnRef = useRef<HTMLButtonElement>(null);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const openLinkPopover = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setLinkPopoverOpen(true);
    setTimeout(() => linkInputRef.current?.focus(), 50);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
    }
    setLinkPopoverOpen(false);
    setLinkUrl('');
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkPopoverOpen(false);
    setLinkUrl('');
  };

  const handleInsertClick = () => {
    if (insertBtnRef.current) {
      const rect = insertBtnRef.current.getBoundingClientRect();
      setInsertMenuPos({ top: rect.bottom + 8, left: rect.left });
    }
    setInsertMenuOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        {/* Insert Block Button */}
        <button
          ref={insertBtnRef}
          type="button"
          onClick={handleInsertClick}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium mr-2"
        >
          <Plus size={16} />
          Insert
        </button>

        <MenuDivider />

        {/* Text Style */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code size={18} />
        </MenuButton>

        <MenuDivider />

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          title="Paragraph"
        >
          <Pilcrow size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </MenuButton>

        <MenuDivider />

        {/* Alignment */}
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight size={18} />
        </MenuButton>

        <MenuDivider />

        {/* Lists */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={18} />
        </MenuButton>

        <MenuDivider />

        {/* Media */}
        <div className="relative">
          <MenuButton onClick={openLinkPopover} isActive={editor.isActive('link')} title="Add Link">
            <LinkIcon size={18} />
          </MenuButton>
          {linkPopoverOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-80">
              <div className="flex items-center gap-2">
                <input
                  ref={linkInputRef}
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
                    if (e.key === 'Escape') { setLinkPopoverOpen(false); setLinkUrl(''); }
                  }}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={applyLink}
                  className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Apply
                </button>
                {editor.isActive('link') && (
                  <button
                    type="button"
                    onClick={removeLink}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove link"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setLinkPopoverOpen(false); setLinkUrl(''); }}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel (Esc)
              </button>
            </div>
          )}
        </div>
        <MenuButton
          onClick={() => onInsertBlock('image')}
          title="Insert Image (at cursor position)"
        >
          <ImageIcon size={18} />
        </MenuButton>

        {/* Table controls if in table */}
        <TableMenu editor={editor} />

        <MenuDivider />

        {/* History */}
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={18} />
        </MenuButton>
      </div>

      <InsertBlockMenu
        isOpen={insertMenuOpen}
        onClose={() => setInsertMenuOpen(false)}
        onSelect={onInsertBlock}
        position={insertMenuPos}
      />
    </>
  );
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing... Type "/" for commands',
  className = '',
  minHeight = '300px',
}: RichTextEditorProps) {
  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean;
    type: 'image' | 'video' | 'pdf' | 'file' | 'youtube';
  }>({ isOpen: false, type: 'image' });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline hover:text-primary-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg my-4',
        },
      }),
      PdfEmbed,
      FileAttachment,
      VideoEmbed,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none p-4`,
        style: `min-height: ${minHeight}`,
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            uploadService.uploadFile(file, 'conformation').then((result) => {
              const { schema } = view.state;
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              const node = schema.nodes.image.create({ src: result.url });
              if (coordinates) {
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              event.preventDefault();
              const file = items[i].getAsFile();
              if (file) {
                uploadService.uploadFile(file, 'conformation').then((result) => {
                  const { schema } = view.state;
                  const node = schema.nodes.image.create({ src: result.url });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                });
              }
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  const handleInsertBlock = useCallback((type: string) => {
    if (!editor) return;

    switch (type) {
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'divider':
        editor.chain().focus().setHorizontalRule().run();
        break;
      case 'table':
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        break;
      case 'image':
        setMediaModal({ isOpen: true, type: 'image' });
        break;
      case 'video':
        setMediaModal({ isOpen: true, type: 'video' });
        break;
      case 'youtube':
        setMediaModal({ isOpen: true, type: 'youtube' });
        break;
      case 'pdf':
        setMediaModal({ isOpen: true, type: 'pdf' });
        break;
      case 'file':
        setMediaModal({ isOpen: true, type: 'file' });
        break;
    }
  }, [editor]);

  const handleMediaInsert = useCallback((data: any) => {
    if (!editor) return;

    switch (mediaModal.type) {
      case 'image':
        editor.chain().focus().setImage({ src: data.src }).run();
        break;
      case 'video':
        editor.chain().focus().insertContent({
          type: 'videoEmbed',
          attrs: { src: data.src },
        }).run();
        break;
      case 'youtube':
        editor.chain().focus().setYoutubeVideo({ src: data.src }).run();
        break;
      case 'pdf':
        editor.chain().focus().insertContent({
          type: 'pdfEmbed',
          attrs: { src: data.src, title: data.fileName },
        }).run();
        break;
      case 'file':
        editor.chain().focus().insertContent({
          type: 'fileAttachment',
          attrs: {
            src: data.src,
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileType: data.fileType,
          },
        }).run();
        break;
    }
  }, [editor, mediaModal.type]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
      <MenuBar editor={editor} onInsertBlock={handleInsertBlock} />
      <EditorContent editor={editor} />
      <MediaUploadModal
        isOpen={mediaModal.isOpen}
        onClose={() => setMediaModal({ ...mediaModal, isOpen: false })}
        type={mediaModal.type}
        onInsert={handleMediaInsert}
      />
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror:focus { outline: none; }
        .ProseMirror h1 { font-size: 2em; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: 600; margin-top: 0.75em; margin-bottom: 0.5em; }
        .ProseMirror h3 { font-size: 1.25em; font-weight: 600; margin-top: 0.75em; margin-bottom: 0.5em; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; }
        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          color: #6b7280;
          font-style: italic;
          margin: 1em 0;
        }
        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.125em 0.25em;
          border-radius: 0.25em;
          font-family: monospace;
        }
        .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
        }
        .ProseMirror hr { border: none; border-top: 2px solid #e5e7eb; margin: 2em 0; }
        .ProseMirror mark { background-color: #fef08a; padding: 0.125em 0; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.5em; margin: 1em 0; }
        .ProseMirror table {
          border-collapse: collapse;
          margin: 1em 0;
          width: 100%;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #e5e7eb;
          padding: 0.5em 1em;
          text-align: left;
        }
        .ProseMirror th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .ProseMirror .tableWrapper { overflow-x: auto; margin: 1em 0; }
        .ProseMirror iframe { border-radius: 0.5em; }
        .ProseMirror .pdf-embed { background: white; }
        .ProseMirror .file-attachment { text-decoration: none !important; }
        .ProseMirror .selectedCell { background-color: #dbeafe; }
      `}</style>
    </div>
  );
}

export { RichTextEditor };
