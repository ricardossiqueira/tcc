import { ModeToggle } from "./ThemeDropdown";
import { Button } from "./ui/button";

export function SideMenu({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section>
      <header
        className="dark:bg-black bg-white border-b px-5 flex w-full items-center h-12 justify-between"
        aria-label="Header"
      >
        <ul className="flex flex-row items-center">
          <li className="font-normal text-lg px-3">
            Logo
          </li>
          <li className="font-normal text-base px-3">
            <Button variant="link" aria-label="Home">
              Home
            </Button>
          </li>
        </ul>
        <ModeToggle />
      </header>
      <section className="overflow-y-auto max-h-screen w-full">
        {children}
      </section>
    </section>
  );
}
