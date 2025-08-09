import { Clock, Star, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AppManifest } from "@/types/app";

interface AppCardProps {
  app: AppManifest;
  onSelect: (app: AppManifest) => void;
}

export const AppCard = ({ app, onSelect }: AppCardProps) => {
  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 bg-card border-border">
      <div onClick={() => onSelect(app)}>
        {/* Banner Image */}
        <div className="relative h-32 bg-gradient-subtle rounded-t-lg overflow-hidden">
          {app.banner ? (
            <img 
              src={app.banner} 
              alt={app.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-primary opacity-20" />
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
              {app.category}
            </Badge>
          </div>

          {/* Pricing Badge */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant={app.pricing === 'free' ? 'outline' : 'default'}
              className="text-xs bg-background/80 backdrop-blur-sm"
            >
              {app.pricing === 'free' ? 'Free' : 'Paid'}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-semibold">
                {app.icon || app.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-base leading-none group-hover:text-primary transition-colors">
                  {app.name}
                </h3>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {app.author}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {app.description}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {app.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {app.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{app.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(app.updated_at).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1" />
              v{app.version}
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-0">
        <Button 
          className="w-full group/btn"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(app);
          }}
        >
          Try App
          <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};