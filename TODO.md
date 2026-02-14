# TODO

These TODOs are to be resolved by the developer, NOT THE LLM.

## Before Each Release

- upgrade all and check security issues in github
- update docs to describe the changes

## Today


## Tomorrow


## Later (not yet necessary for initial release)


# TODOs for Abstracore (to be deleted downstream)

- add a banner for non-prod envs with a custom string to warn users that they are not using prod
- add observability (logging, metrics, tracing)
- fix tracking of the url in the auth service, so that if the user clicks or enters a link, they are redirected, regardless of whether they are already signed in, or need to sign in
- allow other addresses than localhost to read management/metrics. need to also expose it in docker file?
