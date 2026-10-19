# Releasing the Atlas site

The GitHub repository is the durable source record. The site is served by a Vercel project with a custom domain. Production is a deliberate release action, so a merge is never mistaken for a verified deployment.

## Release contract

1. Work on a feature branch.
2. Run the full local gate.
3. Commit and push the intended diff.
4. Open a pull request to `main`.
5. Create and verify a Preview deployment.
6. Merge only after CI and preview verification pass.
7. Build and deploy the merged `main` commit to Production.
8. Verify the custom domain and production logs.

A commit, push, merge, deployment, and public-domain verification are separate states. Record each one in the pull request.

## Required environment

The forms need these variables in Preview and Production:

- `RESEND_API_KEY`
- `ATLAS_ACCESS_RECIPIENT`
- `ATLAS_ACCESS_FROM`

Never commit their values. Confirm names with `vercel env ls` before release. Setting variables does not update an existing deployment: redeploy afterward. See the README for notification and reply behavior.

## Local gate

```sh
npm ci
npm audit
npm run verify
git diff --check
```

`npm run verify` covers API tests, HTML, CSS, and local route and asset references.

## Preview

```sh
vercel pull --yes --environment=preview
vercel build
vercel deploy --prebuilt --yes
```

Inspect the returned deployment, then verify:

- `/`, `/products/`, `/products/ai-assignments/`, `/assessment/`, `/learn-more/`, and `/contact/` return `200`.
- The film poster and video return `200` and support byte ranges.
- Legacy `/access`, `/pricing`, `/product`, `/how-it-works`, and `/work-with-us` routes redirect to their current destinations.
- Security headers match `vercel.json`.
- `GET /api/inquiry` returns `405`.
- An incomplete same-origin `POST /api/inquiry` returns `400`.
- A delivery test succeeds only when the three required variables are configured. Confirm actual receipt in the private inbox and the visitor's `Reply-To`; a provider success response alone does not prove inbox delivery.
- On failure, entries remain editable and no success confirmation appears.
- Preview error logs are clean.

Add the preview URL and verification result to the pull request before merging.

## Production

After the pull request is merged, sync `main` and build the exact merged commit:

```sh
git switch main
git pull --ff-only origin main
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod --yes
```

Record the deployment ID, URL, commit SHA, and prior production deployment. Verify the custom domain with and without `www` independently.

## Rollback

If production verification fails, restore the previous production deployment immediately:

```sh
vercel rollback
vercel rollback status
```

Then verify the custom domain, inspect the failed deployment, and fix forward through a new pull request. Do not delete deployments needed for rollback evidence.
