-- Add UPDATE policy for conversations so users can update updated_at
CREATE POLICY "Users can update their conversations"
ON public.conversations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);