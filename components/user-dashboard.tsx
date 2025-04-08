'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/custom-dialog"
import { Label } from "@/components/ui/label"
import { UserCircle, Users, UserCheck, UserX, Search, UserPlus, MoreVertical, Edit, Power, Send } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type User = {
  id: number
  name: string
  email: string
  status: 'Active' | 'Inactive' | 'Pending'
}

const initialUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Pending' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', status: 'Active' },
  { id: 5, name: 'Tom Davis', email: 'tom@example.com', status: 'Inactive' },
]

export function UserDashboard() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ name: '', email: '', status: 'Active' })

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalUsers = users.length
  const activeUsers = users.filter(user => user.status === 'Active').length
  const inactiveUsers = users.filter(user => user.status === 'Inactive').length

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    const id = users.length + 1
    setUsers([...users, { id, ...newUser }])
    setNewUser({ name: '', email: '', status: 'Active' })
    setIsAddUserOpen(false)
  }

  const handleEditUser = (userId: number) => {
    console.log(`Edit user with ID: ${userId}`)
    // Implement edit functionality here
  }

  const handleDeactivateUser = (userId: number) => {
    console.log(`Deactivate user with ID: ${userId}`)
    // Implement deactivate functionality here
  }

  const handleSendMessage = (userId: number) => {
    console.log(`Send message to user with ID: ${userId}`)
    // Implement send message functionality here
  }

  const UserItem = ({ user }: { user: User }) => (
    <div className="flex items-center space-x-4 py-2">
      <UserCircle className="h-8 w-8 text-gray-400" />
      <div className="flex-grow">
        <p className="font-medium">{user.name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <span className={`text-sm ${
        user.status === 'Active' ? 'text-green-500' :
        user.status === 'Inactive' ? 'text-red-500' : 'text-yellow-500'
      }`}>
        {user.status}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDeactivateUser(user.id)}>
            <Power className="mr-2 h-4 w-4" />
            <span>Deactivate</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSendMessage(user.id)}>
            <Send className="mr-2 h-4 w-4" />
            <span>Send</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <div className=" mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="w-full md:w-1/3 relative">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <div className="flex space-x-4 items-center">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-medium">{totalUsers}</span>
            <span className="text-sm text-gray-500 ml-1">Total Users</span>
          </div>
          <div className="flex items-center">
            <UserCheck className="h-5 w-5 text-green-500 mr-2" />
            <span className="font-medium">{activeUsers}</span>
            <span className="text-sm text-gray-500 ml-1">Active Users</span>
          </div>
          <div className="flex items-center">
            <UserX className="h-5 w-5 text-red-500 mr-2" />
            <span className="font-medium">{inactiveUsers}</span>
            <span className="text-sm text-gray-500 ml-1">Inactive Users</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>User List</CardTitle>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={newUser.status}
                      onChange={(e) => setNewUser({ ...newUser, status: e.target.value as User['status'] })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <Button type="submit">Add User</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {filteredUsers.map((user) => (
              <UserItem key={user.id} user={user} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Users</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.filter(user => user.status === 'Pending').map((user) => (
              <UserItem key={user.id} user={user} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}