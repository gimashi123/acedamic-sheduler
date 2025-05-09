import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar.tsx';
import { useAuth } from '@/context/auth/auth-context.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu.tsx';

export const NavigationBar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-row justify-between p-4 flex-wrap items-center">
      {/* Left Section: Title */}
      <div className="w-full sm:w-auto">
        <h1 className="text-2xl font-bold text-center sm:text-left">
          Academic Scheduler
        </h1>
      </div>

      {/* Middle Section: Navigation Links */}
      <div className="w-full sm:w-auto">
        <div className="flex flex-row justify-center sm:justify-start space-x-4">
          <p>Home</p>
          <p>About Us</p>
          <p>Contact</p>
        </div>
      </div>

      {/* Right Section: Avatar */}
      <div className="w-full sm:w-auto flex justify-center sm:justify-end">
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-row gap-4">
            <Button size={'sm'} onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button
              size={'sm'}
              variant={'outline'}
              onClick={() => navigate('/signup')}
            >
              Signup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
