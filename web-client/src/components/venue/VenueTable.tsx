import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Venue {
  _id?: string;
  faculty: string;
  building: string;
  hallName: string;
  type: "lecture" | "tutorial" | "lab";
  capacity: number;
}

interface VenueTableProps {
  venues: Venue[];
  onEdit: (venue: Venue) => void;
  onDelete: (id: string) => void;
}

export default function VenueTable({ venues, onEdit, onDelete }: VenueTableProps) {
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);

  // delete handler
  const handleDeleteClick = (venue: Venue) => {
    setVenueToDelete(venue);
  };

  // delete confirmation message handler
  const handleConfirmDelete = () => {
    if (venueToDelete?._id) {
      onDelete(venueToDelete._id);
      setVenueToDelete(null);
    }
  };

  return (
    <>
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
                <Button variant="outline" onClick={() => onEdit(venue)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDeleteClick(venue)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* delete confirmation pop up message*/}
      <AlertDialog open={!!venueToDelete} onOpenChange={() => setVenueToDelete(null)}>
        <AlertDialogContent>

          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this venue?
              <div className="mt-2 space-y-1">
                <p><strong>Hall Name:</strong> {venueToDelete?.hallName}</p>
                <p><strong>Type:</strong> {venueToDelete?.type}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Yes, Delete</AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

