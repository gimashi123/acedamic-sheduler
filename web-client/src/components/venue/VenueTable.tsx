import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { deleteVenue, getVenues, updateVenue } from "@/services/venue.service";

// newly added
interface Venue {
  _id?: string,
  faculty: string,
  building: string,
  hallName: string,
  type: "lecture" | "tutorial" | "lab",
  capacity: number
};

export default function VenueTable() {

  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    fetchVenues();
  }, []);

  // declaration of the fetchVenues()
  const fetchVenues = async() => {
    const data = await getVenues();
    setVenues(data);
  }

  // handle delete
  const handleDelete = async(_id?: string) => {
    if(_id) {
      await deleteVenue(_id);
      fetchVenues();
    }
  }

  // handle update
  const handleUpdate = async(_id?: string) => {
    if(_id) {
      const venueData = venues.find(venue => venue._id === _id);
      if (venueData) {
        await updateVenue(_id, venueData);
      }
      fetchVenues();
    }
  }

  return (
    <Table className="w-full border">
      <TableHeader>
        <TableRow>
          <TableHead>Faculty</TableHead>
          <TableHead>Building</TableHead>
          <TableHead>Hall</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead className="flex justify-center items-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {venues.map((venue) => (
          <TableRow key={venue._id}>
            
            <TableCell>{venue.faculty}</TableCell>
            <TableCell>{venue.building}</TableCell>
            <TableCell>{venue.hallName}</TableCell>
            <TableCell>{venue.type}</TableCell>
            <TableCell>{venue.capacity}</TableCell>

            <TableCell className="flex flex-row justify-center items-center gap-3">
              <Button variant="outline" onClick={() => handleUpdate(venue._id)}>Edit</Button>
              <Button variant="destructive" onClick={() => handleDelete(venue._id)}>Delete</Button>
            </TableCell>
            
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

