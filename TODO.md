# TODO

TODOs to be resolved by the developer, NOT THE LLM.

## Today

- need to be able to edit tags - need a route and link in the header for that
- 500 when editing legal entity
- when adding/editing contact details, the type should influence the html5 input field (e.g. phone number should be a phone number input field)
- the contact details displayed in partner-tile and partner-overview should be links, e.g. email->mailto, phone->tel, website->anchor, etc.

- in order to integrate with other microservices, we need to export data in a shareable way. apache arrow format? csv?

    Minor Issue: PartnerExportServiceTest (3 failures)
    These failures are pre-existing transaction/visibility issues unrelated to our changes:

    Tests create partners in 
    Transactional
    methods
    Export service runs in same transaction but partners aren't visible
    This is a test design issue, not a code issue


- sync upstream (test port)
- search for more todo comments that need to be resolved
- replace DEMO_ERROR and similar error codes in ErrorCode.java with partner related error codes and actually use them.


what is this warning?
```
2026-01-23 22:40:38,455 WARN  [io.qua.deployment] (main) [skey:] Run time configuration should not be consumed in Build Steps, use RuntimeValue<io.quarkiverse.resteasy.problem.ProblemRuntimeConfig> in a @Recorder constructor instead at io.quarkiverse.resteasy.problem.ProblemRuntimeConfig config of void io.quarkiverse.resteasy.problem.deployment.ProblemProcessor.applyRuntimeConfig(io.quarkiverse.resteasy.problem.postprocessing.ProblemRecorder,io.quarkiverse.resteasy.problem.ProblemRuntimeConfig) of class io.quarkiverse.resteasy.problem.deployment.ProblemProcessor
```

## Tomorrow

- e2e tests
- ability to search by tag
- double click partner tile to open a view that shows all of their info on one screen
- ability to search by contact detail
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

