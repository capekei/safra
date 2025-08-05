// User dashboard page
import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Dashboard</h1>
          <p className="text-gray-600 mt-2">Panel de control del usuario</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mis Clasificados</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Gestiona tus anuncios clasificados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mis Reseñas</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Revisa las reseñas que has escrito</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ajusta tus preferencias</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}