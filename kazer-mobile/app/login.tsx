import * as React from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { KazerLockup } from '../components/KazerMark';
import { useTheme } from '../src/theme';

export default function LoginScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const submit = () => {
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
    router.replace('/');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.base }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top + 40,
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 24,
        justifyContent: 'center',
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <KazerLockup size={30} />
      </View>

      <Text
        style={{
          color: theme.colors.text,
          fontSize: 24,
          fontWeight: '500',
          letterSpacing: -0.3,
          marginBottom: 6,
        }}
      >
        Entrar no KAZER
      </Text>
      <Text style={{ color: theme.colors.text2, fontSize: 14, marginBottom: 28 }}>
        Use a mesma conta da web e do app.
      </Text>

      <Text style={{ color: theme.colors.text2, fontSize: 13, marginBottom: 6 }}>
        E-mail
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="voce@empresa.com"
        placeholderTextColor={theme.colors.text3}
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="E-mail"
        style={{
          height: 46,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.colors.lineStrong,
          backgroundColor: theme.colors.inset,
          paddingHorizontal: 14,
          color: theme.colors.text,
          fontSize: 15,
          marginBottom: 16,
        }}
      />

      <Text style={{ color: theme.colors.text2, fontSize: 13, marginBottom: 6 }}>
        Senha
      </Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        placeholderTextColor={theme.colors.text3}
        secureTextEntry
        accessibilityLabel="Senha"
        style={{
          height: 46,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.colors.lineStrong,
          backgroundColor: theme.colors.inset,
          paddingHorizontal: 14,
          color: theme.colors.text,
          fontSize: 15,
          marginBottom: 10,
        }}
      />

      {error ? (
        <Text style={{ color: theme.colors.red, fontSize: 13, marginBottom: 10 }}>
          {error}
        </Text>
      ) : null}

      <Pressable
        onPress={submit}
        accessibilityRole="button"
        accessibilityLabel="Entrar"
        style={{
          height: 48,
          borderRadius: 10,
          backgroundColor: theme.colors.gold,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 8,
        }}
      >
        <Text style={{ color: theme.colors.textInverse, fontSize: 15, fontWeight: '600' }}>
          Entrar
        </Text>
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.line }} />
        <Text style={{ color: theme.colors.text3, fontSize: 12 }}>ou</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.line }} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continuar com Google"
        style={{
          height: 48,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.colors.lineStrong,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 15 }}>Continuar com Google</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/signup')}
        accessibilityRole="link"
        accessibilityLabel="Criar conta"
        style={{ marginTop: 28, alignItems: 'center' }}
      >
        <Text style={{ color: theme.colors.text2, fontSize: 14 }}>
          Ainda não tem conta?{' '}
          <Text style={{ color: theme.colors.goldText, fontWeight: '500' }}>Cadastre-se</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
