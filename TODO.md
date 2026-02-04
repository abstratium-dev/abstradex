# TODO

These TODOs are to be resolved by the developer, NOT THE LLM.

## Today

- sync upstream

- add more e2e tests based on the features

- use the features to test the api in a quarkus test???
  - if not, remove those feature files
  - is cucumber compatible with playwright?
- need to be able to edit tags - need a route and link in the header for that
- 500 when editing legal entity
- when adding/editing contact details, the type should influence the html5 input field (e.g. phone number should be a phone number input field)
- the contact details displayed in partner-tile and partner-overview should be links, e.g. email->mailto, phone->tel, website->anchor, etc.

- in the controller we need to remove the two methods loadPartners and loadAddresses - as they won't perform well when we have a lot of partners.  in some places, like where we are editing a partner, it should load exactly that partner! ditto address.

- in the "Scenario: Delete a Partner", it looks like it finds 8 partners for the unique partner ID that was deleted. i have debugged it. deleting results in status code 204 and there is a second request GET http://localhost:8082/api/partner which returns ALL the partners. that won't perform well at all, once we have a few hundred partners. change the code so that all modifications to partners AND addresses (create, update, delete) do NOT reload *all* of the entities. instead it should a) simply delete the search text when a entity was deleted, b) leave the search text if the entity was an edited, and c) if the entity was a created, remove the search text and replace it with the entity number and use the result of the create to add that entity to the model so that that entity is displayed. all relevant angular tests will need to be updated! delete the REST method which loads all partners and addresses. run all tests and keep testing until they all pass. see @testing.md 

- in order to integrate with other microservices, we need to export data in a shareable way. apache arrow format? csv?

    Minor Issue: PartnerExportServiceTest (3 failures)
    These failures are pre-existing transaction/visibility issues unrelated to our changes:

    Tests create partners in 
    Transactional
    methods
    Export service runs in same transaction but partners aren't visible
    This is a test design issue, not a code issue


- search for more todo comments that need to be resolved
- replace DEMO_ERROR and similar error codes in ErrorCode.java with partner related error codes and actually use them.

- check that abstracore makes the ui generate the demo entity uuid, and that the backend validates that it is a valid uuid. then fix that here that all entities should be created like that.


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

