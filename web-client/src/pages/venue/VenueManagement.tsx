import { useState, useEffect } from "react";
import VenueForm from "@/components/venue/VenueForm";
import VenueTable from "@/components/venue/VenueTable";
import { Card, CardContent } from "@/components/ui/card";
import { getVenues, deleteVenue, updateVenue } from "@/services/venue.service";
import { toast } from "sonner";

export default function VenueManagement() {
  const [venues, setVenues] = useState<any[]>([]);
  const [editingVenue, setEditingVenue] = useState<any | null>(null);

  const fetchVenues = async () => {
    try {
      const data = await getVenues();
      setVenues(data);
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Failed to fetch venues");
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleAddOrUpdate = async (venue: any) => {
    try {
      // Check for duplicate hall name
      const duplicateHall = venues.find(v => v.hallName.toLowerCase() === venue.hallName.toLowerCase());
      if (duplicateHall) {
        toast.error("A hall with this name already exists! Please use a different name.");
        return;
      }

      // Check for lab overlap
      if (venue.type === "lab") {
        const overlappingLab = venues.find(v => v.type === "lab" && v.hallName === venue.hallName);
        if (overlappingLab) {
          toast.error("Lab sessions cannot overlap! Please choose another hall.");
          return;
        }
      }

      // Refresh venues after adding/updating
      await fetchVenues();
      setEditingVenue(null);
      toast.success(editingVenue ? "Venue updated successfully!" : "Venue added successfully!");
    } catch (error) {
      console.error("Error handling venue:", error);
      toast.error("Failed to save venue");
    }
  };

  const handleEdit = (venue: any) => {
    setEditingVenue(venue);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVenue(id);
      await fetchVenues(); // Refresh the venues list
      toast.success("Venue deleted successfully!");
    } catch (error) {
      console.error("Error deleting venue:", error);
      toast.error("Failed to delete venue");
    }
  };

  const handleUpdate = async (id: string, updatedVenue: any) => {
    try {
      await updateVenue(id, updatedVenue);
      await fetchVenues(); // Refresh the venues list
      toast.success("Venue updated successfully!");
    } catch (error) {
      console.error("Error updating venue:", error);
      toast.error("Failed to update venue");
    }
  };

  return (
    <div className="p-4 space-y-6 justify-center">
      <div className="h-screen flex justify-center items-center">
        <CardContent>
          <h2 className="text-xl font-bold mb-3">Manage Venues</h2>
          <VenueForm onSubmit={handleAddOrUpdate} initialData={editingVenue} onSuccess={fetchVenues} />
        </CardContent>
      </div>

      <div className="flex justify-center items-center">
        <Card className="w-240">
          <CardContent>
            <h2 className="text-xl font-bold mb-3">Allocated Venues</h2>
            <VenueTable 
              venues={venues} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
