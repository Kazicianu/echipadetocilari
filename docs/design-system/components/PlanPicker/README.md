# PlanPicker

A segmented control that switches between the three Google Ads plans on narrow screens, where only one plan card shows at a time.

Markup: `div.ect-picker[role="tablist"][aria-label="Alege pachetul"]` with three `button[role="tab"]`, each with `aria-selected`, `aria-controls` (the plan card's id) and the name, a `br` and the price in a `span`. The page script moves a gradient indicator under the selected tab.

- Track: `white`, `radius-button`, `shadow-soft`, 6px padding and gaps.
- Tabs: at least 56px tall, `radius-panel`, 14/1.25 600 in `ink`, the price in 800. The selected tab is the `orange-logo` to `orange` gradient with `white` text. Pressing scales a tab to 98%.
- Show it only where the plan cards do not fit side by side (container below 760px); hide it when all three cards show.
- Contrast: `white` on the gradient is 2.4:1 to 2.8:1, below AA; kept as the site has it.

Hand-written from `google-ads.css` (`.gads-plan-picker`).
