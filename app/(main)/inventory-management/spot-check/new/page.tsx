'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SpotCheckSetup } from '../components/setup';
import { useCountStore } from '@/lib/store/use-count-store';

export default function SpotCheckSetupPage() {
  const router = useRouter();
  const initializeSession = useCountStore(state => state.initializeSession);
  const [formData, setFormData] = useState({
    counterName: '',
    department: '',
    dateTime: new Date(),
    notes: '',
    targetCount: '',
  });

  const handleNext = () => {
    // Initialize the session before navigating
    initializeSession(
      formData.counterName,
      formData.department,
      formData.dateTime,
      formData.dateTime.toLocaleTimeString(),
      formData.notes,
      "spot"
    );
    router.push('/inventory-management/spot-check/new/location');
  };

  const handleBack = () => {
    router.push('/inventory-management/spot-check');
  };

  return (
    <div className="container max-w-2xl mx-auto">
      <SpotCheckSetup
        formData={formData}
        setFormData={setFormData}
        onNext={handleNext}
        onBack={handleBack}
      />
    </div>
  );
}
