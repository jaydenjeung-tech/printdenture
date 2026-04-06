"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase";
import PrintCrownLogo from "@/components/logo"

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<null | { email: string; isAdmin: boolean }>(null);
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
        .select("is_admin")
        .eq("id", user.id)
        .single();

      setUser({ email: user.email || "", isAdmin: profile?.is_admin || false });
      setLoading(false);
    }

    loadUser();

    // 로그인/로그아웃 상태 변화 감지
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

  // 홈페이지면 앵커, 아니면 홈으로 이동 후 앵커
  function navLink(anchor: string) {
    return isHome ? anchor : `/${anchor}`;
  }

 const navLinks: { label: string; href: string }[] = [
  { label: "Products", href: navLink("#products") },
  { label: "How it works", href: navLink("#how-it-works") },
  ...(user ? [{ label: "Pricing", href: "/pricing" }] : []),
];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E2E0D8]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/">
          <PrintCrownLogo size={36} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href}
              className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="w-24 h-9 rounded-lg bg-[#E2E0D8] animate-pulse" />
          ) : user ? (
            <>
          {user.isAdmin && (
                <>
                  <Link href="/lab">
                    <Button variant="ghost" className="text-sm text-[#9333EA] hover:text-[#7E22CE]">
                      Lab
                    </Button>
                  </Link>
                  <Link href="/admin/orders">
                    <Button variant="ghost" className="text-sm text-[#9333EA] hover:text-[#7E22CE]">
                      Orders
                    </Button>
                  </Link>
                  <Link href="/admin/products">
                    <Button variant="ghost" className="text-sm text-[#9333EA] hover:text-[#7E22CE]">
                      Products
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">
                  Dashboard
                </Button>
              </Link>
              <Link href="/support">  {/* ← 추가 */}
              <Button variant="ghost" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">
                Support
              </Button>
              </Link>
              <Link href="/order">
                <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm px-5 h-9 rounded-lg">
                  New order
                </Button>
              </Link>
              <button onClick={handleSignOut}
                className="text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
                Sign out
              </button>
              <Link href="/lab/scan">
                <Button variant="ghost" className="text-sm text-[#9333EA] hover:text-[#7E22CE]">
                  Scan
                </Button>
              </Link>
            </>
          ) : (
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
          )}
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
              {navLinks.map((l) => (
                <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
                  className="text-lg font-medium text-[#1A1A1A]">
                  {l.label}
                </Link>
              ))}
              <hr className="border-[#E2E0D8]" />
              {user ? (
                <>
                  {user.isAdmin && (
                  <>
                    <Link href="/lab">
                      <Button variant="ghost" className="text-sm text-[#9333EA] hover:text-[#7E22CE]">
                        Lab
                      </Button>
                    </Link>
                    <Link href="/admin/orders">
                      <Button variant="ghost" className="text-sm text-[#9333EA] hover:text-[#7E22CE]">
                        Orders
                      </Button>
                    </Link>
                    <Link href="/admin/products">
                      <Button variant="ghost" className="text-sm text-[#9333EA] hover:text-[#7E22CE]">
                        Products
                      </Button>
                    </Link>
                    <Link href="/lab/scan">
                  <Button variant="ghost" className="text-sm text-[#9333EA] hover:text-[#7E22CE]">
                    Scan
                  </Button>
                </Link>
                  </>
                )}
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Dashboard</Button>
                  </Link>
                  <Link href="/order" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                      New order
                    </Button>
                  </Link>
                  <Link href="/support" onClick={() => setOpen(false)}>  {/* ← 추가 */}
                  <Button variant="outline" className="w-full">Support</Button>
                  </Link>
                  <button onClick={() => { handleSignOut(); setOpen(false); }}
                    className="text-sm text-[#9B9B9B] hover:text-[#1A1A1A] text-left transition-colors">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Sign in</Button>
                  </Link>
                  <Link href="/order" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                      Order now
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </nav>
  );
}