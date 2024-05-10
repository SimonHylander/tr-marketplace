import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const Navbar = () => {
  const router = useRouter();

  const [isOpen, setOpen] = useState(false);

  return (
    <nav className="flex w-full justify-between p-5 text-white">
      <div>
        {router.pathname !== "/ads" && (
          <Link href="/ads" className="flex gap-2">
            <ArrowLeft />
            Annonser
          </Link>
        )}
      </div>

      <DropdownMenu open={isOpen} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="flex justify-self-end">
          Byt konto
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Konto</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Säljare</DropdownMenuItem>
          <DropdownMenuItem>Köpare</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default Navbar;
