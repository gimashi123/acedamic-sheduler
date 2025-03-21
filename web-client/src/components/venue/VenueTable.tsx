import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface VenueTableProps {
  venues: any[];
  onEdit: (venue: any) => void;
  onDelete: (id: string) => void;
}

export default function VenueTable({ venues, onEdit, onDelete }: VenueTableProps) {
  return (
    <Table className="w-full border">
      <TableHeader>
        <TableRow>
          <TableHead>Faculty</TableHead>
          <TableHead>Building</TableHead>
          <TableHead>Hall</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {venues.map((venue) => (
          <TableRow key={venue.id}>
            <TableCell>{venue.faculty}</TableCell>
            <TableCell>{venue.building}</TableCell>
            <TableCell>{venue.hall}</TableCell>
            <TableCell>{venue.type}</TableCell>
            <TableCell>{venue.capacity}</TableCell>
            <TableCell>
              <Button variant="outline" onClick={() => onEdit(venue)}>Edit</Button>
              <Button variant="destructive" onClick={() => onDelete(venue.id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

