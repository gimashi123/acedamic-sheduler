import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { AppDispatch, RootState } from '@/store/store.ts';
import { useAuth } from '@/context/auth/auth-context.tsx';
import {
  fetchProfilePicture,
  uploadProfilePicture,
  deleteProfilePicture,
} from './profileSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Lock, User, Mail, Image } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { profilePicture, loading } = useSelector(
    (state: RootState) => state.profile,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchProfilePicture());
  }, [dispatch, refreshKey]);

  const handleProfilePictureUpdate = async (file: File) => {
    try {
      setIsUploading(true);
      await dispatch(uploadProfilePicture(file)).unwrap();
      toast.success('Profile picture updated successfully');
      setRefreshKey((prev) => prev + 1);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfilePictureDelete = async () => {
    try {
      await dispatch(deleteProfilePicture()).unwrap();
      toast.success('Profile picture deleted successfully');
      setRefreshKey((prev) => prev + 1);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error('Failed to delete profile picture');
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card className="relative">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative group w-fit">
              {loading ? (
                <Skeleton className="h-32 w-32 rounded-full" />
              ) : (
                <>
                  <img
                    src={profilePicture?.toString() || '/default-profile.png'}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover border-2 border-muted shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleProfilePictureUpdate(e.target.files[0])
                      }
                      className="hidden"
                      id="profile-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="profile-upload"
                      className="cursor-pointer flex items-center gap-2 text-white hover:text-primary transition-colors"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Image className="h-4 w-4" />
                          <span className="text-sm">Change</span>
                        </>
                      )}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-destructive hover:bg-white/10"
                      onClick={handleProfilePictureDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-muted-foreground">{currentUser.email}</p>
              <Badge variant="secondary" className="mt-2">
                {currentUser.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">First Name</span>
                </div>
                <p className="font-medium pl-6">{currentUser.firstName}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Last Name</span>
                </div>
                <p className="font-medium pl-6">{currentUser.lastName}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Email</span>
                </div>
                <p className="font-medium pl-6 break-all">
                  {currentUser.email}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Role</span>
                </div>
                <p className="font-medium pl-6 capitalize">
                  {currentUser.role}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => (window.location.href = '/change-password')}
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
