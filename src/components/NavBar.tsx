import Link from "next/link";

export function NavBar() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          Museum Tools
        </Link>
        <Link href="/cases" className="text-sm hover:underline">
          Display Cases
        </Link>
        <Link href="/projects" className="text-sm hover:underline">
          Projects
        </Link>
        <Link href="/objects" className="text-sm hover:underline">
          Objects
        </Link>
      </nav>
    </header>
  );
}
