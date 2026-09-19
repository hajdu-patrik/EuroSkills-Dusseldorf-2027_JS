import { forwardRef } from 'react';

// Every string below is copied verbatim from the call sites that used to hard-code it
// (App.jsx's "Back to Project List" link, MapEditor.jsx's wind-direction buttons and its
// "Remove All Turbines" button) - no new variant/design was introduced, only the exact
// classes that already existed. The only edit made to any of these strings was the
// transition-all -> transition/transition-colors narrowing described in the same change.
export const BUTTON_VARIANTS = {
  ghost: 'inline-block px-4 py-2 md:px-6 md:py-3 bg-white text-stone-600 font-bold text-xs md:text-base rounded-xl border-2 border-stone-200 hover:bg-stone-100 hover:border-stone-300 hover:text-stone-800 transition-colors shadow-xs',
  navActive: 'py-3 px-2 rounded-xl text-sm font-bold border-2 transition bg-stone-800 text-white border-stone-800 shadow-lg scale-105',
  navInactive: 'py-3 px-2 rounded-xl text-sm font-bold border-2 transition bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50',
  dangerEnabled: 'flex-[0.3] rounded-xl flex items-center justify-center transition-colors duration-200 border bg-red-500 hover:bg-red-600 text-white border-red-400/20 shadow-red-200',
  dangerDisabled: 'flex-[0.3] rounded-xl flex items-center justify-center transition-colors duration-200 border bg-stone-300 text-stone-500 cursor-not-allowed border-stone-300 shadow-none',
};

/**
 * Shared button/link-button primitive.
 * - `as`: element or component to render ("button" by default, or e.g. react-router's `Link`).
 * - `variant`: picks one of the exact pre-existing class strings above.
 * - `className`: used as-is instead of a variant when a call site needs a one-off class string.
 * Forwards refs and all native props; real <button> elements default to type="button".
 */
const Button = forwardRef(function Button({ as: Component = 'button', variant, className, type, ...props }, ref) {
  const classes = className != null ? className : BUTTON_VARIANTS[variant];
  const typeProp = Component === 'button' ? { type: type || 'button' } : (type !== undefined ? { type } : {});
  return <Component ref={ref} className={classes} {...typeProp} {...props} />;
});

export default Button;
