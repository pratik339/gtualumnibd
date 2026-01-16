-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;

-- Create a non-recursive policy using a security definer function
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id uuid, uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id AND user_id = uid
  );
$$;

-- Create new non-recursive SELECT policy for conversation_participants
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants
FOR SELECT
USING (
  public.is_conversation_participant(conversation_id, auth.uid())
);

-- Also fix the conversations SELECT policy to avoid potential issues
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (
  public.is_conversation_participant(id, auth.uid())
);

-- Fix the conversations UPDATE policy
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

CREATE POLICY "Users can update their conversations"
ON public.conversations
FOR UPDATE
USING (
  public.is_conversation_participant(id, auth.uid())
)
WITH CHECK (
  public.is_conversation_participant(id, auth.uid())
);

-- Fix messages SELECT policy
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  public.is_conversation_participant(conversation_id, auth.uid())
);

-- Fix messages INSERT policy
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;

CREATE POLICY "Users can send messages to their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND public.is_conversation_participant(conversation_id, auth.uid())
);