"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import PrintDentureLogo from "@/components/logo";
import { createClient, getClientUser, isSupabaseConfigured } from "@/lib/supabase";
import { NAV_LINKS } from "@/lib/marketing/copy";
import { CtaLink } from "./primitives";

type Role = "user" | "lab" | "admin";

type UserState = {
  email: string;
  role: Role;
};

const APP_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "New case", href: "/order" },
  { label: "Support", href: "/support" },
];

const LAB_LINKS = [
  { label: "Lab queue", href: "/lab" },
  { label: "Scan", href: "/lab/scan" },
];

const ADMIN_LINKS = [
  { label: "Overview", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Products", href: "/admin/products" },
  { label: "Support", href: "/admin/support" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [user, setUser] = useState<null | UserState>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const adminRef = useRef<HTMLDivElement>(null);

  const isMarketingDark =
    pathname === "/" ||
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/the-system") ||
    pathname.startsWith("/clinical") ||
    pathname.startsWith("/providers") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/guides");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    } = supabase.auth.onAuthStateChange(() => void loadUser(supabase));
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

  const headerBg =
    scrolled || !isMarketingDark
      ? "bg-white/95 backdrop-blur-md border-[var(--pd-border)] text-[var(--pd-navy)]"
      : "bg-[var(--pd-navy)]/95 backdrop-blur-md border-white/10 text-white";

  const linkClass =
    scrolled || !isMarketingDark
      ? "text-[14px] font-medium text-[var(--pd-slate)] hover:text-[var(--pd-navy)] transition-colors"
      : "text-[14px] font-medium text-[#A8C4D4] hover:text-white transition-colors";

  const loginClass =
    scrolled || !isMarketingDark
      ? "text-[14px] font-medium text-[var(--pd-navy)] hover:text-[var(--pd-teal-dark)] transition-colors"
      : "text-[14px] font-medium text-white/80 hover:text-white transition-colors";

  function NavLinks({ mobile = false }: { mobile?: boolean }) {
    const links = user?.role === "lab" ? LAB_LINKS : user ? APP_LINKS : NAV_LINKS;
    return (
      <>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => mobile && setOpen(false)}
            className={mobile ? "block text-[16px] font-medium py-1" : linkClass}
          >
            {l.label}
          </Link>
        ))}
      </>
    );
  }

  function AdminDropdown() {
    return (
      <div ref={adminRef} className="relative">
        <button
          type="button"
          onClick={() => setAdminOpen((v) => !v)}
          className={`${linkClass} inline-flex items-center gap-1`}
        >
          Admin
          <svg width="10" height="10" viewBox="0 0 10 10" className={adminOpen ? "rotate-180" : ""}>
            <path d="M2 4 L5 7 L8 4" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
        </button>
        {adminOpen && (
          <div className="absolute top-full right-0 mt-2 min-w-[180px] border border-[var(--pd-border)] bg-white py-1 shadow-lg z-50">
            {ADMIN_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setAdminOpen(false)}
                className="block px-4 py-2.5 text-[14px] text-[var(--pd-slate)] hover:bg-[var(--pd-surface)] hover:text-[var(--pd-navy)]"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  function DesktopActions() {
    if (loading) return <div className="w-24 h-9 bg-black/5 animate-pulse" />;

    if (user?.role === "lab") {
      return (
        <button type="button" onClick={handleSignOut} className={loginClass}>
          Sign out
        </button>
      );
    }

    if (user) {
      return (
        <div className="flex items-center gap-4">
          {user.role === "admin" && <AdminDropdown />}
          <Link href="/dashboard" className={loginClass}>
            Dashboard
          </Link>
          <Link href="/order">
            <span className="inline-flex h-10 items-center px-5 bg-[var(--pd-teal)] text-white text-[14px] font-medium hover:bg-[var(--pd-teal-dark)] transition-colors">
              New case
            </span>
          </Link>
          <button type="button" onClick={handleSignOut} className={loginClass}>
            Sign out
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <Link href="/login" className={loginClass}>
          Provider login
        </Link>
        <CtaLink href="/providers#demo" className="h-10 px-5 text-[14px]">
          Request a demo
        </CtaLink>
      </div>
    );
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b transition-colors duration-200 ${headerBg}`}
    >
      <div className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 h-[4.25rem]">
        <Link href="/" aria-label="PrintDenture home">
          <PrintDentureLogo
            variant={scrolled || !isMarketingDark ? "light" : "dark"}
            size="md"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 flex-1 justify-center">
          <NavLinks />
        </nav>

        <div className="hidden lg:flex items-center shrink-0">
          <DesktopActions />
        </div>

        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" className="p-2" aria-label="Open menu">
                <span className="flex flex-col gap-1.5">
                  <span className="w-5 h-px bg-current block" />
                  <span className="w-5 h-px bg-current block" />
                  <span className="w-3 h-px bg-current block ml-auto" />
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw,320px)] p-6">
              <div className="flex flex-col gap-6 mt-8">
                <NavLinks mobile />
                <hr className="border-[var(--pd-border)]" />
                {!loading && !user && (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)} className="text-[16px] font-medium">
                      Provider login
                    </Link>
                    <Link href="/providers#demo" onClick={() => setOpen(false)}>
                      <span className="flex w-full h-11 items-center justify-center bg-[var(--pd-teal)] text-white text-[14px] font-medium">
                        Request a demo
                      </span>
                    </Link>
                  </>
                )}
                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void handleSignOut();
                    }}
                    className="text-left text-[16px] font-medium text-[var(--pd-muted)] hover:text-[var(--pd-navy)] pt-2 border-t border-[var(--pd-border)]"
                  >
                    Sign out
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
