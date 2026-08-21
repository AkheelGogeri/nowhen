import Navbar from "../Navbar";

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Orders are typically processed within 1-2 business days and delivered within 5-7 business days across India.",
  },
  {
    q: "What sizes do you offer?",
    a: "Our tees are oversized fit, available in S, M, L, XL, and XXL. Check each product page for a specific size chart.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "Yes — unworn items with tags intact can be returned or exchanged within 10 days of delivery. Reach out to us at contact.nowhen@gmail.com to start the process.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, credit/debit cards, and net banking through our secure checkout.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll receive a tracking link via email. You can also reach out to us directly for updates.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we only ship within India. International shipping may be added in the future.",
  },
];

export default function FAQ() {
  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-6 md:px-10 pt-32 pb-20"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl tracking-[0.2em] uppercase mb-10 text-center">
            Frequently Asked Questions
          </h1>

          <div className="flex flex-col gap-6">
            {faqs.map((item, i) => (
              <div key={i} className="pb-6" style={{ borderBottom: "1px solid #222" }}>
                <h2 className="text-sm tracking-wide mb-2 font-semibold">{item.q}</h2>
                <p className="text-sm opacity-70 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <p className="text-xs opacity-50 text-center mt-12">
            Still have questions? Reach us at{" "}
            <a href="mailto:contact.nowhen@gmail.com" className="underline">
              contact.nowhen@gmail.com
            </a>
          </p>
        </div>
      </main>
    </>
  );
}