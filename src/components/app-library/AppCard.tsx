import { Clock, Star, User, ArrowRight, TrendingUp, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface AppCardProps {
  app: any; // Using any for now since the API returns a different structure
  onSelect: (app: any) => void;
}

export const AppCard = ({ app, onSelect }: AppCardProps) => {
  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 bg-card border-border">
      <div onClick={() => onSelect(app)}>
        {/* Banner Image */}
        <div className="relative h-32 bg-gradient-subtle rounded-t-lg overflow-hidden">
          {app.cover_image ? (
            <img 
              src={app.cover_image} 
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

          {/* Featured Badge */}
          {app.featured && (
            <div className="absolute top-3 right-3">
              <Badge className="text-xs bg-yellow-500/90 text-white backdrop-blur-sm">
                ⭐ Featured
              </Badge>
            </div>
          )}
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

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {app.run_count > 0 && (
                <div className="flex items-center" title={`${app.run_count} runs`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {app.run_count > 999 ? `${(app.run_count / 1000).toFixed(1)}k` : app.run_count}
                </div>
              )}
              {app.fork_count > 0 && (
                <div className="flex items-center" title={`${app.fork_count} forks`}>
                  <GitFork className="h-3 w-3 mr-1" />
                  {app.fork_count > 999 ? `${(app.fork_count / 1000).toFixed(1)}k` : app.fork_count}
                </div>
              )}
            </div>
            {app.rating_avg > 0 && (
              <div className="flex items-center" title={`Rating: ${app.rating_avg}`}>
                <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                {Number(app.rating_avg).toFixed(1)}
              </div>
            )}
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