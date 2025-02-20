'use client';

import { useState, useEffect } from 'react';
import { HistoryNavBar } from './HistoryNavBar';
import { ToastContainer, toast } from 'react-toastify';
import { saveToDatabase, getAllManifests } from '../app/action';
import 'react-toastify/dist/ReactToastify.css';
import { UploadJSON } from './UploadJSON';
import DynamicForm from "./DynamicForm";

const ManifestForm = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({ });
  const [showForm, setShowForm] = useState(false);

  const handleFileUpload = (event) => {
    if (!event.target || !event.target.files) {
      return;
    }
  
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        const newFile = {
          id: Date.now().toString(),
          name: file.name,
          uploadTime: new Date(),
          content: content,
        };
        setUploadedFiles([newFile, ...uploadedFiles]);
        onFileUpload(file);
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('manifestHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    const fetchData = async () => {
      const manifests = await getAllManifests();
      if (manifests.length > 0) {
        const formattedManifests = manifests.map((manifest) => ({
          timestamp: new Date(manifest.created_at).getTime(),
          formData: manifest.data,
        }));

        if(formattedManifests && formattedManifests[0].formData.length > 0){
          setShowForm(true);
        }
        const mergedHistory = [
          ...formattedManifests,
          ...(savedHistory ? JSON.parse(savedHistory) : []),
        ];
        setHistory(mergedHistory);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }
    const firstAttribute = Object.keys(formData)[0];
    const deviceModel = formData[firstAttribute];
    const manifest = { formData };
    await saveToDatabase(fileName, deviceModel, manifest);
  // Update history state
  const newEntry = { fileName, timestamp: Date.now(), formData: manifest };
  setHistory((prevHistory) => [newEntry, ...prevHistory]);

  // Save updated history to localStorage
  localStorage.setItem('manifestHistory', JSON.stringify([newEntry, ...history]));
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRevert = (index) => {
    const historyItem = history[index];
    const manifestData = historyItem.formData;
    const fileName = historyItem.fileName;

    // Download the JSON file
    const jsonBlob = new Blob([JSON.stringify(manifestData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    const errors = [];

    // Validate device model
    if (!formData.deviceModel) {
      errors.push('Device Model is required');
    }

    function checkAppFields(app, index, appName) {
      if (!app.appName) errors.push(`${appName} App ${index + 1}: App Name is required`);
      if (!app.packageName)
        errors.push(`${appName} ${index + 1}: Package Name is required`);
      if (!app.versionName)
        errors.push(`${appName} ${index + 1}: Version Name is required`);
      if (!app.versionCode)
        errors.push(`${appName} ${index + 1}: Version Code is required`);
      if (!app.iconThumbUrl)
        errors.push(`${appName} ${index + 1}: Icon Thumb URL is required`);
      if (!app.downloadUrl)
        errors.push(`${appName} ${index + 1}: Download URL is required`);
      if (!app.md5) errors.push(`${appName} App ${index + 1}: MD5 is required`);
      if (!app.appDescription)
        errors.push(`${appName} ${index + 1}: App Description is required`);
      if (!app.releaseNotes)
        errors.push(`${appName} ${index + 1}: Release Notes are required`);
      if (!app.releaseDate)
        errors.push(`${appName} ${index + 1}: Release Date is required`);
    }

    formData.apps.nookHubApps.forEach((app, index) => {
      checkAppFields(app, index, 'Nook Hub');
    });

    formData.apps.bnNookApps.forEach((app, index) => {
      checkAppFields(app, index, 'BN Nook');
    });

    // Validate OTA package
    const otaPackage = formData.otaPackage.full;
    if (!otaPackage.url) errors.push('OTA Package: URL is required');
    if (!otaPackage.version) errors.push('OTA Package: Version is required');
    if (!otaPackage.changelog)
      errors.push('OTA Package: Changelog is required');
    if (!otaPackage.md5) errors.push('OTA Package: MD5 is required');
    return errors;
  };

  const handleFileSelect = () => {
    setFormData(formData);
    setShowForm(formData && true ? true : false);
  };

  return (
    <div className="flex">
      <ToastContainer />
      <div className="w-full">
      <UploadJSON onFileUpload={handleFileUpload} onFileSelect={handleFileSelect} showForm={showForm}  />
      {/* <HistoryNavBar history={history} onRevert={handleRevert} /> */}
      </div>
    </div>
  );
};

export default ManifestForm;
