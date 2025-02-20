import ManifestForm from '../components/ManifestForm';

export default function Home() {
  return (
    <div>
      <div className="flex flex-col items-left">
      <h1 className="text-left text-l bg-lime-300 font-serif italic text-shadow-md font-bold py-4 px-5 shadow-md

">Manifest Generator</h1>
      </div>
        <ManifestForm />
    </div>
  );
}