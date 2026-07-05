"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AdminPageGuardProps = {
  fallbackHref: string;
};

export default function AdminPageGuard({
  fallbackHref,
}: AdminPageGuardProps) {
  const router = useRouter();

  useEffect(() => {
    window.alert("접근할 수 없는 페이지입니다.");

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  }, [fallbackHref, router]);

  return null;
}
