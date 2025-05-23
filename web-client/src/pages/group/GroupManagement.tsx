import { useState, useEffect } from "react";
import GroupForm from "@/components/group/GroupForm";
import GroupTable from "@/components/group/GroupTable";
import { Card, CardContent } from "@/components/ui/card";
import { getGroups, deleteGroup, updateGroup } from "@/services/group.service";
import { toast } from "sonner";

export default function GroupManagement() {
  const [groups, setGroups] = useState<any[]>([]);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);

  const fetchGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to fetch groups");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddOrUpdate = async (group: any) => {
    try {
      // check for duplicate group names
      const duplicateGroups = groups.find(v => v.name.toLowerCase() === group.name.toLowerCase());
      if(duplicateGroups) {
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
            <h2 className="text-xl font-bold mb-5">Existing Groups</h2>
            <GroupTable 
              groups={groups} 
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
