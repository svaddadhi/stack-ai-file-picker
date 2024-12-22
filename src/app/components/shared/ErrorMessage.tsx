interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
      <p>{message}</p>
    </div>
  );
}
