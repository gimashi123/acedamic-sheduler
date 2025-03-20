import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface GroupTableProps {
  groups: any[];
  onEdit: (group: any) => void;
  onDelete: (id: string) => void;
}

export default function GroupTable({ groups, onEdit, onDelete }: GroupTableProps) {
  return (
    <Table className="w-full border">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Semester</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          <TableRow key={group.id}>
            <TableCell>{group.name}</TableCell>
            <TableCell>{group.year}</TableCell>
            <TableCell>{group.semester}</TableCell>
            <TableCell>{group.type}</TableCell>
            <TableCell>
              <Button variant="outline" onClick={() => onEdit(group)}>Edit</Button>
              <Button variant="destructive" onClick={() => onDelete(group.id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
