"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send, Paperclip, X, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { analyzeEmailForSecurity, type AnalyzeEmailOutput } from '@/ai/flows/ai-security-analysis';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/zip',
];

const formSchema = z.object({
  recipient: z.string().email({ message: 'Invalid email address.' }),
  subject: z.string().min(1, { message: 'Subject is required.' }),
  body: z.string().min(1, { message: 'Email body cannot be empty.' }),
  attachments: z
    .custom<FileList>()
    .refine(
      (files) => Array.from(files ?? []).every((file) => file.size <= MAX_FILE_SIZE),
      `File size should be less than 5MB.`
    )
    .refine(
      (files) =>
        Array.from(files ?? []).every((file) => ACCEPTED_FILE_TYPES.includes(file.type)),
      'Only .jpg, .png, .pdf, and .zip files are accepted.'
    )
    .optional(),
});

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function ComposeEmailForm() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeEmailOutput | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: '',
      subject: '',
      body: '',
    },
  });
  
  const attachedFiles = form.watch('attachments');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsAnalyzing(true);
    try {
      let attachmentData: string[] = [];
      if (values.attachments) {
        attachmentData = await Promise.all(
          Array.from(values.attachments).map((file) => fileToBase64(file))
        );
      }

      const result = await analyzeEmailForSecurity({
        content: values.body,
        attachments: attachmentData,
      });
      
      setAnalysisResult(result);

      if (result.isSafe) {
        const uniqueId = Math.random().toString(36).substring(2, 12);
        const link = `${window.location.origin}/email/${uniqueId}`;
        setGeneratedLink(link);
      }
      
    } catch (error) {
      console.error('Security analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to perform security analysis. Please try again.',
      });
    } finally {
      setIsAnalyzing(false);
      setShowResultDialog(true);
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Copied!",
      description: "Secure link copied to clipboard.",
    });
  }

  const resetFormAndDialog = () => {
    form.reset();
    setShowResultDialog(false);
    setAnalysisResult(null);
    setGeneratedLink('');
  }


  return (
    <>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>New Message</CardTitle>
              <CardDescription>
                Your email will be analyzed for security threats before being encrypted and sent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <FormControl>
                      <Input placeholder="recipient@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Confidential Project Details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your secure message here."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attachments"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Attachments</FormLabel>
                    <FormControl>
                       <Button asChild variant="outline" className="w-full cursor-pointer">
                        <div>
                          <Paperclip className="mr-2" />
                          Attach Files
                          <Input
                            type="file"
                            className="sr-only"
                            multiple
                            onChange={(e) => onChange(e.target.files)}
                            {...rest}
                          />
                        </div>
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {attachedFiles && attachedFiles.length > 0 && (
                 <div className="space-y-2">
                  <h4 className="text-sm font-medium">Attached files:</h4>
                  <ul className="list-disc list-inside space-y-1 rounded-md border p-2">
                    {Array.from(attachedFiles).map((file, index) => (
                      <li key={index} className="text-sm">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isAnalyzing} className="ml-auto">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send />
                    Send Secure Email
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <AlertDialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <AlertDialogContent>
          {analysisResult?.isSafe ? (
             <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>
                Email is Safe & Ready to Send
              </AlertDialogTitle>
              <AlertDialogDescription>
                Our AI security scan found no threats. Your email has been encrypted. Share the secure link below with the recipient.
              </AlertDialogDescription>
              <div className="pt-2">
                <Label htmlFor="secure-link" className="sr-only">Secure Link</Label>
                <Input id="secure-link" readOnly value={generatedLink} />
              </div>
            </AlertDialogHeader>
          ) : (
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                 <ShieldAlert className="text-destructive" />
                Security Alert!
              </AlertDialogTitle>
              <AlertDialogDescription>
                <strong>Our AI security analysis flagged a potential issue:</strong>
                <p className="mt-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive-foreground">{analysisResult?.reason || 'No specific reason provided.'}</p>
                 <p className="mt-4 text-sm">For security reasons, this email cannot be sent. Please review the content and attachments.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
          )}

          <AlertDialogFooter>
            {analysisResult?.isSafe ? (
              <>
                <AlertDialogAction onClick={handleCopyToClipboard}>Copy Link</AlertDialogAction>
                <Button variant="outline" onClick={resetFormAndDialog}>Compose New</Button>
              </>
            ) : (
              <AlertDialogAction onClick={() => setShowResultDialog(false)}>OK</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
