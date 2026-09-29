"use client";

import React from "react";
import Link, { LinkProps } from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchRouteData } from "@/hooks/usePrefetchPage";

interface PrefetchLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
  "aria-label"?: string;
  "aria-current"?: "page" | "step" | "location" | "date" | "time" | boolean;
}

/**
 * Universal Zero-Latency Link Component
 * Combines Next.js App Router viewport prefetching with TanStack Query on-hover/focus data prefetching.
 */
export default function PrefetchLink({
  href,
  children,
  className,
  onMouseEnter,
  onFocus,
  ...props
}: PrefetchLinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const queryClient = useQueryClient();

  const handlePrefetch = () => {
    if (typeof href === "string") {
      prefetchRouteData(queryClient, href);
    }
  };

  return (
    <Link
      href={href}
      className={className}
      prefetch={true}
      onMouseEnter={(e) => {
        handlePrefetch();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        handlePrefetch();
        onFocus?.(e);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
