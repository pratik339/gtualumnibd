import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useColleges } from '@/hooks/useColleges';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus } from 'lucide-react';

interface CollegeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export function CollegeSelector({ value, onChange, label = "Affiliated College", required = false }: CollegeSelectorProps) {
  const { colleges, refetch } = useColleges();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeCity, setNewCollegeCity] = useState('');
  const [adding, setAdding] = useState(false);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'other') {
      setShowOtherInput(true);
      onChange('');
    } else {
      setShowOtherInput(false);
      onChange(selectedValue);
    }
  };

  const handleAddCollege = async () => {
    if (!newCollegeName.trim()) {
      toast({
        title: 'Please enter a college name',
        variant: 'destructive',
      });
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('colleges')
        .insert({
          name: newCollegeName.trim(),
          city: newCollegeCity.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'College added successfully',
        description: 'Your college has been added to the list.',
      });

      // Refetch colleges and select the new one
      await refetch();
      onChange(data.id);
      setShowOtherInput(false);
      setNewCollegeName('');
      setNewCollegeCity('');
    } catch (error: any) {
      console.error('Error adding college:', error);
      toast({
        title: 'Error adding college',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleCancel = () => {
    setShowOtherInput(false);
    setNewCollegeName('');
    setNewCollegeCity('');
  };

  return (
    <div className="space-y-3">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      
      {!showOtherInput ? (
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select college" />
          </SelectTrigger>
          <SelectContent className="bg-popover max-h-[300px]">
            {colleges.map((college) => (
              <SelectItem key={college.id} value={college.id}>
                {college.name} {college.city && `(${college.city})`}
              </SelectItem>
            ))}
            {isAdmin && (
              <SelectItem value="other" className="text-primary font-medium">
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Other (Add New College)
                </span>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="new_college_name" className="text-sm">College Name *</Label>
            <Input
              id="new_college_name"
              placeholder="Enter your college name"
              value={newCollegeName}
              onChange={(e) => setNewCollegeName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="new_college_city" className="text-sm">City (Optional)</Label>
            <Input
              id="new_college_city"
              placeholder="Enter city"
              value={newCollegeCity}
              onChange={(e) => setNewCollegeCity(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleAddCollege}
              disabled={adding || !newCollegeName.trim()}
              size="sm"
            >
              {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add College
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
