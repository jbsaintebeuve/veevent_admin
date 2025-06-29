import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarGroupProps {
  users: Array<{
    id: number | string;
    firstName: string;
    lastName: string;
    imageUrl?: string | null;
  }>;
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showOverflow?: boolean;
}

export function AvatarGroup({
  users,
  maxDisplay = 5,
  size = "md",
  className,
  showOverflow = true,
}: AvatarGroupProps) {
  const displayedUsers = users.slice(0, maxDisplay);
  const overflowCount = users.length - maxDisplay;

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
        {displayedUsers.map((user) => (
          <Avatar key={user.id} className={cn(sizeClasses[size])}>
            <AvatarImage
              src={user.imageUrl || undefined}
              alt={`${user.firstName} ${user.lastName}`}
            />
            <AvatarFallback className="text-xs">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {showOverflow && overflowCount > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground",
            sizeClasses[size],
            "ml-2"
          )}
        >
          +{overflowCount}
        </div>
      )}
    </div>
  );
}
