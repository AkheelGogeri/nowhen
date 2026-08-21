import Navbar from "../Navbar";

export default function Terms() {
  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-6 md:px-10 pt-32 pb-20"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl tracking-[0.2em] uppercase mb-10 text-center">
            Terms &amp; Conditions
          </h1>

          <div className="flex flex-col gap-8 text-sm opacity-80 leading-relaxed">
            <section>
              <h2 className="text-sm font-semibold mb-2 opacity-100">1. General</h2>
              <p>
                By accessing and using nowhen.in, you agree to be bound by these terms and
                conditions. Nowhen reserves the right to update these terms at any time
                without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2 opacity-100">2. Orders &amp; Payment</h2>
              <p>
                All orders are subject to availability. Prices are listed in INR and are
                inclusive of applicable taxes unless stated otherwise. Payment is processed
                securely through our third-party payment partner.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2 opacity-100">3. Shipping</h2>
              <p>
                We currently ship within India only. Estimated delivery timelines are
                provided at checkout and may vary due to factors outside our control.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2 opacity-100">4. Returns &amp; Exchanges</h2>
              <p>
                Items may be returned or exchanged within 10 days of delivery, provided they
                are unworn and in original condition with tags attached. See our FAQ for
                details.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2 opacity-100">5. Intellectual Property</h2>
              <p>
                All designs, logos, and content on this site are the property of Nowhen and
                may not be reproduced without permission.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2 opacity-100">6. Contact</h2>
              <p>
                For any questions regarding these terms, reach out to us at{" "}
                <a href="mailto:contact.nowhen@gmail.com" className="underline">
                  contact.nowhen@gmail.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}