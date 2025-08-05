// News preferences page
import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewsPreferences() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Preferencias de Noticias</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Configura tus preferencias de noticias - En desarrollo</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}