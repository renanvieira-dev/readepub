"use client";

import React, { useState } from "react";
import { loginLocalUser, registerLocalUser } from "@/lib/localAuth";
import {
  BookOpen,
  Sparkles,
  Flame,
  Lock,
  Mail,
  ArrowRight,
  User,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isRegister) {
      if (password.length < 4) {
        setErrorMsg("A palavra-passe deve conter pelo menos 4 caracteres.");
        return;
      }
      const res = registerLocalUser(email, password, name, rememberMe);
      if (!res.success) {
        setErrorMsg(res.message || "Erro ao criar conta.");
        return;
      }
    } else {
      const res = loginLocalUser(email, password, rememberMe);
      if (!res.success) {
        setErrorMsg(res.message || "Credenciais inválidas.");
        return;
      }
    }

    onAuthenticated();
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#1B2632] text-[#EEE9DF] p-6 selection:bg-[#FFB162]/30 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col gap-6 my-auto">
        {/* Logótipo e Descrição */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FFB162]/15 border border-[#FFB162]/30 flex items-center justify-center text-[#FFB162] shadow-xl shadow-[#FFB162]/10">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EEE9DF]">ReadEpub</h1>
          <p className="text-xs text-[#C9C1B1]">
            A sua biblioteca inteligente offline com foco e gamificação.
          </p>
        </div>

        {/* Formulário com a Paleta Abyssal Blue */}
        <form
          onSubmit={handleAuth}
          className="bg-[#2C3B4D] border border-[#C9C1B1]/20 p-6 sm:p-7 rounded-3xl backdrop-blur-xl flex flex-col gap-4 shadow-2xl"
        >
          {errorMsg && (
            <div className="p-3 bg-[#A35139]/30 border border-[#A35139]/50 text-[#FFB162] text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-[#C9C1B1] block mb-1.5">
                Nome
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-[#C9C1B1] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="O seu nome"
                  className="w-full bg-[#1B2632] border border-[#C9C1B1]/20 rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/40 focus:outline-none focus:border-[#FFB162] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#C9C1B1] block mb-1.5">
              E-mail
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#C9C1B1] absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-[#1B2632] border border-[#C9C1B1]/20 rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/40 focus:outline-none focus:border-[#FFB162] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#C9C1B1] block mb-1.5">
              Palavra-passe
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#C9C1B1] absolute left-3 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira a sua senha"
                className="w-full bg-[#1B2632] border border-[#C9C1B1]/20 rounded-xl pl-9 pr-10 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/40 focus:outline-none focus:border-[#FFB162] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 p-1 text-[#C9C1B1] hover:text-[#EEE9DF] transition-colors cursor-pointer"
                title={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Opção: Permanecer conectado */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setRememberMe((p) => !p)}
                className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors border ${
                  rememberMe
                    ? "bg-[#FFB162] border-[#FFB162] text-[#1B2632]"
                    : "bg-[#1B2632] border-[#C9C1B1]/30"
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span
                onClick={() => setRememberMe((p) => !p)}
                className="text-xs text-[#C9C1B1] hover:text-[#EEE9DF] transition-colors"
              >
                Permanecer conectado
              </span>
            </label>
          </div>

          {/* Botão de Submissão */}
          <button
            type="submit"
            className="w-full mt-2 py-3 bg-[#FFB162] hover:bg-[#FFB162]/90 text-[#1B2632] font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-[#FFB162]/15"
          >
            <span>{isRegister ? "Criar Conta Local" : "Entrar no ReadEpub"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Alternar entre Entrar e Registar */}
          <button
            type="button"
            onClick={() => {
              setIsRegister((prev) => !prev);
              setErrorMsg(null);
            }}
            className="text-xs text-[#C9C1B1] hover:text-[#EEE9DF] transition-colors text-center mt-1 cursor-pointer"
          >
            {isRegister
              ? "Já tem uma conta guardada? Iniciar Sessão"
              : "Ainda não tem conta? Criar nova conta local"}
          </button>
        </form>

        {/* Rodapé Informativo */}
        <div className="flex items-center justify-around text-center text-[#C9C1B1] text-xs py-2 border-t border-[#C9C1B1]/20">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#FFB162]" />
            <span>Sequência de Dias Ativa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFB162]" />
            <span>Dados 100% no seu dispositivo</span>
          </div>
        </div>
      </div>
    </div>
  );
}