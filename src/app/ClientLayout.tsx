"use client";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  return isLogin ? (
    <main className="min-h-screen">{children}</main>
  ) : (
    <>
      <Sidebar />
      <main className="ml-56">{children}</main>
    </>
  );
} 