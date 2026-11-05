import { Children, ReactNode } from 'react';
import {
  DimensionValue,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { IconName } from '@/components/icons';
import { colors, fonts, radius } from '@/constants/theme';

function display(weight: '600' | '700'): TextStyle {
  return { fontFamily: weight === '700' ? fonts.display : fonts.displaySemi };
}

function ui(weight: '400' | '500' | '600' | '700'): TextStyle {
  const family = { '400': fonts.body, '500': fonts.medium, '600': fonts.semibold, '700': fonts.bold }[weight];
  return { fontFamily: family };
}

type TextVariant = 'display' | 'h1' | 'h2' | 'h3' | 'stat' | 'body' | 'bodySm' | 'label' | 'labelMd' | 'labelSm' | 'section';

export function AppText({
  variant = 'body',
  color,
  center,
  uppercase,
  style,
  children,
  numberOfLines,
  onPress,
}: {
  variant?: TextVariant;
  color?: string;
  center?: boolean;
  uppercase?: boolean;
  style?: StyleProp<import('react-native').TextStyle>;
  children: ReactNode;
  numberOfLines?: number;
  onPress?: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      numberOfLines={numberOfLines}
      style={[
        textStyles[variant],
        center && styles.centerText,
        uppercase && styles.upper,
        color ? { color } : null,
        style,
      ]}>
      {children}
    </Text>
  );
}

export function Icon({ name, size = 20, color = colors.ink }: { name: IconName; size?: number; color?: string }) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

const logoMark = require('../assets/images/logo-mark.png');
const logoFull = require('../assets/images/logo-full.png');

export function LogoMark({ width = 44 }: { width?: number }) {
  return (
    <Image
      source={logoMark}
      accessibilityLabel="AktivMate"
      style={{ width, height: width * (319 / 437) }}
      resizeMode="contain"
    />
  );
}

export function LogoLockup({ width = 260 }: { width?: number }) {
  const screen = useWindowDimensions();
  const fitted = Math.min(width, Math.max(160, screen.width - 48));
  return (
    <Image
      source={logoFull}
      accessibilityLabel="AktivMate. Track Together. Achieve Together."
      style={{ width: fitted, height: fitted * (668 / 1012) }}
      resizeMode="contain"
    />
  );
}

export function Avatar({
  label,
  size = 36,
  color = colors.primary,
}: {
  label: string;
  size?: number;
  color?: string;
}) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={{ color: '#fff', ...ui('600'), fontSize: Math.max(11, size * 0.36) }}>{label}</Text>
    </View>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  color = colors.ink,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.iconButton}>
      <Icon name={icon} size={20} color={color} />
    </Pressable>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'soft';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  leading,
  disabled,
  size = 'md',
  fullWidth = true,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  iconRight?: IconName;
  leading?: ReactNode;
  disabled?: boolean;
  size?: 'md' | 'sm';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const iconColor =
    variant === 'primary' || variant === 'dark' ? colors.onPrimary : variant === 'secondary' ? colors.primary : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        fullWidth ? styles.full : styles.hug,
        buttonVariant[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {leading}
      {icon ? <Icon name={icon} size={18} color={iconColor} /> : null}
      <AppText variant={size === 'sm' ? 'labelMd' : 'label'} color={iconColor} numberOfLines={1} style={styles.buttonLabel}>
        {label}
      </AppText>
      {iconRight ? <Icon name={iconRight} size={18} color={iconColor} /> : null}
    </Pressable>
  );
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      {children}
    </Pressable>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <AppText variant="section">{title}</AppText>
        {action}
      </View>
      {children}
    </View>
  );
}

export function List({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.list}>
      {items.map((child, index) => (
        <View key={index}>
          {child}
          {index < items.length - 1 ? <View style={styles.separator} /> : null}
        </View>
      ))}
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  value,
  onPress,
  trailing,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  trailing?: ReactNode;
}) {
  const copy = (
    <View style={styles.listCopy}>
      <AppText variant="label" numberOfLines={1}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="bodySm" numberOfLines={2}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
  const main = (
    <>
      {copy}
      {value ? (
        <AppText variant="bodySm" color={colors.ink}>
          {value}
        </AppText>
      ) : null}
      {onPress && !trailing ? <Icon name="chevron-right" size={20} color={colors.outline} /> : null}
    </>
  );
  return (
    <View style={styles.listRow}>
      {onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.listMain, pressed && styles.pressed]}>
          {main}
        </Pressable>
      ) : (
        <View style={styles.listMain}>{main}</View>
      )}
      {trailing}
    </View>
  );
}

export function Pill({
  label,
  icon,
  tone = 'mint',
}: {
  label: string;
  icon?: IconName;
  tone?: 'mint' | 'green' | 'white' | 'blue' | 'gold' | 'neutral';
}) {
  const toneStyle = pillTones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: toneStyle.bg }]}>
      {icon ? <Icon name={icon} size={14} color={toneStyle.text} /> : null}
      <AppText variant="labelSm" color={toneStyle.text}>
        {label}
      </AppText>
    </View>
  );
}

export function ProgressBar({
  progress,
  color = colors.primary,
  height = 8,
}: {
  progress: number;
  color?: string;
  height?: number;
}) {
  const width = `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%` as DimensionValue;
  return (
    <View style={[styles.track, { height }]}>
      <View style={{ width, height: '100%', backgroundColor: color, borderRadius: radius.pill }} />
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            onPress={() => onChange(option.id)}
            style={[styles.segmentItem, active && styles.segmentOn]}>
            <AppText variant="labelSm" color={active ? colors.ink : colors.secondary} numberOfLines={1} center>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function TextTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <View style={styles.textTabs}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            onPress={() => onChange(option.id)}
            style={[styles.textTab, active && styles.textTabOn]}>
            <AppText variant="labelSm" color={active ? colors.primary : colors.secondary} numberOfLines={1}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  trailing,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  icon?: IconName;
  trailing?: ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  maxLength?: number;
}) {
  return (
    <View style={styles.fieldWrap}>
      <AppText variant="labelMd" color={colors.secondary}>
        {label}
      </AppText>
      <View style={styles.field}>
        {icon ? <Icon name={icon} size={18} color={colors.outline} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          style={styles.input}
        />
        {trailing}
      </View>
    </View>
  );
}

export function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="Close sheet" style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <AppText variant="h3">{title}</AppText>
            <IconButton icon="close" label="Close" onPress={onClose} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function Screen({
  children,
  footer,
  safeBottom,
  onRefresh,
  refreshing,
}: {
  children: ReactNode;
  footer?: ReactNode;
  safeBottom?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          ) : undefined
        }
        contentContainerStyle={[
          styles.content,
          { paddingBottom: footer ? 16 : safeBottom ? insets.bottom + 28 : 28 },
        ]}>
        {children}
      </ScrollView>
      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View> : null}
    </View>
  );
}

const textStyles = StyleSheet.create({
  display: { ...display('700'), fontSize: 34, lineHeight: 40, letterSpacing: -0.4, color: colors.ink },
  h1: { ...display('700'), fontSize: 28, lineHeight: 34, letterSpacing: -0.3, color: colors.ink },
  h2: { ...display('700'), fontSize: 22, lineHeight: 28, letterSpacing: -0.2, color: colors.ink },
  h3: { ...display('600'), fontSize: 17, lineHeight: 22, color: colors.ink },
  stat: { ...display('700'), fontSize: 40, lineHeight: 44, letterSpacing: -0.8, color: colors.ink },
  body: { ...ui('400'), fontSize: 17, lineHeight: 22, color: colors.ink },
  bodySm: { ...ui('400'), fontSize: 15, lineHeight: 20, color: colors.secondary },
  label: { ...ui('600'), fontSize: 17, lineHeight: 22, color: colors.ink },
  labelMd: { ...ui('500'), fontSize: 15, lineHeight: 20, color: colors.ink },
  labelSm: { ...ui('400'), fontSize: 13, lineHeight: 18, color: colors.secondary },
  section: { ...ui('500'), fontSize: 13, lineHeight: 18, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.secondary },
});

const buttonVariant = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.mint },
  ghost: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.stroke },
  dark: { backgroundColor: colors.apple },
  soft: { backgroundColor: colors.surfaceContainer },
});

const pillTones = {
  mint: { bg: colors.mint, text: colors.onMint },
  green: { bg: colors.primary, text: colors.onPrimary },
  white: { bg: colors.card, text: colors.secondary },
  blue: { bg: '#d3e3ff', text: colors.tertiary },
  gold: { bg: '#f8e7c2', text: colors.goldText },
  neutral: { bg: colors.surfaceContainer, text: colors.secondary },
};

const styles = StyleSheet.create({
  centerText: { textAlign: 'center' },
  upper: { textTransform: 'uppercase', letterSpacing: 0.2 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonSm: { minHeight: 34, paddingHorizontal: 12, borderRadius: 10 },
  buttonLabel: { flexShrink: 1 },
  full: { alignSelf: 'stretch' },
  hug: { alignSelf: 'center', flexShrink: 0 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  section: { gap: 8 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  list: { backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden' },
  listRow: { minHeight: 56, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  listMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  listCopy: { flex: 1, minWidth: 0, gap: 2 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.stroke, marginLeft: 16 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  track: { backgroundColor: colors.track, borderRadius: radius.pill, overflow: 'hidden' },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 10,
    padding: 2,
  },
  segmentItem: { flex: 1, minHeight: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segmentOn: { backgroundColor: colors.card },
  textTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke,
    marginHorizontal: -16,
    paddingHorizontal: 8,
  },
  textTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  textTabOn: { borderBottomColor: colors.primary },
  fieldWrap: { gap: 6 },
  field: {
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: { flex: 1, minWidth: 0, color: colors.ink, fontFamily: fonts.body, fontSize: 17, paddingVertical: 12 },
  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(19,30,26,0.38)' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: '86%',
    gap: 8,
  },
  handle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 99, backgroundColor: colors.stroke, marginBottom: 4 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 22 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.stroke,
    backgroundColor: colors.surface,
  },
});
