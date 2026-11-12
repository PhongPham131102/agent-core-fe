import Image from "next/image";

import { appConfig } from "@/lib/constants/app";

interface IBrandLogoProps {
  size?: number;
  showName?: boolean;
  className?: string;
}

export function BrandLogo({ size = 32, showName = true, className = "" }: IBrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image src={appConfig.logo} alt="UID" width={size} height={size} unoptimized priority />
      {showName && <span className="text-base font-semibold">{appConfig.name}</span>}
    </span>
  );
}
