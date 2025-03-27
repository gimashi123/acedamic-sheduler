
import { Card, CardContent } from "@/components/ui/card";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuLink
} from "@/components/ui/navigation-menu";

export default function HomePage() {
    return (
        <div className="relative min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
             style={{
                 backgroundImage: "url('/AS.jpg') ",
                 backgroundSize: "100%",  // Keeps the entire image visible
                 backgroundPosition: "center",
                 backgroundRepeat: "no-repeat"}}>

            {/* Dark Overlay for Readability */}


            {/* Navigation Bar */}
            <header className="relative z-10 shadow-md bg-blue-100 bg-opacity-90">
                <nav className="container mx-auto p-5 flex space-x-7 items-center">
                    <h1 className="text-3xl font-bold text-black-200 mr-10">Academic Scheduler</h1>
                    <NavigationMenu>
                        <NavigationMenuList className="flex space-x-6">
                            <NavigationMenuItem>
                                <NavigationMenuLink href="/" className="text-black-200 hover:text-white text-xl">
                                    Home
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink href="/about" className="text-black-200 hover:text-white text-xl">
                                    About
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink href="/login" className="text-black-200 hover:text-white text-xl">
                                    Login
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink href="/signup" className="text-black-200 hover:text-white text-xl">
                                    Sign Up
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center p-6">

            </main>

            {/* Footer */}
            <footer className="relative z-10 bg-gray-100 p-8 text-center text-gray-600 mt-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 ml-10 mr-10">
                    <Card className="max-w-1xl p-8">
                        <CardContent>
                            <h2 className="text-4xl font-bold mb-4">Welcome to MyApp</h2>
                            <p className="text-gray-600 text-lg mb-6">
                                Build your projects with modern UI components using ShadCN and Tailwind.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="max-w-1xl p-8">
                        <CardContent>
                            <h2 className="text-4xl font-bold mb-4">Welcome to MyApp</h2>
                            <p className="text-gray-600 text-lg mb-6">
                                Build your projects with modern UI components using ShadCN and Tailwind.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="max-w-1xl p-8">
                        <CardContent>
                            <h2 className="text-4xl font-bold mb-4">Welcome to MyApp</h2>
                            <p className="text-gray-600 text-lg mb-6">
                                Build your projects with modern UI components using ShadCN and Tailwind.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </footer>
        </div>
    );
}
