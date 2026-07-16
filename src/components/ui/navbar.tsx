import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import * as React from 'react';
import LanguageToggle from '@/components/layout/LanguageToggle';
import { useLocale } from '@/hooks/useLocale';
import { NAV_LIFT } from '@/components/ui/nav-lift';

// Adapted from the provided shadcn "Tabnavbar" demo: next/link -> plain <a>
// (Vite/React-Router), our fonts + palette, real logo, an EN/HE toggle, and
// labels wired to i18n so the toggle switches the nav language.

export default function Tabnavbar({ hidden = false }: { hidden?: boolean }) {
  const { t } = useLocale();
  // Products opens on click, not hover (see navigation-menu.tsx). Controlled so
  // a pointer-down anywhere outside the navbar closes it.
  const [menuValue, setMenuValue] = React.useState('');
  const navRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (!menuValue) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuValue('');
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuValue]);
  return (
    <nav
      ref={navRef}
      className={cn(
        'sticky top-0 z-40 border-b border-line bg-white font-sans transition-[transform,opacity] duration-500 ease-out',
        // Lifted out of frame during the "painter's world" video beats, then
        // eased back in as the collections reveal.
        hidden && '-translate-y-full opacity-0',
      )}
    >
      <div className="flex w-full items-center justify-between px-8 py-4">
        <div className="flex items-center gap-6">
          {/* Logo flush to the start; nav + search follow it. */}
          <a href="#" className="flex items-center">
            <img
              src="/signature.png"
              alt="יוסי כהן"
              className="h-[4.25rem] w-auto mix-blend-multiply"
            />
          </a>
          <NavigationMenu value={menuValue} onValueChange={setMenuValue}>
            <NavigationMenuList>
              <NavigationMenuItem value="products">
                <NavigationMenuTrigger>{t('nav.products')}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none transition-colors hover:text-primary focus:text-primary focus:shadow-md"
                          href="#"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Featured Product
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Check out our latest and greatest offering
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="#" title="Product 1">
                      Description for Product 1
                    </ListItem>
                    <ListItem href="#" title="Product 2">
                      Description for Product 2
                    </ListItem>
                    <ListItem href="#" title="Product 3">
                      Description for Product 3
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href="#"
                >
                  {t('nav.about')}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href="#"
                >
                  {t('nav.contact')}
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <Button
            variant="outline"
            className={cn('text-base font-medium', NAV_LIFT)}
          >
            {t('nav.signIn')}
          </Button>
        </div>
      </div>
    </nav>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:text-primary focus:text-primary',
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
