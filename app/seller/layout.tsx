import SellerShell from "./SellerShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SellerShell>{children}</SellerShell>;
}
