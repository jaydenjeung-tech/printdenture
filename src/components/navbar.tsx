"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient, getClientUser, isSupabaseConfigured } from "@/lib/supabase";

type Role = "user" | "lab" | "admin";

type UserState = {
  email: string;
  role: Role;
};

const linkClass =
  "text-[13px] text-[#7CA0B8] hover:text-white transition-colors whitespace-nowrap";
const linkClassAccent =
  "text-[13px] font-medium text-[#5DCAA5] hover:text-[#9FE1CB] transition-colors whitespace-nowrap";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [user, setUser] = useState<null | UserState>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const adminRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    async function loadUser(client: NonNullable<ReturnType<typeof createClient>>) {
      const { user: authUser } = await getClientUser(client);
      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await client
        .from("profiles")
        .select("role, is_admin")
        .eq("id", authUser.id)
        .single();

      const role: Role = profile?.role ?? (profile?.is_admin ? "admin" : "user");
      setUser({ email: authUser.email || "", role });
      setLoading(false);
    }

    void loadUser(supabase);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser(supabase);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }

  function anchor(href: string) {
    if (href.startsWith("#")) return isHome ? href : `/${href}`;
    return href;
  }

  const marketingLinks = [
    { label: "JB Tray", href: anchor("#jb-tray") },
    { label: "JB Fork", href: anchor("#jb-fork") },
    { label: "Workflow", href: anchor("#how-it-works") },
    { label: "Services", href: anchor("#products") },
    { label: "Pricing", href: "/pricing" },
  ];

  const accountLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Support", href: "/support" },
  ];

  const labLinks = [
    { label: "Lab queue", href: "/lab" },
    { label: "Scan", href: "/lab/scan" },
  ];

  const adminLinks = [
    { label: "Overview", href: "/admin" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Products", href: "/admin/products" },
    { label: "Support inbox", href: "/admin/support" },
    { label: "Lab", href: "/lab" },
  ];

  function Logo() {
    return (
      <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
        <div className="w-8 h-8 bg-[#1D9E75] rounded-lg flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M2 9.5c1.2-2.8 3.2-4.2 5-4.5 1.8-.3 3.5.5 5 2.5M3 11.5h8"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="font-semibold text-[16px] lg:text-[17px] text-white tracking-tight">
          Print<span className="text-[#5DCAA5]">Denture</span>
        </span>
      </Link>
    );
  }

  function Separator() {
    return <span className="w-px h-4 bg-[#1E3347] shrink-0 hidden lg:block" aria-hidden />;
  }

  function MarketingNav() {
    return (
      <>
        {marketingLinks.map((l) => (
          <Link key={l.href} href={l.href} className={linkClass}>
            {l.label}
          </Link>
        ))}
      </>
    );
  }

  function AdminDropdown() {
    return (
      <div ref={adminRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setAdminOpen((v) => !v)}
          className={`${linkClassAccent} inline-flex items-center gap-1 px-1`}
          aria-expanded={adminOpen}
        >
          Admin
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className={`transition-transform ${adminOpen ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path d="M2 4 L5 7 L8 4" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
        </button>
        {adminOpen && (
          <div className="absolute top-full right-0 mt-2 min-w-[180px] rounded-xl border border-[#1E3347] bg-[#132337] py-1.5 shadow-xl z-50">
            {adminLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setAdminOpen(false)}
                className="block px-4 py-2 text-[13px] text-[#9FE1CB] hover:bg-[#1E3347] hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  function DesktopNav() {
    if (user?.role === "lab") {
      return (
        <div className="flex items-center gap-4 lg:gap-5">
          {labLinks.map((l) => (
            <Link key={l.href} href={l.href} className={linkClassAccent}>
              {l.label}
            </Link>
          ))}
        </div>
      );
    }

    if (user?.role === "admin") {
      return (
        <div className="flex items-center gap-3 lg:gap-4 flex-wrap justify-center">
          <MarketingNav />
          <Separator />
          {accountLinks.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
          <AdminDropdown />
        </div>
      );
    }

    if (user) {
      return (
        <div className="flex items-center gap-3 lg:gap-4 flex-wrap justify-center">
          <MarketingNav />
          <Separator />
          {accountLinks.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 lg:gap-5 flex-wrap justify-center">
        <MarketingNav />
        <Link href="/support" className={linkClass}>
          Support
        </Link>
      </div>
    );
  }

  function DesktopCTAs() {
    if (loading) {
      return <div className="w-28 h-9 rounded-lg bg-[#1E3347] animate-pulse shrink-0" />;
    }

    if (!user) {
      return (
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/auth">
            <Button
              variant="ghost"
              className="text-[13px] text-[#7CA0B8] hover:text-white hover:bg-white/5 h-9 px-3"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/auth?next=%2Forder">
            <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-[13px] px-4 h-9 rounded-lg">
              Order now
            </Button>
          </Link>
        </div>
      );
    }

    if (user.role === "lab") {
      return (
        <button type="button" onClick={handleSignOut} className={`${linkClass} shrink-0`}>
          Sign out
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/order">
          <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-[13px] px-4 h-9 rounded-lg">
            New order
          </Button>
        </Link>
        <button type="button" onClick={handleSignOut} className={linkClass}>
          Sign out
        </button>
      </div>
    );
  }

  function MobileMenuContent() {
    if (loading) return null;

    const section = (title: string, links: { label: string; href: string }[], accent = false) => (
      <div className="space-y-2">
        <p className="text-[10px] font-medium text-[#5A7D94] uppercase tracking-widest">{title}</p>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={`block text-[15px] font-medium ${accent ? "text-[#5DCAA5]" : "text-white"}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    );

    if (!user) {
      return (
        <>
          {section("Explore", [...marketingLinks, { label: "Support", href: "/support" }])}
          <hr className="border-[#1E3347]" />
          <Link href="/auth" onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full border-[#1E3347] text-white bg-transparent">
              Sign in
            </Button>
          </Link>
          <Link href="/auth?next=%2Forder" onClick={() => setOpen(false)}>
            <Button className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Order now</Button>
          </Link>
        </>
      );
    }

    if (user.role === "lab") {
      return (
        <>
          {section("Lab", labLinks, true)}
          <hr className="border-[#1E3347]" />
          <button
            type="button"
            onClick={() => {
              handleSignOut();
              setOpen(false);
            }}
            className="text-sm text-[#7CA0B8]"
          >
            Sign out
          </button>
        </>
      );
    }

    if (user.role === "admin") {
      return (
        <>
          {section("Site", marketingLinks)}
          {section("Account", accountLinks)}
          {section("Admin", adminLinks, true)}
          <hr className="border-[#1E3347]" />
          <Link href="/order" onClick={() => setOpen(false)}>
            <Button className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white">New order</Button>
          </Link>
          <button
            type="button"
            onClick={() => {
              handleSignOut();
              setOpen(false);
            }}
            className="text-sm text-[#7CA0B8]"
          >
            Sign out
          </button>
        </>
      );
    }

    return (
      <>
        {section("Site", marketingLinks)}
        {section("Account", [...accountLinks, { label: "New order", href: "/order" }])}
        <hr className="border-[#1E3347]" />
        <button
          type="button"
          onClick={() => {
            handleSignOut();
            setOpen(false);
          }}
          className="text-sm text-[#7CA0B8]"
        >
          Sign out
        </button>
      </>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-[#0D1B2A]/95 backdrop-blur-md border-b border-[#1E3347]">
      <div className="w-full flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 lg:px-10 h-16">
        <Logo />

        {!loading && (
          <div className="hidden lg:flex flex-1 items-center justify-center px-4 min-w-0">
            <DesktopNav />
          </div>
        )}

        <div className="hidden lg:flex items-center shrink-0">
          <DesktopCTAs />
        </div>

        <div className="flex lg:hidden items-center gap-2 shrink-0">
          {!loading && !user && (
            <Link href="/auth?next=%2Forder">
              <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-[12px] px-3 h-8 rounded-lg">
                Order
              </Button>
            </Link>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5"
                aria-label="Open menu"
              >
                <span className="w-5 h-px bg-[#7CA0B8] block" />
                <span className="w-5 h-px bg-[#7CA0B8] block" />
                <span className="w-3 h-px bg-[#7CA0B8] block ml-auto" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0D1B2A] w-[min(100vw,320px)] border-l border-[#1E3347]">
              <div className="flex flex-col gap-6 mt-8 overflow-y-auto max-h-[calc(100vh-4rem)] pb-8">
                <MobileMenuContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
