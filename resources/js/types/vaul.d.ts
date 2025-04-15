declare module 'vaul' {
  import * as React from 'react';

  export interface DrawerProps extends React.ComponentPropsWithoutRef<'div'> {
    shouldScaleBackground?: boolean;
  }

  export const Drawer: React.FC<DrawerProps>;
  export const DrawerTrigger: React.FC<React.ComponentPropsWithoutRef<'button'>>;
  export const DrawerPortal: React.FC<React.ComponentPropsWithoutRef<'div'>>;
  export const DrawerClose: React.FC<React.ComponentPropsWithoutRef<'button'>>;
  export const DrawerOverlay: React.FC<React.ComponentPropsWithoutRef<'div'>>;
  export const DrawerContent: React.FC<React.ComponentPropsWithoutRef<'div'>>;
  export const DrawerHeader: React.FC<React.ComponentPropsWithoutRef<'div'>>;
  export const DrawerFooter: React.FC<React.ComponentPropsWithoutRef<'div'>>;
  export const DrawerTitle: React.FC<React.ComponentPropsWithoutRef<'h2'>>;
  export const DrawerDescription: React.FC<React.ComponentPropsWithoutRef<'p'>>;
} 