import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

type WithThemeProps = {
  isDark: boolean;
};

/**
 * Higher Order Component to make child components theme-aware
 * @param Component The component to wrap with theme awareness
 * @returns A theme-aware component
 */
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & WithThemeProps>
): React.FC<P> => {
  const WithThemeComponent: React.FC<P> = (props) => {
    const { isDark } = useTheme();
    return <Component {...props} isDark={isDark} />;
  };
  
  const displayName = Component.displayName || Component.name || 'Component';
  WithThemeComponent.displayName = `WithTheme(${displayName})`;
  
  return WithThemeComponent;
};

/**
 * A component that renders different children based on the current theme
 */
export const ThemeConditional: React.FC<{
  light: React.ReactNode;
  dark: React.ReactNode;
}> = ({ light, dark }) => {
  const { isDark } = useTheme();
  return <>{isDark ? dark : light}</>;
};

/**
 * A helper component that applies theme-aware classes
 */
export const ThemeAware: React.FC<{
  children: React.ReactNode;
  className?: string;
  darkClassName?: string;
  lightClassName?: string;
}> = ({ children, className = '', darkClassName = '', lightClassName = '' }) => {
  const { isDark } = useTheme();
  
  const themeClasses = isDark ? darkClassName : lightClassName;
  const combinedClasses = `${className} ${themeClasses}`;
  
  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

export default ThemeAware; 