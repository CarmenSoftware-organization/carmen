"use client";

import { useState, useEffect } from "react";
import { User, Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface UserType {
  id: number;
  name: string;
  email: string;
  department?: string;
}

interface UserSearchProps {
  onSelect: (user: UserType) => void;
  selectedUsers: UserType[];
}

export function UserSearch({ onSelect, selectedUsers }: UserSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock users for demo purposes
  const mockUsers: UserType[] = [
    { id: 1, name: "John Doe", email: "john.doe@example.com", department: "Finance" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com", department: "HR" },
    { id: 3, name: "Bob Johnson", email: "bob.johnson@example.com", department: "IT" },
    { id: 4, name: "Alice Brown", email: "alice.brown@example.com", department: "Marketing" },
    { id: 5, name: "Charlie Davis", email: "charlie.davis@example.com", department: "Operations" },
  ];

  // Fetch users based on search query
  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery) {
        setUsers([]);
        return;
      }
      
      setLoading(true);
      try {
        // For demo purposes, we'll filter mock users instead of making an API call
        // In a real implementation, this would be:
        // const response = await fetch(`/api/users?search=${searchQuery}`);
        // const data = await response.json();
        
        const filteredUsers = mockUsers.filter(user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Check if user is already selected
  const isUserSelected = (userId: number) => {
    return selectedUsers.some(user => user.id === userId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Search className="mr-2 h-4 w-4" />
          Search users
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading users...
            </div>
          ) : (
            <>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[200px]">
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => {
                        onSelect(user);
                        setOpen(false);
                        setSearchQuery("");
                      }}
                      disabled={isUserSelected(user.id)}
                      className="flex items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
} 