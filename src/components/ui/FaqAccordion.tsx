"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-4xl mx-auto divide-y divide-gray-200 border-y border-gray-200">
      {items.map((item, index) => (
        <div key={index} className="py-6">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between text-left focus:outline-none group"
            aria-expanded={openIndex === index}
          >
            <span className="text-xl font-bold text-foreground group-hover:text-navy-primary transition-colors pr-8">
              {item.question}
            </span>
            <ChevronDown
              className={`w-6 h-6 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                openIndex === index ? "rotate-180 text-navy-primary" : ""
              }`}
            />
          </button>
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              openIndex === index ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <p className="text-gray-500 leading-relaxed text-lg pb-4">
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
