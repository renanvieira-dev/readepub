"use client";

import React, { useState, useEffect } from "react";
import { getActiveUser, logoutLocalUser, StoredUser } from "@/lib/localAuth";
import { SavedBook } from "@/lib/db";
import AuthScreen from "@/components/AuthScreen";
import GamificationDashboard from "@/components/GamificationDashboard";
import Reader from "@/components/Reader";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [activeBook, setActiveBook] = useState<SavedBook | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    const user = getActiveUser();
    setCurrentUser(user);
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const handleLogout = () => {
    logoutLocalUser();
    setCurrentUser(null);
    setActiveBook(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#1B2632] text-[#FFB162] font-mono text-xs">
        Carregando ReadEpub...
      </div>
    );
  }

  // 1. Tela de Login
  if (!currentUser) {
    return <AuthScreen onAuthenticated={refreshUser} />;
  }

  // 2. Tela Principal: Dashboard + Estante de Livros
  if (!activeBook) {
    return (
      <main className="w-full min-h-screen bg-[#1B2632]">
        <GamificationDashboard
          profile={currentUser}
          onOpenBook={(book) => setActiveBook(book)}
          onLogout={handleLogout}
        />
      </main>
    );
  }

  // 3. Leitor Ativo
  return (
    <main className="w-screen h-screen overflow-hidden">
      <Reader
        initialBook={activeBook}
        onBackToDashboard={() => {
          setActiveBook(null);
          refreshUser();
        }}
      />
    </main>
  );
}