import Navbar from "../Navbar";

export default function Contact() {
  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-8 py-16 flex flex-col items-center"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        <h1 className="text-3xl tracking-widest mb-8">CONTACT</h1>

        <div className="max-w-md text-center opacity-90">
          <p className="mb-4">Questions, order issues, or anything else — reach out:</p>
          <p className="mb-2">
            <a href="mailto:contact.nowhen@gmail.com" className="underline">
              contact.nowhen@gmail.com
            </a>
          </p>
          <p className="opacity-70 text-sm mt-6">
            We usually respond within 24–48 hours.
          </p>
        </div>
      </main>
    </>
  );
}