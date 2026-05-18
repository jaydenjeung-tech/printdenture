"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient, getClientUser } from "@/lib/supabase";
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
      const { user } = await getClientUser(supabase);
      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_admin")
        .eq("id", user.id)
        .single();

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

  const publicLinks = [
    { label: "Products",      href: navLink("#products") },
    { label: "How it works",  href: navLink("#how-it-works") },
  ];

  const userLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Support",   href: "/support" },
  ];

  const labLinks = [
    { label: "Lab Queue", href: "/lab" },
    { label: "Scan",      href: "/lab/scan" },
  ];

  const adminLinks = [
    { label: "All Orders", href: "/admin/orders" },
    { label: "Customers",  href: "/admin/customers" },
    { label: "Products",   href: "/admin/products" },
    { label: "Lab",        href: "/lab" },
    { label: "Scan",       href: "/lab/scan" },
  ];

  // ── Desktop links ─────────────────────────────────────────

  function DesktopLinks() {
  if (!user) return null;

  if (user.role === "lab") {
    return (
      <>
        {labLinks.map((l) => (
          <Link key={l.label} href={l.href}
            className="text-sm font-medium text-[#5DCAA5] hover:text-[#9FE1CB] transition-colors">
            {l.label}
          </Link>
        ))}
      </>
    );
  }

  if (user.role === "admin") {
    return (
      <>
        {publicLinks.map((l) => (
          <Link key={l.label} href={l.href}
            className="text-sm text-[#7CA0B8] hover:text-white transition-colors">
            {l.label}
          </Link>
        ))}
        <span className="w-px h-4 bg-[#1E3347]" />
        {userLinks.map((l) => (
          <Link key={l.label} href={l.href}
            className="text-sm text-[#7CA0B8] hover:text-white transition-colors">
            {l.label}
          </Link>
        ))}
        <span className="w-px h-4 bg-[#1E3347]" />
        {adminLinks.map((l) => (
          <Link key={l.label} href={l.href}
            className="text-sm font-medium text-[#5DCAA5] hover:text-[#9FE1CB] transition-colors">
            {l.label}
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      {publicLinks.map((l) => (
        <Link key={l.label} href={l.href}
          className="text-sm text-[#7CA0B8] hover:text-white transition-colors">
          {l.label}
        </Link>
      ))}
      {userLinks.map((l) => (
        <Link key={l.label} href={l.href}
          className="text-sm text-[#7CA0B8] hover:text-white transition-colors">
          {l.label}
        </Link>
      ))}
    </>
  );
}

function DesktopCTAs() {
  if (loading) return <div className="w-24 h-9 rounded-lg bg-[#1E3347] animate-pulse" />;

  if (!user) {
    return (
      <>
        <Link href="/auth">
          <Button variant="ghost"
            className="text-sm text-[#7CA0B8] hover:text-white hover:bg-transparent">
            Sign in
          </Button>
        </Link>
        <Link href="/auth?next=%2Forder">
          <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-sm px-5 h-9 rounded-lg transition-colors">
            Order now
          </Button>
        </Link>
      </>
    );
  }

  if (user.role === "lab") {
    return (
      <button onClick={handleSignOut}
        className="text-sm text-[#7CA0B8] hover:text-white transition-colors">
        Sign out
      </button>
    );
  }

  return (
    <>
      <Link href="/order">
        <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-sm px-5 h-9 rounded-lg transition-colors">
          New order
        </Button>
      </Link>
      <button onClick={handleSignOut}
        className="text-sm text-[#7CA0B8] hover:text-white transition-colors">
        Sign out
      </button>
    </>
  );
}

  // ── Mobile menu ───────────────────────────────────────────

  function MobileMenu() {
    if (loading) return null;

    if (!user) {
      return (
        <>
          {publicLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="text-lg font-medium text-[#1B2B3A]">
              {l.label}
            </Link>
          ))}
          <hr className="border-[#E5E7EB]" />
          <Link href="/auth" onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full border-[#E5E7EB] text-[#1B2B3A]">
              Sign in
            </Button>
          </Link>
          <Link href="/auth?next=%2Forder" onClick={() => setOpen(false)}>
            <Button className="w-full bg-[#1B2B3A] hover:bg-[#243447] text-white">
              Order now
            </Button>
          </Link>
        </>
      );
    }

    if (user.role === "lab") {
      return (
        <>
          {labLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="text-lg font-medium text-[#0F6E56]">
              {l.label}
            </Link>
          ))}
          <hr className="border-[#E5E7EB]" />
          <button onClick={() => { handleSignOut(); setOpen(false); }}
            className="text-sm text-[#9CA3AF] hover:text-[#1B2B3A] text-left transition-colors">
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
              className="text-lg font-medium text-[#1B2B3A]">
              {l.label}
            </Link>
          ))}
          <hr className="border-[#E5E7EB]" />
          <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider">Admin</p>
          {adminLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="text-lg font-medium text-[#0F6E56]">
              {l.label}
            </Link>
          ))}
          <hr className="border-[#E5E7EB]" />
          {userLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="text-lg font-medium text-[#1B2B3A]">
              {l.label}
            </Link>
          ))}
          <hr className="border-[#E5E7EB]" />
          <Link href="/order" onClick={() => setOpen(false)}>
            <Button className="w-full bg-[#1B2B3A] hover:bg-[#243447] text-white">New order</Button>
          </Link>
          <button onClick={() => { handleSignOut(); setOpen(false); }}
            className="text-sm text-[#9CA3AF] hover:text-[#1B2B3A] text-left transition-colors">
            Sign out
          </button>
        </>
      );
    }

    return (
      <>
        {publicLinks.map((l) => (
          <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
            className="text-lg font-medium text-[#1B2B3A]">
            {l.label}
          </Link>
        ))}
        {userLinks.map((l) => (
          <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
            className="text-lg font-medium text-[#1B2B3A]">
            {l.label}
          </Link>
        ))}
        <hr className="border-[#E5E7EB]" />
        <Link href="/order" onClick={() => setOpen(false)}>
          <Button className="w-full bg-[#1B2B3A] hover:bg-[#243447] text-white">New order</Button>
        </Link>
        <button onClick={() => { handleSignOut(); setOpen(false); }}
          className="text-sm text-[#9CA3AF] hover:text-[#1B2B3A] text-left transition-colors">
          Sign out
        </button>
      </>
    );
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D1B2A]/95 backdrop-blur-md border-b border-[#1E3347]">
  <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

    <Link href="/" className="flex items-center gap-2">
      <div className="w-7 h-7 bg-[#1D9E75] rounded-lg flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1C5 1 4 2.5 4 4.5c0 1.2.6 2.2 1.2 3L6 11h2l.8-3.5C9.4 6.7 10 5.7 10 4.5 10 2.5 9 1 7 1z" fill="white"/>
        </svg>
      </div>
      <span className="font-semibold text-[17px] text-white">
        Print<span className="text-[#5DCAA5]">Crown</span>
      </span>
    </Link>

    {!loading && (
      <div className="hidden md:flex items-center gap-6">
        <DesktopLinks />
      </div>
    )}

    <div className="hidden md:flex items-center gap-3">
      <DesktopCTAs />
    </div>

    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <button className="flex flex-col gap-1.5 p-2">
          <span className="w-5 h-px bg-[#7CA0B8] block" />
          <span className="w-5 h-px bg-[#7CA0B8] block" />
          <span className="w-3 h-px bg-[#7CA0B8] block" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-[#0D1B2A] w-72 border-l border-[#1E3347]">
        <div className="flex flex-col gap-6 mt-8">
          <MobileMenu />
        </div>
      </SheetContent>
    </Sheet>

  </div>
</nav>
  );
}