import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  LogOut,
  Download,
  Filter,
  Users,
  Car,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { indianStates } from "@/data/indianStates";
import { format } from "date-fns";

interface Registration {
  id: string;
  full_name: string;
  mobile: string;
  email: string;
  aadhaar: string;
  photo_url: string | null;
  present_address: string | null;
  present_city: string | null;
  present_district: string | null;
  present_state: string | null;
  present_pincode: string | null;
  permanent_address: string | null;
  permanent_city: string | null;
  permanent_district: string | null;
  permanent_state: string | null;
  permanent_pincode: string | null;
  same_as_present: boolean;
  location_link: string | null;
  has_vehicle: boolean;
  vehicle_types: string[] | null;
  education: string;
  application_id: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  
  const { signOut, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchRegistrations();
    }
  }, [isAdmin]);

  useEffect(() => {
    applyFilters();
  }, [registrations, searchQuery, stateFilter, districtFilter, vehicleFilter]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch registrations");
      console.error(error);
    } else {
      setRegistrations(data || []);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...registrations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.full_name.toLowerCase().includes(query) ||
          r.mobile.includes(query) ||
          r.application_id.toLowerCase().includes(query) ||
          r.email.toLowerCase().includes(query)
      );
    }

    if (stateFilter && stateFilter !== "all") {
      filtered = filtered.filter((r) => r.present_state === stateFilter || r.permanent_state === stateFilter);
    }

    if (districtFilter) {
      filtered = filtered.filter((r) =>
        r.present_district?.toLowerCase().includes(districtFilter.toLowerCase()) ||
        r.permanent_district?.toLowerCase().includes(districtFilter.toLowerCase())
      );
    }

    if (vehicleFilter && vehicleFilter !== "all") {
      if (vehicleFilter === "yes") {
        filtered = filtered.filter((r) => r.has_vehicle);
      } else {
        filtered = filtered.filter((r) => !r.has_vehicle);
      }
    }

    setFilteredRegistrations(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStateFilter("all");
    setDistrictFilter("");
    setVehicleFilter("all");
  };

  const exportToCSV = () => {
    const headers = [
      "Application ID",
      "Full Name",
      "Mobile",
      "Email",
      "Aadhaar",
      "Present Address",
      "Present City",
      "Present District",
      "Present State",
      "Present Pincode",
      "Permanent Address",
      "Permanent City",
      "Permanent District",
      "Permanent State",
      "Permanent Pincode",
      "Same As Present",
      "Location Link",
      "Has Vehicle",
      "Vehicle Types",
      "Education",
      "Registered At",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredRegistrations.map((r) =>
        [
          r.application_id,
          `"${r.full_name}"`,
          r.mobile,
          r.email,
          r.aadhaar,
          `"${(r.present_address || "").replace(/"/g, '""')}"`,
          r.present_city || "",
          r.present_district || "",
          r.present_state || "",
          r.present_pincode || "",
          `"${(r.permanent_address || "").replace(/"/g, '""')}"`,
          r.permanent_city || "",
          r.permanent_district || "",
          r.permanent_state || "",
          r.permanent_pincode || "",
          r.same_as_present ? "Yes" : "No",
          r.location_link || "",
          r.has_vehicle ? "Yes" : "No",
          r.vehicle_types?.join("; ") || "",
          r.education,
          format(new Date(r.created_at), "yyyy-MM-dd HH:mm:ss"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `jjss-registrations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("CSV exported successfully!");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                Jan Jagran Seva Samiti
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Registrations
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                With Vehicles
              </CardTitle>
              <Car className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registrations.filter((r) => r.has_vehicle).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                States Covered
              </CardTitle>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(registrations.map((r) => r.present_state).filter(Boolean)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, mobile, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by State" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  <SelectItem value="all">All States</SelectItem>
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Filter by District"
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
              />
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Vehicle Ownership" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has Vehicle</SelectItem>
                  <SelectItem value="no">No Vehicle</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button variant="saffron" onClick={exportToCSV} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Registrations ({filteredRegistrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No registrations found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Present State</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          {reg.photo_url ? (
                            <img
                              src={reg.photo_url}
                              alt={reg.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs">
                              N/A
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {reg.application_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {reg.full_name}
                        </TableCell>
                        <TableCell>{reg.mobile}</TableCell>
                        <TableCell>{reg.present_state || "-"}</TableCell>
                        <TableCell>{reg.present_district || "-"}</TableCell>
                        <TableCell>
                          {reg.has_vehicle ? (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-success text-success-foreground">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{reg.education}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(reg.created_at), "dd MMM yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
