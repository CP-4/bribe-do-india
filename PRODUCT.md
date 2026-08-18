# Product context

## Product

Bribe.do is a public-interest, India-focused reporting and discovery tool for bribe demands in government services. It helps people anonymously record what happened, compare patterns by place and department, and understand that reports are signals—not a complete measure of corruption.

## Audience and scene

People who have just been asked for unofficial money, people trying to understand what a government service may cost in practice, and researchers or journalists looking for grounded local signals. The primary scene is a phone or laptop used privately, often under stress, before or after visiting an office.

## First surface

The homepage should make three things immediately clear: a verified phone is required to submit, no phone number is published with a report, and the report is structured enough to compare. The primary action is “Report a bribe”.

## Truth and constraints

- Do not present crowdsourced reports as an official corruption ranking or verified accusation.
- Preserve public anonymity as a core promise; phone verification is required for abuse resistance, but phone numbers never enter public report documents.
- Firestore stores sanitized reports; Firebase Phone Auth gates report creation.
- Prototype interactions should be functional locally: tabs, filters, report modal, and search.
- Use illustrative sample data clearly as sample data.

## Mode

Operate: people need to complete a reporting or exploration task quickly and confidently.
