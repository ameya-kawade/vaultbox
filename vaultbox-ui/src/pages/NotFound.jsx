'use client';

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <>
    <div className="w-screen flex flex-col items-center justify-center min-h-screen bg-transparent text-center mb-6">
      <h1 className="text-4xl font-bold p-2">404 - Page Not Found</h1>
      <Link to="/">
        <Button variant="default">Go Back Home</Button>
      </Link>
      
    </div>
   
    </>
  );
};

export default NotFound;
