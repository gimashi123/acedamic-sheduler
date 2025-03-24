import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { deleteGroup, getGroups } from "@/services/group.service";

interface GroupTableProps {
  groups: any[];
  onEdit: (group: any) => void;
  onDelete: (id: string) => void;
}

// newly added
interface Group {
  _id?: string;
  name: string;
  faculty: string;
  year: number;
  semester: number;
  type: string,
  maxStudents: number;
}

export default function GroupTable({ onEdit }: GroupTableProps) {

  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  // declaration of the fetchGroups()
  const fetchGroups = async() => {
    const data = await getGroups();
    setGroups(data);
  }

  // handle delete
const handleDelete = async (id?: string) => {
  if(id) {
    await deleteGroup(id);
    fetchGroups();
  }
}

  return (
    <Table className="w-full border">
      <TableHeader>
        <TableRow className="">
          <TableHead>Name</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Semester</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="flex justify-center items-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          <TableRow key={group._id}>
            <TableCell>{group.name}</TableCell>
            <TableCell>{group.year}</TableCell>
            <TableCell>{group.semester}</TableCell>
            <TableCell>{group.type}</TableCell>

            <TableCell className="flex flex-row justify-center items-center gap-3">
              <Button variant="outline" onClick={() => onEdit(group)}>Edit</Button>
              <Button variant="destructive" onClick={() => handleDelete(group._id)}>Delete</Button>
            </TableCell>

          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
