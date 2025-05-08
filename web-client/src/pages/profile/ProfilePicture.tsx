import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Camera,
  User,
  Trash2,
  AlertTriangle,
  Plus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppDispatch } from '@/store/store.ts';
import { ProfilePicture as ProfilePictureType } from '@/data-types/user.tp.ts';
import { profileService } from '@/pages/profile/profileService.ts';
import {
  deleteProfilePicture,
  fetchProfilePicture,
  uploadProfilePicture,
} from '@/pages/profile/profileSlice.ts';

interface ProfilePictureProps {
  profilePicture: ProfilePictureType | undefined | null;
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
  userId?: string;
  onUpdate?: (profilePicture: ProfilePictureType | null) => void;
  isAdmin?: boolean;
  className?: string;
}

const getSizeClasses = (size: string): string => {
  switch (size) {
    case 'small':
      return 'h-10 w-10';
    case 'large':
      return 'h-32 w-32';
    case 'medium':
    default:
      return 'h-14 w-14';
  }
};

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profilePicture,
  size = 'medium',
  editable = false,
  userId,
  onUpdate,
  isAdmin = false,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const fileInputId = React.useMemo(
    () => `profile-pic-upload-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  useEffect(() => {
    if (profilePicture?.url) {
      const timestamp = new Date().getTime();
      setImgSrc(
        `${profilePicture.url}${profilePicture.url.includes('?') ? '&' : '?'}t=${timestamp}`,
      );
    } else {
      setImgSrc('');
    }
  }, [profilePicture]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should not exceed 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, JPG and PNG files are allowed');
      return;
    }

    setLoading(true);

    try {
      if (isAdmin && userId) {
        const newProfilePicture = await profileService.updateUserProfilePicture(
          userId,
          file,
        );
        toast.success('Profile picture updated');
        onUpdate?.(newProfilePicture);
      } else {
        const result = await dispatch(uploadProfilePicture(file)).unwrap();
        if (result?.url) {
          const timestamp = new Date().getTime();
          setImgSrc(`${result.url}?t=${timestamp}`);
        }
        toast.success('Profile picture updated');
        setTimeout(() => dispatch(fetchProfilePicture()), 500);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletePicture = async () => {
    setDeleteDialogOpen(false);
    setLoading(true);

    try {
      if (isAdmin && userId) {
        await profileService.deleteProfilePicture();
        toast.success('Profile picture removed');
        onUpdate?.(null);
      } else {
        await dispatch(deleteProfilePicture()).unwrap();
        toast.success('Profile picture removed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative group">
        <Avatar
          className={`${getSizeClasses(size)} ${editable ? 'cursor-pointer' : ''}`}
        >
          {imgSrc && (
            <AvatarImage src={imgSrc} alt="Profile" className="object-cover" />
          )}
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className={size === 'large' ? 'h-16 w-16' : 'h-6 w-6'} />
          </AvatarFallback>
        </Avatar>

        {editable && (
          <div className="absolute bottom-0 right-0 flex gap-1.5">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary-foreground bg-primary rounded-full p-1" />
            ) : imgSrc ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 rounded-full shadow-sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove photo</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <label
                    htmlFor={fileInputId}
                    className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <input
                      id={fileInputId}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </TooltipTrigger>
                <TooltipContent>Upload photo</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {editable && !loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <label
              htmlFor={fileInputId}
              className="text-primary-foreground cursor-pointer p-1.5 hover:bg-white/10 rounded-full"
            >
              <Camera className="h-5 w-5" />
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Profile Picture
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this profile picture? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeletePicture}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePicture;
