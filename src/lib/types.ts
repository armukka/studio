export interface Attachment {
  name: string;
  size: string;
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  attachments: Attachment[];
  timestamp: string;
}
