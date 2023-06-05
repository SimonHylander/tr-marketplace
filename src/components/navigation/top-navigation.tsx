import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const Navbar = () => {
  const router = useRouter();

  return (
    <nav className="flex w-full justify-end p-5 text-white">
      {router.pathname !== "/ads" && <Link href="/ads">Annonser</Link>}
    </nav>
  );
};

export default Navbar;
