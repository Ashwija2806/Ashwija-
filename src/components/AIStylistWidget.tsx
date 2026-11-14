import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, MessageSquareText, Send, X } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import type { StylistMessage } from '../types';
import { formatINR } from '../utils/catalogLogic';
import { ProductImage } from './ProductImage';

const SUGGESTED_PROMPTS = [
  'Smart-casual outfit for a weekend brunch under ₹3,500',
  'Festive wedding guest look for women with jewelry-friendly colors',
  'Minimalist streetwear look with sneakers for men',
  'Cozy home refresh + skincare gift under ₹3,000',
];

const CATALOG_INDEX = PRODUCTS.map((p) => ({
  id: p.id,
  brand: p.brand,
  name: p.name,
  gender: p.gender,
  category: p.category,
  price: p.price,
  colors: p.colors,
  tags: p.tags,
}));

export function AIStylistWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<StylistMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Tell me the occasion, dress code, or budget you are shopping for, and I will curate a complete look from the Stylo catalog.',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const sendPrompt = async (promptText: string) => {
    const cleaned = promptText.trim();
    if (!cleaned || loading) return;

    const userMsg: StylistMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: cleaned,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 50);

    try {
      const response = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleaned,
          history: nextMessages
            .filter((m) => !m.error)
            .map((m) => ({ role: m.role, text: m.text })),
          catalog: CATALOG_INDEX,
        }),
      });

      const data = (await response.json()) as {
        advice?: string;
        stylingTip?: string;
        recommendedIds?: string[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Could not get styling advice right now.');
      }

      const assistantMsg: StylistMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.advice || 'Here are my curated picks from Stylo for your look.',
        stylingTip: data.stylingTip,
        recommendedIds: data.recommendedIds || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg =
        err instanceof Error
          ? err.message
          : 'Unable to reach AI Stylist right now.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: errMsg,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 60);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI Stylist chat"
          className="fixed right-4 bottom-18 z-40 flex items-center gap-2 rounded-full bg-[#282C3F] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(40,44,63,0.24)] transition-transform hover:-translate-y-0.5 hover:bg-[#FF3F6C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3F6C] md:right-6 md:bottom-6"
        >
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          <span>AI Stylist</span>
        </button>
      )}

      {open && (
        <section
          aria-label="Stylo AI Stylist Assistant"
          className="fixed right-3 bottom-16 z-50 flex h-[500px] max-h-[78vh] w-[calc(100vw-24px)] max-w-[390px] flex-col overflow-hidden rounded-lg border border-[#EAEAEC] bg-white shadow-[0_16px_36px_rgba(40,44,63,0.22)] md:right-6 md:bottom-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#282C3F] px-4 py-3.5 text-white">
            <div>
              <h2 className="font-display text-sm font-bold tracking-wide">
                Stylo AI Stylist
              </h2>
              <p className="text-[11px] text-white/75">
                Personalized outfit &amp; gift curation
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI Stylist"
              className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-[#F5F5F6] p-4">
            {messages.map((msg) => {
              const recommendedProducts = (msg.recommendedIds || [])
                .map((id) => PRODUCTS.find((p) => p.id === id))
                .filter((p): p is NonNullable<typeof p> => Boolean(p));

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#FF3F6C] text-white'
                        : msg.error
                          ? 'border border-[#ba1a1a]/30 bg-[#ffdad6] text-[#93000a]'
                          : 'border border-[#EAEAEC] bg-white text-[#282C3F]'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.stylingTip && (
                      <p className="mt-2 border-t border-[#EAEAEC] pt-2 text-xs text-[#7E818C]">
                        <strong className="text-[#282C3F]">Styling tip:</strong>{' '}
                        {msg.stylingTip}
                      </p>
                    )}
                  </div>

                  {recommendedProducts.length > 0 && (
                    <div className="mt-2.5 w-full space-y-2">
                      {recommendedProducts.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded border border-[#EAEAEC] bg-white p-2 transition-colors hover:border-[#FF3F6C]"
                        >
                          <div className="h-14 w-11 shrink-0 overflow-hidden rounded bg-[#F5F5F6]">
                            <ProductImage
                              src={product.images[0]}
                              alt={product.name}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-bold uppercase tracking-wider text-[#282C3F]">
                              {product.brand}
                            </p>
                            <p className="truncate text-xs text-[#7E818C]">
                              {product.name}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs tabular-nums">
                              <span className="font-bold text-[#282C3F]">
                                {formatINR(product.price)}
                              </span>
                              <span className="text-[#03A685] font-semibold">
                                {product.discountPercent}% OFF
                              </span>
                            </div>
                          </div>
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-[#7E818C]"
                            aria-hidden="true"
                          />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 rounded-lg border border-[#EAEAEC] bg-white px-3.5 py-2.5 text-xs text-[#7E818C] w-fit">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FF3F6C]" aria-hidden="true" />
                <span>Curating outfits from Stylo catalog...</span>
              </div>
            )}

            {messages.length === 1 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => sendPrompt(p)}
                      className="rounded border border-[#EAEAEC] bg-white px-2.5 py-1.5 text-left text-xs text-[#282C3F] transition-colors hover:border-[#FF3F6C] hover:text-[#FF3F6C]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendPrompt(input);
            }}
            className="flex items-center gap-2 border-t border-[#EAEAEC] bg-white p-3"
          >
            <label htmlFor="ai-stylist-input" className="sr-only">
              Describe an occasion or style
            </label>
            <input
              id="ai-stylist-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Date night outfit under ₹3,000..."
              className="flex-1 rounded border border-[#EAEAEC] bg-[#F5F5F6] px-3 py-2 text-sm text-[#282C3F] placeholder:text-[#7E818C] focus:border-[#282C3F] focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send styling request"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#FF3F6C] text-white transition-colors hover:bg-[#E02D59] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
