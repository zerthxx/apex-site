import { Accordion } from "@/components/ui/Accordion";
import type { FaqItem } from "@/lib/types";

interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

export function FaqAccordion({ items, className }: FaqAccordionProps) {
  const accordionItems = items.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));

  return <Accordion items={accordionItems} className={className} />;
}
