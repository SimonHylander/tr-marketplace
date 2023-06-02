import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="flex w-full justify-end p-5 text-white">
      <Link href="/ads">Annonser</Link>
    </nav>
  );
};

export default Navbar;
