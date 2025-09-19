"use client";

import { Paperclip, Download, Send, CornerUpLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Email } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

function getInitials(name: string) {
  const parts = name.split(/[\s-@.]+/);
  return parts.map(part => part.charAt(0)).join('').toUpperCase().substring(0, 2);
}

export default function EmailView({ email }: { email: Email }) {
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);

  const handleReplySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsReplying(false);
    toast({
      title: 'Reply Sent',
      description: 'Your secure reply has been sent successfully.',
    });
    (event.target as HTMLFormElement).reset();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>{getInitials(email.from)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-0.5">
                <div className="font-semibold">{email.from}</div>
                <div className="text-xs text-muted-foreground">to {email.to}</div>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {new Date(email.timestamp).toLocaleString()}
            </div>
        </div>
        <CardTitle className="mt-4 text-2xl">{email.subject}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div
          className="prose prose-sm max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: email.body }}
        />

        {email.attachments && email.attachments.length > 0 && (
          <>
            <Separator className="my-6" />
            <div>
              <h3 className="mb-4 text-lg font-semibold flex items-center">
                <Paperclip className="mr-2 h-5 w-5" />
                Attachments ({email.attachments.length})
              </h3>
              <div className="space-y-3">
                {email.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Paperclip />
                      </div>
                      <div>
                        <div className="font-medium">{attachment.name}</div>
                        <div className="text-sm text-muted-foreground">{attachment.size}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
       <CardContent className="p-4 sm:p-6 border-t">
        {isReplying ? (
          <form onSubmit={handleReplySubmit} className="space-y-4">
            <div>
              <Label htmlFor="reply-body" className="font-semibold">Your Secure Reply</Label>
              <Textarea id="reply-body" placeholder="Type your reply..." className="mt-2 min-h-[120px]" />
            </div>
             <div>
              <Label htmlFor="reply-attachments">Attach Files</Label>
              <Input id="reply-attachments" type="file" multiple className="mt-2" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsReplying(false)}>Cancel</Button>
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                Send Reply
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setIsReplying(true)}>
            <CornerUpLeft className="mr-2 h-4 w-4" />
            Reply
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
