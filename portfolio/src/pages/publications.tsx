import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PublicationsPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, [router]);
  return null;
}
