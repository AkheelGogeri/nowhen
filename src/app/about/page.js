import Navbar from "../Navbar";

export default function About() {
  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-8 pt-32 pb-16 flex flex-col items-center"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        <div className="max-w-xl text-center leading-relaxed opacity-90">
          <p className="mb-6">
            Nowhen isn't about time. It's about moments that stay —
            clothes made to outlast trends, not chase them.
          </p>
          <p>
            Started by three friends working out of a single house,
            Nowhen is built on the belief that good design doesn't
            need a big budget — just conviction, craft, and time
            spent getting it right.
          </p>
        </div>
      </main>
    </>
  );
}