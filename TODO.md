# TODO

TODOs to be resolved by the developer, NOT THE LLM.

## Today

- search for more todo comments that need to be resolved
- replace DEMO_ERROR and similar error codes in ErrorCode.java with partner related error codes and actually use them.

## Tomorrow

- e2e tests
- add relationships between partners T_partner_relationship
- add tags to partners T_partner_tag and T_tag
- do we need T_sme_relationship? we can use tags
  - relationship_type IN ('CUSTOMER', 'SUPPLIER', 'BOTH')
  - status IN ('ACTIVE', 'INACTIVE', 'PROSPECT', 'FORMER', 'SUSPENDED') and has contract, etc...

- add a gdpr solution
- address search may only use addresses which are active and valid on the current date
- FREE TEXT SEARCH: need ability to search for partners by their address
- need a partner overview which shows contracts, etc.
- FREE TEXT SEARCH: need to be able to search for partners by contracts, etc. 


## Later (not yet necessary for initial release)

- address and addressDetail validity - see decisions document

- need ability to search for partners that use a specific address address

- add validity to partners?

