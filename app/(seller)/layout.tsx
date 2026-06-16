import SellerShell from "@/components/sellerShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SellerShell>{children}</SellerShell>;
}
