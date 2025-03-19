import React from "react";
import { Loader2 } from 'lucide-react';

export function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
