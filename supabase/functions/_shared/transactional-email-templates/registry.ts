/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as registrationConfirmation } from './registration-confirmation.tsx'
import { template as groupRegistrationConfirmation } from './group-registration-confirmation.tsx'
import { template as privateRegistrationConfirmation } from './private-registration-confirmation.tsx'
import { template as kidsRegistrationConfirmation } from './kids-registration-confirmation.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'registration-confirmation': registrationConfirmation,
  'group-registration-confirmation': groupRegistrationConfirmation,
  'private-registration-confirmation': privateRegistrationConfirmation,
  'kids-registration-confirmation': kidsRegistrationConfirmation,
}
