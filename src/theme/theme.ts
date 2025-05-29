// src/theme/theme.ts
export const colors = {
  primaryBlue: '#5DADE2',
  lightBlueHeaderArea: '#EBF5FF',
  logoBackground: '#EBF5FF',
  pageTitle: '#3498DB',
  backgroundMain: '#F0F4F8',
  
  // VERIFIQUE AQUI:
  textDark: '#333333',           // Para títulos como "Login"
  
  textInput: '#333333',
  textLinkPrompt: '#566573',
  textLinkAction: '#2C3E50',
  placeholder: '#A0A0A0',
  
  // E VERIFIQUE AQUI:
  iconGray: '#808080',           // Para ícones nos inputs
  
  white: '#FFFFFF',
  inputBorder: '#E0E0E0',
  backArrow: '#3498DB',
  gradientBlueStart: '#A7D7F9',
  // Adicione outras cores conforme necessário
};

export const typography = {
  fontSizeBase: 16,
  fontFamilyBold: 'System',
  
  // E VERIFIQUE AQUI:
  fontSizeLargeTitle: 32,       // Para o título "Login"
  
  fontSizeInput: 16,
  // Adicione outros tamanhos de fonte se necessário
};

export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 30,
};

export const theme = { // Certifique-se de que 'colors' e 'typography' estão incluídos aqui
  colors,
  typography,
  spacing,
};

export default theme;