import React, { useEffect, useState } from 'react';
import { requestIoTExplanation, GLOBAL_AI_TERMS, subscribeToGlossary } from '@/lib/ai-glossary';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

export const GlossaryText: React.FC<{ text?: string; className?: string }> = ({
  text = '',
  className = '',
}) => {
  const [, setVersion] = useState(0);

  useEffect(() => {
    // Wenn ein neuer Text gerendert wird, KI-Analyse anstoßen
    if (text) {
      requestIoTExplanation(text);
    }
  }, [text]);

  useEffect(() => {
    // Reagiere sofort, sobald OpenAI neue Begriffe zurückgeliefert hat
    const unsubscribe = subscribeToGlossary(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  if (!text) return null;

  // Alle von OpenAI bisher gelernten Begriffe sammeln
  const allTerms = Array.from(GLOBAL_AI_TERMS.values());
  if (allTerms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Längste Suchbegriffe zuerst sortieren
  const sorted = [...allTerms].sort((a, b) => b.term.length - a.term.length);
  const patterns = sorted.map((t) => t.term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const regex = new RegExp(`(${patterns.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        const item = GLOBAL_AI_TERMS.get(part.toLowerCase());

        if (item) {
          return (
            <HoverCard key={idx}>
              <HoverCardTrigger className="font-semibold text-[#1E2430] underline decoration-dotted decoration-[#C46A2B] hover:text-[#C46A2B] cursor-help px-0.5 rounded hover:bg-orange-50 transition-colors inline-block">
                {part}
              </HoverCardTrigger>
              <HoverCardContent className="w-72 bg-white p-3.5 shadow-2xl border border-[#D9D3C7] rounded-xl text-left z-[9999]">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-xs text-[#1E2430]">{item.term}</span>
                  {item.category && (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-orange-100 text-orange-800 border border-orange-200 rounded font-mono">
                      {item.category}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#5A6172] leading-relaxed mb-0">
                  {item.explanation}
                </p>
              </HoverCardContent>
            </HoverCard>
          );
        }

        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
};