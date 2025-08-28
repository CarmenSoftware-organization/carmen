
import { ReactNode } from 'react';

interface PolicyWizardHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

export function PolicyWizardHeader({ icon, title, subtitle }: PolicyWizardHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center">
        <span className="text-3xl mr-3">{icon}</span>
        <div>
          <h2 className="text-xl font-bold text-slate-700">{title}</h2>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
