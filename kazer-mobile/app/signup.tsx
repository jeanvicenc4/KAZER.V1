import * as React from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { KazerLockup } from '../components/KazerMark';
import { useTheme } from '../src/theme';

export default function SignupScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Informe seu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'E-mail inválido.';
    if (password.length < 6) next.password = 'Use ao menos 6 caracteres.';
    setErrors(next);
    if (Object.keys(next).length) return;
    router.replace('/onboarding');
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    errorKey: string,
    props: Record<string, unknown> = {},
  ) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: theme.colors.text2, fontSize: 13, marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholderTextColor={theme.colors.text3}
        accessibilityLabel={label}
        style={{
          height: 46,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: errors[errorKey] ? theme.colors.red : theme.colors.lineStrong,
          backgroundColor: theme.colors.inset,
          paddingHorizontal: 14,
          color: theme.colors.text,
          fontSize: 15,
        }}
        {...props}
      />
      {errors[errorKey] ? (
        <Text style={{ color: theme.colors.red, fontSize: 12, marginTop: 5 }}>
          {errors[errorKey]}
        </Text>
      ) : null}
    </View>
  );

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
        Criar conta
      </Text>
      <Text style={{ color: theme.colors.text2, fontSize: 14, marginBottom: 28 }}>
        Comece grátis. Você escolhe o plano depois.
      </Text>

      {field('Nome', name, setName, 'name', {
        placeholder: 'Como o KAZER deve te chamar',
        autoCapitalize: 'words',
      })}
      {field('E-mail', email, setEmail, 'email', {
        placeholder: 'voce@empresa.com',
        autoCapitalize: 'none',
        keyboardType: 'email-address',
      })}
      {field('Senha', password, setPassword, 'password', {
        placeholder: 'Mínimo de 6 caracteres',
        secureTextEntry: true,
      })}

      <Pressable
        onPress={submit}
        accessibilityRole="button"
        accessibilityLabel="Criar conta"
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
          Criar conta
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/login')}
        accessibilityRole="link"
        accessibilityLabel="Entrar"
        style={{ marginTop: 28, alignItems: 'center' }}
      >
        <Text style={{ color: theme.colors.text2, fontSize: 14 }}>
          Já tem conta?{' '}
          <Text style={{ color: theme.colors.goldText, fontWeight: '500' }}>Entrar</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
