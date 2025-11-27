import React, { CSSProperties, ReactNode, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

export type Style = CSSProperties & {
  paddingVertical?: number;
  paddingHorizontal?: number;
  marginVertical?: number;
  marginHorizontal?: number;
  transform?: Array<{
    scale?: number;
    translateX?: number;
    translateY?: number;
    rotate?: string;
  }>;
};

export type StyleProp = Style | Style[] | undefined | null;

type CommonProps = {
  style?: StyleProp;
  children?: ReactNode;
};

const flattenStyle = (style?: StyleProp): Style => {
  const entries = Array.isArray(style) ? style.flat().filter(Boolean) : style ? [style] : [];
  const merged: any = {};
  for (const item of entries) {
    Object.assign(merged, item);
  }

  if (merged.paddingVertical !== undefined) {
    merged.paddingTop = merged.paddingVertical;
    merged.paddingBottom = merged.paddingVertical;
    delete merged.paddingVertical;
  }
  if (merged.paddingHorizontal !== undefined) {
    merged.paddingLeft = merged.paddingHorizontal;
    merged.paddingRight = merged.paddingHorizontal;
    delete merged.paddingHorizontal;
  }
  if (merged.marginVertical !== undefined) {
    merged.marginTop = merged.marginVertical;
    merged.marginBottom = merged.marginVertical;
    delete merged.marginVertical;
  }
  if (merged.marginHorizontal !== undefined) {
    merged.marginLeft = merged.marginHorizontal;
    merged.marginRight = merged.marginHorizontal;
    delete merged.marginHorizontal;
  }

  if (Array.isArray(merged.transform)) {
    const transforms: string[] = [];
    for (const transform of merged.transform) {
      if (transform.scale !== undefined) transforms.push(`scale(${transform.scale})`);
      if (transform.translateX !== undefined) transforms.push(`translateX(${transform.translateX}px)`);
      if (transform.translateY !== undefined) transforms.push(`translateY(${transform.translateY}px)`);
      if (transform.rotate !== undefined) transforms.push(`rotate(${transform.rotate})`);
    }
    merged.transform = transforms.join(' ');
  }

  return merged;
};

export const StyleSheet = {
  create<T extends { [key: string]: Style }>(styles: T): T {
    return styles;
  },
};

export const View: React.FC<CommonProps & React.HTMLAttributes<HTMLDivElement>> = ({ style, children, ...rest }) => {
  const computed = useMemo(() => flattenStyle(style), [style]);
  return (
    <div style={computed} {...rest}>
      {children}
    </div>
  );
};

export const Text: React.FC<CommonProps & React.HTMLAttributes<HTMLSpanElement>> = ({ style, children, ...rest }) => {
  const computed = useMemo(() => flattenStyle(style), [style]);
  return (
    <span style={{ display: 'inline', ...computed }} {...rest}>
      {children}
    </span>
  );
};

type ScrollViewProps = CommonProps & {
  contentContainerStyle?: StyleProp;
  horizontal?: boolean;
};

export const ScrollView: React.FC<ScrollViewProps> = ({ style, contentContainerStyle, children, horizontal }) => {
  const wrapperStyle = useMemo(() => flattenStyle([{ overflowY: horizontal ? 'hidden' : 'auto' }, style]), [style, horizontal]);
  const innerStyle = useMemo(() => flattenStyle(contentContainerStyle), [contentContainerStyle]);
  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>{children}</div>
    </div>
  );
};

type TouchableOpacityProps = CommonProps & {
  onPress?: () => void;
  disabled?: boolean;
};

export const TouchableOpacity: React.FC<TouchableOpacityProps> = ({ style, children, onPress, disabled }) => {
  const computed = useMemo(() => flattenStyle(style), [style]);
  return (
    <button
      type="button"
      style={{ border: 'none', background: 'transparent', padding: 0, cursor: disabled ? 'default' : 'pointer', ...computed }}
      onClick={() => !disabled && onPress?.()}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

type ModalProps = {
  visible: boolean;
  transparent?: boolean;
  animationType?: 'none' | 'fade' | 'slide';
  onRequestClose?: () => void;
  children?: ReactNode;
};

export const Modal: React.FC<ModalProps> = ({ visible, children, onRequestClose }) => {
  if (!visible) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onRequestClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body,
  );
};

export const SafeAreaView: React.FC<CommonProps> = ({ style, children }) => {
  const computed = useMemo(() => flattenStyle(style), [style]);
  return <div style={{ minHeight: '100vh', ...computed }}>{children}</div>;
};

export const StatusBar: React.FC = () => null;

type TextInputProps = CommonProps & {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
};

export const TextInput: React.FC<TextInputProps> = ({ style, value, onChangeText, placeholder, placeholderTextColor }) => {
  const computed = useMemo(() => flattenStyle([{ color: '#e2e8f0' }, style]), [style]);
  return (
    <input
      value={value}
      onChange={(e) => onChangeText?.(e.target.value)}
      placeholder={placeholder}
      style={{ ...computed, outline: 'none', border: 'none', boxSizing: 'border-box', width: '100%', color: computed.color }}
      aria-placeholder={placeholderTextColor ? undefined : placeholder}
    />
  );
};

const registry = new Map<string, () => React.ComponentType<any>>();

export const AppRegistry = {
  registerComponent(appKey: string, componentProvider: () => React.ComponentType<any>) {
    registry.set(appKey, componentProvider);
    return appKey;
  },
  runApplication(appKey: string, params: { rootTag: HTMLElement; initialProps?: Record<string, unknown> }) {
    const component = registry.get(appKey)?.();
    if (!component) {
      throw new Error(`App ${appKey} is not registered`);
    }
    const root = ReactDOM.createRoot(params.rootTag);
    root.render(React.createElement(component, params.initialProps ?? {}));
  },
};

export const Alert = {
  alert(title: string, message?: string) {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert([title, message].filter(Boolean).join('\n'));
    }
  },
};

export type { StyleSheet as StyleSheetType };
