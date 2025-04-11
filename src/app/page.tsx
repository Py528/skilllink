import Example from "@/components/example"
import { ModeToggle } from "@/components/ModeToggle";
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
       <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-4xl font-bold">Build Skills. Submit Projects. Get Hired.  </h1>
      <Example />
      <ModeToggle />
    </main>
    </div>
  );
}
