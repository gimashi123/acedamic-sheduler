import { useState, useEffect } from "react";
import VenueForm from "@/components/venue/VenueForm";
import VenueTable from "@/components/venue/VenueTable";
import { Card, CardContent } from "@/components/ui/card";

export default function VenueManagement() {
  const [venues, setVenues] = useState<any[]>([]);
  const [editingVenue, setEditingVenue] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/venues")
      .then((res) => res.json())
      .then((data) => setVenues(data));
  }, []);

  const handleAddOrUpdate = (venue: any) => {
    const duplicateHall = venues.find(v => v.hall.toLowerCase() === venue.hall.toLowerCase());
  
    if (duplicateHall) {
      alert("A hall with this name already exists! Please use a different name.");
      return;
    }
  
    if (venue.type === "lab") {
      const overlappingLab = venues.find(v => v.type === "lab" && v.hall === venue.hall);
      if (overlappingLab) {
        alert("Lab sessions cannot overlap! Please choose another hall.");
        return;
      }
    }
  
    if (editingVenue) {
      setVenues(venues.map((v) => (v.id === venue.id ? venue : v)));
      setEditingVenue(null);
    } else {
      setVenues([...venues, { ...venue, id: Date.now().toString() }]);
    }
  };
  
  

  const handleEdit = (venue: any) => {
    setEditingVenue(venue);
  };

  const handleDelete = (id: string) => {
    setVenues(venues.filter((v) => v.id !== id));
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold">Manage Venues</h2>
          <VenueForm onSubmit={handleAddOrUpdate} initialData={editingVenue} />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <VenueTable venues={venues} onEdit={handleEdit} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
