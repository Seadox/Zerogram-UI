import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingScreen({ isDarkMode }) {
  return (
    <div
      className={`h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      } flex items-center justify-center`}
    >
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 w-32" />
          <Skeleton className="h-32 w-32" />
        </div>
      </div>
    </div>
  );
}
