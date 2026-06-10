"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Section {
  number: number;
  title: string;
  lines: string[];
}

interface PolicyData {
  title: string;
  subtitle: string;
  appTarget: string;
  metadata: string[];
  sections: Section[];
}

interface PrivacyPolicyClientProps {
  policyData: PolicyData;
}

export default function PrivacyPolicyClient({ policyData }: PrivacyPolicyClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState(1);
  const [copiedSectionId, setCopiedSectionId] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sectionRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  // Dynamic Scroll Spy: Track which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for header/padding
      
      let currentSection = 1;
      for (const section of policyData.sections) {
        const ref = sectionRefs.current[section.number];
        if (ref) {
          const top = ref.offsetTop;
          if (scrollPosition >= top) {
            currentSection = section.number;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [policyData.sections]);

  const scrollToSection = (num: number) => {
    setActiveSection(num);
    setIsMobileMenuOpen(false);
    const ref = sectionRefs.current[num];
    if (ref) {
      const top = ref.offsetTop - 100; // Offset for sticky header
      window.scrollTo({
        top: top,
        behavior: "smooth",
      });
      // Update browser URL hash without jump
      window.history.pushState(null, "", `#section-${num}`);
    }
  };

  // Sync initial hash if present
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const numMatch = hash.match(/#section-(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1]);
        // Delay slightly for initial render
        setTimeout(() => {
          scrollToSection(num);
        }, 300);
      }
    }
  }, []);

  const copySectionLink = (num: number) => {
    const url = `${window.location.origin}${window.location.pathname}#section-${num}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSectionId(num);
      setTimeout(() => setCopiedSectionId(null), 2000);
    });
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-amber-100 text-amber-950 font-bold px-0.5 rounded border-b border-amber-300">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const renderLine = (line: string, index: number) => {
    // 1. Highlight standard subsections like "1.1", "12.3", "22.4"
    const matchSub = line.match(/^(\d+\.\d+)\s*(.*)$/);
    if (matchSub) {
      // Check if it's a section heading (short text, no ending punctuation)
      const isHeading = matchSub[2].length < 60 && !matchSub[2].endsWith('.') && !matchSub[2].endsWith(';') && !matchSub[2].includes('This Privacy Policy') && !matchSub[2].includes('This Policy governs');
      if (isHeading) {
        return (
          <h3 key={index} className="text-gray-900 font-extrabold text-base mt-6 mb-3 flex items-center gap-2">
            <span className="text-[#059669] font-mono shrink-0">{matchSub[1]}</span>
            <span>{highlightText(matchSub[2], searchQuery)}</span>
          </h3>
        );
      }
      return (
        <div key={index} className="pl-0 md:pl-2 py-1.5 text-gray-700 leading-relaxed flex items-start gap-2.5">
          <span className="font-bold text-[#059669] shrink-0 font-mono text-sm mt-0.5">{matchSub[1]}</span>
          <span>{highlightText(matchSub[2], searchQuery)}</span>
        </div>
      );
    }

    // 2. Highlight bullet points like "a)", "b)"
    const matchAlpha = line.match(/^([a-g]\))\s*(.*)$/);
    if (matchAlpha) {
      return (
        <div key={index} className="pl-6 md:pl-8 py-1.5 text-gray-700 leading-relaxed flex items-start gap-2.5">
          <span className="font-bold text-[#059669]/80 shrink-0 font-mono text-sm mt-0.5">{matchAlpha[1]}</span>
          <span>{highlightText(matchAlpha[2], searchQuery)}</span>
        </div>
      );
    }

    // 3. Highlight Table headers
    const isTableHeader = line.startsWith('Permission When requested') || line.startsWith('Purpose Personal Data') || line.startsWith('Category Retention Reason') || line.startsWith('Matter Timeline');
    if (isTableHeader) {
      return (
        <div key={index} className="bg-gray-50 border-y border-gray-200 text-gray-900 font-extrabold text-[11px] tracking-wider uppercase py-2 px-3 mt-4 mb-2 select-none font-mono">
          {highlightText(line, searchQuery)}
        </div>
      );
    }

    // 4. Default paragraphs
    return (
      <p key={index} className="text-gray-700 leading-relaxed py-1 text-sm md:text-base">
        {highlightText(line, searchQuery)}
      </p>
    );
  };

  // Filter sections that match the search query (to show visual feedback/badges)
  const matchingSections = policyData.sections.filter(s => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.lines.some(l => l.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-sans text-gray-900 flex flex-col selection:bg-[#10B981]/20">
      
      {/* Top Banner Navigation */}
      <header className="sticky top-0 left-0 right-0 bg-white/85 backdrop-blur-md border-b border-[#E5E7EB] z-40 shadow-sm print:hidden">
        <div className="w-full max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SimulaFly Logo" className="w-7 h-7 object-contain" />
            <span className="font-extrabold text-lg tracking-tight text-[#022C22]">SimulaFly App Privacy Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/merchant" className="text-xs md:text-sm font-bold text-[#064E3B] hover:text-[#10B981] transition-all bg-[#ECFDF5] px-4 py-2 rounded-lg border border-[#059669]/10">
              ← Back to Merchant Central
            </Link>
            <button 
              onClick={() => window.print()}
              className="hidden md:inline-flex items-center gap-2 text-xs md:text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Policy
            </button>
            <a 
              href="/SimulaFly_App_Privacy_Policy.pdf" 
              download 
              className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs md:text-sm font-bold rounded-lg hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </a>
          </div>
        </div>
      </header>

      {/* Main Hero Header Section */}
      <section className="bg-gradient-to-br from-[#022C22] to-[#064E3B] text-white py-14 px-6 relative overflow-hidden border-b-4 border-[#059669]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,_#10B981_0%,_transparent_50%)]"></div>
        <div className="w-full max-w-[1400px] mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="text-[10px] md:text-xs font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 px-3 py-1 rounded-full uppercase tracking-wider">
              Legal Operations
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-4 mb-2">
              Privacy Policy for Mobile Application
            </h1>
            <p className="text-gray-300 font-medium text-sm md:text-base mb-8">
              Verbatim copy of the SimulaFly privacy policy governing the iOS and Android applications. Formulated under the Digital Personal Data Protection Act, 2023.
            </p>

            {/* Quick Metadata Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs md:text-sm font-medium">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-gray-400 block text-[10px] uppercase tracking-wider mb-1">Data Fiduciary</span>
                <span className="text-white font-bold block">Simula Technologies LLP</span>
                <span className="text-gray-300 text-[11px] block mt-0.5">Noida, Uttar Pradesh, India</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-gray-400 block text-[10px] uppercase tracking-wider mb-1">Grievance Officer</span>
                <span className="text-white font-bold block">Shourya Pratap</span>
                <span className="text-emerald-400 block text-[11px] hover:underline mt-0.5">
                  <a href="mailto:support@simulafly.com">support@simulafly.com</a>
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-gray-400 block text-[10px] uppercase tracking-wider mb-1">Compliance State</span>
                <span className="text-white font-bold block">Effective 08-06-2026</span>
                <span className="text-gray-300 text-[11px] block mt-0.5">DPDPA 2023 & SPDI Rules 2011</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Controls Bar */}
      <section className="bg-white border-b border-[#E5E7EB] sticky top-16 z-30 shadow-sm py-4 px-6 print:hidden">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search clauses, keywords (e.g. AI, child, refund)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 font-bold text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {searchQuery && (
              <span className="text-xs text-gray-500 font-semibold bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg select-none">
                Found matches in <span className="text-[#059669] font-bold">{matchingSections.length}</span> sections
              </span>
            )}
            
            {/* Mobile TOC Drawer Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Table of Contents
            </button>
          </div>

        </div>
      </section>

      {/* Main Section Explorer Workspace */}
      <main className="w-full max-w-[1400px] mx-auto px-6 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Table of Contents - Desktop Sticky Navigation */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-52 max-h-[calc(100vh-14rem)] overflow-y-auto pr-2 custom-scrollbar print:hidden">
            <h2 className="text-[11px] font-black text-gray-400 tracking-wider uppercase mb-4 pl-3">
              Table of Contents
            </h2>
            <nav className="space-y-1">
              {policyData.sections.map((section) => {
                const isActive = activeSection === section.number;
                const hasSearchMatch = searchQuery && matchingSections.some(s => s.number === section.number);
                
                return (
                  <button
                    key={section.number}
                    onClick={() => scrollToSection(section.number)}
                    className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-bold flex items-start gap-3 transition-all relative group cursor-pointer ${
                      isActive 
                        ? "bg-gradient-to-r from-[#ECFDF5] to-emerald-50/20 text-[#064E3B] border-l-4 border-[#059669] shadow-sm" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/70 border-l-4 border-transparent"
                    }`}
                  >
                    <span className={`font-mono text-[10px] shrink-0 w-5 h-5 flex items-center justify-center rounded-md ${
                      isActive 
                        ? "bg-[#059669] text-white" 
                        : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                    }`}>
                      {section.number.toString().padStart(2, '0')}
                    </span>
                    <span className="leading-tight shrink">{section.title}</span>

                    {/* Highlight matching badge */}
                    {hasSearchMatch && (
                      <span className="absolute right-2.5 top-3 w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-white"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Policy Scroll Area */}
          <article className="col-span-1 lg:col-span-8 space-y-6">
            
            {/* Introductory PDF text details */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 md:p-8 shadow-sm">
              <div className="space-y-4">
                {policyData.metadata.map((line, idx) => (
                  <div key={idx} className="text-gray-600 leading-relaxed text-sm font-medium border-l-2 border-gray-100 pl-4">
                    {highlightText(line, searchQuery)}
                  </div>
                ))}
              </div>
            </div>

            {/* Render each of the 22 sections */}
            {policyData.sections.map((section) => {
              const isActive = activeSection === section.number;
              const hasSearchMatch = searchQuery && matchingSections.some(s => s.number === section.number);
              
              return (
                <section
                  key={section.number}
                  id={`section-${section.number}`}
                  ref={(el) => {
                    sectionRefs.current[section.number] = el;
                  }}
                  className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative group scroll-mt-24 ${
                    isActive 
                      ? "border-[#059669] ring-2 ring-[#059669]/5" 
                      : "border-gray-200"
                  } ${hasSearchMatch ? "ring-2 ring-amber-400/35 border-amber-300" : ""}`}
                >
                  
                  {/* Section Title Header */}
                  <div className={`px-6 py-4 border-b flex items-center justify-between ${
                    isActive ? "bg-emerald-50/30 border-emerald-100" : "bg-gray-50/50 border-gray-100"
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-black bg-gray-100 border text-gray-500 rounded-md w-6 h-6 flex items-center justify-center">
                        {section.number}
                      </span>
                      <h2 className="text-base md:text-lg font-black tracking-tight text-[#022C22]">
                        {highlightText(section.title, searchQuery)}
                      </h2>
                    </div>

                    {/* Section Utility Controls */}
                    <div className="flex items-center gap-2 opacity-80 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copySectionLink(section.number)}
                        title="Copy direct section link"
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer relative"
                      >
                        {copiedSectionId === section.number ? (
                          <span className="absolute -top-8 right-0 bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md z-10 block whitespace-nowrap">
                            Copied!
                          </span>
                        ) : null}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Section Paragraph Lines */}
                  <div className="p-6 md:p-8 space-y-2 text-gray-700">
                    {section.lines.map((line, idx) => renderLine(line, idx))}
                  </div>

                </section>
              );
            })}
          </article>
        </div>
      </main>

      {/* Floating Bottom Section Navigation for Mobile (Only visible on small viewports) */}
      <div className={`fixed inset-0 z-50 bg-black/55 backdrop-blur-sm lg:hidden transition-all duration-300 md:hidden print:hidden ${
        isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[75vh] flex flex-col shadow-2xl transition-transform duration-300 transform ${
          isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
        }`}>
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <span className="font-black text-gray-900 text-sm">Jump to Section</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-extrabold text-sm p-1 cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="overflow-y-auto p-4 space-y-1 max-h-[calc(75vh-4rem)]">
            {policyData.sections.map((section) => (
              <button
                key={section.number}
                onClick={() => scrollToSection(section.number)}
                className={`w-full text-left p-3 rounded-lg text-xs font-bold flex items-center gap-3 ${
                  activeSection === section.number 
                    ? "bg-[#ECFDF5] text-[#064E3B]" 
                    : "text-gray-500"
                }`}
              >
                <span className="font-mono text-[10px] shrink-0 bg-gray-100 w-5 h-5 flex items-center justify-center rounded-md">
                  {section.number}
                </span>
                <span className="truncate">{section.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Element */}
      <footer className="bg-[#022C22] text-white py-12 px-6 border-t-4 border-[#059669]">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left text-xs md:text-sm">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SimulaFly Logo" className="w-8 h-8 object-contain brightness-0 invert" />
            <div>
              <span className="font-extrabold tracking-tight text-white block">SimulaFly Seller Central</span>
              <span className="text-gray-400 text-[11px] block mt-0.5">&copy; 2026 Simula Technologies LLP. All rights reserved.</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-semibold text-[#E5E7EB]">
            <Link href="/merchant" className="hover:text-white transition-all">
              Home
            </Link>
            <Link href="/merchant/sign_in" className="hover:text-white transition-all">
              Merchant Login
            </Link>
            <a href="mailto:support@simulafly.com" className="hover:text-white transition-all">
              Contact Privacy Support
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
