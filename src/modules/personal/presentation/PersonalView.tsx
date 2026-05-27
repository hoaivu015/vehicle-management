import React from 'react';
import { PersonalWebView } from './PersonalWebView';
import { PersonalMobileView } from './PersonalMobileView';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';
import { Staff } from '@/src/shared/domain/types';

interface PersonalViewProps {
  user: Staff | null;
  onUpdateUser?: (docId: string, data: Partial<Staff>) => void;
  onLogout?: () => void;
}

/**
 * PersonalView - The Dispatcher.
 */
export const PersonalView: React.FC<PersonalViewProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <PersonalMobileView {...props} />;
  }

  return <PersonalWebView {...props} />;
};
