import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export const OtaPackageForm = ({ otaPackage, handleChange, handleAddField, handleRemoveField }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="otaUrl">URL</Label>
        <Input id="otaUrl" value={otaPackage && (otaPackage.url || "")} onChange={(e) => handleChange(e, "otaPackage.full.url")} />
      </div>
      <div>
        <Label htmlFor="otaVersion">Version</Label>
        <Input id="otaVersion" value={otaPackage && (otaPackage.version || "")} onChange={(e) => handleChange(e, "otaPackage.full.version")} />
      </div>
      <div>
        <Label htmlFor="otaChangelog">Changelog</Label>
        <Input id="otaChangelog" value={otaPackage && (otaPackage.changelog || "")} onChange={(e) => handleChange(e, "otaPackage.full.changelog")} />
      </div>
      <div>
        <Label htmlFor="otaMd5">MD5</Label>
        <Input id="otaMd5" value={otaPackage && (otaPackage.md5 || "")} onChange={(e) => handleChange(e, "otaPackage.full.md5")} /> 
      </div>
      <div>
      <Label htmlFor={`forceupdate`}>Force Update</Label>
<div className="mb-4"></div>
<select
  id={`forceupdate`}
  value={otaPackage && (otaPackage.forceupdate || "")}
  onChange={(e) => handleChange(e, `otaPackage.full.forceupdate`)}
  className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
>
  <option value="no">No</option>
  <option value="yes">Yes</option>
</select>
      </div>
      <div>
        <Label htmlFor="otaForceUpdateMinVersion">Force Update Min Version</Label>
        <Input id="otaForceUpdateMinVersion" value={otaPackage && (otaPackage.forceupdateminversion || "")} onChange={(e) => handleChange(e, "otaPackage.full.forceupdateminversion")} />
      </div>
      <div>
        <Label htmlFor="otaForceUpdateMaxVersion">Force Update Max Version</Label>
        <Input id="otaForceUpdateMaxVersion" value={otaPackage && (otaPackage.forceupdatemaxversion || "")} onChange={(e) => handleChange(e, "otaPackage.full.forceupdatemaxversion")} />
      </div>
      <div>
        <Label>Whitelist</Label>
        {otaPackage && (otaPackage.whitelist || []).map((item, index) => (
          <div key={index} className="mt-2">
            <Input value={item} onChange={(e) => handleChange(e, `otaPackage.full.whitelist.${index}`)} />
          </div>
        ))}
        <div>
          <Button onClick={() => handleAddField("otaPackage.full.whitelist")} className="mt-2" variant="outline">
            Add Whitelist
          </Button>
          <Button
  onClick={() => handleRemoveField("otaPackage.full.whitelist")}
  className="mt-2 ml-2 bg-red-500 hover:bg-red-600 text-white"
>
  Remove Whitelist
</Button>
        </div>
      </div>
      <div>
        <Label>Blacklist</Label>
        {otaPackage && (otaPackage.blacklist || []).map((item, index) => (
          <div key={index} className="mt-2">
            <Input value={item} onChange={(e) => handleChange(e, `otaPackage.full.blacklist.${index}`)} />
          </div>
        ))}
        <div className="mb-4">
          <Button onClick={() => handleAddField("otaPackage.full.blacklist")} className="mt-2" variant="outline">
            Add Blacklist
          </Button>
          <Button onClick={() => handleRemoveField("otaPackage.full.blacklist")} className="mt-2 ml-2 bg-red-500 hover:bg-red-600 text-white" variant="outline">
            Remove Blacklist
          </Button>
        </div>
      </div>
    </div>
  )
}

