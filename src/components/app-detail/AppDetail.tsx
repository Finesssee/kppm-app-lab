import { useState } from "react";
import { ArrowLeft, ExternalLink, Star, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { AppManifest } from "@/types/app";
import { toast } from "sonner";

interface AppDetailProps {
  app: AppManifest;
  onBack: () => void;
}

export const AppDetail = ({ app, onBack }: AppDetailProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call to Replicate
      console.log("Submitting form data:", formData);
      
      // Mock response after delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult = {
        id: "mock-result-id",
        status: "completed",
        output: "https://replicate.delivery/mock-output.png",
        created_at: new Date().toISOString()
      };
      
      setResult(mockResult);
      toast.success("App executed successfully!");
      
    } catch (error) {
      toast.error("Failed to execute app. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-semibold">
                  {app.icon || app.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-semibold">{app.name}</h1>
                  <p className="text-sm text-muted-foreground">by {app.author}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Clone
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="form" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="form">Try App</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>
              
              <TabsContent value="form" className="mt-6">
                <DynamicForm
                  schema={app.form_schema}
                  onSubmit={handleFormSubmit}
                  isLoading={isSubmitting}
                />
                
                {/* Results */}
                {result && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Result</CardTitle>
                      <CardDescription>Your app has finished processing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-2">Output:</p>
                          {result.output?.includes('http') ? (
                            <img 
                              src={result.output} 
                              alt="Generated result" 
                              className="max-w-full h-auto rounded-lg border"
                            />
                          ) : (
                            <pre className="text-sm whitespace-pre-wrap">{result.output}</pre>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Generated at {new Date(result.created_at).toLocaleString()}
                          </p>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This App</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{app.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Version:</span>
                          <span className="ml-2 font-medium">v{app.version}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <span className="ml-2 font-medium">{app.category}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pricing:</span>
                          <span className="ml-2 font-medium capitalize">{app.pricing}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span className="ml-2 font-medium">
                            {new Date(app.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {app.replicate_model && (
                      <div>
                        <h3 className="font-semibold mb-2">AI Model</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{app.replicate_model}</Badge>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View on Replicate
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="examples" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Examples & Use Cases</CardTitle>
                    <CardDescription>
                      See what others have created with this app
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Examples coming soon...</p>
                      <p className="text-sm mt-2">
                        Be the first to create something amazing with this app!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {app.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>App Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
                    <span className="font-medium">4.8</span>
                    <span className="text-muted-foreground ml-1">(124)</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Runs</span>
                  <span className="font-medium">2,456</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};