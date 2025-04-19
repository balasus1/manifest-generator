import { useState,useEffect } from "react";
import { X, FileInput } from "lucide-react";
import DynamicForm from "./DynamicForm";
import { HistoryNavBar } from './HistoryNavBar';
import { getAllManifests } from '../app/action';
import JSON5 from "json5";

export const UploadJSON = ({ onFileUpload, onFileSelect, showForm }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [prefillData, setPrefillData] = useState({});
  const [history, setHistory] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = JSON5.parse(e.target?.result);
          const newFile = {
            id: Date.now().toString(),
            name: file.name,
            uploadTime: new Date(),
            content: content,
          };
          setUploadedFiles([newFile, ...uploadedFiles]);
          onFileUpload(file);
          onFileSelect(newFile.content);
          setPrefillData(newFile.content);
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          
          // Create a more helpful error message with just the line number
          let errorMessage = "The uploaded file contains invalid JSON.";
          
          if (error instanceof SyntaxError && e.target?.result) {
            const fileContent = e.target.result;
            
            // Extract position if available
            const positionMatch = error.message.match(/position (\d+)/);
            if (positionMatch && positionMatch[1]) {
              const position = parseInt(positionMatch[1], 10);
              
              // Calculate line number
              let line = 1;
              for (let i = 0; i < position; i++) {
                if (fileContent[i] === '\n') {
                  line++;
                }
              }
              
              errorMessage += ` Error at line ${line}.`;
              
              // Log the problematic line for debugging
              const lines = fileContent.split('\n');
              if (lines[line - 1]) {
                console.error(`Problematic line (${line}):`, lines[line - 1]);
              }
            }
          }
          
          errorMessage += " Please check for unescaped special characters or invalid syntax.";
          alert(errorMessage);
        }
      };
      
      reader.onerror = () => {
        alert("Error reading file. Please try again with a different file.");
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

  const handleDeleteFile = (id) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
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
  
  return (
    <div className="flex">
      <div className="px-5 pt-5">
        <div className="bg-white rounded-md shadow-md p-4 border-2 border-solid">
          <h2 className="text-lg font-semibold mb-2">Upload JSON</h2>
          <input
            type="file"
            accept="application/json"
            onChange={handleFileUpload}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploadedFiles.length > 0 && (
            <>
              <hr className="my-4 border-gray-200" />
              <h3 className="text-md font-semibold mb-2">Uploaded Files</h3>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex-grow min-w-0 mr-2">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.uploadTime.toLocaleString()}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                      {<button
                        onClick={() => showForm && setPrefillData(file.content)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        title="Pre-fill form"
                      >
                        <FileInput size={16} />
                      </button>}
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              
              </div>
            </>
          )}
        </div>
        {<HistoryNavBar history={history} onRevert={handleRevert} />}
      </div>
      <div className="w-full">
      {showForm && <DynamicForm prefillData={prefillData} />}
      </div>
    </div>
  );
};
