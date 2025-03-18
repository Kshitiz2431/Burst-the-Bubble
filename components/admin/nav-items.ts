import {
  LayoutDashboard,
  BookOpen,
  FileText,
  FolderTree,
  ScrollText,
  MessageCircle
} from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    title: "Library",
    href: "/admin/library",
    icon: BookOpen,
  },
  {
    title: "Templates",
    href: "/admin/templates",
    icon: FileText,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Newsletter",
    href: "/admin/newsletter",
    icon: ScrollText
  },
  {
    title: "Talk to Buddy",
    href: "/admin/talk-to-buddy",
    icon: MessageCircle,
  },
  // {
  //   title: "Settings",
  //   href: "/admin/settings",
  //   icon: Settings,
  // },
] as const;
