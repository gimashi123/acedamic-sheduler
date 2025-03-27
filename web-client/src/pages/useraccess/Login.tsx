import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Login() {
  return (

      <div className="min-h-screen flex flex-col">
        {/* Navigation Bar */}
        {/*<header className="shadow-md bg-white">*/}
        {/*  <nav className="container mx-auto p-4 flex items-center space-x-8">*/}
        {/*    /!* Logo / Title *!/*/}
        {/*    <h1 className="text-2xl font-bold">Academic Scheduler</h1>*/}

        {/*    /!* Menu List *!/*/}
        {/*    <NavigationMenu>*/}
        {/*      <NavigationMenuList className="flex space-x-6">*/}
        {/*        <NavigationMenuItem>*/}
        {/*          <NavigationMenuLink href="/" className="text-gray-700 hover:text-black">Home</NavigationMenuLink>*/}
        {/*        </NavigationMenuItem>*/}
        {/*        <NavigationMenuItem>*/}
        {/*          <NavigationMenuLink href="/about" className="text-gray-700 hover:text-black">About</NavigationMenuLink>*/}
        {/*        </NavigationMenuItem>*/}
        {/*        <NavigationMenuItem>*/}
        {/*          <NavigationMenuLink href="/signup" className="text-gray-700 hover:text-black">Sign Up</NavigationMenuLink>*/}
        {/*        </NavigationMenuItem>*/}
        {/*      </NavigationMenuList>*/}
        {/*    </NavigationMenu>*/}
        {/*  </nav>*/}
        {/*</header>*/}
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            {/* Email Field */}
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="Enter your email" />
            </div>

            {/* Password Field */}
            <div>
              <Label>Password</Label>
              <Input type="password" placeholder="Enter your password" />
            </div>

            {/* Login Button */}
            <Button className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
