// src/components/AppButton.tsx
import React from 'react';
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text, // Importe ViewStyle para o estilo do botão
    TextStyle,
    TouchableOpacity, // Importe StyleProp
    ViewStyle, // Importe ViewStyle para o estilo do botão
} from 'react-native';
import { theme } from '../theme/theme'; // Importe seu tema

// Definindo as props que o botão aceitará
interface AppButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;      // Estilo customizado para o container do botão
  textStyle?: StyleProp<TextStyle>;   // Estilo customizado para o texto do botão
  disabled?: boolean;                 // Para desabilitar o botão
  loading?: boolean;                  // Para mostrar um indicador de carregamento
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.buttonDisabled]} // Aplica estilos base, customizados e de desabilitado
      onPress={onPress}
      activeOpacity={0.7} // Opacidade ao pressionar
      disabled={disabled || loading} // Desabilita se 'disabled' ou 'loading' for true
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.white} />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// Estilos para o componente AppButton
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primaryBlue, // Cor de fundo do tema
    paddingVertical: theme.spacing.medium,     // Espaçamento vertical do tema (ex: 16)
    paddingHorizontal: 20,                     // Espaçamento horizontal
    borderRadius: 16,                          // Bordas arredondadas
    alignItems: 'center',                      // Centraliza o texto/loading
    justifyContent: 'center',                  // Centraliza o texto/loading
    width: '90%',                              // Largura padrão (pode ser sobrescrita via props.style)
    minHeight: 50,                             // Altura mínima para consistência
    // Sombra (opcional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonText: {
    color: theme.colors.white,                 // Cor do texto do tema
    fontWeight: 'bold',
    fontSize: theme.typography.fontSizeBase,   // Tamanho da fonte do tema (ex: 16)
    textTransform: 'uppercase',                // Texto em maiúsculas
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0', // Uma cor para indicar que o botão está desabilitado
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default AppButton; // Exporte o componente para poder usá-lo em outros lugares