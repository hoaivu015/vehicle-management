import React from 'react';
import { PersonalWebView } from './PersonalWebView';
import { PersonalMobileView } from './PersonalMobileView';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';
import { Staff } from '@/src/shared/domain/types';

import { usePersonalState } from './usePersonalState';

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
  const personalState = usePersonalState(props.user || ({} as Staff), props.onUpdateUser);

  if (isMobile) {
    return <PersonalMobileView {...props} state={personalState} />;
  }

  return <PersonalWebView {...props} state={personalState} />;
};
