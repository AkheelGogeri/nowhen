import Image from "next/image";
import Navbar from "./Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: "#000000" }}
      >
        <Image
          src="/logo.png"
          alt="Nowhen"
          width={500}
          height={350}
          priority
        />
      </main>
    </>
  );
}