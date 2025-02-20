import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState } from 'react';

const Field = ({ label, id, value, onChange, onBlur, error }) => (
  <div className="mb-4">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} value={value} onChange={onChange} onBlur={onBlur} className={error ? 'border-red-500 text-red-500' : ''} />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

export const AppForm = ({ app, index, handleChange, handleAddField, handleRemoveField }) => {
  const [errors, setErrors] = useState({});

  const validateField = (fieldName, value) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: value ? '' : `${fieldName.replace(/([A-Z])/g, ' $1')} is required`,
    }));
  };

  const handleBlur = (e, fieldName) => validateField(fieldName, e.target.value);

  const fields = [
    'appName', 'packageName', 'versionName', 'versionCode', 'iconThumbUrl', 
    'downloadUrl', 'md5', 'appDescription', 'releaseNotes', 'releaseDate'
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="nook_hub" className="w-full">
        <AccordionTrigger>NOOK Hub</AccordionTrigger>
      </AccordionItem>
    </Accordion>
  );
};
