import { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';

export function ErrorMessage({ message }) {
  const { error } = useToast();
  useEffect(() => { if (message) error(message); }, [message, error]);
  return null;
}
