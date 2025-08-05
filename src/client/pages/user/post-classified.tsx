// Post classified ad page
import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PostClassified() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Publicar Clasificado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Formulario para publicar clasificados - En desarrollo</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}