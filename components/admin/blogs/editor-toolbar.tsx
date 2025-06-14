// "use client";

// import { type Editor } from "@tiptap/react";
// import {
//   Bold,
//   Italic,
//   List,
//   ListOrdered,
//   Quote,
//   Redo,
//   Strikethrough,
//   Undo,
//   Link as LinkIcon,
//   Image as ImageIcon,
// } from "lucide-react";
// import { Toggle } from "@/components/ui/toggle";
// import { Separator } from "@/components/ui/separator";

// interface EditorToolbarProps {
//   editor: Editor;
// }

// export function EditorToolbar({ editor }: EditorToolbarProps) {
//   return (
//     <div className="border border-input bg-transparent rounded-md mb-2">
//       <div className="flex flex-wrap items-center gap-1 p-1">
//         <Toggle
//           size="sm"
//           pressed={editor.isActive("bold")}
//           onPressedChange={() => editor.chain().focus().toggleBold().run()}
//         >
//           <Bold className="h-4 w-4" />
//         </Toggle>
//         <Toggle
//           size="sm"
//           pressed={editor.isActive("italic")}
//           onPressedChange={() => editor.chain().focus().toggleItalic().run()}
//         >
//           <Italic className="h-4 w-4" />
//         </Toggle>
//         <Toggle
//           size="sm"
//           pressed={editor.isActive("strike")}
//           onPressedChange={() => editor.chain().focus().toggleStrike().run()}
//         >
//           <Strikethrough className="h-4 w-4" />
//         </Toggle>

//         <Separator orientation="vertical" className="mx-1 h-6" />

//         <Toggle
//           size="sm"
//           pressed={editor.isActive("bulletList")}
//           onPressedChange={() =>
//             editor.chain().focus().toggleBulletList().run()
//           }
//         >
//           <List className="h-4 w-4" />
//         </Toggle>
//         <Toggle
//           size="sm"
//           pressed={editor.isActive("orderedList")}
//           onPressedChange={() =>
//             editor.chain().focus().toggleOrderedList().run()
//           }
//         >
//           <ListOrdered className="h-4 w-4" />
//         </Toggle>
//         <Toggle
//           size="sm"
//           pressed={editor.isActive("blockquote")}
//           onPressedChange={() =>
//             editor.chain().focus().toggleBlockquote().run()
//           }
//         >
//           <Quote className="h-4 w-4" />
//         </Toggle>

//         <Separator orientation="vertical" className="mx-1 h-6" />

//         <Toggle
//           size="sm"
//           pressed={editor.isActive("link")}
//           onPressedChange={() => {
//             const url = window.prompt("URL");
//             if (url) {
//               editor.chain().focus().setLink({ href: url }).run();
//             }
//           }}
//         >
//           <LinkIcon className="h-4 w-4" />
//         </Toggle>
//         <Toggle
//           size="sm"
//           onPressedChange={() => {
//             const url = window.prompt("Image URL");
//             if (url) {
//               editor.chain().focus().setImage({ src: url }).run();
//             }
//           }}
//         >
//           <ImageIcon className="h-4 w-4" />
//         </Toggle>

//         <Separator orientation="vertical" className="mx-1 h-6" />

//         <Toggle
//           size="sm"
//           onPressedChange={() => editor.chain().focus().undo().run()}
//           disabled={!editor.can().undo()}
//         >
//           <Undo className="h-4 w-4" />
//         </Toggle>
//         <Toggle
//           size="sm"
//           onPressedChange={() => editor.chain().focus().redo().run()}
//           disabled={!editor.can().redo()}
//         >
//           <Redo className="h-4 w-4" />
//         </Toggle>
//       </div>
//     </div>
//   );
// }
