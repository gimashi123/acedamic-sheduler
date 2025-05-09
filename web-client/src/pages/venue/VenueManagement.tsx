import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Loader2, Pencil, FileIcon } from "lucide-react";
import { getVenues, deleteVenue } from "@/services/venue.service";
import { toast } from "sonner";
import VenueForm from "@/components/venue/VenueForm";
import { exportToPdf } from '@/utils/pdf-utils.tsx';


interface Venue {
  id: string;
  department: string;
  building: string;
  hallName: string;
  type: "lecture" | "tutorial" | "lab";
  capacity: number;
}

export default function VenueManagement() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchVenues = async () => {
    try {
      const data = await getVenues();
      setVenues(data);
    } catch (error) {
      toast.error("Failed to fetch venues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues().then();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteVenue(id);
      await fetchVenues();
      toast.success("Venue deleted successfully");
    } catch (error) {
      toast.error("Failed to delete venue");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportToPdf = () => {
    exportToPdf({
      title: `venue List`,
      filename: `venues-${new Date().toISOString().split('T')[0]}`,
      columns: [
        { header: 'Hall Name', dataKey: 'hallName' },
        { header: 'Building', dataKey: 'building' },
        { header: 'Department', dataKey: 'department' },
        { header: 'Type', dataKey: 'type' },
        { header: 'Capacity', dataKey: 'capacity' },
      ],
      data: venues,
    });
    toast.success('PDF exported successfully');
  };

  const filteredVenues = venues.filter(venue =>
    venue.hallName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Venue Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage all university venues and their details
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <Input
              placeholder="Search venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <VenueForm onSuccess={fetchVenues} mode="add">
              <Button>Add New Venue</Button>
            </VenueForm>
            <Button onClick={handleExportToPdf} variant="outline" className="gap-2">
              <FileIcon className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Hall Name</TableHead>
                  <TableHead className="min-w-[150px]">Building</TableHead>
                  <TableHead className="min-w-[150px]">Department</TableHead>
                  <TableHead className="min-w-[120px]">Type</TableHead>
                  <TableHead className="min-w-[100px]">Capacity</TableHead>
                  <TableHead className="min-w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : filteredVenues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No venues found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVenues.map((venue) => (
                    <TableRow key={venue.id}>
                      <TableCell className="font-medium">{venue.hallName}</TableCell>
                      <TableCell>{venue.building}</TableCell>
                      <TableCell>{venue.department}</TableCell>
                      <TableCell>
                        <span className="capitalize px-2 py-1 rounded bg-accent text-accent-foreground">
                          {venue.type}
                        </span>
                      </TableCell>
                      <TableCell>{venue.capacity}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <VenueForm
                            mode="edit"
                            initialData={venue}
                            onSuccess={fetchVenues}
                          >
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4 mr-2" />
                            </Button>
                          </VenueForm>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(venue.id)}
                            disabled={deletingId === venue.id}
                          >
                            {deletingId === venue.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}