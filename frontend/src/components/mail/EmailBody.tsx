import DOMPurify from 'dompurify';

interface Props {
  html: string;
  text: string;
}

export default function EmailBody({ html, text }: Props) {
  if (html) {
    const cleanHtml = DOMPurify.sanitize(html, {
      ADD_TAGS: ['style'],
      ADD_ATTR: ['target'],
    });

    return (
      <div
        className="email-body"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  }

  return (
    <pre className="email-body whitespace-pre-wrap font-sans">
      {text || '(No content)'}
    </pre>
  );
}
