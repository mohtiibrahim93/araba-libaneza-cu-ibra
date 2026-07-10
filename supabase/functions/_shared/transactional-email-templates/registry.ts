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
import { template as bookingConfirmation } from './booking-confirmation.tsx'
import { template as bookingReminder } from './booking-reminder.tsx'
import { template as bookingCancelled } from './booking-cancelled.tsx'
import { template as bookingRescheduled } from './booking-rescheduled.tsx'
import { template as trialFollowup } from './trial-followup.tsx'
import { template as adminNewRegistration } from './admin-new-registration.tsx'
import { template as gdprErasureRequest } from './gdpr-erasure-request.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'registration-confirmation': registrationConfirmation,
  'group-registration-confirmation': groupRegistrationConfirmation,
  'private-registration-confirmation': privateRegistrationConfirmation,
  'kids-registration-confirmation': kidsRegistrationConfirmation,
  'booking-confirmation': bookingConfirmation,
  'booking-reminder': bookingReminder,
  'booking-cancelled': bookingCancelled,
  'booking-rescheduled': bookingRescheduled,
  'trial-followup': trialFollowup,
  'admin-new-registration': adminNewRegistration,
  'gdpr-erasure-request': gdprErasureRequest,
}
