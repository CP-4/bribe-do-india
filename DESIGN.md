# bribe.do design system

## Direction

The interface is a compact public signal desk: part civic noticeboard, part data terminal. It should feel direct and useful under stress, with enough visual character to be memorable without making a serious reporting task feel gamified.

## Palette

- Graphite `#111311`: primary canvas and high-contrast text.
- Acid lime `#C7F36A`: action, live state, and public-interest signal.
- Warm paper `#F1EEE5`: reading surfaces and report detail.
- Sage `#D8DFD0`: secondary data surface.
- Soft blue `#86A9B7`: reserved for future low-signal visualizations.

## Typography

Space Grotesk handles display type, numeric metrics, and compact labels. DM Sans handles body copy, form labels, and metadata. Uppercase micro-labels use tracking to create a clear data-navigation layer.

## Components

Buttons use a compact rectangular shape and an arrow cue. Panels use small radii (currently square) and thin borders, keeping the interface closer to a printed civic instrument than a consumer app. Lime marks primary action and freshness; it is not used for positive/negative moral judgments.

## Layout and responsive behavior

The desktop surface uses an 1180px reading width, asymmetric hero, three metric cards, and a two-column signal board. On mobile, the navigation collapses, the report CTA remains visible, cards and panels stack, and map labels reduce without removing the data caveat.

## Product-specific interaction

“Report a bribe” opens a protected modal. Phone OTP verification happens before the report fields unlock; the form asks only for department, city, amount, service, and a first-hand confirmation. Successful submission transitions to a calm acknowledgement instead of a gamified reward.
