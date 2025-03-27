import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  onUpdate: (id: string, updatedVenue: Venue) => void;
}

export default function VenueTable({ venues, onDelete, onUpdate }: VenueTableProps) {
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [editedVenue, setEditedVenue] = useState<Venue | null>(null);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);

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

  // edit handler
  const handleEditClick = (venue: Venue) => {
    setEditingVenue(venue);
    setEditedVenue({ ...venue });
  };

  // field change handler
  const handleFieldChange = (field: keyof Venue, value: string | number) => {
    if (editedVenue) {
      setEditedVenue({
        ...editedVenue,
        [field]: value
      });
    }
  };

  // update confirmation handler
  const handleConfirmUpdate = () => {
    if (editedVenue && editedVenue._id) {
      onUpdate(editedVenue._id, editedVenue);
      setEditingVenue(null);
      setEditedVenue(null);
      setShowUpdateConfirmation(false);
    }
  };

  // cancel modification handler
  const handleCancelEdit = () => {
    setEditingVenue(null);
    setEditedVenue(null);
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
              <TableCell>
                {editingVenue?._id === venue._id ? (
                  <Input
                    value={editedVenue?.faculty || ""}
                    onChange={(e) => handleFieldChange("faculty", e.target.value)}
                  />
                ) : (
                  venue.faculty
                )}
              </TableCell>
              <TableCell>
                {editingVenue?._id === venue._id ? (
                  <Input
                    value={editedVenue?.building || ""}
                    onChange={(e) => handleFieldChange("building", e.target.value)}
                  />
                ) : (
                  venue.building
                )}
              </TableCell>
              <TableCell>
                {editingVenue?._id === venue._id ? (
                  <Input
                    value={editedVenue?.hallName || ""}
                    onChange={(e) => handleFieldChange("hallName", e.target.value)}
                  />
                ) : (
                  venue.hallName
                )}
              </TableCell>
              <TableCell>
                {editingVenue?._id === venue._id ? (
                  <Select
                    value={editedVenue?.type}
                    onValueChange={(value) => handleFieldChange("type", value as "lecture" | "tutorial" | "lab")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="lab">Lab</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  venue.type
                )}
              </TableCell>
              <TableCell>
                {editingVenue?._id === venue._id ? (
                  <Input
                    type="number"
                    value={editedVenue?.capacity || ""}
                    onChange={(e) => handleFieldChange("capacity", Number(e.target.value))}
                  />
                ) : (
                  venue.capacity
                )}
              </TableCell>
              <TableCell className="flex flex-row justify-center items-center gap-3">
                {editingVenue?._id === venue._id ? (
                  <>
                    <Button variant="outline" onClick={() => setShowUpdateConfirmation(true)}>
                      Save
                    </Button>
                    <Button variant="destructive" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => handleEditClick(venue)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteClick(venue)}>
                      Delete
                    </Button>
                  </>
                )}
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

      {/* update confirmation pop up message */}
      <AlertDialog open={showUpdateConfirmation} onOpenChange={setShowUpdateConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this venue?
              <div className="mt-2 space-y-1">
                <p><strong>Hall Name:</strong> {editedVenue?.hallName}</p>
                <p><strong>Type:</strong> {editedVenue?.type}</p>
                <p><strong>Faculty:</strong> {editedVenue?.faculty}</p>
                <p><strong>Building:</strong> {editedVenue?.building}</p>
                <p><strong>Capacity:</strong> {editedVenue?.capacity}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpdate}>Yes, Update</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

