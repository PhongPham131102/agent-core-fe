"use client";

import { useEffect } from "react";

import { ErrorView } from "@/components/common";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorView error={error} retry={retry} />;
}
