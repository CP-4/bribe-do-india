# Firebase setup for bribe.do

The project and web app already exist:

- Project: `bribe-do-india`
- Web app: `bribe-do-web`
- Console: https://console.firebase.google.com/project/bribe-do-india/overview

## One-time console steps

1. Open the console and enable **Firestore Database** in `asia-south1`.
2. In **Authentication → Sign-in method**, enable **Phone**.
3. Add the local development and production domains under **Authentication → Settings → Authorized domains**.
4. Configure the SMS region policy and reCAPTCHA settings before public launch.
5. Deploy the prototype rules from this directory after Firestore is enabled:

   `npx -y firebase-tools@latest deploy --only firestore:rules --project bribe-do-india`

## Data model

`reports/{reportId}` contains only sanitized, public-facing fields:

- `department`, `city`, `service`, `amount`
- `createdAt` server timestamp
- `status: "pending"`
- `uid` used only to bind the write to the authenticated Firebase user

The phone number is held by Firebase Authentication and is never copied into the report document.

## Map behavior

The homepage queries the latest reports, aggregates known city names, and redraws marker counts. Add a city to `cityCoordinates` in `app.js` to plot it precisely. For a production-grade version, replace that registry with a reviewed city/lat/lng collection or a server-side geocoder; do not geocode arbitrary user text directly in the browser.

The rules in this repo are a prototype: public reads are allowed for sanitized reports, authenticated users can create only validated pending reports, and updates/deletes are denied. Review and harden them before broad launch.
