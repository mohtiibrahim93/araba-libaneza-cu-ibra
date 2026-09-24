import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as registrationConfirmation } from './registration-confirmation'
import { template as groupRegistrationConfirmation } from './group-registration-confirmation'
import { template as privateRegistrationConfirmation } from './private-registration-confirmation'
import { template as kidsRegistrationConfirmation } from './kids-registration-confirmation'
import { template as bookingConfirmation } from './booking-confirmation'
import { template as bookingReminder } from './booking-reminder'
import { template as bookingCancelled } from './booking-cancelled'
import { template as bookingRescheduled } from './booking-rescheduled'
import { template as trialFollowup } from './trial-followup'
import { template as adminNewRegistration } from './admin-new-registration'
import { template as adminBooking } from './admin-booking'
import { template as gdprErasureRequest } from './gdpr-erasure-request'
import { template as arabiziCheatSheet } from './arabizi-cheat-sheet'
import { template as expresiiLibaneze } from './expresii-libaneze'
import { template as plan30Zile } from './plan-30-zile'
import { template as bookingsAccess } from './bookings-access'

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
  'admin-booking': adminBooking,
  'gdpr-erasure-request': gdprErasureRequest,
  'arabizi-cheat-sheet': arabiziCheatSheet,
  'expresii-libaneze': expresiiLibaneze,
  'plan-30-zile': plan30Zile,
  'bookings-access': bookingsAccess,
}

