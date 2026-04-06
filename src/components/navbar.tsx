"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase";
import PrintCrownLogo from "@/components/logo";

type Role = "user" | "lab" | "admin";

type UserState = {
  email: string;
  role: Role;
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<null | UserState>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_admin")
        .eq("id", user.id)
        .single();

      // role 컬럼 우선, 없으면 is_admin fallback
      const role: Role = profile?.role ?? (profile?.is_admin ? "admin" : "user");

      setUser({ email: user.email || "", role });
      setLoading(false);
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }

  function navLink(anchor: string) {
    return isHome ? anchor : `/${anchor}`;
  }

  // ── 역할별 링크 정의 ──────────────────────────────────────

  // 공개 링크 (비로그인 + 유저 + 어드민 공통)
  const publicLinks = [
    { label: "Products", href: navLink("#products") },
    { label: "How it works", href: navLink("#how-it-works") },
  ];

  // 일반 유저 + 어드민 공통
 // userLinks — Orders 링크 수정
const userLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Support", href: "/support" },
];

  // 랩 전용
  const labLinks = [
    { label: "Lab Queue", href: "/lab" },
    { label: "Scan", href: "/lab/scan" },
  ];

  // 어드민 전용 (관리용)
// adminLinks — Dashboard 없애기
const adminLinks = [
  { label: "All Orders", href: "/admin/orders" },
  { label: "Products", href: "/admin/products" },
  { label: "Lab", href: "/lab" },
  { label: "Scan", href: "/lab/scan" },
];

  // ── 역할별 렌더 헬퍼 ──────────────────────────────────────

  function DesktopLinks() {
    if (!user) return null;

    if (user.role === "lab") {
      return (
        <>
          {labLinks.map((l) => (
            <Link key={l.label} href={l.href}
              className="text-sm font-medium text-[#9333EA] hover:text-[#7E22CE] transition-colors">
              {l.label}
            </Link>
          ))}
        </>
      );
    }

    if (user.role === "admin") {
  return (
    <>
      {/* 공개 링크 */}
      {publicLinks.map((l) => (
        <Link key={l.label} href={l.href}
          className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
          {l.label}
        </Link>
      ))}

      {/* 구분선 */}
      <span className="w-px h-4 bg-[#E2E0D8]" />

      {/* 유저 링크 */}
      {userLinks.map((l) => (
        <Link key={l.label} href={l.href}
          className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
          {l.label}
        </Link>
      ))}

      {/* 구분선 */}
      <span className="w-px h-4 bg-[#E2E0D8]" />

      {/* 어드민 링크 (보라색) — 맨 오른쪽 */}
      {adminLinks.map((l) => (
        <Link key={l.label} href={l.href}
          className="text-sm font-medium text-[#9333EA] hover:text-[#7E22CE] transition-colors">
          {l.label}
        </Link>
      ))}
    </>
  );
}

    // user role
    return (
      <>
        {publicLinks.map((l) => (
          <Link key={l.label} href={l.href}
            className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            {l.label}
          </Link>
        ))}
        {userLinks.map((l) => (
          <Link key={l.label} href={l.href}
            className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            {l.label}
          </Link>
        ))}
      </>
    );
  }

  function DesktopCTAs() {
    if (loading) return <div className="w-24 h-9 rounded-lg bg-[#E2E0D8] animate-pulse" />;

    if (!user) {
      return (
        <>
          <Link href="/auth">
            <Button variant="ghost" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">
              Sign in
            </Button>
          </Link>
          <Link href="/order">
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm px-5 h-9 rounded-lg">
              Order now
            </Button>
          </Link>
        </>
      );
    }

    if (user.role === "lab") {
      return (
        <button onClick={handleSignOut}
          className="text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
          Sign out
        </button>
      );
    }

    // user & admin 공통 CTA
    return (
      <>
        <Link href="/order">
          <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm px-5 h-9 rounded-lg">
            New order
          </Button>
        </Link>
        <button onClick={handleSignOut}
          className="text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
          Sign out
        </button>
      </>
    );
  }

  // ── 모바일 메뉴 ──────────────────────────────────────────

  function MobileMenu() {
    if (loading) return null;

    if (!user) {
      return (
        <>
          {publicLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="text-lg font-medium text-[#1A1A1A]">
              {l.label}
            </Link>
          ))}
          <hr className="border-[#E2E0D8]" />
          <Link href="/auth" onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full">Sign in</Button>
          </Link>
          <Link href="/order" onClick={() => setOpen(false)}>
            <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white">Order now</Button>
          </Link>
        </>
      );
    }

    if (user.role === "lab") {
      return (
        <>
          {labLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="text-lg font-medium text-[#9333EA]">
              {l.label}
            </Link>
          ))}
          <hr className="border-[#E2E0D8]" />
          <button onClick={() => { handleSignOut(); setOpen(false); }}
            className="text-sm text-[#9B9B9B] hover:text-[#1A1A1A] text-left transition-colors">
            Sign out
          </button>
        </>
      );
    }

    if (user.role === "admin") {
      return (
        <>
          {publicLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="text-lg font-medium text-[#1A1A1A]">
              {l.label}
            </Link>
          ))}
          <hr className="border-[#E2E0D8]" />
          <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider">Admin</p>
          {adminLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="text-lg font-medium text-[#9333EA]">
              {l.label}
            </Link>
          ))}
          <hr className="border-[#E2E0D8]" />
          {userLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="text-lg font-medium text-[#1A1A1A]">
              {l.label}
            </Link>
          ))}
          <hr className="border-[#E2E0D8]" />
          <Link href="/order" onClick={() => setOpen(false)}>
            <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white">New order</Button>
          </Link>
          <button onClick={() => { handleSignOut(); setOpen(false); }}
            className="text-sm text-[#9B9B9B] hover:text-[#1A1A1A] text-left transition-colors">
            Sign out
          </button>
        </>
      );
    }

    // user role
    return (
      <>
        {publicLinks.map((l) => (
          <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
            className="text-lg font-medium text-[#1A1A1A]">
            {l.label}
          </Link>
        ))}
        {userLinks.map((l) => (
          <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
            className="text-lg font-medium text-[#1A1A1A]">
            {l.label}
          </Link>
        ))}
        <hr className="border-[#E2E0D8]" />
        <Link href="/order" onClick={() => setOpen(false)}>
          <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white">New order</Button>
        </Link>
        <button onClick={() => { handleSignOut(); setOpen(false); }}
          className="text-sm text-[#9B9B9B] hover:text-[#1A1A1A] text-left transition-colors">
          Sign out
        </button>
      </>
    );
  }

  // ── 렌더 ─────────────────────────────────────────────────

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E2E0D8]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/">
          <PrintCrownLogo size={36} />
        </Link>

        {/* Desktop nav links */}
        {!loading && (
          <div className="hidden md:flex items-center gap-6">
            <DesktopLinks />
          </div>
        )}

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <DesktopCTAs />
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button className="flex flex-col gap-1.5 p-2">
              <span className="w-5 h-px bg-[#1A1A1A] block" />
              <span className="w-5 h-px bg-[#1A1A1A] block" />
              <span className="w-3 h-px bg-[#1A1A1A] block" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#F8F7F4] w-72">
            <div className="flex flex-col gap-6 mt-8">
              <MobileMenu />
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </nav>
  );
}