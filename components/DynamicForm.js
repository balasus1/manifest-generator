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
      // If the array contains only strings, show it as a single text input
      if (value.every((item) => typeof item === "string")) {
        return (
          <div key={fieldKey} className="space-y-4">
            <h3 className="text-lg font-semibold">{key}</h3>
            <Controller
              name={fieldKey}
              control={control}
              defaultValue={value.join(", ")} // Join array elements into a single string
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
          render={({ field }) => <Input {...field} type="text" />}
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

  const onSubmit = (data) => {
    handleDownload(data);
  };

  const handleDownload = (data) => {
    const jsonString = JSON.stringify(data || formData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="apps" className="font-bold">
                  Apps
                </TabsTrigger>
                <TabsTrigger value="otaPackage" className="font-bold">
                  OTA Package
                </TabsTrigger>
              </TabsList>
              <TabsContent value="apps">
                <ScrollArea className="h-[340px] w-full rounded-md border p-4">
                  {renderField("apps", formData.apps)}
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