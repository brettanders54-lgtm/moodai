import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { az } from "date-fns/locale";
import { cn } from "@/lib/utils";

const MOOD_CONFIG = {
  "Əla": { icon: Smile, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Əla" },
  "Yaxşı": { icon: Smile, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Yaxşı" },
  "Normal": { icon: Meh, color: "text-amber-500", bg: "bg-amber-500/10", label: "Normal" },
  "Pis": { icon: Frown, color: "text-rose-500", bg: "bg-rose-500/10", label: "Pis" },
  "Çox pis": { icon: Frown, color: "text-rose-500", bg: "bg-rose-500/10", label: "Çox pis" },
};

export default function EmployeeResponsesNew() {
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [moodFilter, setMoodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: responses = [], isLoading, refetch } = useQuery({
    queryKey: ["employee-responses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_responses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Get unique branches for filter
  const branches = useMemo(() => {
    const unique = [...new Set(responses.map((r: any) => r.branch).filter(Boolean))];
    return unique.sort();
  }, [responses]);

  // Filter responses
  const filteredResponses = useMemo(() => {
    return responses.filter((r: any) => {
      if (searchTerm && !r.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !r.department?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (branchFilter !== "all" && r.branch !== branchFilter) {
        return false;
      }
      if (moodFilter !== "all" && r.mood !== moodFilter) {
        return false;
      }
      return true;
    });
  }, [responses, searchTerm, branchFilter, moodFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / pageSize);
  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats
  const stats = useMemo(() => {
    const total = responses.length;
    const moodCounts = responses.reduce((acc: any, r: any) => {
      acc[r.mood] = (acc[r.mood] || 0) + 1;
      return acc;
    }, {});
    return {
      total,
      moodCounts,
      goodPercent: total > 0 ? Math.round(((moodCounts["Əla"] || 0) + (moodCounts["Yaxşı"] || 0)) / total * 100) : 0,
      normalPercent: total > 0 ? Math.round((moodCounts["Normal"] || 0) / total * 100) : 0,
      badPercent: total > 0 ? Math.round(((moodCounts["Pis"] || 0) + (moodCounts["Çox pis"] || 0)) / total * 100) : 0,
    };
  }, [responses]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">İşçi Cavabları</h1>
            <p className="text-muted-foreground">Sorğu nəticələri və əhval təhlili</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Yenilə
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ümumi Cavablar</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <Smile className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Yaxşı</p>
                  <p className="text-2xl font-bold">{stats.goodPercent}%</p>
                  <Progress value={stats.goodPercent} className="h-2 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Meh className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Normal</p>
                  <p className="text-2xl font-bold">{stats.normalPercent}%</p>
                  <Progress value={stats.normalPercent} className="h-2 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-rose-500/10">
                  <Frown className="h-6 w-6 text-rose-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Pis</p>
                  <p className="text-2xl font-bold">{stats.badPercent}%</p>
                  <Progress value={stats.badPercent} className="h-2 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Cavab Siyahısı</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="İşçi кodu və ya departament..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Bütün filialar</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={moodFilter} onValueChange={setMoodFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Əhval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Hamısı</SelectItem>
                    <SelectItem value="Əla">Əla</SelectItem>
                    <SelectItem value="Yaxşı">Yaxşı</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Pis">Pis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İşçi Kodu</TableHead>
                  <TableHead>Filial</TableHead>
                  <TableHead>Departament</TableHead>
                  <TableHead>Əhval</TableHead>
                  <TableHead>Səbəb</TableHead>
                  <TableHead>Tarix</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Yüklənir...
                    </TableCell>
                  </TableRow>
                ) : paginatedResponses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nəticə tapılmadı
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedResponses.map((response: any) => {
                    const moodConfig = MOOD_CONFIG[response.mood as keyof typeof MOOD_CONFIG] || MOOD_CONFIG["Normal"];
                    const MoodIcon = moodConfig.icon;
                    return (
                      <TableRow key={response.id}>
                        <TableCell className="font-medium">{response.employee_code || "-"}</TableCell>
                        <TableCell>{response.branch || "-"}</TableCell>
                        <TableCell>{response.department || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("gap-1", moodConfig.bg, moodConfig.color)}>
                            <MoodIcon className="h-3 w-3" />
                            {moodConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {response.reason_category || response.reason || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {response.response_date
                            ? new Date(response.response_date).toLocaleDateString("az-AZ")
                            : new Date(response.created_at).toLocaleDateString("az-AZ")}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredResponses.length)} / {filteredResponses.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}