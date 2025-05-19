import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Define an empty app template
const emptyApp = {
  appName: 'New App',
  packageName: '',
  versionName: '',
  versionCode: '',
  iconThumbUrl: '',
  downloadUrl: '',
  md5: '',
  appDescription: '',
  releaseNotes: '',
  releaseDate: '',
  whitelist: [],
  history: [
    {
      versionName: '',
      versionCode: '',
      releaseNotes: '',
      releaseDate: '',
    },
  ],
  blacklist: [],
};

const DynamicForm = ({ prefillData }) => {
  const { control, handleSubmit, reset, setValue, getValues } = useForm();
  const [formData, setFormData] = useState(
    prefillData || {
      apps: [],
      otaPackage: { whitelist: [], blacklist: [] },
    }
  );
  const [fileName, setFileName] = useState('v103_onwards_manifest.json');
  const [isEditable, setIsEditable] = useState(false);
  const [activeAppTab, setActiveAppTab] = useState(0);
  const [pendingResetData, setPendingResetData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    index: null,
    appName: '',
  });

  useEffect(() => {
    if (prefillData) {
      // Process any array data to ensure it's in the correct format
      const processedData = { ...prefillData };

      // Ensure arrays are properly formed for apps
      if (processedData.apps) {
        processedData.apps = processedData.apps.map((app) => {
          const processedApp = { ...app };
          if (app.whitelist) {
            processedApp.whitelist = Array.isArray(app.whitelist)
              ? app.whitelist.map((item) =>
                typeof item === 'object' ? JSON.stringify(item) : item
              )
              : [];
          }
          if (app.blacklist) {
            processedApp.blacklist = Array.isArray(app.blacklist)
              ? app.blacklist.map((item) =>
                typeof item === 'object' ? JSON.stringify(item) : item
              )
              : [];
          }
          return processedApp;
        });
      }

      setFormData(processedData);
      // If there are apps, set the active tab to the first one
      if (processedData.apps && processedData.apps.length > 0) {
        setActiveAppTab(0);
      }
      // Reset the form with the processed prefill data
      reset(processedData);
    }
  }, [prefillData, reset]);

  useEffect(() => {
    if (pendingResetData) {
      reset(pendingResetData);
      setPendingResetData(null); // clear once done
    }
  }, [pendingResetData, reset]);

  const renderField = (key, value, parentKey = '') => {
    //console.log("fieldKey", key)
    const fieldKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === 'object' && !Array.isArray(value)) {
      console.log('object', value, 'key', key);
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
      if (
        value.every(
          (item) =>
            typeof item === 'string' ||
            typeof item === 'number' ||
            !isNaN(Number(item))
        )
      ) {
        return (
          <div key={fieldKey} className="space-y-4">
            <h3 className="text-lg font-semibold">{key}</h3>
            <Controller
              name={fieldKey}
              control={control}
              defaultValue={value.join(', ')}
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
            key.toLowerCase().includes('releaseNotes'.toLowerCase()) ? (
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
    const keys = fieldKey.split('.');
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
    const keys = fieldKey.split('.');
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
      if (key === 'apps' && processed[key]) {
        processed[key].forEach((app, index) => {
          if (app.whitelist && typeof app.whitelist === 'string') {
            processed[key][index].whitelist = app.whitelist
              .split(',')
              .map((item) => item.trim());
          }
          if (app.blacklist && typeof app.blacklist === 'string') {
            processed[key][index].blacklist = app.blacklist
              .split(',')
              .map((item) => item.trim());
          }
        });
      }

      // Handle whitelist/blacklist in otaPackage
      if (key === 'otaPackage' && processed[key]) {
        if (
          processed[key].whitelist &&
          typeof processed[key].whitelist === 'string'
        ) {
          processed[key].whitelist = processed[key].whitelist
            .split(',')
            .map((item) => Number(item.trim()));
        }
        if (
          processed[key].blacklist &&
          typeof processed[key].blacklist === 'string'
        ) {
          processed[key].blacklist = processed[key].blacklist
            .split(',')
            .map((item) => Number(item.trim()));
        }
      }
    }

    return processed;
  };

  const handleDownload = (data) => {
    // Clean the data structure to ensure proper formatting
    const processObject = (obj, parentKey = '') => {
      if (typeof obj !== 'object' || obj === null) return obj;

      const result = Array.isArray(obj) ? [] : {};

      for (const key in obj) {
        const currentPath = parentKey ? `${parentKey}.${key}` : key;

        if (key === 'whitelist' || key === 'blacklist') {
          // Handle whitelist and blacklist based on context
          if (typeof obj[key] === 'string') {
            // If it's a string, convert to array
            const items = obj[key].split(',').map((item) => item.trim());

            // Convert to numbers for OTA package
            if (currentPath.includes('otaPackage')) {
              result[key] = items.map((item) => Number(item));
            } else {
              // Keep as strings for apps
              result[key] = items;
            }
          } else if (Array.isArray(obj[key])) {
            // If already an array, ensure proper type conversion
            if (currentPath.includes('otaPackage')) {
              result[key] = obj[key].map((item) =>
                typeof item === 'string' ? Number(item) : item
              );
            } else {
              result[key] = obj[key].map((item) => String(item));
            }
          } else {
            result[key] = obj[key];
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          // Recursively process nested objects
          result[key] = processObject(obj[key], currentPath);
        } else {
          result[key] =
            typeof obj[key] === 'string'
              ? obj[key]
                .replace(/\\/g, '\\\\')
                .replace(/\n/g, '\\n')
                .replace(/"/g, '\\"')
              : obj[key];
        }
      }

      return result;
    };

    const transformedData = processObject(data);

    const jsonString = JSON.stringify(transformedData, null, 2);
    //const finalJsonString = jsonString.replace(/\\n/g, '\n');
    const blob = new Blob([jsonString], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddApp = () => {
    const newApp = structuredClone(emptyApp);
    setFormData((prev) => {
      const updatedApps = [...(prev.apps || []), newApp];
      const updatedData = { ...prev, apps: updatedApps };
      // Immediately update active tab and reset form with updated data
      setActiveAppTab(updatedApps.length - 1);
      //reset(updatedData);
      return updatedData;
    });
  };

  const handleCloneApp = (index) => {
    const appIndex = index !== undefined ? index : activeAppTab;

    const values = getValues(); // get latest values from form
    const currentApps = values.apps || [];

    if (!currentApps.length || appIndex >= currentApps.length) {
      console.warn('No app to clone');
      return;
    }

    const clonedApp = structuredClone(currentApps[appIndex]);
    clonedApp.appName = `${clonedApp.appName} (Clone)`;

    setFormData((prev) => {
      const updatedApps = [...currentApps, clonedApp];
      const updatedData = { ...prev, apps: updatedApps };
      setActiveAppTab(updatedApps.length - 1);
      reset(updatedData); // reset form with full updated state
      return updatedData;
    });
  };

  const handleAddOTAPackage = () => {
    const defaultFullPackage = {
      url: '',
      version: '',
      changelog: '',
      md5: '',
      forceupdate: '',
      forceupdateminversion: '',
      forceupdatemaxversion: '',
      whitelist: [],
      blacklist: [],
    };

    const updatedData = {
      ...formData,
      otaPackage: { full: defaultFullPackage },
    };

    setFormData(updatedData);
    reset(updatedData); // Ensures form updates and fields appear
  };

  const handleRemoveOTAPackage = () => {
    const updatedData = { ...formData };
    delete updatedData.otaPackage;
    setFormData(updatedData);
    reset(updatedData);
  };

  // New functions for whitelist management
  const handleAddWhitelistToApp = (index) => {
    // Get current form values to preserve existing data
    const currentValues = getValues();
    const updatedData = { ...formData };
 
    if (!updatedData.apps[index]) return;

    // Add empty whitelist array
    updatedData.apps[index].whitelist = [];
    
    // Update the form data state
    setFormData(updatedData);
    
    // Create a merged object that preserves all existing form data plus the new whitelist
    const updatedFormData = {
      ...currentValues,
      apps: [...(currentValues.apps || [])]
    };
    
    // Make sure the app object exists
    if (!updatedFormData.apps[index]) {
      updatedFormData.apps[index] = {};
    }
    
    // Add the whitelist to the specific app
    updatedFormData.apps[index].whitelist = [];
    
    // Reset the form with all the data
    reset(updatedFormData);
  };

  const handleRemoveWhitelistFromApp = (index) => {
    // Get current form values first
    const currentValues = getValues();
    const updatedData = { ...formData };
    
    if (updatedData.apps[index] && 'whitelist' in updatedData.apps[index]) {
      // Only delete the whitelist property, not the entire app object
      delete updatedData.apps[index].whitelist;
      
      // Update the form data state
      setFormData(updatedData);
      
      // Create a merged object that preserves all existing form data
      const updatedFormData = {
        ...currentValues,
        apps: [...(currentValues.apps || [])]
      };
      
      // Make sure the app object exists
      if (updatedFormData.apps[index]) {
        // Only remove the whitelist property
        delete updatedFormData.apps[index].whitelist;
      }
      
      // Reset the form with the updated data
      reset(updatedFormData);
    }
  };

  const handleAddWhitelistToOTA = () => {
    // Get current form values to preserve existing data
    const currentValues = getValues();
    const updatedData = { ...formData };
    
    // Make sure otaPackage and full object exist
    if (!updatedData.otaPackage) {
      updatedData.otaPackage = {};
    }
    if (!updatedData.otaPackage.full) {
      updatedData.otaPackage.full = {};
    }
    
    // Add empty whitelist array
    updatedData.otaPackage.full.whitelist = [];
    
    // Update the form data state
    setFormData(updatedData);
    
    // Create a merged object that preserves all existing form data
    const updatedFormData = { ...currentValues };
    
    // Make sure the otaPackage and full objects exist in form data
    if (!updatedFormData.otaPackage) {
      updatedFormData.otaPackage = {};
    }
    if (!updatedFormData.otaPackage.full) {
      updatedFormData.otaPackage.full = {};
    }
    
    // Add the whitelist
    updatedFormData.otaPackage.full.whitelist = [];
    
    // Reset the form with all the data
    reset(updatedFormData);
  };
  
  const handleRemoveWhitelistFromOTA = () => {
    // Get current form values
    const currentValues = getValues();
    const updatedData = { ...formData };
    
    // Check if otaPackage and full exist
    if (updatedData.otaPackage && updatedData.otaPackage.full && 'whitelist' in updatedData.otaPackage.full) {
      // Only delete the whitelist property, not the entire otaPackage
      delete updatedData.otaPackage.full.whitelist;
      
      // Update the form data state
      setFormData(updatedData);
      
      // Create a merged object that preserves existing form data
      const updatedFormData = { ...currentValues };
      
      // Make sure otaPackage and full objects exist in form data
      if (updatedFormData.otaPackage && updatedFormData.otaPackage.full) {
        // Only remove the whitelist property
        delete updatedFormData.otaPackage.full.whitelist;
      }
      
      // Reset the form with updated data
      reset(updatedFormData);
    }
  };

  const handleAddBlacklistToApp = (index) => {
    // Get current form values
    const currentValues = getValues();
    const updatedData = { ...formData };
    
    if (!updatedData.apps[index]) return;

    // Add empty blacklist array
    updatedData.apps[index].blacklist = [];
    
    // Update the form data state
    setFormData(updatedData);
    
    // Create a merged object that preserves all existing form data
    const updatedFormData = {
      ...currentValues,
      apps: [...(currentValues.apps || [])]
    };
    
    // Make sure the app object exists
    if (!updatedFormData.apps[index]) {
      updatedFormData.apps[index] = {};
    }
    
    // Add the blacklist
    updatedFormData.apps[index].blacklist = [];
    
    // Reset the form with all the data
    reset(updatedFormData);
  };

  const handleRemoveBlacklistFromApp = (index) => {
    // Get current form values
    const currentValues = getValues();
    const updatedData = { ...formData };
    
    if (updatedData.apps[index] && 'blacklist' in updatedData.apps[index]) {
      // Only delete the blacklist property, not the entire app object
      delete updatedData.apps[index].blacklist;
      
      // Update the form data state
      setFormData(updatedData);
      
      // Create a merged object that preserves all existing form data
      const updatedFormData = {
        ...currentValues,
        apps: [...(currentValues.apps || [])]
      };
      
      // Make sure the app object exists
      if (updatedFormData.apps[index]) {
        // Only remove the blacklist property
        delete updatedFormData.apps[index].blacklist;
      }
      
      // Reset the form with updated data
      reset(updatedFormData);
    }
  };

  const handleAddBlacklistToOTA = () => {
    // Get current form values
    const currentValues = getValues();
    const updatedData = { ...formData };
    
    // Make sure otaPackage and full object exist
    if (!updatedData.otaPackage) {
      updatedData.otaPackage = {};
    }
    if (!updatedData.otaPackage.full) {
      updatedData.otaPackage.full = {};
    }
    
    // Add empty blacklist array
    updatedData.otaPackage.full.blacklist = [];
    
    // Update form data state
    setFormData(updatedData);
    
    // Create a merged object that preserves all existing form data
    const updatedFormData = { ...currentValues };
    
    // Make sure the otaPackage and full objects exist in form data
    if (!updatedFormData.otaPackage) {
      updatedFormData.otaPackage = {};
    }
    if (!updatedFormData.otaPackage.full) {
      updatedFormData.otaPackage.full = {};
    }
    
    // Add the blacklist
    updatedFormData.otaPackage.full.blacklist = [];
    
    // Reset the form with all the data
    reset(updatedFormData);
  };

  const handleRemoveBlacklistFromOTA = () => {
    // Get current form values
    const currentValues = getValues();
    const updatedData = { ...formData };
    
    if (updatedData.otaPackage && updatedData.otaPackage.full && 'blacklist' in updatedData.otaPackage.full) {
      // Only delete the blacklist property
      delete updatedData.otaPackage.full.blacklist;
      
      // Update form data state
      setFormData(updatedData);
      
      // Create a merged object that preserves existing form data
      const updatedFormData = { ...currentValues };
      
      // Make sure otaPackage and full objects exist in form data
      if (updatedFormData.otaPackage && updatedFormData.otaPackage.full) {
        // Only remove the blacklist property
        delete updatedFormData.otaPackage.full.blacklist;
      }
      
      // Reset the form with updated data
      reset(updatedFormData);
    }
  };

  const handleDeleteApp = (indexToDelete) => {
    const values = getValues();
    const currentApps = values.apps || [];

    if (currentApps.length < 1) {
      alert('Cannot delete default app. B&N Must exist.');
      return;
    }

    const updatedApps = currentApps.filter(
      (_, index) => index !== indexToDelete
    );
    const newActiveTab =
      indexToDelete === activeAppTab
        ? Math.max(0, indexToDelete - 1)
        : activeAppTab > indexToDelete
          ? activeAppTab - 1
          : activeAppTab;

    setFormData((prev) => {
      const updatedData = { ...prev, apps: updatedApps };
      setPendingResetData(updatedData); // trigger reset after render
      setActiveAppTab(newActiveTab);
      return updatedData;
    });
  };

  // Helper function to update array fields in app tabs
  const handleAppArrayFieldChange = (index, fieldName, value) => {
    // Convert comma-separated string to array, handling empty values
    const arrayValue = value.trim()
      ? value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '')
      : [];

    // Update the form value
    setValue(`apps[${index}].${fieldName}`, arrayValue);

    // Also update the formData state to keep UI in sync
    setFormData((prevData) => {
      const newData = { ...prevData };
      if (!newData.apps[index]) {
        newData.apps[index] = {};
      }
      newData.apps[index][fieldName] = arrayValue;
      return newData;
    });
  };

  // Helper function to update array fields for OTA Package
  const handleOTAArrayFieldChange = (fieldName, value) => {
    // Convert comma-separated string to array, handling empty values
    const arrayValue = value.trim()
      ? value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '')
      : [];

    // Update the form value
    setValue(`otaPackage.${fieldName}`, arrayValue);

    // Also update the formData state to keep UI in sync
    setFormData((prevData) => {
      const newData = { ...prevData };
      if (!newData.otaPackage) {
        newData.otaPackage = {};
      }
      newData.otaPackage[fieldName] = arrayValue;
      return newData;
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
                    type="button"
                  >
                    + Add App
                  </Button>

                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-green-700 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleCloneApp(activeAppTab)}
                    type="button"
                    disabled={!formData.apps || formData.apps.length === 0}
                  >
                    ++ Clone App
                  </Button>
                </div>
                <ScrollArea className="h-[340px] w-full rounded-md border p-4">
                  {formData.apps && formData.apps.length > 0 ? (
                    <Tabs
                      defaultValue={`app-${activeAppTab}`}
                      onValueChange={(value) => {
                        const tabIndex = parseInt(value.split('-')[1]);
                        setActiveAppTab(tabIndex);
                      }}
                    >
                      <TabsList className="mb-4 flex-wrap">
                        {formData.apps.map((_, index) => (
                          <div
                            key={index}
                            className="relative flex items-center"
                          >
                            <Controller
                              key={index}
                              name={`apps[${index}].appName`}
                              control={control}
                              defaultValue={`App ${index + 1}`}
                              render={({ field }) => (
                                <TabsTrigger value={`app-${index}`}>
                                  {field.value || `App ${index + 1}`}
                                </TabsTrigger>
                              )}
                            />
                            <button
                              type="button"
                              className="absolute right-0 bottom-4 text-xs text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteApp(index)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </TabsList>

                      {formData.apps.map((app, index) => (
                        <TabsContent
                          key={index}
                          value={`app-${index}`}
                          className="space-y-4"
                        >
                          {[
                            ...Object.entries(app).filter(([key]) => key !== 'whitelist' && key !== 'history' && key !== 'blacklist'),
                            ...(app.whitelist ? [['whitelist', app.whitelist]] : []),
                            ...(app.history ? [['history', app.history]] : []),
                            ...(app.blacklist ? [['blacklist', app.blacklist]] : []),
                          ].map(([key, value]) => (


                            <div
                              key={`app-${index}-${key}`}
                              className="space-y-2"
                            >
                              <Label>{key}</Label>
                              {key === 'history' && Array.isArray(value) ? (
                                <div className="space-y-4 pl-2 border-l border-gray-300">
                                  {value.map((entry, entryIndex) => (
                                    <div
                                      key={`app-${index}-history-${entryIndex}`}
                                      className="space-y-2 border p-2 rounded bg-gray-50"
                                    >
                                      <p className="text-sm font-medium">
                                        History Entry {entryIndex + 1}
                                      </p>
                                      {Object.entries(entry).map(
                                        ([fieldKey, fieldValue]) => (
                                          <div key={fieldKey}>
                                            <Label>{fieldKey}</Label>
                                            <Controller
                                              name={`apps[${index}].history[${entryIndex}].${fieldKey}`}
                                              control={control}
                                              defaultValue={fieldValue}
                                              render={({ field }) => (
                                                <Input {...field} type="text" />
                                              )}
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : key === 'whitelist' ? (
                                <div>
                                  <div className="flex items-center justify-between">
                                    <Input
                                      type="text"
                                      defaultValue={
                                        Array.isArray(value)
                                          ? value
                                            .map((item) =>
                                              typeof item === 'object' ? JSON.stringify(item) : item
                                            )
                                            .join(', ')
                                          : value
                                      }
                                      onChange={(e) =>
                                        handleAppArrayFieldChange(index, key, e.target.value)
                                      }
                                      placeholder={`Enter ${key} as comma-separated values`}
                                      className="flex-grow mr-2"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="text-red-500 hover:text-red-700 text-sm h-8 px-2"
                                      onClick={() => handleRemoveWhitelistFromApp(index)}
                                    >
                                      <X size={16} />
                                    </Button>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Enter values separated by commas
                                  </p>
                                </div>
                              ) : key === 'blacklist' ? (
                                <div>
                                  <div className="flex items-center justify-between">
                                    <Input
                                      type="text"
                                      defaultValue={
                                        Array.isArray(value)
                                          ? value
                                            .map((item) =>
                                              typeof item === 'object'
                                                ? JSON.stringify(item)
                                                : item
                                            )
                                            .join(', ')
                                          : value
                                      }
                                      onChange={(e) =>
                                        handleAppArrayFieldChange(
                                          index,
                                          key,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Enter ${key} as comma-separated values`}
                                      className="flex-grow mr-2"
                                    />
                                    {key === 'blacklist' && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-red-500 hover:text-red-700 text-sm h-8 px-2"
                                        onClick={() => handleRemoveBlacklistFromApp(index)}
                                      >
                                        <X size={16} />
                                      </Button>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Enter values separated by commas
                                  </p>
                                </div>
                              ) : key
                                .toLowerCase()
                                .includes('releaseNotes'.toLowerCase()) ? (
                                // Special handling for release notes
                                <Controller
                                  name={`apps[${index}].${key}`}
                                  control={control}
                                  defaultValue={value}
                                  render={({ field }) => (
                                    <textarea
                                      {...field}
                                      className="w-full h-32 p-2 border border-gray-300 rounded-md resize-y"
                                      placeholder="Enter release notes..."
                                    />
                                  )}
                                />
                              ) : (
                                // Default handling for other fields
                                <Controller
                                  name={`apps[${index}].${key}`}
                                  control={control}
                                  defaultValue={value}
                                  render={({ field }) => (
                                    <Input {...field} type="text" />
                                  )}
                                />
                              )}
                            </div>
                          ))}
                          <div className="flex space-x-4">
                            {!('whitelist' in app) && (
                              <div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="bg-gradient-to-r from-blue-500 to-blue-700 bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => handleAddWhitelistToApp(index)}
                                >
                                  + Add Whitelist
                                </Button>
                              </div>
                            )}
                            {!('blacklist' in app) && (
                              <div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="bg-gradient-to-r from-red-500 to-red-700 bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleAddBlacklistToApp(index)}
                                >
                                  + Add Blacklist
                                </Button>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">
                        No apps added yet. Click &apos;+ Add App&apos; to get
                        started.
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="otaPackage">
                <ScrollArea className="h-[340px] w-full rounded-md border p-4 space-y-4">
                {formData.otaPackage && formData.otaPackage.full ? (
                    <>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={handleRemoveOTAPackage}
                        >
                          ✕ Close
                        </Button>
                      </div>
                      
                      {/* Render fields for OTA Package */}
                      {Object.entries(formData.otaPackage.full).filter(
                        ([key]) => key !== 'whitelist' && key !== 'blacklist'
                      ).map(([key, value]) => (
                        <div key={`ota-${key}`} className="space-y-2">
                          <Label>{key}</Label>
                          <Controller
                            name={`otaPackage.full.${key}`}
                            control={control}
                            defaultValue={value}
                            render={({ field }) => (
                              <Input {...field} type="text" />
                            )}
                          />
                        </div>
                      ))}
                      
                      {/* Whitelist field if it exists */}
                      {formData.otaPackage.full.whitelist && (
                        <div className="space-y-2">
                          <Label>whitelist</Label>
                          <div className="flex items-center justify-between">
                            <Input
                              type="text"
                              defaultValue={
                                Array.isArray(formData.otaPackage.full.whitelist)
                                  ? formData.otaPackage.full.whitelist.join(', ')
                                  : formData.otaPackage.full.whitelist
                              }
                              onChange={(e) =>
                                handleOTAArrayFieldChange('full.whitelist', e.target.value)
                              }
                              placeholder="Enter whitelist as comma-separated values"
                              className="flex-grow mr-2"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 text-sm h-8 px-2"
                              onClick={handleRemoveWhitelistFromOTA}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Enter values separated by commas
                          </p>
                        </div>
                      )}
                      
                      {/* Blacklist field if it exists */}
                      {formData.otaPackage.full.blacklist && (
                        <div className="space-y-2">
                          <Label>blacklist</Label>
                          <div className="flex items-center justify-between">
                            <Input
                              type="text"
                              defaultValue={
                                Array.isArray(formData.otaPackage.full.blacklist)
                                  ? formData.otaPackage.full.blacklist.join(', ')
                                  : formData.otaPackage.full.blacklist
                              }
                              onChange={(e) =>
                                handleOTAArrayFieldChange('full.blacklist', e.target.value)
                              }
                              placeholder="Enter blacklist as comma-separated values"
                              className="flex-grow mr-2"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 text-sm h-8 px-2"
                              onClick={handleRemoveBlacklistFromOTA}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Enter values separated by commas
                          </p>
                        </div>
                      )}
                      
                      {/* Add Whitelist/Blacklist buttons */}
                      <div className="flex space-x-4 mt-4">
                        {!formData.otaPackage.full.whitelist && (
                          <Button
                            type="button"
                            variant="outline"
                            className="bg-gradient-to-r from-blue-500 to-blue-700 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleAddWhitelistToOTA}
                          >
                            + Add Whitelist
                          </Button>
                        )}
                        {!formData.otaPackage.full.blacklist && (
                          <Button
                            type="button"
                            variant="outline"
                            className="bg-gradient-to-r from-red-500 to-red-700 bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleAddBlacklistToOTA}
                          >
                            + Add Blacklist
                          </Button>
                        )}
                      </div>
                    </>
                  )  : (
                    <div className="text-center text-sm text-gray-500">
                      <p>No OTA package data found.</p>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-green-700 bg-green-600 hover:bg-green-700 text-white"
                        variant="outline"
                        onClick={handleAddOTAPackage}
                      >
                        + Add OTA Package
                      </Button>
                    </div>
                  )}
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