import React, { useState } from 'react';
import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjectApi } from '@/api/api';

export const StartPage: React.FC = () => {
    const {
    createProject: { mutation: createProject, data, isLoading },
  } = useProjectApi();

  const handleSubmit = async () => {
    const values = createForm.getValues();

    // TypeScript will tell us if our input object is wrong!
    await createProject({
      project_id: values.id
    });
  };

  return data === null ? (
      <button onClick={handleSubmit}>Create Project</button>
    
  ) : (
    // TypeScript will tell us what attributes are on the data object!
    <div>Successfully created Project {data.name}</div>
  );
}