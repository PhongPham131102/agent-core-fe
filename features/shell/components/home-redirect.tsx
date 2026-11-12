"use client";

import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useShellMenu } from "../hooks/use-shell-menu";
import { resolveLandingRoute } from "../menu";

export function HomeRedirect() {
  const router = useRouter();
  const target = resolveLandingRoute(useShellMenu());

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return (
    <div className="flex justify-center py-24" role="status">
      <Spin />
    </div>
  );
}
