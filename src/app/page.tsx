"use client";

import Link from "next/link";
import RegistroUsers from "../interfaces/RegistroUsers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="p-10 font-sans flex flex-col gap-6">
      <div className="flex justify-between items-center">
    
        
      </div>

      <Card className="p-6 shadow-lg">
        <RegistroUsers />
      </Card>
    </div>
  );
}
