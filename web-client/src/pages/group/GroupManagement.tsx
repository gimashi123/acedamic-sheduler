import { useState, useEffect } from "react";
import GroupForm from "@/components/group/GroupForm";
import GroupTable from "@/components/group/GroupTable";
import { Card, CardContent } from "@/components/ui/card";
import { getGroups, deleteGroup, updateGroup } from "@/services/group.service";
import { toast } from "sonner";
import { exportToPdf } from '@/utils/pdf-utils.tsx';
import { Button } from '@/components/ui/button';
import { FileIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GroupManagement() {
  const [groups, setGroups] = useState<any[]>([]);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to fetch groups");
    }
  };

  console.log("Groups: ", groups);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddOrUpdate = async (group: any) => {
    try {
      // check for duplicate group names
      const duplicateGroups = groups.find(v => v.name.toLowerCase() === group.name.toLowerCase());
      if (duplicateGroups) {
        toast.error("A group with this name already exists! Please use a different name.");
        return;
      }

      // refresh group after adding / update
      await fetchGroups();
      setEditingGroup(null);
      toast.success(editingGroup ? "Group Updated Successfully!" : "Group added successfully!");

    } catch (error) {
      console.error("Error handling group: ", error);
      toast.error("Failed to save group");
    }
  };

  const handleEdit = (group: any) => {
    setEditingGroup(group);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGroup(id);
      await fetchGroups();
      toast.success("Group deleted successfully!");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    }
  };

  const handleUpdate = async (id: string, updatedGroup: any) => {
    try {
      // Check for duplicate names excluding the current group
      const duplicateGroups = groups.find(
        group => group.name.toLowerCase() === updatedGroup.name.toLowerCase() &&
          group._id !== id
      );

      if (duplicateGroups) {
        toast.error("A group with this name already exists! Please use a different name.");
        return;
      }

      await updateGroup(id, updatedGroup);
      await fetchGroups();
      toast.success("Group updated successfully!");
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    }
  };

  const handleExportToPdf = () => {
    exportToPdf({
      title: `Existing Groups`,
      filename: `groups-${new Date().toISOString().split('T')[0]}`,
      columns: [
        { header: 'Group Name', dataKey: 'name' },
        { header: 'Faculty', dataKey: 'faculty' },
        { header: 'Department', dataKey: 'department' },
        { header: 'Year', dataKey: 'year' },
        { header: 'Semester', dataKey: 'semester' },
        { header: 'Group Type', dataKey: 'groupType' },
      ],
      data: groups,
    });
    toast.success('PDF exported successfully');
  };

  const filteredGroups = groups.filter(group =>
    (group.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.faculty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.groupType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.semester ? group.semester.toString() : '').includes(searchTerm) ||
    (group.year ? group.year.toString() : '').includes(searchTerm)
  );

  return (
    <div className="p-4 space-y-6 justify-center align-middle">

      <div className="h-screen flex justify-center items-center">
        <CardContent>
          <h2 className="text-xl font-bold mb-5">Add Groups</h2>
          <GroupForm
            onSubmit={handleAddOrUpdate}
            initialData={editingGroup}
            existingGroups={groups}
          />
        </CardContent>
      </div>

      <div className="flex justify-center items-center">
        <Card className="w-240">
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold mb-5">Existing Groups</h2>
              <Input
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleExportToPdf} variant="outline" className="gap-2">
                <FileIcon className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
            <GroupTable
              groups={filteredGroups}
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
