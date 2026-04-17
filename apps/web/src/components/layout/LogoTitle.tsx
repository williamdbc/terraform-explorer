import { FaLayerGroup } from "react-icons/fa";

export function LogoTitle() {
  return (
    <div className="flex items-center gap-3 w-1/4">
      <div className="bg-blue-600 p-2 rounded-lg">
        <FaLayerGroup className="w-6 h-6" />
      </div>
      <div>
        <h1 className="text-xl font-bold">Terraform Explorer</h1>
        <p className="text-sm text-slate-300">Infra as Code</p>
      </div>
    </div>
  );
}
