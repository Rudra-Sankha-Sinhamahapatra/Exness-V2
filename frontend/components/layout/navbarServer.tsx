import React from "react";
import Navbar from "./navbar"; 
import { cookies } from "next/headers";

export default function NavbarServer() {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value ?? null;
  const isAuthenticated = !!token;

  return <Navbar isAuthenticated={isAuthenticated} />;
}
