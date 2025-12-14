import React from "react";

const Layout = ({ children }) => (
  <div className="min-h-screen w-full">
    <main className="w-full px-[29px] py-7">{children}</main>
  </div>
);

export default Layout;
