import { useState } from "react";
import { X, FileInput } from "lucide-react";
import DynamicForm from "./DynamicForm";

export const UploadJSON = ({ onFileUpload, onFileSelect, showForm }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [prefillData, setPrefillData] = useState({});

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = JSON.parse(e.target?.result);
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
      };
      reader.readAsText(file);
    }
  };
  const handleDeleteFile = (id) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
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
                    {/* <button
                      onClick={() => showForm && setPrefillData(file.content)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                      title="Pre-fill form"
                    >
                      <FileInput size={16} />
                    </button> */}
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
    </div>
    <div className="w-full">
    {showForm && <DynamicForm prefillData={prefillData} />}
    </div>
    </div>
  );
};
