"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E2E0D8]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">PC</span>
          </div>
          <span className="font-semibold text-[#1A1A1A] tracking-tight text-lg">
            Print<span className="text-[#2563EB]">Crown</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#products" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            Products
          </Link>
          <Link href="#how-it-works" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            How it works
          </Link>
          <Link href="#pricing" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            Pricing
          </Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">
              Sign in
            </Button>
          </Link>
          <Link href="/order">
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm px-5 h-9 rounded-lg">
              Order now
            </Button>
          </Link>
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
              <Link href="#products" onClick={() => setOpen(false)} className="text-lg font-medium">Products</Link>
              <Link href="#how-it-works" onClick={() => setOpen(false)} className="text-lg font-medium">How it works</Link>
              <Link href="#pricing" onClick={() => setOpen(false)} className="text-lg font-medium">Pricing</Link>
              <hr className="border-[#E2E0D8]" />
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">Sign in</Button>
              </Link>
              <Link href="/order" onClick={() => setOpen(false)}>
                <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white">Order now</Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}