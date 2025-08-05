// Post business review page
import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PostReview() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Escribir Reseña</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Formulario para escribir reseñas de negocios - En desarrollo</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}