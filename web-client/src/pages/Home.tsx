import { Card, CardContent } from '@/components/ui/card';
import { NavigationBar } from '@/components/NavigationBar.tsx';


export default function Home() {
  return (
      <div>
          <NavigationBar />
          <div className="relative min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
               style={{
                   backgroundImage: "url('/AS.jpg') ",
                   backgroundSize: "100%",  // Keeps the entire image visible
                   backgroundPosition: "center",
                   backgroundRepeat: "no-repeat"}}>


              <div className="min-h-screen flex flex-col">

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
          </div>
      </div>

  );
}
