import React, { useState , useEffect} from "react";
import { useForm, Controller } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const DynamicForm = ({ prefillData }) => {
  const { control, handleSubmit } = useForm();
  const [formData, setFormData] = useState(prefillData || {});
  const [fileName, setFileName] = useState("v103_onwards_manifest.json");
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    setFormData(prefillData || {});
  }, [prefillData]);

  const renderField = (key, value, parentKey = "") => {
    const fieldKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === "object" && !Array.isArray(value)) {
      return (
        <div key={fieldKey} className="space-y-4">
          <h3 className="text-lg font-semibold">{key}</h3>
          {Object.entries(value).map(([subKey, subValue]) =>
            renderField(subKey, subValue, fieldKey)
          )}
        </div>
      );
    }
  
    if (Array.isArray(value)) {
      // If the array contains only strings or numbers, show it as a single text input
      if (value.every((item) => typeof item === "string" || (typeof item === "number" || !isNaN(Number(item))))) {
        return (
          <div key={fieldKey} className="space-y-4">
            <h3 className="text-lg font-semibold">{key}</h3>
            <Controller
              name={fieldKey}
              control={control}
              defaultValue={value.join(", ")} 
              render={({ field }) => <Input {...field} type="text" />}
            />
          </div>
        );
      }
  
      // If the array contains objects, render them as dynamic fields
      return (
        <div key={fieldKey} className="space-y-4">
          <h3 className="text-lg font-semibold">{key}</h3>
          {value.map((item, index) => (
            <div key={uuidv4()} className="space-y-2">
              {Object.entries(item).map(([subKey, subValue]) =>
                renderField(subKey, subValue, `${fieldKey}[${index}]`)
              )}
            </div>
          ))}
        </div>
      );
    }
  
    return (
      <div key={fieldKey} className="space-y-2">
        <Label>{key}</Label>
        <Controller
          name={fieldKey}
          control={control}
          defaultValue={value}
          render={({ field }) =>
            key.toLowerCase().includes("releaseNotes".toLowerCase()) ? (
              <textarea
                {...field}
                className="w-full h-32 p-2 border border-gray-300 rounded-md resize-y"
                placeholder="Enter release notes..."
              />
            ) : (
              <Input {...field} type="text" />
            )
          }
        />
      </div>
    );
  };

  const handleAddArrayItem = (fieldKey) => {
    const keys = fieldKey.split(".");
    const updatedData = { ...formData };

    let current = updatedData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey].push({}); // Add an empty object to the array
    setFormData(updatedData);
  };

  const handleRemoveArrayItem = (fieldKey, index) => {
    const keys = fieldKey.split(".");
    const updatedData = { ...formData };

    let current = updatedData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey].splice(index, 1); // Remove the item at the specified index
    setFormData(updatedData);
  };

  const onSubmit = (formData) => {
    // Process the form data before downloading
    const processedData = processFormData(formData);
    handleDownload(processedData);
  };

  // New function to process form data and handle arrays correctly
  const processFormData = (data) => {
    const processed = { ...data };
    
    // Process any string inputs that should be arrays
    for (const key in processed) {
      // Handle whitelist/blacklist in apps
      if (key === "apps" && processed[key]) {
        if (processed[key].whitelist && typeof processed[key].whitelist === "string") {
          processed[key].whitelist = processed[key].whitelist.split(",").map(item => item.trim());
        }
        if (processed[key].blacklist && typeof processed[key].blacklist === "string") {
          processed[key].blacklist = processed[key].blacklist.split(",").map(item => item.trim());
        }
      }
      
      // Handle whitelist/blacklist in otaPackage
      if (key === "otaPackage" && processed[key]) {
        if (processed[key].whitelist && typeof processed[key].whitelist === "string") {
          processed[key].whitelist = processed[key].whitelist.split(",").map(item => Number(item.trim()));
        }
        if (processed[key].blacklist && typeof processed[key].blacklist === "string") {
          processed[key].blacklist = processed[key].blacklist.split(",").map(item => Number(item.trim()));
        }
      }
    }
    
    return processed;
  };

  const handleDownload = (data) => {
    // Clean the data structure to ensure proper formatting
    const processObject = (obj, parentKey = "") => {
      if (typeof obj !== "object" || obj === null) return obj;
      
      const result = Array.isArray(obj) ? [] : {};
      
      for (const key in obj) {
        const currentPath = parentKey ? `${parentKey}.${key}` : key;
        
        if (key === "whitelist" || key === "blacklist") {
          // Handle whitelist and blacklist based on context
          if (typeof obj[key] === "string") {
            // If it's a string, convert to array
            const items = obj[key].split(",").map(item => item.trim());
            
            // Convert to numbers for OTA package
            if (currentPath.includes("otaPackage")) {
              result[key] = items.map(item => Number(item));
            } else {
              // Keep as strings for apps
              result[key] = items;
            }
          } else if (Array.isArray(obj[key])) {
            // If already an array, ensure proper type conversion
            if (currentPath.includes("otaPackage")) {
              result[key] = obj[key].map(item => 
                typeof item === "string" ? Number(item) : item
              );
            } else {
              result[key] = obj[key].map(item => String(item));
            }
          } else {
            result[key] = obj[key];
          }
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          // Recursively process nested objects
          result[key] = processObject(obj[key], currentPath);
        } else {
          result[key] = typeof obj[key] === "string"
            ? obj[key].replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"')
            : obj[key];
        }
      }
      
      return result;
    };
  
    const transformedData = processObject(data);
  
    const jsonString = JSON.stringify(transformedData, null, 2);
    //const finalJsonString = jsonString.replace(/\\n/g, '\n');
    const blob = new Blob([jsonString], { type: "application/json" });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };  

  const handleAddApp = () => {
    setFormData((prev) => ({
      ...prev,
      apps: [...prev.apps, structuredClone(emptyApp)],
    }));
  };

  const handleCloneApp = (index) => {
    setFormData((prev) => {
      const clone = structuredClone(prev.apps[index]);
      return { ...prev, apps: [...prev.apps, clone] };
    });
  };

  return (
    <div className="pt-5 top-0 overflow-y-scroll px-5">
      <Card className="inline-flexw-full mx-auto">
        <CardHeader>
          <CardTitle>Manifest Form</CardTitle>
          <CardDescription>Download your manifest file</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  disabled={!isEditable}
                />
              </div>
              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="editFileName"
                  checked={isEditable}
                  onCheckedChange={() => setIsEditable(!isEditable)}
                />
                <Label htmlFor="editFileName">Edit File Name</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="deviceModel">Device Model</Label>
              <Controller
                name="deviceModel"
                control={control}
                defaultValue={formData.deviceModel}
                render={({ field }) => <Input {...field} type="text" />}
              />
            </div>

            <div>
              <Label htmlFor="manifestUpdatedDate">Manifest Updated Date</Label>
              <Controller
                name="manifestUpdatedDate"
                control={control}
                defaultValue={Date.now().toString()}
                render={({ field }) => <Input {...field} type="text" />}
              />
            </div>

            <Separator />

            <Tabs defaultValue="apps" className="w-full">
              <TabsList className="grid w-full grid-cols-2 relative">
                <TabsTrigger value="apps" className="font-bold">
                  Apps
                </TabsTrigger>
                <TabsTrigger value="otaPackage" className="font-bold">
                  OTA Package
                </TabsTrigger>
              </TabsList>
              <TabsContent value="apps">
              <div className="top-0 h-full flex items-center justify-start gap-3 pr-1 pb-1 px-1">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-blue-700 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddApp}
                >
                  + Add App
                </Button>

                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-green-700 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleCloneApp}
                >
                  ++ Clone App
                </Button>
              </div>
                <ScrollArea className="h-[340px] w-full rounded-md border p-4">
                  <Tabs>
                    <TabsList>
                      {formData.apps.map((app, index) => (
                        <TabsTrigger key={index}>{app.appName}</TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent>
                      {formData.apps.map((app, index) => (
                        <div key={index}>
                          {renderField("apps", [app])}
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="otaPackage">
                <ScrollArea className="h-[340px] w-full rounded-md border p-4">
                  {renderField("otaPackage", formData.otaPackage)}
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <CardFooter>
              <Button type="submit" className="w-full">
                Download JSON
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicForm;