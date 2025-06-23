"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, Calendar, TrendingUp, User } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Cartes de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Événements</CardTitle>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground mt-1">+12 ce mois-ci</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">54</div>
            <p className="text-xs text-muted-foreground mt-1">+3 nouveaux</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <User className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 234</div>
            <p className="text-xs text-muted-foreground mt-1">+45 cette semaine</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Croissance</CardTitle>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,5%</div>
            <p className="text-xs text-muted-foreground mt-1">Stable</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Table pour simuler un graphique/statistiques */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Statistiques visiteurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="3mois" className="w-full">
            <TabsList>
              <TabsTrigger value="3mois">3 mois</TabsTrigger>
              <TabsTrigger value="30j">30 jours</TabsTrigger>
              <TabsTrigger value="7j">7 jours</TabsTrigger>
            </TabsList>
            <TabsContent value="3mois">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Visiteurs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>01/04</TableCell><TableCell>120</TableCell></TableRow>
                  <TableRow><TableCell>15/04</TableCell><TableCell>180</TableCell></TableRow>
                  <TableRow><TableCell>01/05</TableCell><TableCell>210</TableCell></TableRow>
                  <TableRow><TableCell>15/05</TableCell><TableCell>160</TableCell></TableRow>
                  <TableRow><TableCell>01/06</TableCell><TableCell>250</TableCell></TableRow>
                  <TableRow><TableCell>15/06</TableCell><TableCell>300</TableCell></TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="30j">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Visiteurs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>01/06</TableCell><TableCell>250</TableCell></TableRow>
                  <TableRow><TableCell>05/06</TableCell><TableCell>270</TableCell></TableRow>
                  <TableRow><TableCell>10/06</TableCell><TableCell>300</TableCell></TableRow>
                  <TableRow><TableCell>15/06</TableCell><TableCell>320</TableCell></TableRow>
                  <TableRow><TableCell>20/06</TableCell><TableCell>310</TableCell></TableRow>
                  <TableRow><TableCell>25/06</TableCell><TableCell>330</TableCell></TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="7j">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Visiteurs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>24/06</TableCell><TableCell>320</TableCell></TableRow>
                  <TableRow><TableCell>25/06</TableCell><TableCell>330</TableCell></TableRow>
                  <TableRow><TableCell>26/06</TableCell><TableCell>340</TableCell></TableRow>
                  <TableRow><TableCell>27/06</TableCell><TableCell>350</TableCell></TableRow>
                  <TableRow><TableCell>28/06</TableCell><TableCell>360</TableCell></TableRow>
                  <TableRow><TableCell>29/06</TableCell><TableCell>370</TableCell></TableRow>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tableau des derniers événements */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Derniers événements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Concert sous les étoiles</TableCell>
                <TableCell>20/11/2023</TableCell>
                <TableCell>Scène55</TableCell>
                <TableCell><Badge variant="default">À venir</Badge></TableCell>
                <TableCell><Button size="sm" variant="outline">Voir</Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Conférence Tech</TableCell>
                <TableCell>15/10/2023</TableCell>
                <TableCell>Palais Expo</TableCell>
                <TableCell><Badge variant="secondary">Terminé</Badge></TableCell>
                <TableCell><Button size="sm" variant="outline">Voir</Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Atelier Bien-être</TableCell>
                <TableCell>01/09/2023</TableCell>
                <TableCell>Zen Center</TableCell>
                <TableCell><Badge variant="secondary">Terminé</Badge></TableCell>
                <TableCell><Button size="sm" variant="outline">Voir</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 