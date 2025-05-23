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

interface Group { // removed faculty, semester and groupType fileds
  _id?: string;
  name: string;
  // faculty: string;
  department: string;
  year: number;
  // semester: number;
  // groupType: "weekday" | "weekend";
  students: string[];
}

interface GroupTableProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedGroup: Group) => void;
}

export default function GroupTable({ groups, onDelete, onUpdate }: GroupTableProps) {
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editedGroup, setEditedGroup] = useState<Group | null>(null);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  

  // delete handler
  const handleDeleteClick = (group: Group) => {
    setGroupToDelete(group);
  };

  // delete confirmation message handler
  const handleConfirmDelete = () => {
    if (groupToDelete?._id) {
      onDelete(groupToDelete._id);
      setGroupToDelete(null);
    }
  };

  // edit handler
  const handleEditClick = (group: Group) => {
    setEditingGroup(group);
    setEditedGroup({ ...group });
    setNameError(null); // Reset name error when starting edit
  };

  // field change handler
  const handleFieldChange = (field: keyof Group, value: string | number | string[]) => {
    if (editedGroup) {
      // Validate name uniqueness when name is changed
      if (field === 'name') {
        const newName = value as string;
        const isNameExists = groups.some(
          group => group.name.toLowerCase() === newName.toLowerCase() && 
                  group._id !== editedGroup._id
        );
        
        if (isNameExists) {
          setNameError('A group with this name already exists');
        } else {
          setNameError(null);
        }
      }
      setEditedGroup({
        ...editedGroup,
        [field]: value
      });
    }
  };

  // update confirmation handler
  const handleConfirmUpdate = () => {
    // Check for name error before proceeding with update
    if (nameError) {
      return;
    }
    
    if (editedGroup && editedGroup._id) {
      onUpdate(editedGroup._id, editedGroup);
      setEditingGroup(null);
      setEditedGroup(null);
      setShowUpdateConfirmation(false);
      setNameError(null);
    }
  };

  // cancel modification handler
  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditedGroup(null);
    setNameError(null);
  };

  return (
    <>
      <Table className="w-full border">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {/* <TableHead>Faculty</TableHead> */}
            <TableHead>Department</TableHead>
            <TableHead>Year</TableHead>
            {/* <TableHead>Semester</TableHead> */}
            {/* <TableHead>Type</TableHead> */}
            <TableHead className="flex justify-center items-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group._id}>
              <TableCell>
                {editingGroup?._id === group._id ? (
                  <div className="flex flex-col gap-1">
                    <Input
                      value={editedGroup?.name || ""}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      className={nameError ? "border-red-500" : ""}
                    />
                    {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
                  </div>
                ) : (
                  group.name
                )}
              </TableCell>
              {/* <TableCell>
                {editingGroup?._id === group._id ? (
                  <Input
                    value={editedGroup?.faculty || ""}
                    onChange={(e) => handleFieldChange("faculty", e.target.value)}
                  />
                ) : (
                  group.faculty
                )}
              </TableCell> */}
              <TableCell>
                {editingGroup?._id === group._id ? (
                  <Input
                    value={editedGroup?.department || ""}
                    onChange={(e) => handleFieldChange("department", e.target.value)}
                  />
                ) : (
                  group.department
                )}
              </TableCell>
              <TableCell>
                {editingGroup?._id === group._id ? (
                  <Select
                    onValueChange={(value) => handleFieldChange("year", Number(value))}
                    value={editedGroup?.year.toString()}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  `Year ${group.year}`
                )}
              </TableCell>
              {/* <TableCell>
                {editingGroup?._id === group._id ? (
                  <Input
                    type="number"
                    value={editedGroup?.semester || ""}
                    onChange={(e) => handleFieldChange("semester", Number(e.target.value))}
                  />
                ) : (
                  group.semester
                )}
              </TableCell> */}

              {/* <TableCell>
                {editingGroup?._id === group._id ? (
                  <Select
                    value={editedGroup?.groupType}
                    onValueChange={(value) => handleFieldChange("groupType", value as "weekday" | "weekend")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekday">Weekday</SelectItem>
                      <SelectItem value="weekend">Weekend</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  group.groupType
                )}
              </TableCell> */}
              <TableCell className="flex flex-row justify-center items-center gap-3">
                {editingGroup?._id === group._id ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUpdateConfirmation(true)}
                      disabled={!!nameError}
                    >
                      Save
                    </Button>
                    <Button variant="destructive" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => handleEditClick(group)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteClick(group)}>
                      Delete
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* delete confirmation pop up message */}
      <AlertDialog open={!!groupToDelete} onOpenChange={() => setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this group?
              <div className="mt-2 space-y-1">
                <p><strong>Group Name:</strong> {groupToDelete?.name}</p>
                <p><strong>Department:</strong> {groupToDelete?.department}</p>
                <p><strong>Year:</strong> {groupToDelete?.year}</p>
                {/* <p><strong>Type:</strong> {groupToDelete?.groupType}</p> */}
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
              Are you sure you want to update this group?
              <div className="mt-2 space-y-1">
                <p><strong>Group Name:</strong> {editedGroup?.name}</p>
                {/* <p><strong>Faculty:</strong> {editedGroup?.faculty}</p> */}
                <p><strong>Department:</strong> {editedGroup?.department}</p>
                <p><strong>Year:</strong> {editedGroup?.year}</p>
                {/* <p><strong>Semester:</strong> {editedGroup?.semester}</p> */}
                {/* <p><strong>Type:</strong> {editedGroup?.groupType}</p> */}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmUpdate} 
              disabled={!!nameError}
            >
              Yes, Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
