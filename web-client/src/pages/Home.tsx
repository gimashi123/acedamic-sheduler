import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NavigationBar } from '@/components/NavigationBar.tsx';
import { Rocket, Code, Palette } from 'lucide-react'; // Assuming you have Lucide icons

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col">
            <NavigationBar />

            {/* Hero Section */}
            <div className="relative flex-1 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-0" />
                <img
                    src="/AS.jpg"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />

                <div className="relative z-10 container px-4 md:px-6">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">

                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 font-medium max-w-2xl mx-auto">

                        </p>
                        <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-white px-8 py-3 rounded-lg font-semibold text-lg">

                        </button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section className="relative z-10 bg-white py-20 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Rocket className="w-8 h-8" />}
                            title="Blazing Fast"
                            description="Optimized performance with modern build tools and efficient code practices."
                        />
                        <FeatureCard
                            icon={<Code className="w-8 h-8" />}
                            title="Developer Friendly"
                            description="Clean, maintainable codebase with TypeScript and comprehensive docs."
                        />
                        <FeatureCard
                            icon={<Palette className="w-8 h-8" />}
                            title="Customizable"
                            description="Flexible theming system with Tailwind CSS integration."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card className="group hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white mb-4">
                    {icon}
                </div>
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 leading-relaxed">{description}</p>
            </CardContent>
        </Card>
    );
}