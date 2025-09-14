'use client';

import { useEffect } from 'react';
import ContributionForm from "@/components/contribution-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ContributePage() {
  useEffect(() => {
    // Add a class to the body when component mounts
    document.body.classList.add('contribute-page');
    
    // Clean up the class when component unmounts
    return () => {
      document.body.classList.remove('contribute-page');
    };
  }, []);

  return (
    <div className="w-full"> 
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 ">
        <ContributionForm />
      </div>
    </div>
  );
}
