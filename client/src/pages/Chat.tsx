'use client';

'use client';

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useChatContext } from '@/App';

/**
 * /chat route — redirects user to the home page and opens FloatingChat.
 * The actual chat UI lives in FloatingChat component.
 */
export default function Chat() {
  const [, navigate] = useLocation();
  const { openChat } = useChatContext();

  useEffect(() => {
    // Navigate to home and open FloatingChat
    navigate('/');
    setTimeout(() => openChat(), 100);
  }, []);

  return null;
}
