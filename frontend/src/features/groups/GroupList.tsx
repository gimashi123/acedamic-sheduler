import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Paper,
  TablePagination,
  Chip,
  Badge,
  Box
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Group as GroupIcon,
  PictureAsPdf
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { Group, deleteGroup } from '../../utils/api/groupApi';
import { exportToPdf } from '../../utils/pdfExport';

interface GroupListProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onManageStudents: (group: Group) => void;
  onRefresh: () => void;
}

const GroupList = ({ groups, onEdit, onManageStudents, onRefresh }: GroupListProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openDeleteDialog = (group: Group) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setGroupToDelete(null);
  };

  const handleDelete = async () => {
    if (!groupToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteGroup(groupToDelete._id);
      toast.success('Group deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    } finally {
      setIsDeleting(false);
      closeDeleteDialog();
    }
  };

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'weekday':
        return 'primary';
      case 'weekend':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleExportToPdf = () => {
    const columns = [
      { header: 'Group Name', dataKey: 'name' },
      { header: 'Faculty', dataKey: 'faculty' },
      { header: 'Department', dataKey: 'department' },
      { header: 'Type', dataKey: 'groupType' },
      { header: 'Year', dataKey: 'year' },
      { header: 'Semester', dataKey: 'semester' },
      { header: 'Students Count', dataKey: 'studentCount' }
    ];

    // Format the data for PDF export
    const formattedData = groups.map(group => ({
      ...group,
      groupType: group.groupType.charAt(0).toUpperCase() + group.groupType.slice(1),
      studentCount: `${group.students.length}/30`
    }));

    exportToPdf({
      title: 'Student Groups List',
      filename: `groups-list-${new Date().toISOString().split('T')[0]}`,
      columns,
      data: formattedData,
      orientation: 'landscape',
      includeTimestamp: true
    });

    toast.success('Groups list exported to PDF successfully');
  };

  return (
    <>
      {groups.length === 0 ? (
        <Typography variant="subtitle1" align="center" sx={{ py: 3 }}>
          No groups found. Add your first group using the button above.
        </Typography>
      ) : (
        <>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button 
              variant="outlined" 
              startIcon={<PictureAsPdf />} 
              onClick={handleExportToPdf}
              size="small"
            >
              Export PDF
            </Button>
          </Box>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Group Name</TableCell>
                  <TableCell>Faculty</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Students</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((group) => (
                    <TableRow key={group._id}>
                      <TableCell>{group.name}</TableCell>
                      <TableCell>{group.faculty}</TableCell>
                      <TableCell>{group.department}</TableCell>
                      <TableCell>
                        <Chip 
                          label={group.groupType.charAt(0).toUpperCase() + group.groupType.slice(1)} 
                          color={getGroupTypeColor(group.groupType) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{group.year}</TableCell>
                      <TableCell>{group.semester}</TableCell>
                      <TableCell>
                        <Badge 
                          badgeContent={group.students.length} 
                          color={group.students.length >= 30 ? "error" : "primary"}
                          showZero
                        >
                          <GroupIcon />
                        </Badge>
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {group.students.length}/30
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          aria-label="manage students" 
                          color="success"
                          onClick={() => onManageStudents(group)}
                          title="Manage Students"
                        >
                          <GroupIcon />
                        </IconButton>
                        <IconButton 
                          aria-label="edit" 
                          color="primary"
                          onClick={() => onEdit(group)}
                          title="Edit Group"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          aria-label="delete" 
                          color="error"
                          onClick={() => openDeleteDialog(group)}
                          title="Delete Group"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={groups.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the group "{groupToDelete?.name}"? 
            This action cannot be undone and will remove all student assignments to this group.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={isDeleting}
            variant="contained"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupList; 