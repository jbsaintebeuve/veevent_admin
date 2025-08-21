import { useState, useMemo } from "react";
import { EventParticipant } from "@/types/event";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Users, X } from "lucide-react";

interface EventParticipantsTableProps {
  participants: EventParticipant[];
  totalElements: number;
  isLoading?: boolean;
}

export function EventParticipantsTable({
  participants,
  totalElements,
  isLoading = false,
}: EventParticipantsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredParticipants = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return participants.filter((participant) => {
      const pseudo = (participant.pseudo ?? "").toLowerCase();
      const id = String(participant.id ?? "").toLowerCase();
      return pseudo.includes(s) || id.includes(s);
    });
  }, [participants, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search-participants">Rechercher un participant</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="search-participants"
            placeholder="Rechercher par pseudo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card shadow-xs animate-pulse"
              >
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
                <div className="h-5 bg-muted rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {searchTerm ? (
              <>
                <Search className="mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium text-muted-foreground mb-1">
                  Aucun participant trouvé
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Aucun participant ne correspond à votre recherche &quot;
                  {searchTerm}&quot;
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                >
                  Effacer la recherche
                </Button>
              </>
            ) : (
              <>
                <Users className="mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium text-muted-foreground mb-1">
                  Aucun participant
                </h3>
                <p className="text-sm text-muted-foreground">
                  Aucun participant n'est inscrit à cet événement.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredParticipants.map((participant, index) => (
              <div
                key={`${participant.id}-${index}`}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card shadow-xs hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={participant.imageUrl || undefined}
                    alt={participant.pseudo}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {participant.pseudo.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {participant.pseudo}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ID: {participant.id}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  {participant.id}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
