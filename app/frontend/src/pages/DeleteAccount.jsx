import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Package, Trash2 } from 'lucide-react';

const requestSteps = [
  'Email support@sparepartshub.app from the email address connected to your SpareParts Hub account.',
  'Use the subject line "Delete my SpareParts Hub account".',
  'Include your full name, phone number, account role, and any business name connected to the account.',
  'We may ask you to verify account ownership before deleting data.',
];

const deletedData = [
  'Account profile details such as name, email address, phone number, role, and business profile details.',
  'Saved garage or vehicle details that are not required for retained transaction records.',
  'Active authentication/session records and local account preferences controlled by SpareParts Hub.',
  'Vendor inventory listings and uploaded part images where deletion does not conflict with completed order records.',
];

const retainedData = [
  'Completed order, payment, invoice, delivery, support, security, and dispute records may be retained where required for legal, tax, fraud prevention, accounting, or legitimate business purposes.',
  'Records retained for these reasons are kept only as long as necessary, typically up to 7 years where financial or legal obligations apply.',
  'Data stored with payment processors, maps providers, app stores, or device platforms may also be subject to those providers\' own retention rules.',
];

export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <section className="border-b border-zinc-800 bg-zinc-900/40">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="h-7 w-7 text-amber-500" />
            <h1 className="text-3xl md:text-4xl font-black">Delete Your SpareParts Hub Account</h1>
          </div>
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            Account and data deletion request
          </Badge>
          <p className="mt-4 text-zinc-400 max-w-3xl">
            This page explains how SpareParts Hub users can request deletion of their account and associated
            personal data.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">How to Request Account Deletion</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-zinc-300 list-decimal pl-5">
                {requestSteps.map((step) => (
                  <li key={step} className="text-sm leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-zinc-400">
                We aim to complete verified deletion requests within 30 days unless a longer period is required
                by law, security review, dispute handling, or fraud prevention.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">Data We Delete</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-zinc-300">
                {deletedData.map((item) => (
                  <li key={item} className="text-sm leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">Data We May Keep</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-zinc-300">
                {retainedData.map((item) => (
                  <li key={item} className="text-sm leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-300">
              <p>Support email: sparepartshub607@gmail.com</p>
              <p>Support phone: +234 707 151 4945</p>
              <p className="text-zinc-400">
                Include enough detail for us to locate and verify your account before deletion.
              </p>
            </CardContent>
          </Card>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link to="/" className="text-sm text-amber-500 hover:text-amber-400 font-medium">
              Back to home
            </Link>
            <Link to="/privacy-policy" className="text-sm text-amber-500 hover:text-amber-400 font-medium">
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
