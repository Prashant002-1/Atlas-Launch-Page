# Releasing Atlas Launch Page

The GitHub repository is the durable source record. Vercel project `atlas-lms-coming-soon` serves `atlas-lms.com`.

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

## Required environments

The access form needs these variables in Preview and Production:

- `RESEND_API_KEY`
- `ATLAS_ACCESS_RECIPIENT`
- `ATLAS_ACCESS_FROM`

Never commit their values. Confirm names with `vercel env ls` before release.

Both access and contact forms use this configuration. The recipient must be a working private inbox, and the sender must use a Resend-verified domain. Setting variables does not update an existing deployment: redeploy afterward. No Google Workspace mailbox is required for the server to send through Resend. See the README for notification and reply behavior.

## Local gate

```sh
npm ci
npm audit
npm run verify
git diff --check
```

`npm run verify` covers API tests, HTML, CSS, and local route/asset references.

## Preview

```sh
vercel pull --yes --environment=preview
vercel build
vercel deploy --prebuilt --yes
```

Inspect the returned deployment, then verify:

- `/`, `/products/`, `/products/ai-assignments/`, `/assessment/`, and `/access/` return `200`.
- The V7 poster and video return `200` and support byte ranges.
- Legacy `/product`, `/how-it-works`, and `/work-with-us` routes redirect to their current destinations.
- Security headers match `vercel.json`.
- `GET /api/launch-access` returns `405`.
- An incomplete same-origin `POST /api/launch-access` returns `400`.
- A valid delivery test succeeds only when the three required variables are configured and an approved test address is used.
- Verify both a pilot request and a contact message, including actual receipt in the private inbox and the visitor's `Reply-To`. A provider success response alone does not prove inbox delivery.
- Check that contact links, privacy requests, security concerns, and retry states stay on the site without publishing an email address. On failure, entries remain editable and no success confirmation appears.
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

Record the deployment ID, URL, commit SHA, and prior production deployment. Verify `https://atlas-lms.com` and `https://www.atlas-lms.com` independently.

## Rollback

If production verification fails, restore the previous production deployment immediately:

```sh
vercel rollback
vercel rollback status
```

Then verify the custom domain, inspect the failed deployment, and fix forward through a new pull request. Do not delete deployments needed for rollback evidence.
