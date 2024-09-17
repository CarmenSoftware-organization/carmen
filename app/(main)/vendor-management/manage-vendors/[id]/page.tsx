'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DetailPageTemplate from '@/components/templates/DetailPageTemplate';
import FormPageTemplate from '@/components/templates/FormPageTemplate';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface Vendor {
  id: string;
  companyName: string;
  businessRegistrationNumber: string;
  taxId: string;
  establishmentDate: string;
  businessTypeId: string;
  isActive: boolean;
  addresses: Address[];
  contacts: Contact[];
  rating: number;
}

interface Address {
  id: string;
  addressType: 'MAIN' | 'BILLING' | 'SHIPPING';
  addressLine: string;
  subDistrictId: string;
  districtId: string;
  provinceId: string;
  postalCode: string;
  isPrimary: boolean;
}

interface Contact {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  department: string;
  isPrimary: boolean;
}

const VendorData : Vendor = {
  id: "1",
  companyName: "Tech Innovations Inc.",
  businessRegistrationNumber: "BRN123456789",
  taxId: "TID987654321",
  establishmentDate: "2010-05-15",
  businessTypeId: "TECH001",
  isActive: true,
  addresses: [
    {
      id: "ADDR001",
      addressType: "MAIN",
      addressLine: "123 Silicon Valley",
      subDistrictId: "SD001",
      districtId: "D001",
      provinceId: "P001",
      postalCode: "94025",
      isPrimary: true
    },
    {
      id: "ADDR002",
      addressType: "BILLING",
      addressLine: "456 Finance Street",
      subDistrictId: "SD002",
      districtId: "D002",
      provinceId: "P002",
      postalCode: "94026",
      isPrimary: false
    }
  ],
  contacts: [
    {
      id: "CONT001",
      name: "John Doe",
      position: "CEO",
      phone: "555-1234",
      email: "john.doe@techinnovations.com",
      department: "Executive",
      isPrimary: true
    },
    {
      id: "CONT002",
      name: "Jane Smith",
      position: "CTO",
      phone: "555-5678",
      email: "jane.smith@techinnovations.com",
      department: "Technology",
      isPrimary: false
    }
  ],
  rating: 4.8
}

export default function VendorDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendor() {
      try {
        
        // const response = await fetch(`/api/vendors/${params.id}`);
        // if (!response.ok) {
        //   throw new Error('Failed to fetch vendor');
        // }
        // const data = await response.json();

        const data = VendorData;
        setVendor(data);
      } catch (error) {
        setError('Error fetching vendor xxxx');
        console.error('Error fetching vendor:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVendor();
    
  }, [params.id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      });

      if (!response.ok) throw new Error('Failed to update vendor');

      toast({ title: "Vendor updated successfully" });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({ title: "Error", description: "Failed to update vendor", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        const response = await fetch(`/api/vendors/${vendor.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete vendor');

        toast({ title: "Vendor deleted successfully" });
        router.push('/vendors');
      } catch (error) {
        console.error('Error deleting vendor:', error);
        toast({ title: "Error", description: "Failed to delete vendor", variant: "destructive" });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVendor(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = () => {
    setVendor(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setVendor(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!vendor) return <div>Vendor not found</div>;

  const actionButtons = (
    <>
      {isEditing ? (
        <>
          <Button onClick={handleSave}>Save</Button>
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
        </>
      ) : (
        <>
          <Button onClick={handleEdit}>Edit</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </>
      )}
    </>
  );

  const content = (
    <Tabs defaultValue="basic">
      <TabsList>
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="addresses">Addresses</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
      </TabsList>
      <TabsContent value="basic">
        <div className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={vendor.companyName}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="businessRegistrationNumber">Business Registration Number</Label>
            <Input
              id="businessRegistrationNumber"
              name="businessRegistrationNumber"
              value={vendor.businessRegistrationNumber}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="taxId">Tax ID</Label>
            <Input
              id="taxId"
              name="taxId"
              value={vendor.taxId}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="establishmentDate">Establishment Date</Label>
            <Input
              id="establishmentDate"
              name="establishmentDate"
              type="date"
              value={vendor.establishmentDate}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="businessTypeId">Business Type</Label>
            <Select
              name="businessTypeId"
              value={vendor.businessTypeId}
              onValueChange={(value) => handleSelectChange('businessTypeId', value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {/* Add business type options here */}
                <SelectItem value="1">Type 1</SelectItem>
                <SelectItem value="2">Type 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={vendor.isActive}
              onCheckedChange={handleSwitchChange}
              disabled={!isEditing}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="addresses">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Primary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendor.addresses.map((address) => (
              <TableRow key={address.id}>
                <TableCell>{address.addressType}</TableCell>
                <TableCell>{address.addressLine}</TableCell>
                <TableCell>{address.isPrimary ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {isEditing && (
                    <>
                      <Button variant="ghost">Edit</Button>
                      <Button variant="ghost">Delete</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {isEditing && <Button className="mt-4">Add Address</Button>}
      </TabsContent>
      <TabsContent value="contacts">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Primary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendor.contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.position}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.isPrimary ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {isEditing && (
                    <>
                      <Button variant="ghost">Edit</Button>
                      <Button variant="ghost">Delete</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {isEditing && <Button className="mt-4">Add Contact</Button>}
      </TabsContent>
    </Tabs>
  );

  return (
    <DetailPageTemplate
      title={`Vendor: ${vendor.companyName}`}
      actionButtons={actionButtons}
      content={content}
    />
  );
}
