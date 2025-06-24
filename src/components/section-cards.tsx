"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface CardData {
  id: string;
  title: string;
  description: string;
  value: string | number;
  trend: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  footer: {
    primary: string;
    secondary: string;
  };
}

interface SectionCardsProps {
  cards: CardData[];
  className?: string;
  gridCols?: 1 | 2 | 3 | 4;
}

export function SectionCards({
  cards,
  className = "",
  gridCols = 4,
}: SectionCardsProps) {
  const gridClasses = {
    1: "@xl/main:grid-cols-1",
    2: "@xl/main:grid-cols-2",
    3: "@xl/main:grid-cols-2 @5xl/main:grid-cols-3",
    4: "@xl/main:grid-cols-2 @5xl/main:grid-cols-4",
  };

  return (
    <div
      className={`
      *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card 
      dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 
      *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs 
      lg:px-6 ${gridClasses[gridCols]} ${className}
    `}
    >
      {cards.map((card) => (
        <Card key={card.id} className="@container/card">
          <CardHeader>
            <CardDescription>{card.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {card.trend.isPositive ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {card.trend.isPositive ? "+" : ""}
                {card.trend.value}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.footer.primary}{" "}
              {card.trend.isPositive ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">{card.footer.secondary}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
