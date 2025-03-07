"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-md border animate-pulse" />
  ),
});

// Image Resize Module Configuration
const imageResize = {
  modules: ["Resize", "DisplaySize"],
  handleStyles: {
    backgroundColor: "#b33771",
    border: "none",
    color: "white",
  },
  displayStyles: {
    backgroundColor: "black",
    border: "none",
    color: "white",
  },
  toolbarStyles: {
    backgroundColor: "black",
    border: "none",
    color: "white",
  },
};

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
  imageResize,
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "bullet",
  "indent",
  "align",
  "link",
  "image",
];

interface BlogEditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
}

export function BlogEditor({ onChange, initialContent = "" }: BlogEditorProps) {
  const [mounted, setMounted] = useState(false);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("quill").then((Quill) => {
        //@ts-ignore
        import("quill-image-resize-module-react").then((ImageResize) => {
          Quill.default.register("modules/imageResize", ImageResize.default);
        });
      });
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="prose-pink prose-lg max-w-none">
      <style jsx global>{`
        .ql-container {
          min-height: 500px;
          font-size: 16px;
          font-family: inherit;
        }
        .ql-editor {
          min-height: 500px;
          padding: 1rem;
        }
        .ql-editor img {
          display: block;
          max-width: 100%;
          height: auto;
        }
        .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-color: #e5e7eb;
          background-color: #f9fafb;
        }
        .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          border-color: #e5e7eb;
        }
        /* Image resize handle styles */
        .ql-editor .image-resizer {
          border: 1px dashed #b33771;
        }
        .ql-editor .image-resizer .handle {
          background-color: #b33771;
        }
      `}</style>
      <ReactQuill
        //@ts-ignore
        ref={quillRef}
        theme="snow"
        modules={modules}
        formats={formats}
        value={initialContent}
        onChange={onChange}
        placeholder="Write your blog post here..."
        className="rounded-md"
      />
    </div>
  );
}
