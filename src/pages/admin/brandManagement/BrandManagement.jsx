import React, { useState, useEffect } from 'react';
import BrandManagementSearchbar from "./BrandManagementSearchbar"
import BrandManagementContent from './BrandManagementContent';

const BrandManagement = ({ registerTrigger }) => {
  const [insertOpen, setInsertOpen] = useState(false);

  useEffect(() => {
    if (registerTrigger > 0) setInsertOpen(true);
  }, [registerTrigger]);

  return <div>
      <BrandManagementSearchbar />
      <BrandManagementContent insertOpen={insertOpen} onInsertClose={() => setInsertOpen(false)} />
  </div>;
};

export default BrandManagement;
