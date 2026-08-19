'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadToCloudinary } from '@/lib/upload';
import { ImageGallery } from '@/components/tiptap/ImageGalleryExtension';

export default function PostEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [outline, setOutline] = useState<string[]>([]);

  function extractOutline(editorInstance: any) {
    const items: string[] = [];
    editorInstance.state.doc.descendants((node: any) => {
      if (node.type.name === 'heading' && node.attrs.level === 2) {
        items.push(node.textContent);
      }
    });
    setOutline(items);
  }

  const editor = useEditor({
    extensions: [StarterKit, ImageExtension, ImageGallery],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      extractOutline(editor);
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[300px] border rounded-b-md px-4 py-3 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor) extractOutline(editor);
  }, [editor]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      try {
        const url = await uploadToCloudinary(file, 'posts');
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err: any) {
        alert(err.message || 'Tải ảnh lên thất bại. Vui lòng thử lại.');
      }
    },
    [editor],
  );

  const handleGalleryUpload = useCallback(
    async (files: FileList) => {
      if (!editor || files.length === 0) return;
      try {
        const urls = await Promise.all(
          Array.from(files).map((file) => uploadToCloudinary(file, 'posts')),
        );
        editor.chain().focus().insertImageGallery(urls).run();
      } catch (err: any) {
        alert(err.message || 'Tải ảnh lên thất bại. Vui lòng thử lại.');
      }
    },
    [editor],
  );

  if (!editor) return null;

  return (
    <div>
      <div className="flex items-center gap-1 border-2 border-gray-200 rounded-t-xl p-2 bg-brand-50/50 flex-wrap">
        <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          📑 Đầu mục (H2)
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          " Quote
        </ToolbarBtn>
        <ToolbarBtn onClick={() => fileInputRef.current?.click()}>🖼 Ảnh</ToolbarBtn>
        <ToolbarBtn onClick={() => galleryInputRef.current?.click()}>🖼️🖼️ Bộ ảnh</ToolbarBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = '';
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleGalleryUpload(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      <EditorContent editor={editor} />

      <div className="mt-3 border-2 border-dashed border-brand-100 rounded-xl px-4 py-3 bg-brand-50/30">
        <p className="text-xs font-semibold text-gray-600 mb-1.5">
          📑 Mục lục xem trước (tự sinh từ các đầu mục H2)
        </p>
        {outline.length === 0 ? (
          <p className="text-xs text-gray-400">
            Chưa có đầu mục nào. Bôi đen dòng tiêu đề phần rồi bấm nút "📑 Đầu mục (H2)" ở trên để thêm vào mục lục.
          </p>
        ) : (
          <ol className="text-xs text-gray-600 space-y-0.5 list-decimal list-inside">
            {outline.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${active ? 'bg-brand-gradient text-white' : 'hover:bg-brand-100 text-gray-600'
        }`}
    >
      {children}
    </button>
  );
}