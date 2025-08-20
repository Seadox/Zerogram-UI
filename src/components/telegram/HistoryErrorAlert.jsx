import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";

export default function HistoryErrorAlert({ error, onClearError }) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mx-6 mt-4 flex-shrink-0 relative">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="pr-8">{error}</AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-red-100"
        onClick={onClearError}
      >
        <X className="h-3 w-3" />
      </Button>
    </Alert>
  );
}
