import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSchema, FormField } from "@/types/app";
import { Loader2, Play } from "lucide-react";

interface DynamicFormProps {
  schema: FormSchema;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isLoading?: boolean;
}

export const DynamicForm = ({ schema, onSubmit, isLoading }: DynamicFormProps) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [sliderValues, setSliderValues] = useState<Record<string, number[]>>({});

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      name: field.name,
      ...register(field.name, { 
        required: field.required ? `${field.label} is required` : false 
      })
    };

    switch (field.type) {
      case 'text':
        return (
          <Input
            {...commonProps}
            placeholder={field.placeholder}
            defaultValue={field.default_value}
            className="w-full"
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            placeholder={field.placeholder}
            defaultValue={field.default_value}
            className="w-full min-h-[100px]"
          />
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            placeholder={field.placeholder}
            defaultValue={field.default_value}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full"
          />
        );

      case 'select':
        return (
          <Select onValueChange={(value) => setValue(field.name, value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.validation?.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'slider':
        const sliderValue = sliderValues[field.name] || [field.default_value || field.validation?.min || 0];
        return (
          <div className="space-y-2">
            <Slider
              value={sliderValue}
              onValueChange={(value) => {
                setSliderValues(prev => ({ ...prev, [field.name]: value }));
                setValue(field.name, value[0]);
              }}
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{field.validation?.min || 0}</span>
              <span className="font-medium">{sliderValue[0]}</span>
              <span>{field.validation?.max || 100}</span>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              onCheckedChange={(checked) => setValue(field.name, checked)}
              defaultChecked={field.default_value}
            />
            <Label htmlFor={field.id} className="text-sm font-normal">
              {field.label}
            </Label>
          </div>
        );

      case 'file':
        return (
          <Input
            {...commonProps}
            type="file"
            className="w-full"
            accept="image/*"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{schema.title}</CardTitle>
        {schema.description && (
          <CardDescription>{schema.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {schema.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              {field.type !== 'checkbox' && (
                <Label htmlFor={field.id} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
              )}
              
              {renderField(field)}
              
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
              
              {errors[field.name] && (
                <p className="text-xs text-destructive">
                  {errors[field.name]?.message as string}
                </p>
              )}
            </div>
          ))}

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run App
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};