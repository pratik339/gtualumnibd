import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBranches } from '@/hooks/useBranches';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';

interface BranchSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export function BranchSelector({ value, onChange, label = "Branch / Discipline", required = false }: BranchSelectorProps) {
  const { branches, refetch } = useBranches();
  const { toast } = useToast();
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
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

  const handleAddBranch = async () => {
    if (!newBranchName.trim()) {
      toast({
        title: 'Please enter a branch name',
        variant: 'destructive',
      });
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('branches')
        .insert({
          name: newBranchName.trim(),
          code: newBranchCode.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Branch added successfully',
        description: 'Your branch has been added to the list.',
      });

      // Refetch branches and select the new one
      await refetch();
      onChange(data.id);
      setShowOtherInput(false);
      setNewBranchName('');
      setNewBranchCode('');
    } catch (error: any) {
      console.error('Error adding branch:', error);
      toast({
        title: 'Error adding branch',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleCancel = () => {
    setShowOtherInput(false);
    setNewBranchName('');
    setNewBranchCode('');
  };

  return (
    <div className="space-y-3">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      
      {!showOtherInput ? (
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent className="bg-popover max-h-[300px]">
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name} {branch.code && `(${branch.code})`}
              </SelectItem>
            ))}
            <SelectItem value="other" className="text-primary font-medium">
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Other (Add New Branch)
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="new_branch_name" className="text-sm">Branch Name *</Label>
            <Input
              id="new_branch_name"
              placeholder="Enter branch name (e.g., Computer Engineering)"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="new_branch_code" className="text-sm">Code (Optional)</Label>
            <Input
              id="new_branch_code"
              placeholder="Enter code (e.g., CE)"
              value={newBranchCode}
              onChange={(e) => setNewBranchCode(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleAddBranch}
              disabled={adding || !newBranchName.trim()}
              size="sm"
            >
              {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Branch
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
