"use client";

import React, { useState } from "react";
import { loginLocalUser, registerLocalUser } from "@/lib/localAuth";
import { BookOpen, Sparkles, Flame, Lock, Mail, ArrowRight, User } from "lucide-react";

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isRegister) {
      if (password.length < 4) {
        setErrorMsg("A palavra-passe deve ter pelo menos 4 caracteres.");
        return;
      }
      const res = registerLocalUser(email, password, name);
      if (!res.success) {
        setErrorMsg(res.message || "Erro ao registar.");
        return;
      }
    } else {
      const res = loginLocalUser(email, password);
      if (!res.success) {
        setErrorMsg(res.message || "Credenciais inválidas.");
        return;
      }
    }

    onAuthenticated();
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-neutral-100 p-6 selection:bg-amber-500/30">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/5">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ReadEpub</h1>
          <p className="text-xs text-neutral-400">
            A sua biblioteca inteligente offline com foco e gamificação.
          </p>
        </div>

        <form
          onSubmit={handleAuth}
          className="bg-neutral-900/70 border border-neutral-800 p-6 rounded-2xl backdrop-blur-xl flex flex-col gap-4 shadow-2xl"
        >
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="text-xs font-medium text-neutral-400 block mb-1.5">
                Nome
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-neutral-500 absolute left-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="O seu nome"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-neutral-400 block mb-1.5">
              E-mail
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400 block mb-1.5">
              Palavra-passe
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira a sua senha"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            {isRegister ? "Criar Conta Local" : "Entrar no ReadEpub"}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegister((prev) => !prev);
              setErrorMsg(null);
            }}
            className="text-xs text-neutral-400 hover:text-white transition-colors text-center mt-1 cursor-pointer"
          >
            {isRegister
              ? "Já tem uma conta guardada? Iniciar Sessão"
              : "Ainda não tem conta? Criar nova conta local"}
          </button>
        </form>

        <div className="flex items-center justify-around text-center text-neutral-500 text-xs py-2 border-t border-neutral-800/80">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Sequência de Dias Ativa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Dados 100% no seu dispositivo</span>
          </div>
        </div>
      </div>
    </div>
  );
}