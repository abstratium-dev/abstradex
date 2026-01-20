# TODO

TODOs to be resolved by the developer, NOT THE LLM.

## Today

- move autocomplete component into abstracore.
- test signed-out
  - still not working if page is refreshed with non root path
- addresses not working
- CH still displayed when viewing addresses of partners
- CH still displayed in the partner tile
- address one and two are missing in partner tile
with partner related error codes and actually use them.
- TEST partner tile should show address, in this order:
 - primary
 - billing
 - shipping
- search for more todo comments that need to be resolved
- address search may only use addresses which are active and valid on the current date
- addresses are not displayed as verified
- partner address is not displayed as primary
- replace DEMO_ERROR and similar error codes in ErrorCode.java 
- move SpaRoutingNotFoundMapper.java to abstracore
- enter an address in the URL and it isn't being used after signing in

## Tomorrow

- add contacts like email and phone - they are already in the db
- add other tables
- add validity to partners
- regenerate DATABASE.md after completing the database model
- if you edit an address, we need a way of ensuring that we aren't breaking partner addresses - changing an address is a little dodgy. perhaps don't allow editing of addresses, rather only allow adding new addresses, marking addresses as no longer "active" so they can't be used for adding to new partners.
- add a gdpr solution


## Later (not yet necessary for initial release)

