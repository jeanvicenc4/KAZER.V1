'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleMark } from '@/components/auth/google-mark';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};

    if (!name.trim()) next.name = 'Informe seu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'E-mail inválido.';
    if (password.length < 6) next.password = 'Use ao menos 6 caracteres.';
    if (password && !/[0-9]/.test(password))
      next.password = 'Inclua ao menos um número.';

    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push('/onboarding');
  };

  return (
    <AuthShell
      quote={{
        text: 'Toda conta começa com 40 mensagens por dia. Sem cartão.',
        author: 'KAZER',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[26px] font-medium leading-[32px] tracking-[-0.015em] text-[var(--kazer-text)]">
          Criar conta
        </h1>
        <p className="mt-2 text-[14px] leading-[20px] text-[var(--kazer-text-2)]">
          Comece grátis. Você escolhe o plano depois.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          <Input
            label="Nome"
            autoComplete="name"
            placeholder="Como o KAZER deve te chamar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <Input
            label="Senha"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo de 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint="Use ao menos 6 caracteres, com um número."
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            {loading ? 'Criando conta…' : 'Criar conta'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--kazer-line)]" />
          <span className="text-[12px] text-[var(--kazer-text-3)]">ou</span>
          <span className="h-px flex-1 bg-[var(--kazer-line)]" />
        </div>

        <Button variant="secondary" size="lg" className="w-full">
          <GoogleMark />
          Continuar com Google
        </Button>

        <p className="mt-8 text-center text-[14px] text-[var(--kazer-text-2)]">
          Já tem conta?{' '}
          <Link
            href="/login"
            className="text-[var(--kazer-gold-text)] transition-colors hover:text-[var(--kazer-gold)]"
          >
            Entrar
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
