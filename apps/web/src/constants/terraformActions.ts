import { 
  Play, 
  RotateCw, 
  Trash2, 
  CheckCircle,
  ShieldCheck,
  Code,
  FileOutput,
  Eye
} from 'lucide-react';

export interface TerraformAction {
  id: string;
  label: string;
  command: string;
  icon: any;
  className: string;
}

export const TERRAFORM_ACTIONS: TerraformAction[] = [
  {
    id: 'init',
    label: 'Init',
    command: 'init',
    icon: RotateCw,
    className: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'plan',
    label: 'Plan',
    command: 'plan',
    icon: CheckCircle,
    className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    id: 'apply',
    label: 'Apply',
    command: 'apply -auto-approve',
    icon: Play,
    className: 'bg-green-600 hover:bg-green-700 text-white',
  },
  {
    id: 'destroy',
    label: 'Destroy',
    command: 'destroy -auto-approve',
    icon: Trash2,
    className: 'bg-red-600 hover:bg-red-700 text-white',
  },
  {
    id: 'validate',
    label: 'Validate',
    command: 'validate',
    icon: ShieldCheck,
    className: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  {
    id: 'fmt',
    label: 'Format',
    command: 'fmt',
    icon: Code,
    className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  {
    id: 'output',
    label: 'Output',
    command: 'output',
    icon: FileOutput,
    className: 'bg-cyan-600 hover:bg-cyan-700 text-white',
  },
  {
    id: 'show',
    label: 'Show',
    command: 'show',
    icon: Eye,
    className: 'bg-slate-600 hover:bg-slate-700 text-white',
  },
];