import { Card, CardContent } from '@/components/ui/card';

import { NavigationBar } from '@/components/NavigationBar.tsx';

export default function Home() {
  return (
    <div>
      <NavigationBar />
      <div className="min-h-screen flex flex-col">
        {/* Navigation Bar */}

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <Card className="max-w-2xl p-8">
            <CardContent>
              <h2 className="text-4xl font-bold mb-4">
                Welcome to Academic Scheduler
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Easily manage academic timetables with modern UI components.
              </p>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 p-4 text-center text-gray-600">
          © 2025 Academic Scheduler. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
