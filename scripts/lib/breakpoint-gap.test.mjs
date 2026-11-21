import test from 'node:test';
import assert from 'node:assert/strict';
import { closeMobileBreakpointGap } from './breakpoint-gap.mjs';

test('mobile max-width queries end just below the 768px desktop breakpoint', () => {
  assert.equal(closeMobileBreakpointGap('@media(max-width:767px){a{b:c}}'), '@media(max-width:767.98px){a{b:c}}');
  assert.equal(closeMobileBreakpointGap('@media (max-width: 767px) and (hover:none)'), '@media (max-width: 767.98px) and (hover:none)');
  assert.equal(closeMobileBreakpointGap("matchMedia('(max-width: 767px)')"), "matchMedia('(max-width: 767.98px)')");
});

test('other breakpoints and already-closed queries stay as they are', () => {
  const css = '@media(min-width:768px){}@media(max-width:1024px){}@media(max-width:767.98px){}@media(max-width:3767px){}';
  assert.equal(closeMobileBreakpointGap(css), css);
});
