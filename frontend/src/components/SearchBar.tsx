
import React, { useState, FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (city: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex gap-3">
      <div className="relative flex-1">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for city..."
          className="pl-10 h-11 bg-white/80 dark:bg-gray-800/80 border-gray-200"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>
      <Button type="submit" variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600">
        Search
      </Button>
    </form>
  );
}
