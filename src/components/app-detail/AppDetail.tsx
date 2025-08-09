'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Star, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppManifest } from "@/types/app";
import { useAuth } from '@/hooks/use-auth'
import { DeployButton } from '@/components/deploy/DeployButton'

interface AppDetailProps {
  app: AppManifest;
}

export const AppDetail = ({ app }: AppDetailProps) => {
  const router = useRouter()
  const { session } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
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
              {session?.user && <DeployButton app={app} />}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This App</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{app.description}</p>
                    {session?.user ? (
                      <div className="pt-4 border-t">
                        <p className="text-sm">Click the "Deploy & Run" button in the header to get started.</p>
                      </div>
                    ) : (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Please sign in to deploy and run this app.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

                    {app.replicate_model && (
                      <div>
                        <h3 className="font-semibold mb-2 mt-4">AI Model</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{app.replicate_model}</Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`https://replicate.com/${app.replicate_model}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View on Replicate
                            </a>
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