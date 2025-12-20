import React from "react";
import { Navbar } from "../nav";
import { Footer } from "../footer";

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};


