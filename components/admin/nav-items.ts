import {
  LayoutDashboard,
  BookOpen,
  FileText,
  FolderTree,
  ScrollText
} from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Blog Posts",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    title: "Love Library",
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
    title:"Newsletter",
    href:"/admin/newsletter",
    icon:ScrollText
  },
  // {
  //   title: "Settings",
  //   href: "/admin/settings",
  //   icon: Settings,
  // },
] as const;
