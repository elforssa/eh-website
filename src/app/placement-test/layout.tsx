import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placement Test Booking | English Hills",
  description: "Book your free placement test at English Hills Language Center in Bouskoura.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
