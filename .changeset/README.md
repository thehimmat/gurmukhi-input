# Changesets

Every PR that changes a published package adds a changeset:

```bash
pnpm changeset
```

Pick the packages, the bump (patch, minor or major) and write one line for the changelog. On merge to `main`, the release workflow opens or updates a "Version packages" PR. Merging that PR publishes to npm.
