"use client";

import { Spin } from "antd";

export function FullPageSpinner({ tip }: { tip?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3" role="status">
      <Spin size="large" />
      {tip && <span className="text-sm text-black/45">{tip}</span>}
    </div>
  );
}
