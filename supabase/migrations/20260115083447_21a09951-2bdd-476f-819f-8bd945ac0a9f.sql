-- Create connection status enum
CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create connections table
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for connections
CREATE POLICY "Users can view their own connections"
ON public.connections FOR SELECT
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can send connection requests"
ON public.connections FOR INSERT
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Addressee can update connection status"
ON public.connections FOR UPDATE
USING (addressee_id = auth.uid());

CREATE POLICY "Users can delete their own connection requests"
ON public.connections FOR DELETE
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_connections_requester ON public.connections(requester_id);
CREATE INDEX idx_connections_addressee ON public.connections(addressee_id);
CREATE INDEX idx_connections_status ON public.connections(status);

-- Trigger for updated_at
CREATE TRIGGER update_connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for connections
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;