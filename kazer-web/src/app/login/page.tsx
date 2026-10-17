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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Informe o e-mail.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('E-mail inválido.');
      return;
    }
    if (password.length < 6) {
      setError('A senha precisa ter ao menos 6 caracteres.');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    router.push('/kazer');
  };

  return (
    <AuthShell
      quote={{
        text: 'A resposta vem com fonte. O resultado vem pronto.',
        author: 'KAZER',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[26px] font-medium leading-[32px] tracking-[-0.015em] text-[var(--kazer-text)]">
          Entrar no KAZER
        </h1>
        <p className="mt-2 text-[14px] leading-[20px] text-[var(--kazer-text-2)]">
          Use a mesma conta da web e do app.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error && !email.trim() ? error : undefined}
          />

          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error && email.trim() ? error : undefined}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-[var(--kazer-text-2)]">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded-[4px] border-[var(--kazer-line-strong)] bg-[var(--kazer-inset)] accent-[var(--kazer-gold)]"
              />
              Manter conectado
            </label>
            <Link
              href="/signup"
              className="text-[13px] text-[var(--kazer-gold-text)] transition-colors hover:text-[var(--kazer-gold)]"
            >
              Esqueci a senha
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : null}
            {loading ? 'Entrando…' : 'Entrar'}
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
          Ainda não tem conta?{' '}
          <Link
            href="/signup"
            className="text-[var(--kazer-gold-text)] transition-colors hover:text-[var(--kazer-gold)]"
          >
            Cadastre-se
          </Link>
        </p>

        <p className="mt-6 text-center text-[12px] leading-[17px] text-[var(--kazer-text-3)]">
          Ao entrar você concorda com os Termos de Uso e a Política de
          Privacidade do KAZER.
        </p>
      </motion.div>
    </AuthShell>
  );
}
