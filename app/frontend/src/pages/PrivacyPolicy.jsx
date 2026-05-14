import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Package } from 'lucide-react';

const sections = [
  {
    title: 'Information We Collect',
    points: [
      'Account information: name, email address, phone number, role, and business details when applicable.',
      'Profile and garage details: profile fields you submit, plus vehicle details such as year, make, model, mileage, trim, and VIN (if provided).',
      'Order and request data: part requests, quotes, cart/order items, delivery details, and order status/timeline.',
      'Payment data: transaction references and payment status. Card payment processing is handled by Paystack.',
      'Location data: dispatcher location coordinates when location sharing/tracking is enabled in the app.',
      'Media data: images selected by vendors from device photo library for part listings.',
      'Technical and session data: authentication tokens and app/browser session data needed to keep you signed in and run core features.',
    ],
  },
  {
    title: 'How We Use Information',
    points: [
      'Create and manage accounts, authentication, and role-based access.',
      'Power marketplace operations such as listing parts, posting requests, ordering, dispatch assignment, and delivery tracking.',
      'Process and verify payments and provide payment-related updates.',
      'Provide in-app notifications, customer support, and service communications.',
      'Detect abuse, protect platform security, and improve reliability of the service.',
    ],
  },
  {
    title: 'How Information Is Shared',
    points: [
      'With other platform users as needed to fulfill transactions (for example, client/vendor/dispatcher order flow details).',
      'With service providers that help operate the platform, including payment processing (Paystack), mapping/location services (Google Maps), and infrastructure/database hosting providers.',
      'When required by law, legal process, or to protect rights, safety, and platform integrity.',
    ],
  },
  {
    title: 'Permissions and Device Access',
    points: [
      'Photo library access is requested only when a vendor chooses to upload a part image.',
      'Location access is requested only when dispatcher location tracking features are used.',
      'If permission is denied, related features may be unavailable, but the rest of the app can still function.',
    ],
  },
  {
    title: 'Data Storage and Retention',
    points: [
      'We retain account, order, and operational records for as long as needed to provide services, resolve disputes, and meet legal or security obligations.',
      'Some app/browser data is stored locally on your device (for example, session/cart state) to improve usability.',
      'When data is no longer required, we remove or de-identify it where reasonably practicable.',
    ],
  },
  {
    title: 'Your Choices and Rights',
    points: [
      'You can update profile information from account settings features available in the app.',
      'You can stop location sharing by disabling tracking features and/or OS-level location permission.',
      'You can request account or data help by contacting support.',
    ],
  },
  {
    title: 'Security',
    points: [
      'We use reasonable safeguards for account and transaction security, including password hashing and authenticated API access.',
      'No system is fully immune from risk, so please use a strong password and protect your account credentials.',
    ],
  },
  {
    title: 'Children\'s Privacy',
    points: [
      'SpareParts Hub is not intended for children under 13, and we do not knowingly collect personal information from children under 13.',
    ],
  },
  {
    title: 'Policy Updates',
    points: [
      'We may update this policy from time to time. Material changes will be reflected by updating the effective date on this page.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <section className="border-b border-zinc-800 bg-zinc-900/40">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-7 w-7 text-amber-500" />
            <h1 className="text-3xl md:text-4xl font-black">Privacy Policy</h1>
          </div>
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            Effective date: May 14, 2026
          </Badge>
          <p className="mt-4 text-zinc-400 max-w-3xl">
            This Privacy Policy explains how SpareParts Hub collects, uses, stores, and shares information
            when you use our web and mobile services.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          {sections.map((section) => (
            <Card key={section.title} className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-zinc-300">
                  {section.points.map((point) => (
                    <li key={point} className="text-sm leading-relaxed">
                      • {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-300">
              <p>Support email: support@sparepartshub.app</p>
              <p>Support phone: +12365550199</p>
              <p className="text-zinc-400">
                If you have privacy requests or questions, contact support and include enough detail for us to
                locate your account.
              </p>
            </CardContent>
          </Card>

          <div className="pt-2">
            <Link to="/" className="text-sm text-amber-500 hover:text-amber-400 font-medium">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

